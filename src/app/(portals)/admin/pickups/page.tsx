'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpCircle,
  Car,
  CheckCircle,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Hash,
  RotateCcw,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { CRMFilterBar } from '@/components/shared/CRMFilterBar';
import { CRMStatCards } from '@/components/shared/CRMStatCards';
import { CRMTableWrapper } from '@/components/shared/CRMTableWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminPickup,
  AdminPickupListResponse,
  AdminPickupSummaryResponse,
} from '@/types';
import { AdminPickupStage } from '@/types';

/**
 * Pickup CRM (KAN-27) — reads GET /v1/admin/pickup + /summary and mutates
 * via POST /:id/complete | /:id/unmark against the real backend. The backend
 * exposes exactly two transitions (complete ↔ unmark); the old six-way
 * status buttons are gone.
 */

const readError = (err: Error): string => {
  const data = (
    err as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data;
  return data?.error?.message ?? err.message ?? '';
};

/** Backend `stage_label` values (lowercase) → filter options order. */
const STAGE_LABELS = [
  'active',
  'prepare',
  'queued',
  'completed',
  'cancelled',
] as const;

export default function PickupCRMPage() {
  const t = useTranslations('Admin.Pickups');
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [quickMarkOpen, setQuickMarkOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<AdminPickup | null>(
    null,
  );

  const listQuery = useApi<AdminPickupListResponse>(
    apiKeys.adminPickups.list({
      size: 100,
      order_by: 'created_at',
      order_dir: 'desc',
      ...(search ? { search } : {}),
      ...(statusFilter ? { statuses: statusFilter } : {}),
    }),
  );
  const pickups = listQuery.data?.data ?? [];
  const isLoading = listQuery.isLoading && !listQuery.data;

  const summaryQuery = useApi<AdminPickupSummaryResponse>(
    apiKeys.adminPickups.summary(),
  );
  const counts = summaryQuery.data?.data?.status;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'pickups'] });

  /** Optimistically reflect a stage change on the open detail modal. */
  const patchSelected = (id: string, stage: number, label: string) => {
    setSelectedPickup((prev) =>
      prev && prev.id === id ? { ...prev, stage, stage_label: label } : prev,
    );
  };

  const completeMutation = useApiMutation<unknown, string>(
    (id) => apiKeys.adminPickups.complete(id),
    {
      onSuccess: (_data, id) => {
        toast.success(t('markSuccess'));
        patchSelected(id, AdminPickupStage.Completed, 'completed');
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
      onSuccess: (_data, id) => {
        toast.success(t('unmarkSuccess'));
        patchSelected(id, AdminPickupStage.Queued, 'queued');
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

  const stats = [
    {
      label: t('statTodayTotal'),
      value: counts
        ? counts.active +
          counts.prepare +
          counts.queued +
          counts.completed +
          counts.cancelled
        : '—',
    },
    {
      label: t('statActive'),
      value: counts ? counts.active + counts.prepare + counts.queued : '—',
      colorClass: 'text-blue-600 font-bold',
    },
    {
      label: t('statCompleted'),
      value: counts?.completed ?? '—',
      colorClass: 'text-emerald-500 font-bold',
    },
    {
      label: t('statCancelled'),
      value: counts?.cancelled ?? '—',
      colorClass: 'text-[#EF4444] font-bold',
    },
  ];

  const stageLabelText = (label: string): string =>
    ({
      active: t('statusActive'),
      prepare: t('statusPrepare'),
      queued: t('statusQueued'),
      completed: t('statusCompleted'),
      cancelled: t('statusCancelled'),
    })[label] ?? label;

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
      </div>

      <CRMStatCards metrics={stats} />

      <CRMFilterBar
        searchPlaceholder={t('searchPlaceholder')}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        filters={filters}
        actionLabel={t('quickMark')}
        actionIcon={<CheckCircle className="h-4 w-4" />}
        actionClassName="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
        onActionClick={() => setQuickMarkOpen(true)}
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
                        {vehicleLabel(pickup, t('noVehicle'))}
                        {pickup.vehicle.vehicle_type === 'taxi' && (
                          <span className="bg-amber-100/60 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center">
                            {t('taxiBadge')}
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
                    <StageBadge label={pickup.stage_label} t={t} />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex flex-row justify-end items-center gap-3">
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
                      <button
                        type="button"
                        onClick={() => setSelectedPickup(pickup)}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground/60 hover:text-foreground"
                      >
                        <Eye className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CRMTableWrapper>

      {/* Quick Mark Modal — same list endpoint, scoped to open pickups. */}
      <QuickMarkDialog
        open={quickMarkOpen}
        onOpenChange={setQuickMarkOpen}
        onComplete={(id) => completeMutation.mutate(id)}
        actionPending={actionPending}
        t={t}
      />

      {/* Pickup Detail Modal */}
      <Dialog
        open={!!selectedPickup}
        onOpenChange={(open) => !open && setSelectedPickup(null)}
      >
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[20px] border-border/40 shadow-xl gap-0">
          {selectedPickup && (
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col gap-1 mb-6 pr-8">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Hash className="h-5 w-5 text-foreground font-bold" />
                  {selectedPickup.pickup_code ?? selectedPickup.id.slice(0, 8)}
                </h2>
                <p className="text-[13.5px] text-muted-foreground/90 font-medium">
                  {t('detailHeading')}
                </p>
              </div>

              <div className="space-y-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-muted/20 border border-border/50 rounded-[14px] p-3 px-4">
                  <span className="font-semibold text-muted-foreground/80 text-[14px]">
                    {t('statusLabel')}
                  </span>
                  <StageBadge label={selectedPickup.stage_label} t={t} />
                </div>

                {/* STUDENTS */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <GraduationCap className="h-4 w-4" /> {t('studentsHeading')}
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {selectedPickup.students.map((student) => {
                      const name =
                        `${student.first_name} ${student.last_name}`.trim();
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between bg-white border border-border/60 rounded-[14px] p-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="h-[36px] w-[36px] rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-[12px]">
                              {name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)}
                            </div>
                            <span className="font-bold text-foreground/90 text-[14.5px]">
                              {name}
                            </span>
                          </div>
                          <span className="text-[12.5px] font-mono font-medium text-muted-foreground/70">
                            {[student.grade, student.section]
                              .filter(Boolean)
                              .join('-') || '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Data Grid: Family, Vehicle, Started, Completed */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-muted/10 border border-border/60 rounded-[14px] p-4">
                    <span className="text-[11.5px] font-semibold text-muted-foreground/80 flex items-center gap-2 mb-2 uppercase tracking-wider">
                      <Users className="h-3.5 w-3.5" /> {t('parent')}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[14.5px] text-foreground/90">
                        {t('parentFamily', {
                          lastName: selectedPickup.family.family_name,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/10 border border-border/60 rounded-[14px] p-4">
                    <span className="text-[11.5px] font-semibold text-muted-foreground/80 flex items-center gap-2 mb-2 uppercase tracking-wider">
                      <Car className="h-3.5 w-3.5" /> {t('vehicle')}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[14.5px] text-foreground/90">
                        {selectedPickup.vehicle.license_plate || t('noVehicle')}
                      </span>
                      {vehicleModel(selectedPickup) && (
                        <span className="text-[13px] font-medium text-muted-foreground mt-0.5">
                          {vehicleModel(selectedPickup)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/10 border border-border/60 rounded-[14px] p-4">
                    <span className="text-[11.5px] font-semibold text-muted-foreground/80 mb-2 block uppercase tracking-wider">
                      {t('started')}
                    </span>
                    <span className="font-bold text-[14.5px] text-foreground/90">
                      {formatTime(selectedPickup.created_at)}
                    </span>
                  </div>
                  <div className="bg-muted/10 border border-border/60 rounded-[14px] p-4">
                    <span className="text-[11.5px] font-semibold text-muted-foreground/80 mb-2 block uppercase tracking-wider">
                      {t('completedLabel')}
                    </span>
                    <span className="font-bold text-[14.5px] text-foreground/90">
                      {selectedPickup.stage === AdminPickupStage.Completed
                        ? formatTime(selectedPickup.updated_at)
                        : t('noTime')}
                    </span>
                  </div>
                </div>

                {/* Real transitions only: complete ↔ unmark. */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    {t('changeStatus')}
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedPickup.stage === AdminPickupStage.Completed ? (
                      <Button
                        onClick={() => unmarkMutation.mutate(selectedPickup.id)}
                        disabled={actionPending}
                        variant="outline"
                        className="rounded-xl h-[36px] font-bold text-[13.5px] px-3.5 gap-2 shadow-none text-[#EA580C] border-[#FED7AA] hover:bg-[#FFF7ED] hover:text-[#C2410C] border bg-transparent"
                      >
                        <RotateCcw className="h-4 w-4" /> {t('unmark')}
                      </Button>
                    ) : selectedPickup.stage_label !== 'cancelled' ? (
                      <Button
                        onClick={() =>
                          completeMutation.mutate(selectedPickup.id)
                        }
                        disabled={actionPending}
                        className="rounded-xl h-[36px] font-bold text-[13.5px] px-3.5 gap-2 shadow-none bg-[#10B981] hover:bg-[#059669] text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" /> {t('mark')}
                      </Button>
                    ) : (
                      <p className="text-[13px] text-muted-foreground font-medium">
                        {t('noActionsForCancelled')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function vehicleLabel(pickup: AdminPickup, fallback: string): string {
  return pickup.vehicle.license_plate || fallback;
}

function vehicleModel(pickup: AdminPickup): string {
  return [pickup.vehicle.brand, pickup.vehicle.model, pickup.vehicle.color]
    .filter(Boolean)
    .join(' ');
}

function StageBadge({
  label,
  t,
}: {
  label: string;
  t: ReturnType<typeof useTranslations>;
}) {
  switch (label) {
    case 'completed':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-100/60 text-emerald-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"
        >
          <CheckCircle2 className="h-3 w-3" /> {t('statusCompleted')}
        </Badge>
      );
    case 'queued':
      return (
        <Badge
          variant="outline"
          className="bg-blue-100/60 text-blue-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"
        >
          <ArrowUpCircle className="h-3 w-3" /> {t('statusQueued')}
        </Badge>
      );
    case 'prepare':
      return (
        <Badge
          variant="outline"
          className="bg-purple-100/60 text-purple-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"
        >
          <Car className="h-3 w-3" /> {t('statusPrepare')}
        </Badge>
      );
    case 'active':
      return (
        <Badge
          variant="outline"
          className="bg-amber-100/60 text-amber-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"
        >
          <Clock className="h-3 w-3" /> {t('statusActive')}
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className="bg-muted/60 text-muted-foreground/80 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"
        >
          <XCircle className="h-3 w-3" /> {t('statusCancelled')}
        </Badge>
      );
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
}

/**
 * Quick mark — search open (non-completed) pickups and complete them in
 * one click. Server-side search covers student/parent/status/lane; pickup
 * codes are matched client-side since the backend doesn't search them.
 */
function QuickMarkDialog({
  open,
  onOpenChange,
  onComplete,
  actionPending,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (id: string) => void;
  actionPending: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [searchBy, setSearchBy] = useState<'id' | 'student'>('id');
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input, 300);

  const listQuery = useApi<AdminPickupListResponse>(
    apiKeys.adminPickups.list({
      size: 50,
      order_by: 'created_at',
      order_dir: 'desc',
      // Pickup codes aren't server-searchable — fetch and filter locally.
      ...(searchBy === 'student' && query ? { search: query } : {}),
    }),
    { enabled: open },
  );

  const matches = (listQuery.data?.data ?? [])
    .filter((p) => p.stage_label !== 'completed')
    .filter((p) =>
      searchBy === 'id' && query
        ? (p.pickup_code ?? p.id).toLowerCase().includes(query.toLowerCase())
        : true,
    )
    .slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-7 rounded-[20px] border-border/40 shadow-xl overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <CheckCircle className="h-[22px] w-[22px] text-emerald-500" />
          <h3 className="text-[19px] font-bold text-foreground tracking-tight">
            {t('quickMarkTitle')}
          </h3>
        </div>
        <p className="text-[14px] text-muted-foreground/90 font-medium leading-relaxed mb-6">
          {t('quickMarkDescription')}
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setSearchBy('id')}
              variant={searchBy === 'id' ? 'default' : 'outline'}
              className={`rounded-xl h-[34px] font-semibold text-[13px] px-3.5 shadow-none border border-border/60 ${searchBy === 'id' ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-0' : 'text-foreground hover:bg-muted/30 bg-transparent'}`}
            >
              <Hash className="h-3.5 w-3.5 mr-1.5 opacity-80" />{' '}
              {t('byPickupId')}
            </Button>
            <Button
              onClick={() => setSearchBy('student')}
              variant={searchBy === 'student' ? 'default' : 'outline'}
              className={`rounded-xl h-[34px] font-semibold text-[13px] px-3.5 shadow-none border border-border/60 ${searchBy === 'student' ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-0' : 'text-foreground hover:bg-muted/30 bg-transparent'}`}
            >
              <GraduationCap className="h-3.5 w-3.5 mr-1.5 opacity-80" />{' '}
              {t('byStudent')}
            </Button>
          </div>

          <div className="relative mt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/60" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                searchBy === 'id'
                  ? t('byPickupIdPlaceholder')
                  : t('byStudentPlaceholder')
              }
              className="pl-11 h-[48px] bg-white rounded-xl border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-foreground/90 font-medium focus-visible:ring-1 focus-visible:ring-purple-500/40 focus-visible:border-purple-500/50 text-[14px] transition-all"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto">
            {matches.length === 0 ? (
              <p className="text-center text-[13px] text-muted-foreground py-4">
                {t('quickMarkEmpty')}
              </p>
            ) : (
              matches.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border border-border/60 rounded-[12px] px-4 py-2.5 bg-white"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[13px] text-foreground/90">
                      {p.pickup_code ?? p.id.slice(0, 8)}
                    </span>
                    <span className="text-[12px] text-muted-foreground truncate">
                      {p.students
                        .map((s) => `${s.first_name} ${s.last_name}`.trim())
                        .join(', ')}
                    </span>
                  </div>
                  <Button
                    onClick={() => onComplete(p.id)}
                    disabled={actionPending}
                    className="h-8 text-white bg-[#10B981] hover:bg-[#059669] rounded-[8px] px-3 font-semibold text-[13px] gap-1.5 shadow-none shrink-0"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t('mark')}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
