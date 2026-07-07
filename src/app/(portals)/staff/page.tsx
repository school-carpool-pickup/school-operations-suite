'use client';

import { useTranslations } from 'next-intl';
import { NotConnected } from '@/components/shared/NotConnected';

/**
 * Staff dashboard. The stat cards and queue preview were mock data. The
 * pickup data itself is available via the admin pickup endpoints (staff
 * have access), so this can be wired to real queue counts later; for now
 * it shows a not-connected state rather than fabricated numbers.
 */
export default function StaffDashboardPage() {
  const t = useTranslations('Staff.Dashboard');

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
      </div>

      <NotConnected />
    </div>
  );
}
