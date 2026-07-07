'use client';

import { LogOut, Maximize, Monitor, PlugZap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { TvLogoutButton } from '../../../_components/TvLogoutButton';

/**
 * TV gate display. The live pickup queue has no wired backend feed yet, so
 * instead of a mock queue this shows a not-connected state. Wire to the
 * real TV gate/queue endpoint once it's available. The clock is real
 * (current time), not mock data.
 */
export default function TvGateDisplayPage(_: {
  params: Promise<{ schoolId: string; gateId: string }>;
}) {
  const t = useTranslations('Tv.GateDisplay');
  const tc = useTranslations('Common');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const formattedDate = currentTime?.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#060b14] text-white overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#0f172a] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold leading-tight">{t('brand')}</h1>
            <span className="text-[10px] text-slate-400">{t('subtitle')}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="text-lg font-bold tabular-nums tracking-tight">
              {formattedTime ?? '--:--:--'}
            </div>
            <div className="text-[10px] text-slate-400">
              {formattedDate ?? ''}
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              type="button"
              className="hover:text-white transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
            <TvLogoutButton
              className="hover:text-white transition-colors"
              title={t('logout')}
            >
              <LogOut className="w-5 h-5" />
            </TvLogoutButton>
          </div>
        </div>
      </header>

      {/* Not connected */}
      <main className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
          <PlugZap className="h-7 w-7" />
        </div>
        <h2 className="text-[17px] font-bold text-slate-200 mt-1">
          {tc('notConnectedTitle')}
        </h2>
        <p className="text-[13.5px] text-slate-400 font-medium max-w-md leading-relaxed">
          {tc('notConnectedBody')}
        </p>
      </main>
    </div>
  );
}
