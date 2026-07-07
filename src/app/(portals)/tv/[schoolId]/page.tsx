import { Monitor, PlugZap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { TvLogoutButton } from '../_components/TvLogoutButton';

/**
 * TV gate-selection screen. The lanes/gates and their live queues have no
 * wired backend feed yet (the TV module isn't connected), so instead of a
 * mock gate list this shows a not-connected state. Wire to the real TV
 * gate/queue endpoints once they're available.
 */
export default async function TvGateSelectionPage() {
  const t = await getTranslations('Tv.GateSelection');
  const tc = await getTranslations('Common');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-[#0b1120]">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-[#1877f2] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-dashed border-slate-700 bg-[#111827] p-10 flex flex-col items-center text-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
          <PlugZap className="h-6 w-6" />
        </div>
        <h2 className="text-[15px] font-bold text-slate-200 mt-1">
          {tc('notConnectedTitle')}
        </h2>
        <p className="text-[13px] text-slate-400 font-medium max-w-sm leading-relaxed">
          {tc('notConnectedBody')}
        </p>
      </div>

      <TvLogoutButton className="mt-10 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">
        {t('logout')}
      </TvLogoutButton>
    </div>
  );
}
