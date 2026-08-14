'use client';

import { ChevronRight, GraduationCap, Monitor, PlugZap } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiKeys, useApi } from '@/lib/api';
import type { TvGatesEnvelope } from '@/types';
import { TvLogoutButton } from '../_components/TvLogoutButton';

/**
 * TV gate-selection screen (KAN-94), wired to `GET /v1/tv/gates`.
 *
 * The endpoint is scoped to the school on the TV account's JWT, so no school
 * id is sent — the `[schoolId]` segment only builds the display links. Gate
 * counts are polled (the TV module is read-only, no push feed), which also
 * keeps a kiosk left on this screen from going stale.
 */
export default function TvGateSelectionPage() {
  const t = useTranslations('Tv.GateSelection');
  const tc = useTranslations('Common');
  const { schoolId } = useParams<{ schoolId: string }>();

  const gatesQuery = useApi<TvGatesEnvelope>(apiKeys.tv.gates(), {
    refetchInterval: 15_000,
  });
  const school = gatesQuery.data?.data?.school;
  const gates = gatesQuery.data?.data?.gates ?? [];
  const isLoading = gatesQuery.isLoading && !gatesQuery.data;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-[#0b1120]">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-[#1877f2] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-sm text-slate-400 mt-2">
          {t('subtitle', { schoolName: school?.name ?? t('unknownSchool') })}
        </p>
      </div>

      {isLoading ? (
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-10 text-center text-[13px] font-medium text-slate-400">
          {tc('loading')}
        </div>
      ) : gatesQuery.isError ? (
        <div className="w-full max-w-md rounded-2xl border border-dashed border-slate-700 bg-[#111827] p-10 flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
            <PlugZap className="h-6 w-6" />
          </div>
          <h2 className="text-[15px] font-bold text-slate-200 mt-1">
            {t('loadErrorTitle')}
          </h2>
          <p className="text-[13px] text-slate-400 font-medium max-w-sm leading-relaxed">
            {t('loadErrorBody')}
          </p>
        </div>
      ) : gates.length === 0 ? (
        <div className="w-full max-w-md rounded-2xl border border-dashed border-slate-700 bg-[#111827] p-10 text-center text-[13px] font-medium text-slate-400">
          {t('noGates')}
        </div>
      ) : (
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          {gates.map((gate) => (
            <Link
              key={gate.id}
              href={`/tv/${schoolId}/gate/${gate.id}`}
              className="group rounded-2xl border border-slate-800 bg-[#111827] p-6 transition-colors hover:border-blue-500/60 hover:bg-[#131c31]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
                    {gate.code}
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-white truncate">
                    {gate.name}
                  </h2>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-600 transition-colors group-hover:text-blue-400" />
              </div>

              <div className="mt-4 flex items-center gap-2 text-[12px] font-medium text-slate-400">
                <GraduationCap className="h-4 w-4" />
                {t('gradesAssigned', { count: gate.grades.length })}
              </div>
              {gate.grades.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {gate.grades.slice(0, 4).map((grade) => (
                    <span
                      key={grade}
                      className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300"
                    >
                      {grade}
                    </span>
                  ))}
                  {gate.grades.length > 4 && (
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                      {t('moreCount', { count: gate.grades.length - 4 })}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-[12px] font-bold text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {t('activeCount', { count: gate.active_count })}
              </div>
            </Link>
          ))}
        </div>
      )}

      <TvLogoutButton className="mt-10 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">
        {t('logout')}
      </TvLogoutButton>
    </div>
  );
}
