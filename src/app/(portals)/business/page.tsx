'use client';

import { useTranslations } from 'next-intl';
import { NotConnected } from '@/components/shared/NotConnected';

/**
 * Business dashboard. Cross-school analytics, revenue, and payout data have
 * no backend module yet, so this shows a not-connected state instead of
 * fabricated numbers. Wire the metric cards + tables once those endpoints
 * ship. (School management already lives under School CRM.)
 */
export default function BusinessDashboardPage() {
  const t = useTranslations('Business.Dashboard');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-[24px] font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
        <p className="text-[14px] text-muted-foreground mt-1 font-medium">
          {t('subtitle')}
        </p>
      </div>

      <NotConnected />
    </div>
  );
}
