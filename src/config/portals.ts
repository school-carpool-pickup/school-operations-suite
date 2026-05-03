export type PortalIdentifier = 'admin' | 'staff' | 'business' | 'tv';

export type PortalLayout = 'shell' | 'fullscreen';

export interface PortalNavItem {
  /** i18n key e.g. `Portal.Admin.nav.dashboard`. */
  titleKey: string;
  href: string;
  icon: string;
}

export interface PortalConfig {
  id: PortalIdentifier;
  /** i18n key for the display name e.g. `Portal.Admin.name`. */
  nameKey: string;
  basePath: string;
  themeClass: string;
  /**
   * `shell`     — wrapped in `PortalShell` (sidebar + header).
   * `fullscreen` — no chrome (used by TV display).
   */
  layout: PortalLayout;
  /**
   * Entry URL on the landing page. Defaults to the shared
   * `/login?redirect=<basePath>` flow when omitted. Portals with their own
   * login (e.g. TV) point straight to it.
   */
  entryHref?: string;
  /**
   * Lucide icon name shown on the landing page card. When omitted the card
   * falls back to the first letter of the (translated) name.
   */
  icon?: string;
  /**
   * Tailwind classes for the landing card icon background. When omitted we
   * use `bg-primary` inside the portal's theme.
   */
  iconBgClass?: string;
  navItems: PortalNavItem[];
}

export const portals: Record<PortalIdentifier, PortalConfig> = {
  admin: {
    id: 'admin',
    nameKey: 'Portal.Admin.name',
    basePath: '/admin',
    themeClass: 'theme-admin',
    layout: 'shell',
    icon: 'Shield',
    navItems: [
      {
        titleKey: 'Portal.Admin.nav.dashboard',
        href: '/admin',
        icon: 'LayoutDashboard',
      },
      {
        titleKey: 'Portal.Admin.nav.staff',
        href: '/admin/staff',
        icon: 'Users',
      },
      {
        titleKey: 'Portal.Admin.nav.families',
        href: '/admin/families',
        icon: 'UsersRound',
      },
      {
        titleKey: 'Portal.Admin.nav.students',
        href: '/admin/students',
        icon: 'GraduationCap',
      },
      {
        titleKey: 'Portal.Admin.nav.pickups',
        href: '/admin/pickups',
        icon: 'Car',
      },
      {
        titleKey: 'Portal.Admin.nav.settings',
        href: '/admin/settings',
        icon: 'Settings',
      },
    ],
  },
  staff: {
    id: 'staff',
    nameKey: 'Portal.Staff.name',
    basePath: '/staff',
    themeClass: 'theme-staff',
    layout: 'shell',
    icon: 'Users',
    navItems: [
      { titleKey: 'Portal.Staff.nav.dashboard', href: '/staff', icon: 'Home' },
      {
        titleKey: 'Portal.Staff.nav.pickups',
        href: '/staff/pickups',
        icon: 'Car',
      },
    ],
  },
  business: {
    id: 'business',
    nameKey: 'Portal.Business.name',
    basePath: '/business',
    themeClass: 'theme-business',
    layout: 'shell',
    icon: 'Building2',
    navItems: [
      {
        titleKey: 'Portal.Business.nav.dashboard',
        href: '/business',
        icon: 'LayoutDashboard',
      },
      {
        titleKey: 'Portal.Business.nav.schools',
        href: '/business/schools',
        icon: 'Building2',
      },
      {
        titleKey: 'Portal.Business.nav.beacons',
        href: '/business/beacons',
        icon: 'Bluetooth',
      },
      {
        titleKey: 'Portal.Business.nav.payments',
        href: '/business/payments',
        icon: 'DollarSign',
      },
      {
        titleKey: 'Portal.Business.nav.users',
        href: '/business/users',
        icon: 'Users',
      },
    ],
  },
  tv: {
    id: 'tv',
    nameKey: 'Portal.Tv.name',
    basePath: '/tv',
    themeClass: 'theme-tv',
    layout: 'fullscreen',
    entryHref: '/tv/login',
    icon: 'Monitor',
    iconBgClass: 'bg-slate-900',
    navItems: [],
  },
};
