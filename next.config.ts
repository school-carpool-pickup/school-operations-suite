import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * `BUILD_PORTAL` is set by `scripts/build-portal.ts` when producing a
 * per-portal production artifact. When set, we:
 *  - write into `.next-<portal>/` so multiple portals can build without
 *    clobbering each other
 *  - emit `standalone` output for clean container/edge deploys
 *  - redirect `/` to the portal's root so the deployed domain works
 *
 * In dev (no env), Next behaves normally and serves all portals from one app.
 */
const PORTAL = process.env.BUILD_PORTAL;
const VALID_PORTALS = ['admin', 'staff', 'business', 'tv'] as const;
const isPortalBuild = (VALID_PORTALS as readonly string[]).includes(
  PORTAL ?? '',
);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Shared options applied to BOTH dev and per-portal builds.
 *
 * `experimental.optimizePackageImports` rewrites barrel imports from these
 * packages to direct paths at build time — without it, every icon
 * (`import { Bell } from 'lucide-react'`) becomes its own dev-mode chunk,
 * which means dozens of extra HTTP requests on first page load. With it,
 * Turbopack/Webpack treat the import as a single optimized module.
 *
 * date-fns gets the same treatment — it's a 38 MB package on disk because
 * it ships every locale and helper as a separate file; without
 * optimization a single `format()` import can pull in dozens of submodules.
 */
const sharedConfig: Pick<NextConfig, 'experimental'> = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@tanstack/react-query',
    ],
  },
};

const nextConfig: NextConfig = isPortalBuild
  ? {
      ...sharedConfig,
      distDir: `.next-${PORTAL}`,
      output: 'standalone',
      async redirects() {
        return [{ source: '/', destination: `/${PORTAL}`, permanent: false }];
      },
    }
  : {
      ...sharedConfig,
      /* dev / full build: standard Next behaviour */
    };

export default withNextIntl(nextConfig);
