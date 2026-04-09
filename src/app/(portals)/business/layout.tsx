import { PortalShell } from '@/components/layout/PortalShell';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portalId="business">{children}</PortalShell>;
}
