export type PortalIdentifier = 'admin' | 'staff' | 'business';

export interface PortalConfig {
  id: PortalIdentifier;
  name: string;
  basePath: string;
  themeClass: string;
  navItems: { title: string; href: string; icon: string }[];
}

export const portals: Record<PortalIdentifier, PortalConfig> = {
  admin: {
    id: 'admin',
    name: 'Admin Portal',
    basePath: '/admin',
    themeClass: 'theme-admin',
    navItems: [
      { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
      { title: 'Staff CRM', href: '/admin/staff', icon: 'Users' },
      { title: 'Family CRM', href: '/admin/families', icon: 'UsersRound' },
      { title: 'Student CRM', href: '/admin/students', icon: 'GraduationCap' },
      { title: 'Pickup CRM', href: '/admin/pickups', icon: 'Car' },
      { title: 'School Settings', href: '/admin/settings', icon: 'Settings' },
    ],
  },
  staff: {
    id: 'staff',
    name: 'Staff Portal',
    basePath: '/staff',
    themeClass: 'theme-staff',
    navItems: [
      { title: 'Dashboard', href: '/staff', icon: 'Home' },
      { title: 'Pickup Management', href: '/staff/pickups', icon: 'Car' },
    ],
  },
  business: {
    id: 'business',
    name: 'Business Portal',
    basePath: '/business',
    themeClass: 'theme-business',
    navItems: [
      { title: 'Dashboard', href: '/business', icon: 'LayoutDashboard' },
      { title: 'School CRM', href: '/business/schools', icon: 'Building2' },
      { title: 'BLE Beacons', href: '/business/beacons', icon: 'Bluetooth' },
      { title: 'Payouts', href: '/business/payments', icon: 'DollarSign' },
      { title: 'Platform Users', href: '/business/users', icon: 'Users' },
    ],
  },
};
