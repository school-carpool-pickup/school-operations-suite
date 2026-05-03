'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuthStore } from '@/hooks/use-auth-store';
import { apiKeys, useApiMutation } from '@/lib/api';
import { resolveClientId } from '@/lib/auth/client-id';
import type { ApiEnvelope, LoginData, LoginRequest } from '@/types';

/** Login `reason` query-param values. Set by the apiClient interceptor. */
const REASON_TOASTS = {
  session_expired: {
    type: 'error' as const,
    titleKey: 'reasonSessionExpiredTitle',
    descriptionKey: 'reasonSessionExpiredBody',
  },
} as const;
type LoginReason = keyof typeof REASON_TOASTS;

/**
 * Translate a backend `ResponseError.message` (returned via the JSON envelope)
 * into a user-friendly i18n key. The backend currently returns plain English
 * sentences for these and an HTTP 500 in all error cases (see
 * `backend-service` → `internal/modules/auth/handler.go:150`), so we match
 * by substring rather than by status code.
 */
function mapBackendError(
  raw: string,
  t: ReturnType<typeof useTranslations<'Login'>>,
): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid credentials')) return t('errorWrongPassword');
  if (msg.includes('resource not found')) return t('errorUserNotFound');
  if (msg.includes('client_id') || msg.includes('clientid')) {
    return t('errorClientIdRejected');
  }
  if (msg.includes('grant_type') || msg.includes('granttype')) {
    return t('errorBadGrantType');
  }
  return raw || t('errorGeneric');
}

export default function LoginPage() {
  const t = useTranslations('Login');
  const router = useRouter();
  const search = useSearchParams();
  const redirectUrl = search.get('redirect') ?? '/admin';
  const reason = search.get('reason');
  const clientId = resolveClientId(redirectUrl);
  const setSession = useAuthStore((s) => s.setSession);

  const [serverError, setServerError] = useState<string | null>(null);

  // Surface a toast when the user landed here because of a known event
  // (e.g. session expired). The `id` makes Sonner dedupe across React's
  // double-invoke + StrictMode re-mounts, so the message shows once.
  useEffect(() => {
    if (!reason) return;
    const cfg = REASON_TOASTS[reason as LoginReason];
    if (!cfg) return;
    const fn = cfg.type === 'error' ? toast.error : toast.info;
    fn(t(cfg.titleKey), {
      id: `login-reason-${reason}`,
      description: t(cfg.descriptionKey),
      duration: 6000,
    });
  }, [reason, t]);

  const schema = z.object({
    email: z
      .string()
      .min(1, t('errorEmailRequired'))
      .email(t('errorEmailInvalid')),
    password: z.string().min(1, t('errorPasswordRequired')),
  });
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const login = useApiMutation<ApiEnvelope<LoginData>, LoginRequest>(
    (input) => apiKeys.auth.login(input),
    {
      onSuccess: (envelope) => {
        // Backend returns 500 with `{error:{message}}` even for "user wrong
        // password" (see handler.go:150 — every domain error gets HTTP 500).
        // The mutation onSuccess only fires on 2xx, so this path covers the
        // happy 200 + the rare envelope-error-on-2xx case.
        if (envelope?.error?.code || envelope?.error?.message) {
          setServerError(mapBackendError(envelope.error.message, t));
          return;
        }
        setSession(envelope.data);
        router.push(redirectUrl);
      },
      onError: (err) => {
        // Axios error — pull `error.message` out of the envelope body.
        const data = (
          err as { response?: { data?: { error?: { message?: string } } } }
        )?.response?.data;
        const raw = data?.error?.message ?? err.message ?? '';
        setServerError(mapBackendError(raw, t));
      },
    },
  );

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    if (!clientId) {
      setServerError(t('errorClientIdMissing'));
      return;
    }
    login.mutate({
      grant_type: 'password',
      client_id: clientId,
      // Defensive: backend doesn't trim or lowercase usernames (exact-match
      // query). Pasted values often carry whitespace; normalize on our side.
      username: values.email.trim().toLowerCase(),
      password: values.password,
    });
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1877f2] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <span className="text-white font-bold text-2xl">SP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('brand')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('tagline')}</p>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Sign In Card */}
          <form
            onSubmit={onSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-slate-900 font-semibold text-lg">
              {t('cardTitle')}
            </h2>
            <p className="text-slate-500 text-sm mb-6">{t('cardSubtitle')}</p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-slate-700 text-sm font-medium mb-1.5"
                >
                  {t('emailLabel')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="w-full bg-[#f1f5f9] border border-transparent rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder={t('emailPlaceholder')}
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-[12.5px] text-red-600 mt-1.5">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-slate-700 text-sm font-medium mb-1.5"
                >
                  {t('passwordLabel')}
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full bg-[#f1f5f9] border border-transparent rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder={t('passwordPlaceholder')}
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-[12.5px] text-red-600 mt-1.5">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="text-[13px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={login.isPending}
                className="w-full bg-[#1877f2] hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors mt-2 shadow-sm"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('signingIn')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    {t('submit')}
                  </>
                )}
              </button>
            </div>
          </form>

          <Link
            href="/"
            className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('backToOverview')}
          </Link>
        </div>
      </div>
    </div>
  );
}
