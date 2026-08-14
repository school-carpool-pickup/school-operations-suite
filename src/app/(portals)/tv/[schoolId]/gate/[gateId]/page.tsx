'use client';

import { Car, LogOut, Monitor, PlugZap, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { apiKeys, useApi } from '@/lib/api';
import type { TvDisplayEnvelope, TvQueueItem } from '@/types';
import { TvLogoutButton } from '../../../_components/TvLogoutButton';

/** Poll cadence for the queue — matches the "auto-refreshing" footer copy. */
const REFRESH_MS = 10_000;

/**
 * TV gate display (KAN-94), wired to `GET /v1/tv/gates/{laneId}/display`.
 *
 * The TV module is read-only with no push feed, so the queue is polled every
 * 10s (the backend serves it from a versioned cache). The clock is local.
 */
export default function TvGateDisplayPage() {
  const t = useTranslations('Tv.GateDisplay');
  const tc = useTranslations('Common');
  const { gateId } = useParams<{ schoolId: string; gateId: string }>();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayQuery = useApi<TvDisplayEnvelope>(
    apiKeys.tv.display(gateId ?? ''),
    { enabled: !!gateId, refetchInterval: REFRESH_MS },
  );
  const gate = displayQuery.data?.data?.gate;
  const stats = displayQuery.data?.data?.stats;
  const queue = displayQuery.data?.data?.queue ?? [];
  const isLoading = displayQuery.isLoading && !displayQuery.data;

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
            <h1 className="text-base font-bold leading-tight">
              {gate ? `${gate.code} · ${gate.name}` : t('brand')}
            </h1>
            <span className="text-[10px] text-slate-400">{t('subtitle')}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {stats && (
            <div className="flex items-center gap-3">
              <StatPill
                label={t('inQueue')}
                value={stats.in_queue}
                className="bg-blue-500/10 text-blue-300"
              />
              <StatPill
                label={t('preparing')}
                value={stats.preparing}
                className="bg-amber-500/10 text-amber-300"
              />
            </div>
          )}
          <div className="flex flex-col items-end">
            <div className="text-lg font-bold tabular-nums tracking-tight">
              {formattedTime ?? '--:--:--'}
            </div>
            <div className="text-[10px] text-slate-400">
              {formattedDate ?? ''}
            </div>
          </div>
          <TvLogoutButton
            className="text-slate-400 hover:text-white transition-colors"
            title={t('logout')}
          >
            <LogOut className="w-5 h-5" />
          </TvLogoutButton>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        {isLoading ? (
          <CenteredNote text={tc('loading')} />
        ) : displayQuery.isError ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
            <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
              <PlugZap className="h-7 w-7" />
            </div>
            <h2 className="text-[17px] font-bold text-slate-200 mt-1">
              {t('loadErrorTitle')}
            </h2>
            <p className="text-[13.5px] text-slate-400 font-medium max-w-md leading-relaxed">
              {t('loadErrorBody')}
            </p>
          </div>
        ) : queue.length === 0 ? (
          <CenteredNote text={t('queueEmpty')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {queue.map((item) => (
              <QueueCard key={item.id} item={item} t={t} />
            ))}
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between px-6 py-2.5 bg-[#0f172a] border-t border-slate-800 text-[11px] text-slate-500">
        <span>{t('footerLabel')}</span>
        <span>{t('autoRefreshing')}</span>
      </footer>
    </div>
  );
}

function StatPill({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div
      className={`flex items-baseline gap-2 rounded-full px-3.5 py-1.5 ${className}`}
    >
      <span className="text-lg font-bold tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function CenteredNote({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[15px] font-medium text-slate-500">{text}</p>
    </div>
  );
}

function QueueCard({
  item,
  t,
}: {
  item: TvQueueItem;
  t: ReturnType<typeof useTranslations>;
}) {
  const inQueue = item.status === 'IN_QUEUE';
  const vehicle = [item.vehicle.brand, item.vehicle.model, item.vehicle.color]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`rounded-2xl border p-5 ${
        inQueue
          ? 'border-blue-500/40 bg-blue-500/[0.07]'
          : 'border-slate-800 bg-[#111827]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[13px] font-bold text-slate-300">
          {item.id}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            inQueue
              ? 'bg-blue-500/20 text-blue-300'
              : 'bg-amber-500/15 text-amber-300'
          }`}
        >
          {inQueue ? t('inQueue') : t('preparing')}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        {item.students.map((student) => (
          <div
            key={`${item.id}-${student.name}`}
            className="flex items-baseline justify-between gap-3"
          >
            <span className="text-lg font-bold text-white truncate">
              {student.name}
            </span>
            <span className="text-[12px] font-semibold text-slate-400 shrink-0">
              {student.grade}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 text-[12.5px] text-slate-400">
        {item.parent.name && (
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {t('parent')}: {item.parent.name}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Car className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {item.vehicle.plate || '—'}
            {vehicle ? ` · ${vehicle}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
