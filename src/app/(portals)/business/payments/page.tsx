'use client';

import { useTranslations } from 'next-intl';
import { NotConnected } from '@/components/shared/NotConnected';

/**
 * Payouts. The backend has no payout module yet (and the transactions
 * endpoint isn't shipped either), so this shows a not-connected state
 * instead of demo payout tables. Wire it once the payout API exists.
 */
export default function PayoutsManagementPage() {
  const t = useTranslations('Business.Payments');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-[24px] font-bold tracking-tight text-foreground leading-none">
          {t('title')}
        </h2>
        <p className="text-[14px] text-muted-foreground mt-1.5 font-medium">
          {t('subtitle')}
        </p>
      </div>

      <NotConnected />
    </div>
  );
}
