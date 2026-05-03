/**
 * Locale configuration. Single source of truth for everything i18n.
 *
 * Default is `en` for now (per product call). The TH bundle stays in
 * `src/messages/th.json` and the `<LocaleSwitcher />` component is kept
 * around but currently unmounted from the UI — flipping back to a visible
 * switcher with TH default is a 2-line change.
 */

export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  th: 'ภาษาไทย',
  en: 'English',
};

export const localeShortLabels: Record<Locale, string> = {
  th: 'TH',
  en: 'EN',
};

/** Cookie name aligns with next-intl's recommended convention. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (locales as readonly string[]).includes(value)
  );
}
