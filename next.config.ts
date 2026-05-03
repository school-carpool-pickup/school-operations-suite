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

const nextConfig: NextConfig = isPortalBuild
  ? {
      distDir: `.next-${PORTAL}`,
      output: 'standalone',
      async redirects() {
        return [{ source: '/', destination: `/${PORTAL}`, permanent: false }];
      },
    }
  : {
      /* dev / full build: standard Next behaviour */
    };

export default withNextIntl(nextConfig);
