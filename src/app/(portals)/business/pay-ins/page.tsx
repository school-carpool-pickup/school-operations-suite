'use client';

import { ArrowDownToLine, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Pay-ins — parent → platform payments (the inbound side of Payouts).
 * The backend Payment module doesn't exist yet (see the parent-app payment
 * ticket), so this is a placeholder until that endpoint ships.
 */
export default function PayInsPage() {
  const t = useTranslations('Business.PayIns');

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

      <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
        <CardContent className="p-12 flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-[16px] bg-orange-50 flex items-center justify-center">
            <ArrowDownToLine className="w-7 h-7 text-orange-500" />
          </div>
          <h3 className="text-[17px] font-bold text-slate-800 mt-1">
            {t('emptyTitle')}
          </h3>
          <p className="text-[13.5px] text-slate-500 font-medium max-w-md leading-relaxed">
            {t('emptyBody')}
          </p>
          <div className="mt-2 rounded-[10px] bg-amber-50/80 border border-amber-200/70 p-3.5 flex items-start gap-2.5 text-left max-w-md">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-amber-800 font-medium leading-relaxed">
              {t('noApiNote')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
