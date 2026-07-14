'use client';

import { UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { CRMField } from '@/components/shared/CRMField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiKeys, useApiMutation } from '@/lib/api';
import type { AdminUserCreateInput, ApiEnvelope } from '@/types';

const envelopeFailed = (env?: ApiEnvelope<unknown>): boolean =>
  Boolean(env?.error?.code || env?.error?.message);

/** Local Thai mobile: 10 digits, leading 0 (matches the backend validator). */
const isValidLocalPhone = (digits: string): boolean => /^0\d{9}$/.test(digits);

interface CreateUserDialogProps {
  role: 'admin' | 'staff';
  schoolId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful create so the caller can refetch the list. */
  onCreated: () => void;
}

/**
 * Create a School Administrator or Staff member directly in a school (business
 * portal). The admin fills name / email / phone; the backend creates the
 * account and emails a temporary password the user changes on first login —
 * there is no email-invite step. Sends `role` + `school_id` so the owner (no
 * JWT school) targets the right school.
 */
export function CreateUserDialog({
  role,
  schoolId,
  open,
  onOpenChange,
  onCreated,
}: CreateUserDialogProps) {
  const t = useTranslations('Business.SchoolDetail');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const isAdmin = role === 'admin';

  const errorDescription = (code?: string, message?: string): string => {
    if (code === '40901') return t('createErrorAlreadyExists');
    return message?.trim() || t('createErrorGeneric');
  };

  const createMutation = useApiMutation<
    ApiEnvelope<unknown>,
    AdminUserCreateInput
  >((input) => apiKeys.adminUsers.create(input), {
    onSuccess: (env) => {
      if (envelopeFailed(env)) {
        toast.error(t('createErrorTitle'), {
          description: errorDescription(env.error.code, env.error.message),
        });
        return;
      }
      toast.success(t('createSuccessTitle'), {
        description: t('createSuccessDescription'),
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      onOpenChange(false);
      onCreated();
    },
    onError: (err) => {
      const data = (
        err as {
          response?: { data?: { error?: { code?: string; message?: string } } };
        }
      )?.response?.data;
      toast.error(t('createErrorTitle'), {
        description: errorDescription(
          data?.error?.code,
          data?.error?.message ?? err.message,
        ),
      });
    },
  });

  const submit = () => {
    const first = firstName.trim();
    const last = lastName.trim();
    const mail = email.trim();
    if (!first || !last) {
      toast.error(t('createErrorTitle'), {
        description: t('userNameRequired'),
      });
      return;
    }
    if (!mail || !mail.includes('@')) {
      toast.error(t('createErrorTitle'), { description: t('emailRequired') });
      return;
    }
    // Phone is optional, but if given it must be a valid local number — the
    // backend rejects anything that isn't 10 digits starting with 0.
    const digits = phone.replace(/\D/g, '');
    if (digits && !isValidLocalPhone(digits)) {
      toast.error(t('createErrorTitle'), { description: t('phoneInvalid') });
      return;
    }
    createMutation.mutate({
      first_name: first,
      last_name: last,
      email: mail,
      role,
      school_id: schoolId,
      ...(digits ? { phone: digits } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isAdmin ? t('addAdminTitle') : t('addStaffTitle')}
            </DialogTitle>
            <DialogDescription className="text-[15px] mt-1.5">
              {isAdmin ? t('addAdminDescription') : t('addStaffDescription')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-5 p-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <CRMField
              label={t('firstNameLabel')}
              placeholder={t('firstNamePlaceholder')}
              value={firstName}
              onChange={(v) => setFirstName((v as string) ?? '')}
            />
            <CRMField
              label={t('lastNameLabel')}
              placeholder={t('lastNamePlaceholder')}
              value={lastName}
              onChange={(v) => setLastName((v as string) ?? '')}
            />
          </div>
          <CRMField
            type="email"
            label={t('emailLabel')}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(v) => setEmail((v as string) ?? '')}
          />
          <CRMField
            label={t('phoneLabel')}
            placeholder={t('phonePlaceholder')}
            value={phone}
            onChange={(v) => setPhone((v as string) ?? '')}
          />
          <div className="rounded-[10px] border border-blue-100 bg-blue-50 p-3.5 text-[12.5px] font-medium leading-relaxed text-blue-700/90">
            {t('tempPasswordNote')}
          </div>
          {isAdmin ? (
            <div className="rounded-[10px] border border-amber-100 bg-amber-50 p-3.5 text-[12.5px] font-medium leading-relaxed text-amber-700/90">
              {t('adminNote')}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 p-6 pt-2">
          <Button
            variant="outline"
            className="h-11 rounded-xl border-slate-200 px-6 font-medium shadow-none"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            className="h-11 gap-2 rounded-xl bg-[#020617] px-6 font-medium text-white shadow-none hover:bg-slate-800"
            onClick={submit}
            disabled={createMutation.isPending}
          >
            <UserPlus className="h-[18px] w-[18px]" />
            {createMutation.isPending ? t('creatingUser') : t('createUser')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
