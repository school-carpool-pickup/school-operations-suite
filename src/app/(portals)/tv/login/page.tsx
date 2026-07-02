'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Lock, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuthStore } from '@/hooks/use-auth-store';
import { apiKeys, useApiMutation } from '@/lib/api';
import { PORTAL_CLIENT_ID } from '@/lib/auth/client-id';
import { readSchoolId } from '@/lib/auth/jwt';
import type { ApiEnvelope, LoginData, LoginRequest } from '@/types';

/**
 * TV display sign-in (KAN-30). Same auth flow as the other portals —
 * email + password against `POST /v1/auth/login`, but with
 * `client_id=dashboard_crm`, which the backend only authorizes for
 * `screen_display` accounts (`ClientAuthorizedRoles`). Each school gets its
 * own display account; on success we route to that school's board using the
 * JWT `school_id` claim. Kept as the TV portal's own page (dark, kiosk
 * styling) because TV builds ship only `/tv/*` — the shared `/login` isn't
 * in the artifact.
 */

/**
 * Translate a backend login error into an i18n key. All business errors
 * arrive as HTTP 500 + plain-English message (same as `/login`), so match
 * by substring. `unauthorized` here means the account exists but isn't a
 * `screen_display` role — the dashboard_crm client rejects it.
 */
function mapBackendError(
  raw: string,
  t: ReturnType<typeof useTranslations<'Tv.Login'>>,
): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid credentials')) return t('errorWrongPassword');
  if (msg.includes('resource not found')) return t('errorUserNotFound');
  if (msg.includes('unauthorized')) return t('errorNotDisplayAccount');
  return raw || t('errorGeneric');
}

export default function TvLoginPage() {
  const t = useTranslations('Tv.Login');
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [serverError, setServerError] = useState<string | null>(null);

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
        if (envelope?.error?.code || envelope?.error?.message) {
          setServerError(mapBackendError(envelope.error.message ?? '', t));
          return;
        }
        const schoolId = readSchoolId(envelope.data.access_token);
        if (!schoolId) {
          // A display account with no school can't show any board — treat
          // as a config error rather than leaving a half-usable session.
          clearSession();
          setServerError(t('errorNoSchool'));
          return;
        }
        setSession(envelope.data);
        router.replace(`/tv/${schoolId}`);
      },
      onError: (err) => {
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
    login.mutate({
      grant_type: 'password',
      client_id: PORTAL_CLIENT_ID.tv,
      // Backend matches usernames exactly — normalize like /login does.
      username: values.email.trim().toLowerCase(),
      password: values.password,
    });
  });

  const inputClass =
    'w-full bg-[#1f2937] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-[#1877f2] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">SafePickup</h1>
        <p className="text-slate-400 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Login Form Card */}
        <form
          onSubmit={onSubmit}
          className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-slate-300" />
            <h2 className="text-slate-200 font-semibold text-sm">
              {t('cardTitle')}
            </h2>
          </div>
          <p className="text-slate-400 text-xs mb-6">{t('cardSubtitle')}</p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="tv-login-email"
                className="block text-slate-300 text-xs font-medium mb-2"
              >
                {t('emailLabel')}
              </label>
              <input
                id="tv-login-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                placeholder={t('emailPlaceholder')}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-[12px] text-red-400 mt-1.5">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tv-login-password"
                className="block text-slate-300 text-xs font-medium mb-2"
              >
                {t('passwordLabel')}
              </label>
              <input
                id="tv-login-password"
                type="password"
                autoComplete="current-password"
                className={inputClass}
                placeholder={t('passwordPlaceholder')}
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-[12px] text-red-400 mt-1.5">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="text-[12.5px] text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-[#1c4ed8] hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors"
            >
              {login.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                <>
                  <Monitor className="w-4 h-4" />
                  {t('accessDisplay')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Link
        href="/"
        className="mt-8 flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> {t('backToOverview')}
      </Link>
    </div>
  );
}
