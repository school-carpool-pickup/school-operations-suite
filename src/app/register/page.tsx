'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  TriangleAlert,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiKeys, useApiMutation } from '@/lib/api';
import { decodeJwtPayload, isTokenExpired } from '@/lib/auth/jwt';
import type {
  ApiEnvelope,
  RegisterRequest,
  RegisterTokenClaims,
  UserMe,
} from '@/types';

/**
 * Registration page for emailed invitations (KAN-13). The invite email
 * carries `?token=<register_token>` (HS256 JWT, 24h): we decode the payload
 * client-side to prefill email/role and pre-empt expired links, then POST
 * `/v1/auth/register` with the profile + password. On success the account
 * is active and the invitee signs in at `/login` (register returns no
 * session tokens).
 */

/** Post-register sign-in destination per backend role. */
const PORTAL_BY_ROLE: Record<string, string> = {
  owner: '/business',
  admin: '/admin',
  staff: '/staff',
};

type LinkState = 'missing' | 'invalid' | 'expired' | 'unsupportedRole' | 'ok';

/**
 * Translate a backend `ResponseError.message` into an i18n key. Like login,
 * the backend returns HTTP 500 + a plain-English message for every business
 * error here, so we match by substring (see `auth/handler.go` Register).
 */
function mapBackendError(
  raw: string,
  t: ReturnType<typeof useTranslations<'Register'>>,
): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid credentials')) return t('errorInvalidToken');
  if (msg.includes('resource already exists')) {
    return t('errorAlreadyRegistered');
  }
  if (msg.includes('resource not found')) return t('errorNoSchool');
  return raw || t('errorGeneric');
}

export default function RegisterPage() {
  const t = useTranslations('Register');
  const search = useSearchParams();
  const token = search.get('token') ?? '';

  const claims = useMemo<RegisterTokenClaims | null>(
    () => (token ? decodeJwtPayload(token) : null),
    [token],
  );
  const email = typeof claims?.sub === 'string' ? claims.sub : '';
  const role = typeof claims?.role === 'string' ? claims.role : '';

  const linkState: LinkState = !token
    ? 'missing'
    : !claims || claims.purpose !== 'register' || !email
      ? 'invalid'
      : isTokenExpired(token)
        ? 'expired'
        : PORTAL_BY_ROLE[role]
          ? 'ok'
          : 'unsupportedRole';

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
          {linkState === 'ok' ? (
            <RegisterForm token={token} email={email} role={role} />
          ) : (
            <LinkProblemCard state={linkState} />
          )}

          <Link
            href="/login"
            className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Invalid / missing / expired / non-back-office invite link. */
function LinkProblemCard({ state }: { state: Exclude<LinkState, 'ok'> }) {
  const t = useTranslations('Register');
  const isExpired = state === 'expired';
  const Icon = isExpired ? Clock : TriangleAlert;
  const copy = {
    missing: { title: t('missingTitle'), body: t('missingBody') },
    invalid: { title: t('invalidTitle'), body: t('invalidBody') },
    expired: { title: t('expiredTitle'), body: t('expiredBody') },
    unsupportedRole: {
      title: t('unsupportedTitle'),
      body: t('unsupportedBody'),
    },
  }[state];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          isExpired ? 'bg-amber-50' : 'bg-red-50'
        }`}
      >
        <Icon
          className={`w-6 h-6 ${isExpired ? 'text-amber-500' : 'text-red-500'}`}
        />
      </div>
      <h2 className="text-slate-900 font-semibold text-lg">{copy.title}</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">{copy.body}</p>
    </div>
  );
}

function RegisterForm({
  token,
  email,
  role,
}: {
  token: string;
  email: string;
  role: string;
}) {
  const t = useTranslations('Register');
  const [serverError, setServerError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const roleLabel =
    { owner: t('roleOwner'), admin: t('roleAdmin'), staff: t('roleStaff') }[
      role
    ] ?? role;
  const loginHref = `/login?redirect=${encodeURIComponent(PORTAL_BY_ROLE[role] ?? '/staff')}`;

  const schema = z
    .object({
      firstName: z.string().trim().min(1, t('errorFirstNameRequired')),
      lastName: z.string().trim().min(1, t('errorLastNameRequired')),
      // Free-form on purpose: the platform stores local-format numbers and
      // matches them as exact strings — never normalize (see login).
      phone: z.string().trim().min(9, t('errorPhoneInvalid')),
      password: z.string().min(8, t('errorPasswordMin')),
      confirmPassword: z.string().min(1, t('errorConfirmRequired')),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t('errorConfirmMismatch'),
      path: ['confirmPassword'],
    });
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const register = useApiMutation<ApiEnvelope<UserMe>, RegisterRequest>(
    (input) => apiKeys.auth.register(input),
    {
      onSuccess: (envelope) => {
        if (envelope?.error?.code || envelope?.error?.message) {
          setServerError(mapBackendError(envelope.error.message ?? '', t));
          return;
        }
        setRegistered(true);
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
    register.mutate({
      register_token: token,
      password: values.password,
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      phone: values.phone.trim(),
    });
  });

  if (registered) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
        <h2 className="text-slate-900 font-semibold text-lg">
          {t('successTitle')}
        </h2>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          {t('successBody', { email })}
        </p>
        <Link
          href={loginHref}
          className="mt-6 w-full bg-[#1877f2] hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors shadow-sm"
        >
          {t('continueToLogin')}
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full bg-[#f1f5f9] border border-transparent rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
    >
      <h2 className="text-slate-900 font-semibold text-lg">{t('cardTitle')}</h2>
      <p className="text-slate-500 text-sm mb-4">{t('cardSubtitle')}</p>

      {/* Who this invite is for — read-only, comes from the token. */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-lg px-3 py-2.5 mb-5">
        <p className="text-[13px] text-blue-800 font-medium">
          {t('invitedAs', { role: roleLabel })}
        </p>
        <p className="text-[13px] text-blue-600 mt-0.5 break-all">{email}</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="register-first-name"
              className="block text-slate-700 text-sm font-medium mb-1.5"
            >
              {t('firstNameLabel')}
            </label>
            <input
              id="register-first-name"
              autoComplete="given-name"
              className={inputClass}
              placeholder={t('firstNamePlaceholder')}
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName && (
              <p className="text-[12.5px] text-red-600 mt-1.5">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="register-last-name"
              className="block text-slate-700 text-sm font-medium mb-1.5"
            >
              {t('lastNameLabel')}
            </label>
            <input
              id="register-last-name"
              autoComplete="family-name"
              className={inputClass}
              placeholder={t('lastNamePlaceholder')}
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName && (
              <p className="text-[12.5px] text-red-600 mt-1.5">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="register-phone"
            className="block text-slate-700 text-sm font-medium mb-1.5"
          >
            {t('phoneLabel')}
          </label>
          <input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder={t('phonePlaceholder')}
            {...form.register('phone')}
          />
          {form.formState.errors.phone && (
            <p className="text-[12.5px] text-red-600 mt-1.5">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-slate-700 text-sm font-medium mb-1.5"
          >
            {t('passwordLabel')}
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            placeholder={t('passwordPlaceholder')}
            {...form.register('password')}
          />
          <p className="text-[12px] text-slate-400 mt-1">{t('passwordHint')}</p>
          {form.formState.errors.password && (
            <p className="text-[12.5px] text-red-600 mt-1.5">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-slate-700 text-sm font-medium mb-1.5"
          >
            {t('confirmPasswordLabel')}
          </label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            placeholder={t('passwordPlaceholder')}
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-[12.5px] text-red-600 mt-1.5">
              {form.formState.errors.confirmPassword.message}
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
          disabled={register.isPending}
          className="w-full bg-[#1877f2] hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors mt-2 shadow-sm"
        >
          {register.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              {t('submit')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
