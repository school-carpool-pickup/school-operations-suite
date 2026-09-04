'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { CRMFilterBar } from '@/components/shared/CRMFilterBar';
import { CRMStatCards } from '@/components/shared/CRMStatCards';
import { CRMTableWrapper } from '@/components/shared/CRMTableWrapper';
import { PickupStageBadge } from '@/components/shared/PickupStageBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PICKUP_BOARD_POLL_MS } from '@/config/polling';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminPickupListResponse,
  AdminPickupSummaryResponse,
} from '@/types';
import { AdminPickupStage } from '@/types';

/**
 * Staff pickup board (KAN-92) — the gate-side view of today's queue.
 *
 * Reads the same real endpoints as the admin Pickup CRM
 * (`GET /v1/admin/pickup` + `/summary`) and mutates via
 * `POST /:id/complete | /:id/unmark`. Staff accounts are allowed on these
 * routes (backend `RolesInternalLevel4` = owner/admin/staff/screen_display),
 * so no staff-specific endpoint is needed.
 *
 * Deliberately leaner than the admin CRM: staff stand at the gate and need
 * to find a pickup and mark it done — no detail modal, no CRM chrome.
 */

const readError = (err: Error): string => {
  const data = (
    err as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data;
  return data?.error?.message ?? err.message ?? '';
};

/** Backend `stage_label` values (lowercase), in board order. */
const STAGE_LABELS = [
  'active',
  'prepare',
  'queued',
  'completed',
  'cancelled',
] as const;

export default function PickupManagementPage() {
  const t = useTranslations('Staff.Pickups');
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState('');

  const listQuery = useApi<AdminPickupListResponse>(
    apiKeys.adminPickups.list({
      size: 100,
      order_by: 'created_at',
      order_dir: 'desc',
      ...(search ? { search } : {}),
      ...(statusFilter ? { statuses: statusFilter } : {}),
    }),
    {
      // The board is a live queue someone watches while cars arrive — without
      // this it only refreshed on a manual reload, so a pickup cancelled from
      // a parent's phone appeared to do nothing (reported from the field).
      refetchInterval: PICKUP_BOARD_POLL_MS,
      refetchIntervalInBackground: false,
      staleTime: 0,
    },
  );
  const pickups = listQuery.data?.data ?? [];
  const isLoading = listQuery.isLoading && !listQuery.data;

  const summaryQuery = useApi<AdminPickupSummaryResponse>(
    apiKeys.adminPickups.summary(),
    {
      // The board is a live queue someone watches while cars arrive — without
      // this it only refreshed on a manual reload, so a pickup cancelled from
      // a parent's phone appeared to do nothing (reported from the field).
      refetchInterval: PICKUP_BOARD_POLL_MS,
      refetchIntervalInBackground: false,
      staleTime: 0,
    },
  );
  const counts = summaryQuery.data?.data?.status;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'pickups'] });

  const completeMutation = useApiMutation<unknown, string>(
    (id) => apiKeys.adminPickups.complete(id),
    {
      onSuccess: () => {
        toast.success(t('markSuccess'));
        invalidate();
      },
      onError: (err) => {
        toast.error(t('actionErrorTitle'), {
          description: readError(err) || t('actionErrorGeneric'),
        });
      },
    },
  );

  const unmarkMutation = useApiMutation<unknown, string>(
    (id) => apiKeys.adminPickups.unmark(id),
    {
      onSuccess: () => {
        toast.success(t('unmarkSuccess'));
        invalidate();
      },
      onError: (err) => {
        toast.error(t('actionErrorTitle'), {
          description: readError(err) || t('actionErrorGeneric'),
        });
      },
    },
  );
  const actionPending = completeMutation.isPending || unmarkMutation.isPending;

  const stageLabelText = (label: string): string =>
    ({
      active: t('statusActive'),
      prepare: t('statusPrepare'),
      queued: t('statusQueued'),
      completed: t('statusCompleted'),
      cancelled: t('statusCancelled'),
    })[label] ?? label;

  const stats = [
    {
      label: t('statWaiting'),
      value: counts ? counts.active + counts.prepare : '—',
      colorClass: 'text-amber-600 font-bold',
    },
    {
      label: t('statInQueue'),
      value: counts?.queued ?? '—',
      colorClass: 'text-blue-600 font-bold',
    },
    {
      label: t('statCompleted'),
      value: counts?.completed ?? '—',
      colorClass: 'text-emerald-500 font-bold',
    },
    {
      label: t('statTotalToday'),
      value: counts
        ? counts.active +
          counts.prepare +
          counts.queued +
          counts.completed +
          counts.cancelled
        : '—',
    },
  ];

  const filters = [
    {
      placeholder: t('filterAllStatus'),
      options: STAGE_LABELS.map((label) => ({
        label: stageLabelText(label),
        value: label,
      })),
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
      </div>

      <CRMStatCards metrics={stats} />

      <CRMFilterBar
        searchPlaceholder={t('searchPlaceholder')}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        filters={filters}
      />

      <CRMTableWrapper
        title={t('todaysPickups', { count: listQuery.data?.total ?? 0 })}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-border/50">
              <TableHead className="pl-6 font-bold text-foreground h-12">
                {t('columnPickupId')}
              </TableHead>
              <TableHead className="font-bold text-foreground">
                {t('columnStudents')}
              </TableHead>
              <TableHead className="font-bold text-foreground">
                {t('columnParentVehicle')}
              </TableHead>
              <TableHead className="font-bold text-foreground">
                {t('columnLane')}
              </TableHead>
              <TableHead className="font-bold text-foreground">
                {t('columnStatus')}
              </TableHead>
              <TableHead className="text-right pr-6 font-bold text-foreground">
                {t('columnActions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : pickups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('emptyState')}
                </TableCell>
              </TableRow>
            ) : (
              pickups.map((pickup) => (
                <TableRow
                  key={pickup.id}
                  className="hover:bg-muted/10 border-b-border/40 transition-colors"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] text-foreground/90">
                        {pickup.pickup_code ?? pickup.id.slice(0, 8)}
                      </span>
                      <span className="text-[12px] text-muted-foreground/80 mt-0.5">
                        {formatTime(pickup.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      {pickup.students.map((student) => (
                        <span
                          key={student.id}
                          className="text-[13px] font-medium text-foreground/90"
                        >
                          {`${student.first_name} ${student.last_name}`.trim()}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-[13.5px] text-foreground/90">
                        {pickup.family.family_name}
                      </span>
                      <span className="text-[12px] text-muted-foreground/80 mt-0.5 flex items-center gap-2">
                        {pickup.vehicle.license_plate || t('noVehicle')}
                        {pickup.vehicle.vehicle_type === 'taxi' && (
                          <span className="bg-amber-100/60 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center">
                            {t('taxi')}
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] font-mono text-foreground/90">
                        {pickup.lane ?? '—'}
                      </span>
                      {pickup.queued_at && (
                        <span className="text-[12px] text-muted-foreground mt-0.5">
                          {t('queuedAtTime', {
                            time: formatTime(pickup.queued_at),
                          })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PickupStageBadge
                      label={pickup.stage_label}
                      text={stageLabelText(pickup.stage_label)}
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {pickup.stage === AdminPickupStage.Completed ? (
                      <Button
                        onClick={() => unmarkMutation.mutate(pickup.id)}
                        disabled={actionPending}
                        variant="outline"
                        className="h-8 text-[#EA580C] border-[#FED7AA] hover:bg-[#FFF7ED] hover:text-[#C2410C] rounded-[8px] px-3 font-semibold text-[13px] gap-1.5 shadow-none transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> {t('unmark')}
                      </Button>
                    ) : pickup.stage_label !== 'cancelled' ? (
                      <Button
                        onClick={() => completeMutation.mutate(pickup.id)}
                        disabled={actionPending}
                        className="h-8 text-white bg-[#10B981] hover:bg-[#059669] rounded-[8px] px-3 font-semibold text-[13px] gap-1.5 shadow-none transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t('mark')}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CRMTableWrapper>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
