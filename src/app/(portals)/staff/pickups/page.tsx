'use client';

import { useTranslations } from 'next-intl';
import { NotConnected } from '@/components/shared/NotConnected';

/**
 * Staff pickup board. Previously a fully hardcoded (useState) mock. The
 * real pickup queue is served by the admin pickup endpoints, which staff
 * accounts can access (RolesInternalLevel4) — this should be wired to
 * `apiKeys.adminPickups` (list/summary/complete/unmark, like the admin
 * pickup board) as a focused follow-up. Until then it shows a
 * not-connected state instead of mock queue rows.
 */
export default function PickupManagementPage() {
  const t = useTranslations('Staff.Pickups');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
      </div>

      <NotConnected />
    </div>
  );
}
