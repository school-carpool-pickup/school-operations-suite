'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Pencil, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type { AdminSchool, AdminSchoolInput, ApiEnvelope } from '@/types';
import { SCHOOL_TABS, type SchoolTab } from './_components/SchoolDetailTabs';

const envelopeFailed = (env?: ApiEnvelope<unknown>): boolean =>
  Boolean(env?.error?.code || env?.error?.message);

const readError = (err: Error): string => {
  const data = (
    err as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data;
  return data?.error?.message ?? err.message ?? '';
};

// Duplicate email domain — backend misreports as 500/50000 "resource
// conflict"; match on status, code AND message (see School CRM, KAN-9).
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

export default function SchoolDetailsPage() {
  const t = useTranslations('Business.SchoolDetail');
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<SchoolTab>('overview');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const detailQuery = useApi<ApiEnvelope<AdminSchool>>(
    apiKeys.adminSchools.byId(id),
  );
  const school = detailQuery.data?.data;

  const saveMutation = useApiMutation<
    ApiEnvelope<AdminSchool>,
    AdminSchoolInput
  >((input) => apiKeys.adminSchools.update(id, input));

  /**
   * Merge a partial change onto the current school and PUT the full body
   * (address/logo always sent so a cleared field persists — see KAN-9).
   * Refetches on success. Returns whether it succeeded.
   */
  const save = async (patch: Partial<AdminSchoolInput>): Promise<boolean> => {
    if (!school) return false;
    const body: AdminSchoolInput = {
      name: (patch.name ?? school.name).trim(),
      email_domain_name: (
        patch.email_domain_name ?? school.emailDomainName
      ).trim(),
      address: (patch.address ?? school.address ?? '').trim(),
      logo_url: (patch.logo_url ?? school.logo_url ?? '').trim(),
    };
    if (!body.name) {
      toast.error(t('saveErrorTitle'), { description: t('nameRequired') });
      return false;
    }
    if (!body.email_domain_name) {
      toast.error(t('saveErrorTitle'), {
        description: t('emailDomainRequired'),
      });
      return false;
    }
    try {
      const env = await saveMutation.mutateAsync(body);
      if (envelopeFailed(env)) {
        toast.error(t('saveErrorTitle'), {
          description: env.error.message || t('saveErrorGeneric'),
        });
        return false;
      }
      toast.success(t('saveSuccessTitle'), {
        description: t('saveSuccessDescription', { name: body.name }),
      });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] });
      return true;
    } catch (err) {
      toast.error(t('saveErrorTitle'), {
        description: isDomainConflict(err as Error)
          ? t('duplicateDomainError')
          : readError(err as Error) || t('saveErrorGeneric'),
      });
      return false;
    }
  };

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

  const ActiveComponent =
    SCHOOL_TABS.find((tab) => tab.id === activeTab)?.Component ??
    SCHOOL_TABS[0].Component;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/business/schools"
          className="mt-1 h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-[24px] font-bold tracking-tight text-foreground leading-none">
              {school.name}
            </h2>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5 text-[11px] font-bold">
              {t('statusActive')}
            </Badge>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              title={t('editDetails')}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[13.5px] text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 shrink-0" />
            {school.address?.trim() ? school.address : t('noAddress')}
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {SCHOOL_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-[14px] font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-orange-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t(tab.labelKey)}
                {isActive ? (
                  <span className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-orange-500" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active tab */}
      <ActiveComponent
        school={school}
        save={save}
        saving={saveMutation.isPending}
      />

      {/* Edit school details (name / address / logo) */}
      <EditDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        school={school}
        save={save}
        saving={saveMutation.isPending}
      />
    </div>
  );
}

function EditDetailsDialog({
  open,
  onOpenChange,
  school,
  save,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: AdminSchool;
  save: (patch: Partial<AdminSchoolInput>) => Promise<boolean>;
  saving: boolean;
}) {
  const t = useTranslations('Business.SchoolDetail');
  const [name, setName] = useState(school.name);
  const [address, setAddress] = useState(school.address ?? '');
  const [logoUrl, setLogoUrl] = useState(school.logo_url ?? '');

  const inputClass =
    'h-[44px] rounded-[10px] bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none';

  const handleSave = async () => {
    const ok = await save({
      name,
      address,
      logo_url: logoUrl,
    });
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t('editDetailsTitle')}
          </DialogTitle>
          <DialogDescription className="text-[14px] mt-1">
            {t('editDetailsDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div className="space-y-1.5">
            <span className="text-[13px] font-semibold text-slate-700">
              {t('schoolNameLabel')}
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[13px] font-semibold text-slate-700">
              {t('addressLabel')}
            </span>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('addressPlaceholder')}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[13px] font-semibold text-slate-700">
              {t('logoUrlLabel')}
            </span>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder={t('logoUrlPlaceholder')}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            className="h-11 px-6 rounded-xl border-border shadow-none font-medium"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('cancel')}
          </Button>
          <Button
            className="h-11 px-6 rounded-xl gap-2 font-medium bg-[#020617] hover:bg-slate-800 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-[18px] w-[18px]" />
            {saving ? t('saving') : t('saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
