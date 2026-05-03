'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface CRMPaginationProps {
  page: number;
  totalPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  /** Disable nav buttons while data is being refetched. */
  isFetching?: boolean;
}

/**
 * Standard list-page pagination row. Renders three groups:
 *
 *   [ 10 / page ▾ ] Page 3 of 12 • 117 total       < Prev  1 … 4 [5] 6 … 12  Next >
 *
 * Compact on small screens (status text hides). Always shows first / last /
 * current ± 1, with ellipsis for any gap. Page size selector resets to
 * page 1 implicitly via the parent's onPageSizeChange handler — wire that
 * to set both size AND page=1 in your component.
 */
export function CRMPagination({
  page,
  totalPage,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isFetching,
}: CRMPaginationProps) {
  const t = useTranslations('Common.pagination');
  const pages = getPageNumbers(page, Math.max(1, totalPage));

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Select
          value={String(pageSize)}
          onValueChange={(v: unknown) => {
            if (typeof v === 'string') onPageSizeChange(Number(v));
          }}
        >
          <SelectTrigger className="h-8 w-auto min-w-[110px] gap-1 rounded-[8px] border-border/60 bg-background px-3 text-[13px] font-medium shadow-none focus:ring-1 focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)} className="text-[13px]">
                {t('perPage', { count: opt })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="hidden md:inline">
          {t('status', { page, totalPage: Math.max(1, totalPage), total })}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('prev')}
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            p === 'ellipsis' ? (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: ellipses are positional
                key={`ell-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground/60"
                aria-hidden
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant={p === page ? 'default' : 'ghost'}
                size="sm"
                disabled={isFetching}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`h-8 min-w-8 px-2.5 font-medium tabular-nums ${
                  p === page ? '' : 'text-foreground hover:bg-muted/60'
                }`}
              >
                {p}
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPage || isFetching}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-3"
        >
          {t('next')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Compute the page-number tokens to render. Always includes 1 and the last
 * page; collapses long ranges into ellipses around the current page. Keeps
 * the rendered count bounded (~7 tokens), so even 1000-page lists render
 * cleanly.
 */
function getPageNumbers(
  current: number,
  total: number,
): readonly (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 4) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push('ellipsis');

  pages.push(total);
  return pages;
}
