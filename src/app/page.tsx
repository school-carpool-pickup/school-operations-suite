import {
  Building2,
  GraduationCap,
  type LucideIcon,
  Monitor,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { portals } from '@/config/portals';

const IconMap: Record<string, LucideIcon> = {
  Shield,
  Users,
  Building2,
  Monitor,
  GraduationCap,
};

export default async function PortalSelectorPage() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8">
      <div className="flex w-full max-w-4xl flex-col gap-12">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
            {t('Landing.title')}
          </h1>
          <p className="text-xl text-zinc-600">{t('Landing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Object.values(portals).map((portal) => {
            const href =
              portal.entryHref ?? `/login?redirect=${portal.basePath}`;
            const Icon = portal.icon ? IconMap[portal.icon] : null;
            const iconBg = portal.iconBgClass ?? 'bg-primary';
            const name = t(portal.nameKey);

            return (
              <Link
                key={portal.id}
                href={href}
                className={`flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${portal.themeClass}`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-sm ${iconBg}`}
                >
                  {Icon ? (
                    <Icon className="h-8 w-8" strokeWidth={2.25} />
                  ) : (
                    <span className="font-bold text-2xl">{name[0]}</span>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="font-bold text-xl text-zinc-900">{name}</h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {t('Landing.enterPortal', { name })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
