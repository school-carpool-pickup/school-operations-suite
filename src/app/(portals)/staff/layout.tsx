import { PortalShell } from '@/components/layout/PortalShell';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portalId="staff">{children}</PortalShell>;
}
