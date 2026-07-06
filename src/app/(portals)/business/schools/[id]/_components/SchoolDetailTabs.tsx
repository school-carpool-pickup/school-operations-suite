'use client';

import {
  AlertCircle,
  Car,
  CheckCircle2,
  GraduationCap,
  Info,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  UserCog,
  Users,
  Wifi,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AdminSchool, AdminSchoolInput } from '@/types';

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

/* ── shared bits ──────────────────────────────────────────────────────── */

/** Marks a card whose data has no backend endpoint yet (display-only). */
function DemoBadge() {
  const t = useTranslations('Business.SchoolDetail');
  return (
    <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none px-2 py-0.5 text-[11px] font-semibold shrink-0">
      {t('demoBadge')}
    </Badge>
  );
}

function SectionCard({
  title,
  icon,
  demo,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  demo?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-[16px] font-bold text-foreground">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {demo ? <DemoBadge /> : null}
            {action}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const disabledInput =
  'h-[42px] rounded-[8px] bg-slate-100/70 border-slate-200 text-[14px] font-medium shadow-none text-slate-600';

/* ── Overview ─────────────────────────────────────────────────────────── */

export function OverviewTab({ school }: SchoolTabProps) {
  const t = useTranslations('Business.SchoolDetail');
  const stats = [
    {
      label: t('statStudents'),
      value: '—',
      icon: <GraduationCap className="w-5 h-5 text-blue-500" />,
    },
    {
      label: t('statParents'),
      value: '—',
      icon: <Users className="w-5 h-5 text-purple-500" />,
    },
    {
      label: t('statPickupsDay'),
      value: '—',
      icon: <Car className="w-5 h-5 text-emerald-500" />,
    },
    {
      label: t('statCarpoolsDay'),
      value: '—',
      icon: <Car className="w-5 h-5 text-orange-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
          >
            <CardContent className="p-5 flex flex-col items-center text-center gap-1.5">
              {s.icon}
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight mt-1">
                {s.value}
              </span>
              <span className="text-[12.5px] font-semibold text-slate-500">
                {s.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionCard title={t('dailyRevenueTitle')} demo>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-[12px] bg-emerald-50/70 border border-emerald-100 p-5">
            <p className="text-[13px] font-semibold text-slate-600">
              {t('grossRevenue')}
            </p>
            <p className="text-[26px] font-black text-emerald-600 leading-none mt-2">
              —
            </p>
            <p className="text-[12px] text-slate-500 mt-1.5">
              {t('perRidesHint')}
            </p>
          </div>
          <div className="rounded-[12px] bg-orange-50/70 border border-orange-100 p-5">
            <p className="text-[13px] font-semibold text-slate-600">
              {t('commissionProfit')}
            </p>
            <p className="text-[26px] font-black text-orange-500 leading-none mt-2">
              —
            </p>
            <p className="text-[12px] text-slate-500 mt-1.5">
              {t('ofGross', { pct: 10 })}
            </p>
          </div>
          <div className="rounded-[12px] bg-blue-50/70 border border-blue-100 p-5">
            <p className="text-[13px] font-semibold text-slate-600">
              {t('driverPayouts')}
            </p>
            <p className="text-[26px] font-black text-blue-600 leading-none mt-2">
              —
            </p>
            <p className="text-[12px] text-slate-500 mt-1.5">
              {t('ofGross', { pct: 90 })}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard
          title={t('apiStatusTitle')}
          icon={<Wifi className="w-[18px] h-[18px] text-slate-500" />}
          demo
        >
          <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-2.5 py-1 text-[12px] font-semibold">
            {t('connected')}
          </Badge>
          <p className="text-[13px] text-slate-500 mt-3">
            {t('createdOn', {
              date: new Date(school.created_at).toLocaleDateString(),
            })}
          </p>
        </SectionCard>
        <SectionCard
          title={t('beaconsTitle')}
          icon={<Radio className="w-[18px] h-[18px] text-slate-500" />}
          demo
        >
          <p className="text-[28px] font-black text-foreground leading-none">
            —
          </p>
          <p className="text-[13px] text-slate-500 mt-2">
            {t('beaconsBreakdownEmpty')}
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

/* ── Admin & Access ───────────────────────────────────────────────────── */

export function AdminAccessTab({ school, save, saving }: SchoolTabProps) {
  const t = useTranslations('Business.SchoolDetail');
  const [editingDomain, setEditingDomain] = useState(false);
  const [domain, setDomain] = useState(school.emailDomainName);

  const commitDomain = async () => {
    const next = domain.trim();
    if (!next) {
      toast.error(t('saveErrorTitle'), {
        description: t('emailDomainRequired'),
      });
      return;
    }
    const ok = await save({ email_domain_name: next });
    if (ok) setEditingDomain(false);
  };

  return (
    <div className="space-y-6">
      {/* School Administrator — display-only (no backend) */}
      <SectionCard
        title={t('schoolAdminTitle')}
        icon={<UserCog className="w-[18px] h-[18px] text-slate-500" />}
        demo
      >
        <p className="text-[13px] text-slate-500 -mt-3 mb-4">
          {t('schoolAdminSubtitle')}
        </p>
        <div className="rounded-[12px] border border-emerald-100 bg-emerald-50/40 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-11 w-11 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <UserCog className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold text-slate-800">
                {t('adminPlaceholderName')}
              </p>
              <p className="text-[13px] text-slate-500 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                admin@{school.emailDomainName}
              </p>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[10.5px] font-bold mt-1">
                {t('activeAdmin')}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="h-[34px] rounded-[8px] border-slate-200 text-slate-400 font-semibold px-3 shrink-0"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> {t('edit')}
          </Button>
        </div>
      </SectionCard>

      {/* Email Domain — REAL (email_domain_name via PUT) */}
      <SectionCard
        title={t('emailDomainTitle')}
        icon={<Mail className="w-[18px] h-[18px] text-slate-500" />}
        action={
          editingDomain ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => {
                  setDomain(school.emailDomainName);
                  setEditingDomain(false);
                }}
                className="h-[34px] rounded-[8px] border-slate-200 font-semibold px-3"
              >
                {t('cancel')}
              </Button>
              <Button
                size="sm"
                disabled={saving}
                onClick={commitDomain}
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
              onClick={() => setEditingDomain(true)}
              className="h-[34px] rounded-[8px] border-slate-200 text-slate-700 font-semibold px-3"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> {t('edit')}
            </Button>
          )
        }
      >
        <p className="text-[13px] text-slate-500 -mt-3 mb-4">
          {t('emailDomainSubtitle')}
        </p>
        {editingDomain ? (
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
      </SectionCard>

      {/* Staff Access — display-only */}
      <SectionCard
        title={t('staffAccessTitle')}
        icon={<Shield className="w-[18px] h-[18px] text-slate-500" />}
        demo
      >
        <p className="text-[13px] text-slate-500 -mt-3 mb-4">
          {t('staffAccessSubtitle')}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[12px] bg-orange-50/60 border border-orange-100 p-4 text-center">
            <p className="text-[24px] font-black text-orange-500 leading-none">
              —
            </p>
            <p className="text-[12.5px] font-semibold text-slate-500 mt-1.5">
              {t('totalStaff')}
            </p>
          </div>
          <div className="rounded-[12px] bg-blue-50/60 border border-blue-100 p-4 text-center">
            <p className="text-[24px] font-black text-blue-600 leading-none">
              —
            </p>
            <p className="text-[12.5px] font-semibold text-slate-500 mt-1.5">
              {t('adminCount')}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-[10px] bg-slate-50/80 border border-slate-100 p-4">
          <p className="text-[13px] font-semibold text-slate-600 mb-2">
            {t('accessModelHeading')}
          </p>
          <ul className="text-[12.5px] text-slate-500 font-medium space-y-1 list-disc pl-5">
            <li>{t('accessModelItem1')}</li>
            <li>{t('accessModelItem2')}</li>
            <li>{t('accessModelItem3')}</li>
            <li>{t('accessModelItem4')}</li>
          </ul>
        </div>
        <Button
          variant="outline"
          disabled
          className="w-full mt-4 h-[44px] rounded-[10px] font-semibold text-slate-500 border-slate-200"
        >
          <Users className="w-4 h-4 mr-2" /> {t('viewStaffDetails')}
        </Button>
      </SectionCard>
    </div>
  );
}

/* ── Geofence ─────────────────────────────────────────────────────────── */

export function GeofenceTab(_: SchoolTabProps) {
  const t = useTranslations('Business.SchoolDetail');
  return (
    <SectionCard
      title={t('geofenceTitle')}
      demo
      action={
        <Button
          variant="outline"
          size="sm"
          disabled
          className="h-[34px] rounded-[8px] border-slate-200 text-slate-400 font-semibold px-3"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> {t('edit')}
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="space-y-1.5">
          <span className="text-[12.5px] font-semibold text-slate-500">
            {t('latitude')}
          </span>
          <Input disabled placeholder="13.738" className={disabledInput} />
        </div>
        <div className="space-y-1.5">
          <span className="text-[12.5px] font-semibold text-slate-500">
            {t('longitude')}
          </span>
          <Input disabled placeholder="100.568" className={disabledInput} />
        </div>
        <div className="space-y-1.5">
          <span className="text-[12.5px] font-semibold text-slate-500">
            {t('radiusMeters')}
          </span>
          <Input disabled placeholder="500" className={disabledInput} />
        </div>
      </div>
      <div className="rounded-[12px] border border-slate-200 bg-slate-50/70 h-[240px] flex flex-col items-center justify-center gap-1 text-center">
        <MapPin className="w-7 h-7 text-slate-300" />
        <p className="text-[14px] font-semibold text-slate-400">
          {t('mapView')}
        </p>
        <p className="text-[12px] text-slate-400">{t('mapPlaceholderNote')}</p>
      </div>
    </SectionCard>
  );
}

/* ── Beacons ──────────────────────────────────────────────────────────── */

const MOCK_BEACONS = [
  {
    id: 'b-a',
    name: 'Gate A - Main Entrance',
    uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
    lastSeen: '3/12/2026, 2:55:00 PM',
  },
  {
    id: 'b-b',
    name: 'Gate B - Side Entrance',
    uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
    lastSeen: '3/12/2026, 2:53:00 PM',
  },
];

export function BeaconsTab(_: SchoolTabProps) {
  const t = useTranslations('Business.SchoolDetail');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold text-slate-600">
            {t('beaconsConfigured', { count: MOCK_BEACONS.length })}
          </p>
          <DemoBadge />
        </div>
        <Button
          disabled
          className="h-[38px] rounded-[10px] bg-[#020617] hover:bg-slate-800 text-white/90 font-semibold px-4 disabled:opacity-60"
        >
          <Plus className="w-4 h-4 mr-1.5" /> {t('addBeacon')}
        </Button>
      </div>
      {MOCK_BEACONS.map((b) => (
        <Card
          key={b.id}
          className="rounded-[14px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-[10px] bg-emerald-50 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-slate-800 truncate">
                  {b.name}
                </p>
                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-2 py-0.5 text-[10.5px] font-bold">
                  {t('active')}
                </Badge>
              </div>
              <p className="text-[12px] text-slate-500 font-mono truncate">
                {b.uuid}
              </p>
              <p className="text-[11.5px] text-slate-400">
                {t('lastSeen', { time: b.lastSeen })}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-slate-300">
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8 rounded-[6px]"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8 rounded-[6px] text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Pricing ──────────────────────────────────────────────────────────── */

export function PricingTab(_: SchoolTabProps) {
  const t = useTranslations('Business.SchoolDetail');
  return (
    <SectionCard title={t('pricingTitle')} demo>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-slate-600">
            {t('costPerRide')}
          </span>
          <Input disabled placeholder="300" className={disabledInput} />
          <p className="text-[12px] text-slate-400">{t('costPerRideHint')}</p>
        </div>
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-slate-600">
            {t('commissionPct')}
          </span>
          <Input disabled placeholder="10" className={disabledInput} />
          <p className="text-[12px] text-slate-400">{t('commissionPctHint')}</p>
        </div>
      </div>
      <div className="rounded-[12px] bg-slate-50/80 border border-slate-100 p-5">
        <p className="text-[13px] font-semibold text-slate-600 mb-3">
          {t('perRideBreakdown')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[10px] bg-white border border-slate-200 p-4">
            <p className="text-[12px] text-slate-500">{t('rideCost')}</p>
            <p className="text-[18px] font-black text-slate-800 mt-1">฿300</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              {t('chargedToParent')}
            </p>
          </div>
          <div className="rounded-[10px] bg-white border border-slate-200 p-4">
            <p className="text-[12px] text-slate-500">{t('driverGets')}</p>
            <p className="text-[18px] font-black text-emerald-600 mt-1">฿270</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">90%</p>
          </div>
          <div className="rounded-[10px] bg-white border border-slate-200 p-4">
            <p className="text-[12px] text-slate-500">{t('platformFee')}</p>
            <p className="text-[18px] font-black text-orange-500 mt-1">฿30</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">10%</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ── API Connection ───────────────────────────────────────────────────── */

export function ApiConnectionTab({ school }: SchoolTabProps) {
  const t = useTranslations('Business.SchoolDetail');
  return (
    <SectionCard title={t('apiConnectionTitle')}>
      <p className="text-[13px] text-slate-500 -mt-3 mb-4">
        {t('apiConnectionSubtitle')}
      </p>
      <div className="rounded-[12px] border border-slate-200 bg-white p-4 flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-[14px] font-bold text-slate-700">
            {t('connected')}
          </span>
          <DemoBadge />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="h-[34px] rounded-[8px] border-slate-200 text-slate-400 font-semibold px-3"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> {t('syncNow')}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <span className="text-[12.5px] font-semibold text-slate-500">
            {t('apiEndpointUrl')}
          </span>
          <Input
            disabled
            placeholder={`https://api.${school.emailDomainName}/v2/students`}
            className={`${disabledInput} font-mono text-[13px]`}
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-[12.5px] font-semibold text-slate-500">
            {t('apiKey')}
          </span>
          <Input
            disabled
            type="password"
            placeholder="••••••••••••••••••••"
            className={disabledInput}
          />
        </div>
        <div className="rounded-[10px] bg-blue-50/70 border border-blue-100 p-3.5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-blue-700/90 font-medium leading-relaxed">
            {t('apiConnectionHowItWorks')}
          </p>
        </div>
      </div>
    </SectionCard>
  );
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
