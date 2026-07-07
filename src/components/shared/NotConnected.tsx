import { PlugZap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Placeholder shown wherever the UI has no real data to render — either
 * because the backend endpoint doesn't exist yet, or a section was
 * previously filled with mock data. Keeps the app honest: no fabricated
 * numbers, just a clear "not connected" state. Localised via
 * `Common.notConnected*`.
 *
 * `variant="inline"` renders bare (no card) for use inside an existing
 * card/section; the default wraps itself in a dashed card.
 */
export function NotConnected({
  title,
  message,
  icon,
  variant = 'card',
  className = '',
}: {
  title?: string;
  message?: string;
  icon?: ReactNode;
  variant?: 'card' | 'inline';
  className?: string;
}) {
  const t = useTranslations('Common');

  const body = (
    <div className="flex flex-col items-center text-center gap-2 py-10 px-6">
      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
        {icon ?? <PlugZap className="h-6 w-6" />}
      </div>
      <h4 className="text-[15px] font-bold text-slate-700 mt-1">
        {title ?? t('notConnectedTitle')}
      </h4>
      <p className="text-[13px] text-slate-500 font-medium max-w-sm leading-relaxed">
        {message ?? t('notConnectedBody')}
      </p>
    </div>
  );

  if (variant === 'inline') {
    return <div className={className}>{body}</div>;
  }

  return (
    <Card
      className={`rounded-[16px] border border-dashed border-slate-200 bg-slate-50/40 shadow-none ${className}`}
    >
      <CardContent className="p-0">{body}</CardContent>
    </Card>
  );
}
