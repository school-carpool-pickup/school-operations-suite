'use server';

import { cookies } from 'next/headers';
import { isLocale, LOCALE_COOKIE, type Locale } from './config';

/**
 * Persist a locale choice in the `NEXT_LOCALE` cookie. Called from the
 * `LocaleSwitcher` client component via a server action.
 */
export async function setLocaleCookie(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
}
