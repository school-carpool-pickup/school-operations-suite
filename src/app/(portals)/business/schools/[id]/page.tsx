'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  CheckSquare,
  Clock,
  Info,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type { AdminSchool, AdminSchoolInput, ApiEnvelope } from '@/types';

const envelopeFailed = (env?: ApiEnvelope<unknown>): boolean =>
  Boolean(env?.error?.code || env?.error?.message);

const readError = (err: Error): string => {
  const data = (
    err as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data;
  return data?.error?.message ?? err.message ?? '';
};

function NoApiBadge() {
  const t = useTranslations('Business.SchoolDetail');
  return (
    <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none px-2 py-0.5 text-[11px] font-semibold">
      {t('noApiBadge')}
    </Badge>
  );
}

export default function SchoolDetailsPage() {
  const t = useTranslations('Business.SchoolDetail');
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');

  const detailQuery = useApi<ApiEnvelope<AdminSchool>>(
    apiKeys.adminSchools.byId(id),
  );
  const school = detailQuery.data?.data;

  if (detailQuery.isLoading && !detailQuery.data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t('loading')}
      </div>
    );
  }

  if (!school) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <p className="text-muted-foreground">{t('notFound')}</p>
        <Link href="/business/schools">
          <Button variant="outline" className="rounded-[10px]">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('backToList')}
          </Button>
        </Link>
      </div>
    );
  }

  return <SchoolEditor key={school.id} school={school} />;
}

function SchoolEditor({ school }: { school: AdminSchool }) {
  const t = useTranslations('Business.SchoolDetail');
  const queryClient = useQueryClient();

  const [name, setName] = useState(school.name);
  const [emailDomain, setEmailDomain] = useState(school.emailDomainName);
  const [address, setAddress] = useState(school.address ?? '');
  const [logoUrl, setLogoUrl] = useState(school.logo_url ?? '');

  const saveMutation = useApiMutation<
    ApiEnvelope<AdminSchool>,
    AdminSchoolInput
  >((input) => apiKeys.adminSchools.update(school.id, input), {
    onSuccess: (env) => {
      if (envelopeFailed(env)) {
        toast.error(t('saveErrorTitle'), {
          description: env.error.message || t('saveErrorGeneric'),
        });
        return;
      }
      toast.success(t('saveSuccessTitle'), {
        description: t('saveSuccessDescription', { name }),
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] });
    },
    onError: (err) => {
      toast.error(t('saveErrorTitle'), {
        description: readError(err) || t('saveErrorGeneric'),
      });
    },
  });

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedDomain = emailDomain.trim();
    if (!trimmedName) {
      toast.error(t('saveErrorTitle'), { description: t('nameRequired') });
      return;
    }
    if (!trimmedDomain) {
      toast.error(t('saveErrorTitle'), {
        description: t('emailDomainRequired'),
      });
      return;
    }
    saveMutation.mutate({
      name: trimmedName,
      email_domain_name: trimmedDomain,
      ...(address.trim() ? { address: address.trim() } : {}),
      ...(logoUrl.trim() ? { logo_url: logoUrl.trim() } : {}),
    });
  };

  const inputClass =
    'h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none';
  const disabledInputClass =
    'h-[42px] rounded-[8px] bg-slate-100/80 border-slate-200 text-[14px] font-medium shadow-none';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/business/schools"
            className="mt-1.5 h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[24px] font-bold tracking-tight text-foreground leading-none">
                {name || school.name}
              </h2>
            </div>
            <p className="text-[14px] text-muted-foreground mt-1.5 font-medium">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-3 py-1 text-[12px] font-semibold">
            {t('createdLabel', {
              date: new Date(school.created_at).toLocaleDateString(),
            })}
          </Badge>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-[40px] rounded-[10px] bg-[#020617] hover:bg-slate-800 text-white shadow-sm font-semibold px-5 flex items-center gap-2 transition-all"
          >
            <Save className="w-[18px] h-[18px]" strokeWidth={2.5} />{' '}
            {saveMutation.isPending ? t('saving') : t('saveChanges')}
          </Button>
        </div>
      </div>

      {/* Only Basic Information is backed by the API. */}
      <div className="bg-blue-50/80 border border-blue-100 rounded-[12px] p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[13px] text-blue-700 font-medium leading-relaxed">
          {t('connectedNote')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-2">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full">
          {/* Basic Information — wired */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-7">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('basicInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <span className="text-[13.5px] font-semibold text-slate-700">
                    {t('schoolNameLabel')}
                  </span>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[13.5px] font-semibold text-slate-700">
                    {t('emailDomainLabel')}
                  </span>
                  <Input
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    placeholder={t('emailDomainPlaceholder')}
                    className={inputClass}
                  />
                  <p className="text-[12px] text-muted-foreground px-0.5">
                    {t('emailDomainDescription')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[13.5px] font-semibold text-slate-700">
                  {t('addressLabel')}
                </span>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t('addressPlaceholder')}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <span className="text-[13.5px] font-semibold text-slate-700">
                  {t('logoUrlLabel')}
                </span>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder={t('logoUrlPlaceholder')}
                  className={inputClass}
                />
              </div>

              {/* Fields the backend doesn't store yet — kept, but disabled. */}
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[12px] font-medium text-slate-400">
                  {t('noApiFieldsNote')}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <span className="text-[13.5px] font-semibold text-slate-400">
                    {t('gradesLabel')}
                  </span>
                  <Input disabled className={disabledInputClass} />
                </div>
                <div className="space-y-2">
                  <span className="text-[13.5px] font-semibold text-slate-400">
                    {t('phoneLabel')}
                  </span>
                  <Input disabled className={disabledInputClass} />
                </div>
                <div className="space-y-2">
                  <span className="text-[13.5px] font-semibold text-slate-400">
                    {t('emailLabel')}
                  </span>
                  <Input disabled className={disabledInputClass} />
                </div>
                <div className="space-y-2">
                  <span className="text-[13.5px] font-semibold text-slate-400">
                    {t('websiteLabel')}
                  </span>
                  <Input disabled className={disabledInputClass} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School API Integration — not in API */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-7 flex flex-row items-center justify-between">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('apiIntegrationTitle')}
              </CardTitle>
              <NoApiBadge />
            </CardHeader>
            <CardContent className="px-7 pb-7 space-y-5">
              <div className="bg-blue-50/80 border border-blue-100 rounded-[10px] p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-blue-800 mb-0.5">
                    {t('aboutApiHeading')}
                  </h4>
                  <p className="text-[13px] text-blue-600/90 font-medium leading-relaxed">
                    {t('aboutApiBody')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[13.5px] font-semibold text-slate-400">
                  {t('apiEndpointLabel')}
                </span>
                <Input disabled className={disabledInputClass} />
              </div>
              <div className="space-y-2">
                <span className="text-[13.5px] font-semibold text-slate-400">
                  {t('apiKeyLabel')}
                </span>
                <Input
                  disabled
                  type="password"
                  className={disabledInputClass}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  disabled
                  className="h-[40px] rounded-[8px] font-semibold text-slate-400 border-slate-200 px-5"
                >
                  {t('testConnection')}
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="h-[40px] rounded-[8px] font-semibold text-slate-400 border-slate-200 px-5"
                >
                  {t('syncNow')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Settings — not in API */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-7 flex flex-row items-center justify-between">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('pickupSettings')}
              </CardTitle>
              <NoApiBadge />
            </CardHeader>
            <CardContent className="px-7 pb-7 space-y-6">
              <div className="bg-purple-50/60 border border-purple-100 rounded-[10px] p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-purple-800 mb-0.5">
                    {t('laneConfigHeading')}
                  </h4>
                  <p className="text-[13px] text-purple-600/90 font-medium leading-relaxed">
                    {t('laneConfigBody')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <span className="text-[13.5px] font-semibold text-slate-400">
                    {t('pickupStartTimeLabel')}
                  </span>
                  <div className="relative">
                    <Input disabled className={`pr-10 ${disabledInputClass}`} />
                    <Clock className="w-4 h-4 text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[13.5px] font-semibold text-slate-400">
                    {t('pickupEndTimeLabel')}
                  </span>
                  <div className="relative">
                    <Input disabled className={`pr-10 ${disabledInputClass}`} />
                    <Clock className="w-4 h-4 text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
              <div className="border border-slate-200/80 rounded-[10px] p-4 flex items-center justify-between opacity-60">
                <div>
                  <p className="text-[14px] font-bold text-slate-800">
                    {t('allowCarpoolMarketplace')}
                  </p>
                  <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                    {t('allowCarpoolMarketplaceDesc')}
                  </p>
                </div>
                <div className="w-5 h-5 rounded-[4px] bg-slate-300 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="border border-slate-200/80 rounded-[10px] p-4 flex items-center justify-between opacity-60">
                <div>
                  <p className="text-[14px] font-bold text-slate-800">
                    {t('requireBleBeacon')}
                  </p>
                  <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                    {t('requireBleBeaconDesc')}
                  </p>
                </div>
                <div className="w-5 h-5 rounded-[4px] bg-slate-300 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full">
          {/* School Statistics — not in API */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('schoolStatistics')}
              </CardTitle>
              <NoApiBadge />
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <div className="bg-slate-50/80 rounded-[12px] p-4">
                <p className="text-[12.5px] font-semibold text-slate-500 mb-1">
                  {t('totalStudents')}
                </p>
                <div className="text-[26px] font-black text-slate-400 leading-none">
                  —
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-[12px] p-4">
                <p className="text-[12.5px] font-semibold text-slate-500 mb-1">
                  {t('activeParents')}
                </p>
                <div className="text-[26px] font-black text-slate-400 leading-none">
                  —
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-[12px] p-4">
                <p className="text-[12.5px] font-semibold text-slate-500 mb-1">
                  {t('dailyPickups')}
                </p>
                <div className="text-[26px] font-black text-slate-400 leading-none">
                  —
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-[12px] p-4">
                <p className="text-[12.5px] font-semibold text-slate-500 mb-1">
                  {t('carpoolRides')}
                </p>
                <div className="text-[26px] font-black text-slate-400 leading-none">
                  —
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Settings — not in API */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('financialSettings')}
              </CardTitle>
              <NoApiBadge />
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-6">
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-[10px] p-4 flex items-start gap-3">
                <AlertCircle
                  className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                  strokeWidth={2.5}
                />
                <div>
                  <h4 className="text-[13px] font-bold text-amber-800 mb-0.5">
                    {t('driverPayoutsOnlyHeading')}
                  </h4>
                  <p className="text-[12.5px] text-amber-700/80 font-medium leading-relaxed">
                    {t('driverPayoutsOnlyBody')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[13.5px] font-semibold text-slate-400">
                  {t('driverPayoutScheduleLabel')}
                </span>
                <Select disabled defaultValue="monthly">
                  <SelectTrigger className="h-[42px] bg-slate-100/80 border-slate-200 text-[14px] font-medium shadow-none rounded-[8px]">
                    <SelectValue placeholder={t('selectSchedulePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">
                      {t('scheduleWeekly')}
                    </SelectItem>
                    <SelectItem value="biweekly">
                      {t('scheduleBiweekly')}
                    </SelectItem>
                    <SelectItem value="monthly">
                      {t('scheduleMonthly')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-[13.5px] font-semibold text-slate-500">
                  {t('carpoolPricing')}
                </p>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="font-semibold text-slate-700">
                    {t('perCarpoolRide')}
                  </span>
                  <span className="font-black text-slate-400">—</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="font-semibold text-slate-700">
                    {t('driverGetsFixed')}
                  </span>
                  <span className="font-black text-slate-400">—</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone — not in API (no school delete/suspend endpoint) */}
          <Card className="rounded-[16px] border border-red-200/60 shadow-sm bg-red-50/30">
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[16px] font-bold text-red-600">
                {t('dangerZone')}
              </CardTitle>
              <NoApiBadge />
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <Button
                variant="outline"
                disabled
                className="w-full h-[44px] rounded-[10px] font-bold text-orange-400 border-orange-200 bg-white"
              >
                {t('suspendSchool')}
              </Button>
              <Button
                variant="outline"
                disabled
                className="w-full h-[44px] rounded-[10px] font-bold text-red-400 border-red-200 bg-white"
              >
                {t('deleteSchool')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
