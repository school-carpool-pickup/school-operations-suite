'use client';

import { Info, Mail, Pencil, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { NotConnected } from '@/components/shared/NotConnected';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AdminSchool, AdminSchoolInput } from '@/types';
import { SchoolBeaconsTab } from './SchoolBeaconsTab';

export type SchoolTab =
  | 'overview'
  | 'access'
  | 'geofence'
  | 'beacons'
  | 'pricing'
  | 'api';

export interface SchoolTabProps {
  school: AdminSchool;
  /** Persists a partial change to the real backend (name/domain/address/logo). */
  save: (patch: Partial<AdminSchoolInput>) => Promise<boolean>;
  saving: boolean;
}

/* ── Overview ─────────────────────────────────────────────────────────── */
// Per-school stats and revenue have no backend endpoint yet.
export function OverviewTab(_: SchoolTabProps) {
  return <NotConnected />;
}

/* ── Admin & Access ───────────────────────────────────────────────────── */
// Email Domain is the school's real `email_domain_name` (editable via PUT).
// School administrator + staff access have no backend endpoint yet.
export function AdminAccessTab({ school, save, saving }: SchoolTabProps) {
  const t = useTranslations('Business.SchoolDetail');
  const [editing, setEditing] = useState(false);
  const [domain, setDomain] = useState(school.emailDomainName);

  const commit = async () => {
    const next = domain.trim();
    if (!next) {
      toast.error(t('saveErrorTitle'), {
        description: t('emailDomainRequired'),
      });
      return;
    }
    const ok = await save({ email_domain_name: next });
    if (ok) setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Email Domain — REAL */}
      <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <Mail className="w-[18px] h-[18px] text-slate-500" />
              <h3 className="text-[16px] font-bold text-foreground">
                {t('emailDomainTitle')}
              </h3>
            </div>
            {editing ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    setDomain(school.emailDomainName);
                    setEditing(false);
                  }}
                  className="h-[34px] rounded-[8px] border-slate-200 font-semibold px-3"
                >
                  {t('cancel')}
                </Button>
                <Button
                  size="sm"
                  disabled={saving}
                  onClick={commit}
                  className="h-[34px] rounded-[8px] bg-[#020617] hover:bg-slate-800 text-white font-semibold px-3"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {saving ? t('saving') : t('save')}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-[34px] rounded-[8px] border-slate-200 text-slate-700 font-semibold px-3"
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> {t('edit')}
              </Button>
            )}
          </div>
          <p className="text-[13px] text-slate-500 mb-4">
            {t('emailDomainSubtitle')}
          </p>
          {editing ? (
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t('emailDomainPlaceholder')}
              className="h-[46px] rounded-[10px] bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
            />
          ) : (
            <div className="rounded-[10px] border border-slate-200 bg-white p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-800 font-mono">
                  @{school.emailDomainName}
                </p>
                <p className="text-[12.5px] text-slate-500">
                  {t('studentEmailsExample', {
                    domain: school.emailDomainName,
                  })}
                </p>
              </div>
            </div>
          )}
          <div className="mt-4 rounded-[10px] bg-blue-50/70 border border-blue-100 p-3.5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-blue-700/90 font-medium leading-relaxed">
              {t('emailDomainHowItWorks')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* School administrator + staff access — no backend yet. */}
      <NotConnected />
    </div>
  );
}

/* ── Geofence / Beacons / Pricing / API — no backend endpoint yet ─────── */
export function GeofenceTab(_: SchoolTabProps) {
  return <NotConnected />;
}
// Real beacon CRUD, scoped to this school (see SchoolBeaconsTab).
export function BeaconsTab({ school }: SchoolTabProps) {
  return <SchoolBeaconsTab school={school} />;
}
export function PricingTab(_: SchoolTabProps) {
  return <NotConnected />;
}
export function ApiConnectionTab(_: SchoolTabProps) {
  return <NotConnected />;
}

export const SCHOOL_TABS: {
  id: SchoolTab;
  labelKey: string;
  Component: (props: SchoolTabProps) => React.ReactElement;
}[] = [
  { id: 'overview', labelKey: 'tabOverview', Component: OverviewTab },
  { id: 'access', labelKey: 'tabAdminAccess', Component: AdminAccessTab },
  { id: 'geofence', labelKey: 'tabGeofence', Component: GeofenceTab },
  { id: 'beacons', labelKey: 'tabBeacons', Component: BeaconsTab },
  { id: 'pricing', labelKey: 'tabPricing', Component: PricingTab },
  { id: 'api', labelKey: 'tabApiConnection', Component: ApiConnectionTab },
];

export type { AdminSchool };
