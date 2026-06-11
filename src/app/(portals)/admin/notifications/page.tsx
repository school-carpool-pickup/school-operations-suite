'use client';

import { Info, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { CRMField } from '@/components/shared/CRMField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminNotificationInput,
  AdminUserListResponse,
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

type Target = 'broadcast' | 'user';

export default function AdminNotificationsPage() {
  const t = useTranslations('Admin.Notifications');

  const [target, setTarget] = useState<Target>('broadcast');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [actionUrl, setActionUrl] = useState('');

  const usersQuery = useApi<AdminUserListResponse>(
    apiKeys.adminUsers.list({ size: 100 }),
    { enabled: target === 'user' },
  );
  const users = usersQuery.data?.data ?? [];

  const sendMutation = useApiMutation<
    ApiEnvelope<unknown>,
    { target: Target; userId: string; input: AdminNotificationInput }
  >(
    ({ target: tg, userId: uid, input }) =>
      tg === 'broadcast'
        ? apiKeys.adminNotifications.broadcast(input)
        : apiKeys.adminNotifications.sendToUser(uid, input),
    {
      onSuccess: (env, vars) => {
        if (envelopeFailed(env)) {
          toast.error(t('sendErrorTitle'), {
            description: env?.error?.message || t('sendErrorGeneric'),
          });
          return;
        }
        toast.success(t('sendSuccessTitle'), {
          description:
            vars.target === 'broadcast'
              ? t('sendSuccessBroadcast')
              : t('sendSuccessUser'),
        });
        setTitle('');
        setMessage('');
        setActionUrl('');
      },
      onError: (err) => {
        toast.error(t('sendErrorTitle'), {
          description: readError(err) || t('sendErrorGeneric'),
        });
      },
    },
  );

  const handleSend = () => {
    if (!title.trim()) {
      toast.error(t('sendErrorTitle'), { description: t('titleRequired') });
      return;
    }
    if (!message.trim()) {
      toast.error(t('sendErrorTitle'), { description: t('messageRequired') });
      return;
    }
    if (target === 'user' && !userId) {
      toast.error(t('sendErrorTitle'), { description: t('userRequired') });
      return;
    }
    const input: AdminNotificationInput = {
      title: title.trim(),
      message: message.trim(),
      type,
      ...(actionUrl.trim() ? { action_url: actionUrl.trim() } : {}),
    };
    sendMutation.mutate({ target, userId, input });
  };

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

      <div className="bg-amber-50/80 border border-amber-200/70 rounded-[12px] p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
          {t('noopNote')}
        </p>
      </div>

      <Card className="rounded-[16px] border border-border/60 shadow-sm">
        <CardHeader className="pb-4 pt-6 px-7">
          <CardTitle className="text-[16px] font-bold text-foreground">
            {t('composeTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7 space-y-5">
          <CRMField
            type="select"
            label={t('targetLabel')}
            value={target}
            onChange={(v) =>
              setTarget(((v as Target) ?? 'broadcast') as Target)
            }
            options={[
              { label: t('targetBroadcast'), value: 'broadcast' },
              { label: t('targetUser'), value: 'user' },
            ]}
          />

          {target === 'user' && (
            <CRMField
              type="select"
              label={t('selectUserLabel')}
              value={userId}
              onChange={(v) => setUserId((v as string) ?? '')}
              placeholder={
                usersQuery.isLoading
                  ? t('loadingUsers')
                  : t('selectUserPlaceholder')
              }
              options={users.map((u) => ({
                value: u.id,
                label:
                  `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() ||
                  u.email,
              }))}
            />
          )}

          <CRMField
            label={t('titleLabel')}
            placeholder={t('titlePlaceholder')}
            value={title}
            onChange={(v) => setTitle((v as string) ?? '')}
          />

          <CRMField
            type="textarea"
            label={t('messageLabel')}
            placeholder={t('messagePlaceholder')}
            value={message}
            onChange={(v) => setMessage((v as string) ?? '')}
          />

          <CRMField
            type="select"
            label={t('typeLabel')}
            value={type}
            onChange={(v) => setType((v as string) ?? 'announcement')}
            options={[
              { label: t('typeAnnouncement'), value: 'announcement' },
              { label: t('typeInfo'), value: 'info' },
              { label: t('typePickup'), value: 'pickup' },
              { label: t('typeUrgent'), value: 'urgent' },
            ]}
          />

          <CRMField
            label={t('actionUrlLabel')}
            placeholder={t('actionUrlPlaceholder')}
            value={actionUrl}
            onChange={(v) => setActionUrl((v as string) ?? '')}
          />

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="h-11 px-6 rounded-xl gap-2 font-semibold"
            >
              <Send className="h-[18px] w-[18px]" />
              {sendMutation.isPending ? t('sending') : t('sendButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
