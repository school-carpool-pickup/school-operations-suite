'use client';

import { useQueryClient } from '@tanstack/react-query';
import { KeyRound, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { CRMField } from '@/components/shared/CRMField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminUser,
  AdminUserChangePasswordInput,
  AdminUserUpdateMeInput,
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

export default function AdminProfilePage() {
  const t = useTranslations('Admin.Profile');
  const meQuery = useApi<ApiEnvelope<AdminUser>>(apiKeys.adminUsers.me());
  const me = meQuery.data?.data;

  if (meQuery.isLoading && !meQuery.data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t('loading')}
      </div>
    );
  }

  if (!me) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t('loadError')}
      </div>
    );
  }

  return <ProfileEditor key={me.id} me={me} />;
}

function ProfileEditor({ me }: { me: AdminUser }) {
  const t = useTranslations('Admin.Profile');
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(me.first_name);
  const [lastName, setLastName] = useState(me.last_name);
  const [phone, setPhone] = useState(me.phone ?? '');
  const [lineId, setLineId] = useState(me.line_id ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const saveMutation = useApiMutation<
    ApiEnvelope<AdminUser>,
    AdminUserUpdateMeInput
  >((input) => apiKeys.adminUsers.updateMe(input), {
    onSuccess: (env) => {
      if (envelopeFailed(env)) {
        toast.error(t('saveErrorTitle'), {
          description: env?.error?.message || t('saveErrorGeneric'),
        });
        return;
      }
      toast.success(t('saveSuccessTitle'), {
        description: t('saveSuccessDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'me'] });
    },
    onError: (err) => {
      toast.error(t('saveErrorTitle'), {
        description: readError(err) || t('saveErrorGeneric'),
      });
    },
  });

  const passwordMutation = useApiMutation<
    ApiEnvelope<{ message: string }>,
    AdminUserChangePasswordInput
  >((input) => apiKeys.adminUsers.changePassword(input), {
    onSuccess: (env) => {
      if (envelopeFailed(env)) {
        toast.error(t('passwordErrorTitle'), {
          description: env?.error?.message || t('passwordErrorGeneric'),
        });
        return;
      }
      toast.success(t('passwordSuccessTitle'), {
        description: t('passwordSuccessDescription'),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => {
      toast.error(t('passwordErrorTitle'), {
        description: readError(err) || t('passwordErrorGeneric'),
      });
    },
  });

  const handleSave = () => {
    const input: AdminUserUpdateMeInput = {};
    if (firstName.trim()) input.first_name = firstName.trim();
    if (lastName.trim()) input.last_name = lastName.trim();
    if (phone.trim()) input.phone = phone.trim();
    if (lineId.trim()) input.line_id = lineId.trim();
    saveMutation.mutate(input);
  };

  const handleChangePassword = () => {
    if (newPassword.length < 8) {
      toast.error(t('passwordErrorTitle'), {
        description: t('passwordTooShort'),
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordErrorTitle'), {
        description: t('passwordMismatch'),
      });
      return;
    }
    passwordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  const pwInputClass =
    'h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[820px]">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
        <p className="text-[14.5px] font-medium text-muted-foreground mt-1 tracking-tight">
          {t('subtitle')}
        </p>
      </div>

      {/* Account Details */}
      <Card className="rounded-[16px] border border-border/60 shadow-sm">
        <CardHeader className="pb-4 pt-6 px-7 flex flex-row items-center justify-between">
          <CardTitle className="text-[16px] font-bold text-foreground">
            {t('accountCard')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2.5 py-0.5 text-[11px] font-semibold uppercase">
              {me.role}
            </Badge>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5 text-[11px] font-semibold">
              {me.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-7 pb-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CRMField
              label={t('firstNameLabel')}
              value={firstName}
              onChange={(v) => setFirstName((v as string) ?? '')}
            />
            <CRMField
              label={t('lastNameLabel')}
              value={lastName}
              onChange={(v) => setLastName((v as string) ?? '')}
            />
            <CRMField
              label={t('phoneLabel')}
              value={phone}
              onChange={(v) => setPhone((v as string) ?? '')}
            />
            <CRMField
              label={t('lineIdLabel')}
              value={lineId}
              onChange={(v) => setLineId((v as string) ?? '')}
            />
          </div>
          <CRMField label={t('emailLabel')} value={me.email} disabled />

          <div className="flex justify-end pt-1">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="h-11 px-6 rounded-xl gap-2 font-semibold"
            >
              <Save className="h-[18px] w-[18px]" />
              {saveMutation.isPending ? t('saving') : t('saveButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="rounded-[16px] border border-border/60 shadow-sm">
        <CardHeader className="pb-4 pt-6 px-7">
          <CardTitle className="text-[16px] font-bold text-foreground">
            {t('passwordCard')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7 space-y-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              {t('currentPasswordLabel')}
            </span>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={pwInputClass}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {t('newPasswordLabel')}
              </span>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={pwInputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {t('confirmPasswordLabel')}
              </span>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={pwInputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              onClick={handleChangePassword}
              disabled={passwordMutation.isPending}
              variant="outline"
              className="h-11 px-6 rounded-xl gap-2 font-semibold"
            >
              <KeyRound className="h-[18px] w-[18px]" />
              {passwordMutation.isPending
                ? t('changingPassword')
                : t('changePasswordButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
