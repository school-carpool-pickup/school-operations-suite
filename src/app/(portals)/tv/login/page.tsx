import { ArrowLeft, Lock, Monitor } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function TvLoginPage() {
  const t = await getTranslations('Tv.Login');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-[#1877f2] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">SafePickup</h1>
        <p className="text-slate-400 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Login Form Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-slate-300" />
            <h2 className="text-slate-200 font-semibold text-sm">
              {t('cardTitle')}
            </h2>
          </div>
          <p className="text-slate-400 text-xs mb-6">{t('cardSubtitle')}</p>

          <div className="space-y-4">
            <div>
              <span className="block text-slate-300 text-xs font-medium mb-2">
                {t('passwordLabel')}
              </span>
              <input
                type="password"
                className="w-full bg-[#1f2937] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder={t('passwordPlaceholder')}
              />
            </div>
            <Link
              href="/tv/bis"
              className="w-full bg-[#1c4ed8] hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors"
            >
              <Monitor className="w-4 h-4" />
              {t('accessDisplay')}
            </Link>
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> {t('backToOverview')}
      </Link>
    </div>
  );
}
