import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from './config';

/**
 * Reads locale from the `NEXT_LOCALE` cookie on every request. Falls back to
 * the configured default when the cookie is missing or invalid.
 *
 * Wired into Next via `createNextIntlPlugin('./src/i18n/request.ts')` in
 * `next.config.ts`.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(stored) ? stored : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
