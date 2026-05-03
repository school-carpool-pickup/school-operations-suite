#!/usr/bin/env bun
/**
 * Per-portal production build orchestrator.
 *
 * SafePickup ships 4 portals (admin/staff/business/tv) from a single Next.js
 * codebase. This script builds *one* portal at a time so its bundle stays
 * isolated — no other portal's pages, layouts, or route handlers leak into
 * the deploy artifact (admin.safepickup.com must NOT serve /business code).
 *
 * Strategy: filesystem stash. Move every other portal's directory (and a
 * couple of cross-portal files like the landing page) into `.build-stash/`,
 * run `next build` with `BUILD_PORTAL=<id>`, then restore — even if the
 * build crashes. A startup recovery pass also restores leftovers from a
 * previous SIGKILL'd run.
 *
 * Output layout:
 *   .next-admin/     (built admin portal — distDir set in next.config.ts)
 *   .next-staff/
 *   .next-business/
 *   .next-tv/
 *
 * Each `.next-<portal>/standalone/` is a self-contained Node server suitable
 * for `node .next-<portal>/standalone/server.js` or container deploys.
 *
 * Usage:
 *   bun scripts/build-portal.ts <admin|staff|business|tv>
 *   bun scripts/build-portal.ts all
 *   bun scripts/build-portal.ts verify <admin|staff|business|tv>
 *   bun scripts/build-portal.ts sizes
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const PORTALS = ['admin', 'staff', 'business', 'tv'] as const;
type Portal = (typeof PORTALS)[number];

const STASH_DIR = '.build-stash';

/** Files/directories to move out of the way for a per-portal build. */
function stashTargets(portal: Portal): string[] {
  const others = PORTALS.filter((p) => p !== portal).map(
    (p) => `src/app/(portals)/${p}`,
  );
  // The shared landing page is replaced by a redirect to /<portal>; remove
  // it so it isn't bundled into the per-portal artifact.
  others.push('src/app/page.tsx');
  // TV has its own /tv/login flow — admin/staff/business builds keep
  // /login (used by the shared portal entry); TV-only build drops it.
  if (portal === 'tv') {
    others.push('src/app/login');
  }
  return others;
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function moveSafe(src: string, dst: string): Promise<void> {
  await fs.mkdir(path.dirname(dst), { recursive: true });
  await fs.rename(src, dst);
}

/**
 * Recover any files left in `.build-stash/` from a previous crashed run.
 * For each entry under the stash, move it back to its mirrored path.
 * Skips paths that already exist at the destination (shouldn't normally
 * happen — would only mean the user manually re-created the file).
 */
async function recoverFromCrash(): Promise<void> {
  if (!(await pathExists(STASH_DIR))) return;
  console.log(`! Found leftover ${STASH_DIR}/ — restoring before continuing.`);

  async function walk(rel: string): Promise<void> {
    const stashAbs = path.join(STASH_DIR, rel);
    const entries = await fs.readdir(stashAbs, { withFileTypes: true });
    for (const entry of entries) {
      const stashChild = path.join(stashAbs, entry.name);
      const targetChild = path.join(rel, entry.name);
      if (await pathExists(targetChild)) {
        if (entry.isDirectory()) {
          await walk(path.join(rel, entry.name));
        } else {
          console.warn(
            `  ⚠ ${targetChild} exists; leaving stashed copy at ${stashChild}`,
          );
        }
      } else {
        await fs.mkdir(path.dirname(targetChild), { recursive: true });
        await fs.rename(stashChild, targetChild);
        console.log(`  ↶ restored ${targetChild}`);
      }
    }
  }

  await walk('');
  await fs.rm(STASH_DIR, { recursive: true, force: true }).catch(() => {});
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function dirSize(dir: string): Promise<number> {
  let total = 0;
  async function walk(p: string): Promise<void> {
    const entries = await fs.readdir(p, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(p, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        const stat = await fs.stat(full);
        total += stat.size;
      }
    }
  }
  if (await pathExists(dir)) await walk(dir);
  return total;
}

async function buildPortal(portal: Portal): Promise<void> {
  console.log(`\n━━━ Building ${portal} portal ━━━`);

  const targets = stashTargets(portal);
  const stashed: Array<{ original: string; stashed: string }> = [];

  // Snapshot tsconfig.json then rewrite it for the duration of this build.
  //
  // Why: Next's TS check loads every `*.next*/.../types/**` path listed in
  // `include`. Stale types from a prior `bun dev` (`.next/dev/types/`) or a
  // previous portal's build (`.next-staff/types/`) reference routes that
  // don't exist in the current build, so the type-checker rejects them
  // (`Type '"/staff"' is not assignable to type 'LayoutRoutes'`).
  //
  // We therefore write a build-time tsconfig that includes ONLY the current
  // portal's `.next-<portal>/types/**`, and restore the original immediately
  // after the build (success or failure).
  const tsconfigPath = 'tsconfig.json';
  const tsconfigSnapshot = await fs.readFile(tsconfigPath, 'utf8');
  const tsconfigForBuild = JSON.parse(tsconfigSnapshot);
  tsconfigForBuild.include = [
    'next-env.d.ts',
    '**/*.ts',
    '**/*.tsx',
    '**/*.mts',
    `.next-${portal}/types/**/*.ts`,
  ];
  // Make sure other portals' dist dirs are excluded from TS scan.
  tsconfigForBuild.exclude = Array.from(
    new Set([
      ...(tsconfigForBuild.exclude ?? []),
      ...PORTALS.filter((p) => p !== portal).map((p) => `.next-${p}`),
      '.next',
    ]),
  );
  await fs.writeFile(
    tsconfigPath,
    `${JSON.stringify(tsconfigForBuild, null, 2)}\n`,
  );

  // Stash files
  for (const target of targets) {
    if (await pathExists(target)) {
      const stashTo = path.join(STASH_DIR, target);
      await moveSafe(target, stashTo);
      stashed.push({ original: target, stashed: stashTo });
    }
  }

  // Make sure restore happens on any exit signal
  const restore = async () => {
    for (const { original, stashed: stash } of [...stashed].reverse()) {
      if (await pathExists(stash)) {
        await moveSafe(stash, original).catch((e) =>
          console.error(`✗ failed to restore ${original}: ${e}`),
        );
      }
    }
    await fs.rm(STASH_DIR, { recursive: true, force: true }).catch(() => {});
    // Restore the dev-friendly tsconfig.
    await fs
      .writeFile(tsconfigPath, tsconfigSnapshot)
      .catch((e) => console.error(`✗ failed to restore ${tsconfigPath}: ${e}`));
  };

  const sigHandler = async (signal: NodeJS.Signals) => {
    console.error(`\n! Caught ${signal}, restoring stashed files...`);
    await restore();
    process.exit(130);
  };
  process.on('SIGINT', sigHandler);
  process.on('SIGTERM', sigHandler);

  let buildError: unknown = null;
  try {
    const result = spawnSync('bun', ['x', 'next', 'build'], {
      stdio: 'inherit',
      env: { ...process.env, BUILD_PORTAL: portal },
    });
    if (result.status !== 0) {
      throw new Error(`next build exited with code ${result.status}`);
    }
  } catch (e) {
    buildError = e;
  } finally {
    process.off('SIGINT', sigHandler);
    process.off('SIGTERM', sigHandler);
    await restore();
  }

  if (buildError) throw buildError;

  const distDir = `.next-${portal}`;
  const size = await dirSize(distDir);
  const standaloneSize = await dirSize(path.join(distDir, 'standalone'));
  console.log(`✓ ${portal} → ${distDir}/`);
  console.log(`  total:      ${fmtBytes(size)}`);
  console.log(`  standalone: ${fmtBytes(standaloneSize)}`);
}

async function buildAll(): Promise<void> {
  for (const p of PORTALS) await buildPortal(p);
}

/**
 * Verify a per-portal build doesn't reference other portals' route segments.
 * Looks for `(portals)/<other>/` substrings inside the dist dir's compiled
 * output — if found, the stash didn't take effect or something else leaked.
 */
async function verify(portal: Portal): Promise<boolean> {
  const distDir = `.next-${portal}`;
  if (!(await pathExists(distDir))) {
    console.error(
      `✗ ${distDir} not found — run \`bun run build:${portal}\` first`,
    );
    return false;
  }

  const others = PORTALS.filter((p) => p !== portal);
  let leaked = false;

  console.log(`\n━━━ Verifying ${portal} build (${distDir}/) ━━━`);

  for (const other of others) {
    const result = spawnSync(
      'grep',
      [
        '-r',
        '-l',
        '--include=*.js',
        '--include=*.html',
        `(portals)/${other}/`,
        distDir,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const hits = result.stdout?.toString().trim();
    if (hits) {
      console.error(`✗ ${portal} bundle references ${other}:`);
      for (const line of hits.split('\n').slice(0, 5)) {
        console.error(`    ${line}`);
      }
      leaked = true;
    } else {
      console.log(`✓ no \`${other}\` references`);
    }
  }

  // Sanity: build SHOULD contain the portal's own segment
  const ownResult = spawnSync(
    'grep',
    [
      '-r',
      '-l',
      '--include=*.js',
      '--include=*.html',
      `(portals)/${portal}/`,
      distDir,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  if (!ownResult.stdout?.toString().trim()) {
    console.warn(
      `! warning: build contains no \`${portal}\` references either — did the build succeed?`,
    );
  }

  return !leaked;
}

async function showSizes(): Promise<void> {
  console.log(`\n━━━ Build sizes ━━━`);
  for (const p of PORTALS) {
    const distDir = `.next-${p}`;
    if (!(await pathExists(distDir))) {
      console.log(`  ${p.padEnd(10)} (not built)`);
      continue;
    }
    const size = await dirSize(distDir);
    const standaloneSize = await dirSize(path.join(distDir, 'standalone'));
    console.log(
      `  ${p.padEnd(10)} total ${fmtBytes(size).padStart(10)}    standalone ${fmtBytes(standaloneSize).padStart(10)}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────

const arg = process.argv[2];
const arg2 = process.argv[3];

await recoverFromCrash();

if (!arg) {
  console.error('Usage:');
  console.error('  bun scripts/build-portal.ts <admin|staff|business|tv>');
  console.error('  bun scripts/build-portal.ts all');
  console.error('  bun scripts/build-portal.ts verify <portal>');
  console.error('  bun scripts/build-portal.ts sizes');
  process.exit(1);
}

if (arg === 'all') {
  await buildAll();
  await showSizes();
} else if (arg === 'sizes') {
  await showSizes();
} else if (arg === 'verify') {
  if (!arg2 || !(PORTALS as readonly string[]).includes(arg2)) {
    console.error(
      `Usage: bun scripts/build-portal.ts verify <${PORTALS.join('|')}>`,
    );
    process.exit(1);
  }
  const ok = await verify(arg2 as Portal);
  process.exit(ok ? 0 : 1);
} else if ((PORTALS as readonly string[]).includes(arg)) {
  await buildPortal(arg as Portal);
} else {
  console.error(`Unknown command: ${arg}`);
  console.error(
    `Valid: ${PORTALS.join(' | ')} | all | verify <portal> | sizes`,
  );
  process.exit(1);
}
