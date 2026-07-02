'use client';

import {
  Building2,
  Info,
  Mail,
  MapPin,
  Plus,
  Search,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';
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

// Duplicate email domain. The backend currently misreports this as
// HTTP 500 / code 50000 with message "resource conflict" (ErrConflict is
// missing from its responseErrors map) — match on status, code AND message
// so this keeps working once the backend fixes it to a proper 409.
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

export default function SchoolCRMPage() {
  const t = useTranslations('Business.Schools');

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const listQuery = useApi<AdminSchoolListResponse>(
    apiKeys.adminSchools.list({ size: 100, ...(search ? { search } : {}) }),
  );

  const schools = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? schools.length;
  const isLoading = listQuery.isLoading && !listQuery.data;

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
          className="h-[40px] rounded-[10px] bg-[#020617] hover:bg-slate-800 text-white shadow-sm font-semibold px-5 flex items-center gap-2"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />{' '}
          {t('addNewSchool')}
        </Button>
      </div>

      {/* The backend School model only stores name/email-domain/address/logo. */}
      <div className="bg-amber-50/80 border border-amber-200/70 rounded-[12px] p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
          {t('metricsUnavailableNote')}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-[320px]">
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
        <Button
          variant="outline"
          className="h-[44px] rounded-[10px] font-semibold text-slate-700 border-slate-200/80 bg-white shadow-sm px-4"
        >
          {t('allSchoolsCount', { count: total })}
        </Button>
      </div>

      {/* Summary Cards — only Total Schools is backed by the API today. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('statTotalSchools')}
          value={String(total)}
          tone="bg-blue-50/50"
          icon={<Building2 className="w-5 h-5 text-blue-600" strokeWidth={2} />}
        />
        <StatCard
          label={t('statActiveSchools')}
          value="—"
          tone="bg-emerald-50/50"
          icon={
            <Building2 className="w-5 h-5 text-emerald-500" strokeWidth={2} />
          }
        />
        <StatCard
          label={t('statTotalStudents')}
          value="—"
          tone="bg-purple-50/50"
          icon={
            <Building2 className="w-5 h-5 text-purple-600" strokeWidth={2} />
          }
        />
        <StatCard
          label={t('statSetupIncomplete')}
          value="—"
          tone="bg-orange-50/50"
          icon={
            <Building2 className="w-5 h-5 text-orange-500" strokeWidth={2} />
          }
        />
      </div>

      {/* Schools List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            {t('loading')}
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t('emptyState')}
          </div>
        ) : (
          schools.map((school) => (
            <Card
              key={school.id}
              className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden"
            >
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-[12px] bg-[#eff6ff] flex shrink-0 items-center justify-center">
                    <Building2
                      className="w-6 h-6 text-blue-600"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-0.5">
                    <h3 className="text-[18px] font-bold tracking-tight text-slate-900 leading-none">
                      {school.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[13.5px] text-slate-500 font-medium">
                      <Mail className="w-3.5 h-3.5" />
                      {school.emailDomainName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[13.5px] text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {school.address?.trim() ? school.address : t('noAddress')}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link href={`/business/schools/${school.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-[36px] rounded-[8px] border-slate-200 text-slate-700 font-semibold px-4"
                    >
                      <Settings className="w-4 h-4 mr-2" /> {t('settings')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create School Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {t('createTitle')}
              </DialogTitle>
              <DialogDescription className="text-[15px] mt-1.5">
                {t('createDescription')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-5 p-6 pt-2">
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

          <div className="p-6 pt-2 flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              className="h-11 px-6 rounded-xl border-border shadow-none font-medium"
              onClick={() => setIsCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              className="h-11 px-6 rounded-xl gap-2 font-medium shadow-none bg-[#020617] hover:bg-slate-800 text-white"
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

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[13.5px] font-semibold text-slate-500 mb-0.5">
            {label}
          </span>
          <span className="text-[28px] font-black text-foreground leading-none tracking-tight">
            {value}
          </span>
        </div>
        <div
          className={`h-[42px] w-[42px] rounded-full flex items-center justify-center ${tone}`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
