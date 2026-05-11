'use client';

import { Car, Clock, GraduationCap, UserCog, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiKeys, useApi } from '@/lib/api';
import type { Pickup } from '@/types';

/**
 * Per-row "by Khun X" attribution. Backend's `Pickup` shape doesn't yet
 * include the staff who marked it complete — when it does (e.g.
 * `processed_by_staff_name`), drop this stub and read from the row.
 */
const PROCESSED_BY_STUB = [
  'Khun Prasert',
  'Khun Nattaya',
  'Khun Wiriya',
  'Khun Aranya',
];

export default function AdminDashboardPage() {
  const t = useTranslations('Admin.Dashboard');

  const pickupsQuery = useApi<Pickup[]>(apiKeys.pickups.list());
  const pickups = pickupsQuery.data ?? [];
  const completedPickups = pickups.filter((p) => p.status === 'Completed');
  // Newest first. ID format `PU-YYYYMMDD-NNN` sorts lexicographically by
  // date+sequence, so reverse-sort gives newest. We slice to the 4 the
  // design shows.
  const recentCompleted = [...completedPickups]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border p-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{t('totalFamilies')}</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight mt-1">2</div>
            <p className="text-xs mt-2 font-medium">
              {t('familiesActive', { count: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border p-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{t('activePickupsToday')}</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Car className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight mt-1">
              10
            </div>
            <p className="text-xs mt-2 font-medium">
              {t('pickupsActiveNow', { count: 5 })}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border p-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{t('studentsEnrolled')}</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight mt-1">3</div>
            <p className="text-xs mt-2 font-medium">
              {t('acrossFamilies', { count: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border p-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{t('staffMembers')}</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <UserCog className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight mt-1">3</div>
            <p className="text-xs mt-2 font-medium">
              {t('staffActive', { count: 3 })}
            </p>
          </CardContent>
        </Card>
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
                recentCompleted.map((pickup, idx) => (
                  <PickupActivityRow
                    key={pickup.id}
                    pickup={pickup}
                    processedBy={
                      PROCESSED_BY_STUB[idx % PROCESSED_BY_STUB.length]
                    }
                    t={t}
                  />
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

          <Card className="shadow-sm border-border">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-base">{t('systemStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('serverStatus')}</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-none px-2 font-medium"
                >
                  {t('online')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('database')}</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-none px-2 font-medium"
                >
                  {t('healthy')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('apiResponse')}</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-none px-2 font-medium"
                >
                  {t('fast')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * One row inside the Recent Pickup Activity card.
 *
 * Left column = the human story (who was picked up, by whom, when, was it a
 * carpool). Right column = the audit trail (pickup ID + which staff processed
 * it). Keep both sides legible at md, collapse gracefully on narrow widths.
 */
function PickupActivityRow({
  pickup,
  processedBy,
  t,
}: {
  pickup: Pickup;
  processedBy: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-border/80 transition-all">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-bold text-sm text-foreground truncate">
          {pickup.students.join(', ')}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('pickedUpBy', { name: pickup.parent })}
        </span>
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 border-none font-medium text-[11px] px-2 py-0.5"
          >
            {t('statusCompleted')}
          </Badge>
          {pickup.isCarpool ? (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 border-none font-medium text-[11px] px-2 py-0.5"
            >
              {t('pickupTypeCarpool')}
            </Badge>
          ) : null}
          <span className="text-xs text-muted-foreground">{pickup.time}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="font-mono text-[11px] text-muted-foreground">
          {pickup.id}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('processedBy', { name: processedBy })}
        </span>
      </div>
    </div>
  );
}
