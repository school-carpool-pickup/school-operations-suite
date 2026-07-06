'use client';

import {
  Building2,
  Car,
  ChevronRight,
  GraduationCap,
  Mail,
  MapPin,
  Plus,
  Search,
  Users,
  Wifi,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { CRMField } from '@/components/shared/CRMField';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminSchool,
  AdminSchoolInput,
  AdminSchoolListResponse,
  ApiEnvelope,
} from '@/types';

const envelopeFailed = (env?: ApiEnvelope<unknown>): boolean =>
  Boolean(env?.error?.code || env?.error?.message);

const readError = (err: Error): string => {
  const data = (
    err as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data;
  return data?.error?.message ?? err.message ?? '';
};

const isDomainConflict = (err: Error): boolean => {
  const res = (
    err as {
      response?: { status?: number; data?: { error?: { code?: string } } };
    }
  )?.response;
  return (
    res?.status === 409 ||
    res?.data?.error?.code === '40901' ||
    readError(err) === 'resource conflict'
  );
};

const EMPTY_FORM = {
  name: '',
  email_domain_name: '',
  address: '',
  logo_url: '',
};

// Backend School has no status field yet, so every school is treated as
// "active". The Onboarding/Inactive filters are present to match the design
// and will start filtering for real once the backend adds a status.
type SchoolFilter = 'all' | 'active' | 'onboarding' | 'inactive';

export default function SchoolCRMPage() {
  const t = useTranslations('Business.Schools');

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [filter, setFilter] = useState<SchoolFilter>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const listQuery = useApi<AdminSchoolListResponse>(
    apiKeys.adminSchools.list({ size: 100, ...(search ? { search } : {}) }),
  );

  const schools = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? schools.length;
  const isLoading = listQuery.isLoading && !listQuery.data;

  // Derived, display-only status buckets.
  const counts = {
    all: total,
    active: total,
    onboarding: 0,
    inactive: 0,
  };
  const visible = filter === 'all' || filter === 'active' ? schools : [];

  const createMutation = useApiMutation<
    ApiEnvelope<AdminSchool>,
    AdminSchoolInput
  >((input) => apiKeys.adminSchools.create(input), {
    onSuccess: (env, vars) => {
      if (envelopeFailed(env)) {
        toast.error(t('createErrorTitle'), {
          description: env.error.message || t('createErrorGeneric'),
        });
        return;
      }
      toast.success(t('createSuccessTitle'), {
        description: t('createSuccessDescription', { name: vars.name }),
      });
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
      listQuery.refetch();
    },
    onError: (err) => {
      toast.error(t('createErrorTitle'), {
        description: isDomainConflict(err)
          ? t('duplicateDomainError')
          : readError(err) || t('createErrorGeneric'),
      });
    },
  });

  const handleCreate = () => {
    const name = form.name.trim();
    const emailDomain = form.email_domain_name.trim();
    if (!name) {
      toast.error(t('createErrorTitle'), { description: t('nameRequired') });
      return;
    }
    if (!emailDomain) {
      toast.error(t('createErrorTitle'), {
        description: t('emailDomainRequired'),
      });
      return;
    }
    createMutation.mutate({
      name,
      email_domain_name: emailDomain,
      ...(form.address.trim() ? { address: form.address.trim() } : {}),
      ...(form.logo_url.trim() ? { logo_url: form.logo_url.trim() } : {}),
    });
  };

  const FILTERS: { id: SchoolFilter; label: string; count: number }[] = [
    { id: 'all', label: t('filterAll'), count: counts.all },
    { id: 'active', label: t('filterActive'), count: counts.active },
    {
      id: 'onboarding',
      label: t('filterOnboarding'),
      count: counts.onboarding,
    },
    { id: 'inactive', label: t('filterInactive'), count: counts.inactive },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-foreground">
            {t('title')}
          </h2>
          <p className="text-[14px] text-muted-foreground mt-1 font-medium">
            {t('subtitle')}
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-[40px] rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white shadow-sm font-semibold px-5 flex items-center gap-2"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />{' '}
          {t('addSchool')}
        </Button>
      </div>

      {/* Toolbar: search + filter pills */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400"
            strokeWidth={2}
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-10 h-[44px] w-full rounded-[10px] bg-slate-100 border-transparent text-[14px] shadow-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-slate-100 focus-visible:ring-offset-0 font-medium placeholder:text-slate-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {FILTERS.map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`h-[40px] rounded-[10px] px-4 text-[13.5px] font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border ${
                  isActive
                    ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
                <span
                  className={`text-[11px] font-bold px-1.5 rounded-md ${
                    isActive ? 'bg-white/25' : 'bg-slate-100'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* School cards */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('loading')}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('emptyState')}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visible.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}

      {/* Create School Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t('createTitle')}
            </DialogTitle>
            <DialogDescription className="text-[15px] mt-1.5">
              {t('createDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-2">
            <CRMField
              label={t('nameLabel')}
              placeholder={t('namePlaceholder')}
              value={form.name}
              onChange={(v) =>
                setForm((f) => ({ ...f, name: (v as string) ?? '' }))
              }
            />
            <CRMField
              label={t('emailDomainLabel')}
              placeholder={t('emailDomainPlaceholder')}
              description={t('emailDomainDescription')}
              value={form.email_domain_name}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  email_domain_name: (v as string) ?? '',
                }))
              }
            />
            <CRMField
              label={t('addressLabel')}
              placeholder={t('addressPlaceholder')}
              value={form.address}
              onChange={(v) =>
                setForm((f) => ({ ...f, address: (v as string) ?? '' }))
              }
            />
            <CRMField
              label={t('logoUrlLabel')}
              placeholder={t('logoUrlPlaceholder')}
              value={form.logo_url}
              onChange={(v) =>
                setForm((f) => ({ ...f, logo_url: (v as string) ?? '' }))
              }
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              className="h-11 px-6 rounded-xl border-border shadow-none font-medium"
              onClick={() => setIsCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              className="h-11 px-6 rounded-xl gap-2 font-medium bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Plus className="h-[18px] w-[18px]" />
              {createMutation.isPending ? t('creating') : t('createButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchoolCard({ school }: { school: AdminSchool }) {
  const t = useTranslations('Business.Schools');
  const stats = [
    {
      label: t('cardStudents'),
      value: '—',
      icon: <GraduationCap className="w-4 h-4 text-blue-500" />,
    },
    {
      label: t('cardParents'),
      value: '—',
      icon: <Users className="w-4 h-4 text-purple-500" />,
    },
    {
      label: t('cardPickupsDay'),
      value: '—',
      icon: <Car className="w-4 h-4 text-emerald-500" />,
    },
    {
      label: t('cardCarpoolsDay'),
      value: '—',
      icon: <Car className="w-4 h-4 text-orange-500" />,
    },
  ];

  return (
    <Link href={`/business/schools/${school.id}`} className="group block">
      <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] group-hover:border-orange-200 group-hover:shadow-md transition-all h-full">
        <CardContent className="p-5 flex flex-col gap-4 h-full">
          {/* Top: identity */}
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-[12px] bg-orange-50 flex shrink-0 items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-500" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[16px] font-bold tracking-tight text-slate-900 leading-tight">
                  {school.name}
                </h3>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10.5px] font-bold">
                  {t('statusActive')}
                </span>
              </div>
              <p className="text-[12.5px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {school.address?.trim() ? school.address : t('noAddress')}
                </span>
              </p>
              <p className="text-[12.5px] text-blue-600 font-mono mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />@
                {school.emailDomainName}
              </p>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-4 gap-2 rounded-[12px] border border-slate-100 bg-slate-50/50 p-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center text-center gap-1"
              >
                {s.icon}
                <span className="text-[15px] font-black text-slate-800 leading-none">
                  {s.value}
                </span>
                <span className="text-[10.5px] font-semibold text-slate-400">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[12.5px] mt-auto pt-1">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Wifi className="w-3.5 h-3.5" /> {t('apiConnected')}
            </span>
            <span className="text-slate-400 font-medium">
              {t('commissionPct', { pct: 10 })}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
