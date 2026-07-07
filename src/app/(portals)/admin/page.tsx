'use client';

import { Car, Clock, GraduationCap, UserCog, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { NotConnected } from '@/components/shared/NotConnected';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiKeys, useApi } from '@/lib/api';
import type {
  AdminPickup,
  AdminPickupListResponse,
  AdminPickupSummaryResponse,
  ApiEnvelope,
} from '@/types';
import { AdminPickupStage } from '@/types';

/** Reads the `total` off any enveloped list response for a stat count. */
type ListEnvelope = ApiEnvelope<unknown[]>;
const totalOf = (env?: ListEnvelope): number | undefined => env?.total;

export default function AdminDashboardPage() {
  const t = useTranslations('Admin.Dashboard');

  // Every stat is a real count from the backend list/summary endpoints —
  // no hardcoded numbers. `size: 1` keeps the count queries cheap.
  const familiesQuery = useApi<ListEnvelope>(
    apiKeys.adminFamilies.list({ size: 1 }),
  );
  const studentsQuery = useApi<ListEnvelope>(
    apiKeys.adminStudents.list({ size: 1 }),
  );
  const staffQuery = useApi<ListEnvelope>(apiKeys.adminUsers.list({ size: 1 }));
  const summaryQuery = useApi<AdminPickupSummaryResponse>(
    apiKeys.adminPickups.summary(),
  );
  const counts = summaryQuery.data?.data?.status;
  const activePickups = counts
    ? counts.active + counts.prepare + counts.queued
    : undefined;

  const pickupsQuery = useApi<AdminPickupListResponse>(
    apiKeys.adminPickups.list({
      size: 50,
      order_by: 'created_at',
      order_dir: 'desc',
    }),
  );
  const pickups = pickupsQuery.data?.data ?? [];
  const completedPickups = pickups.filter(
    (p) => p.stage === AdminPickupStage.Completed,
  );
  const recentCompleted = completedPickups.slice(0, 4);

  const fmt = (n: number | undefined): string =>
    n === undefined ? '—' : n.toLocaleString();

  const stats = [
    {
      label: t('totalFamilies'),
      value: fmt(totalOf(familiesQuery.data)),
      icon: <Users className="h-6 w-6" />,
      tone: 'bg-blue-100 text-blue-600',
    },
    {
      label: t('activePickupsToday'),
      value: fmt(activePickups),
      icon: <Car className="h-6 w-6" />,
      tone: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: t('studentsEnrolled'),
      value: fmt(totalOf(studentsQuery.data)),
      icon: <GraduationCap className="h-6 w-6" />,
      tone: 'bg-purple-100 text-purple-600',
    },
    {
      label: t('staffMembers'),
      value: fmt(totalOf(staffQuery.data)),
      icon: <UserCog className="h-6 w-6" />,
      tone: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-sm border-border p-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{s.label}</p>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tone}`}
                >
                  {s.icon}
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight mt-2">
                {s.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Recent Pickup Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="py-4 border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t('recentPickupActivity')}
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 border-none font-semibold"
              >
                {t('completedCount', { count: completedPickups.length })}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {pickupsQuery.isLoading ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  {t('activityLoading')}
                </div>
              ) : recentCompleted.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  {t('activityEmpty')}
                </div>
              ) : (
                recentCompleted.map((pickup) => (
                  <PickupActivityRow key={pickup.id} pickup={pickup} t={t} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions and Status */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-base">{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  title: t('quickActionStaffTitle'),
                  desc: t('quickActionStaffDesc'),
                  icon: <UserCog className="h-5 w-5 text-muted-foreground" />,
                  href: '/admin/staff',
                },
                {
                  title: t('quickActionFamiliesTitle'),
                  desc: t('quickActionFamiliesDesc'),
                  icon: <Users className="h-5 w-5 text-muted-foreground" />,
                  href: '/admin/families',
                },
                {
                  title: t('quickActionStudentsTitle'),
                  desc: t('quickActionStudentsDesc'),
                  icon: (
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  ),
                  href: '/admin/students',
                },
                {
                  title: t('quickActionPickupsTitle'),
                  desc: t('quickActionPickupsDesc'),
                  icon: <Car className="h-5 w-5 text-muted-foreground" />,
                  href: '/admin/pickups',
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-border/80 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-muted/80 transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {action.desc}
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* System status has no backend health endpoint yet. */}
          <Card className="shadow-sm border-border">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-base">{t('systemStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <NotConnected variant="inline" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** One row inside the Recent Pickup Activity card. */
function PickupActivityRow({
  pickup,
  t,
}: {
  pickup: AdminPickup;
  t: ReturnType<typeof useTranslations>;
}) {
  const studentNames = pickup.students
    .map((s) => `${s.first_name} ${s.last_name}`.trim())
    .join(', ');
  const time = new Date(pickup.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-border/80 transition-all">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-bold text-sm text-foreground truncate">
          {studentNames}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('pickedUpBy', { name: pickup.family.family_name })}
        </span>
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 border-none font-medium text-[11px] px-2 py-0.5"
          >
            {t('statusCompleted')}
          </Badge>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
      <span className="font-mono text-[11px] text-muted-foreground shrink-0">
        {pickup.pickup_code ?? pickup.id.slice(0, 8)}
      </span>
    </div>
  );
}
