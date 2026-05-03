import { Car } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

// Mock data
const SCHOOLS: Record<string, string> = {
  bis: 'Bangkok International School',
  sa: 'Sathorn Academy',
};

export default async function TvGateSelectionPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const t = await getTranslations('Tv.GateSelection');
  const resolvedParams = await params;
  const schoolId = resolvedParams.schoolId;
  const schoolName = SCHOOLS[schoolId] || t('unknownSchool');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-[#0b1120]">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-[#1877f2] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
          <Car className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 text-sm mt-2">
          {t('subtitle', { schoolName })}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
        {/* Gate A Card */}
        <Link
          href={`/tv/${schoolId}/gate/a`}
          className="flex-1 bg-[#111827] border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition-colors shadow-xl group relative"
        >
          <div className="w-12 h-12 bg-[#1e3a8a] rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-800 transition-colors">
            <span className="text-blue-300 font-bold text-lg">A</span>
          </div>

          <h2 className="text-white font-bold text-lg mb-1">
            {t('gateAName')}
          </h2>
          <p className="text-slate-400 text-xs mb-4">
            {t('gradesAssigned', { count: 5 })}
          </p>

          <div className="flex flex-wrap gap-2">
            {['KG-1', 'KG-2', 'KG-3', 'Grade 1'].map((grade) => (
              <span
                key={grade}
                className="text-[10px] font-medium bg-[#1f2937] text-slate-300 px-2 py-1 rounded border border-slate-700"
              >
                {grade}
              </span>
            ))}
            <span className="text-[10px] font-medium bg-[#1f2937] text-slate-400 px-2 py-1 rounded border border-slate-700">
              {t('moreCount', { count: 1 })}
            </span>
          </div>
        </Link>

        {/* Gate B Card */}
        <Link
          href={`/tv/${schoolId}/gate/b`}
          className="flex-1 bg-[#111827] border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition-colors shadow-xl group relative"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-[#1e3a8a] rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
              <span className="text-blue-300 font-bold text-lg">B</span>
            </div>
            <div className="bg-[#1e3a8a] border border-[#1e40af] text-blue-200 text-xs font-medium px-3 py-1 rounded-md">
              {t('activeCount', { count: 1 })}
            </div>
          </div>

          <h2 className="text-white font-bold text-lg mb-1">
            {t('gateBName')}
          </h2>
          <p className="text-slate-400 text-xs mb-4">
            {t('gradesAssigned', { count: 4 })}
          </p>

          <div className="flex flex-wrap gap-2">
            {['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((grade) => (
              <span
                key={grade}
                className="text-[10px] font-medium bg-[#1f2937] text-slate-300 px-2 py-1 rounded border border-slate-700"
              >
                {grade}
              </span>
            ))}
          </div>
        </Link>
      </div>

      <Link
        href="/tv/login"
        className="mt-12 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
      >
        {t('logout')}
      </Link>
    </div>
  );
}
