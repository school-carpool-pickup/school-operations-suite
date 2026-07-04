'use client';

import { HelpCircle, LogOut, MapPin, Maximize } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { TvLogoutButton } from '../../../_components/TvLogoutButton';

const MOCK_DATA = {
  gateName: 'Gate B - Side Entrance',
  queue: [
    {
      id: 'B-002',
      status: 'PREPARING',
      type: 'CARPOOL',
      students: [
        {
          name: 'Hana Tanaka',
          grade: 'Grade 3',
          initials: 'HT',
          color: 'bg-blue-600',
        },
        {
          name: 'Lily Chen',
          grade: 'Carpool',
          initials: 'LC',
          color: 'bg-purple-600',
        },
      ],
      parent: {
        name: 'Somchai Tanaka',
        role: 'Parent',
        initials: 'ST',
        color: 'bg-emerald-600',
      },
      vehicle: {
        plate: 'NS-1234',
        desc: 'Toyota Fortuner (Silver)',
        type: 'car',
      },
    },
  ],
  stats: {
    inQueue: 0,
    preparing: 1,
  },
};

export default function TvGateDisplayPage(_: {
  params: Promise<{ schoolId: string; gateId: string }>;
}) {
  const t = useTranslations('Tv.GateDisplay');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#060b14] text-white overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#0f172a] border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none flex items-center justify-center -mt-1 pb-1">
                <span style={{ fontSize: '28px', lineHeight: '28px' }}>
                  &#128663;
                </span>{' '}
                {/* Simple car emoji as fallback since we don't have the exact svg */}
              </span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-tight">
                {t('brand')}
              </h1>
              <span className="text-[10px] text-slate-400">
                {t('subtitle')}
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">
              {MOCK_DATA.gateName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="text-lg font-bold tabular-nums tracking-tight">
              {formattedTime}
            </div>
            <div className="text-[10px] text-slate-400">{formattedDate}</div>
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

      {/* Sub Header / Stats */}
      <div className="flex items-center gap-6 px-6 py-2 bg-[#1e293b] text-xs font-medium border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-slate-300">
            {MOCK_DATA.stats.inQueue} {t('inQueue')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-slate-300">
            {MOCK_DATA.stats.preparing} {t('preparing')}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        {MOCK_DATA.queue.map((item) => (
          <div
            key={item.id}
            className="bg-[#1c1410] border border-orange-900/50 rounded-xl p-5 flex flex-col gap-6 max-w-4xl shadow-2xl"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold tracking-tight">
                  {item.id}
                </span>
                <span className="bg-orange-600/20 text-orange-400 border border-orange-600/50 text-[10px] font-bold px-2 py-1 rounded">
                  {item.status}
                </span>
              </div>
              <span className="bg-purple-900/40 text-purple-300 border border-purple-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {item.type}
              </span>
            </div>

            {/* Middle row: Students */}
            <div className="flex items-center gap-8">
              {item.students.map((student) => (
                <div key={student.name} className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${student.color} flex items-center justify-center font-bold text-lg shadow-inner`}
                  >
                    {student.initials}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{student.name}</div>
                    <div className="text-xs text-slate-400">
                      {student.grade === 'Carpool'
                        ? t('carpoolGrade')
                        : student.grade}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom row: Parent and Vehicle */}
            <div className="flex items-center justify-between pt-4 border-t border-orange-900/30">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${item.parent.color} flex items-center justify-center font-bold text-sm shadow-inner`}
                >
                  {item.parent.initials}
                </div>
                <div>
                  <div className="text-xs text-slate-400">{t('parent')}</div>
                  <div className="text-sm font-bold">{item.parent.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center overflow-hidden border border-slate-700">
                  <div className="w-8 h-4 bg-slate-400 rounded-sm relative">
                    <div className="absolute top-0 right-1 w-2 h-1 bg-white rounded-sm opacity-50"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tracking-wide">
                    {item.vehicle.plate}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.vehicle.desc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-2 bg-[#0f172a] border-t border-slate-800 text-[10px] text-slate-500">
        <div>{t('footerLabel')}</div>
        <div className="flex items-center gap-2">
          <span>{t('autoRefreshing')}</span>
          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 hover:text-slate-300 cursor-pointer transition-colors">
            <HelpCircle className="w-3 h-3" />
          </div>
        </div>
      </footer>
    </div>
  );
}
