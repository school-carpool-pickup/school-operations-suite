'use client';

import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setLocaleCookie } from '@/i18n/actions';
import {
  type Locale,
  localeNames,
  localeShortLabels,
  locales,
} from '@/i18n/config';

interface LocaleSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function LocaleSwitcher({
  variant = 'compact',
  className,
}: LocaleSwitcherProps) {
  const current = useLocale() as Locale;
  const t = useTranslations('Locale');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSelect = (next: Locale) => {
    if (next === current) return;
    startTransition(async () => {
      await setLocaleCookie(next);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={variant === 'compact' ? 'icon' : 'sm'}
            disabled={pending}
            aria-label={t('label')}
            className={className}
          />
        }
      >
        <Globe className="h-5 w-5 text-muted-foreground" />
        {variant === 'full' && (
          <span className="ml-2 font-medium text-sm">
            {localeShortLabels[current]}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleSelect(loc)}
            className={loc === current ? 'font-semibold text-primary' : ''}
          >
            <span className="mr-2 inline-flex h-5 w-7 items-center justify-center rounded bg-muted font-mono text-[10px] uppercase">
              {localeShortLabels[loc]}
            </span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
