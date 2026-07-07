'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Radio,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminBeacon,
  AdminBeaconCreateInput,
  AdminBeaconListResponse,
  AdminBeaconUpdateInput,
  AdminSchool,
  ApiEnvelope,
} from '@/types';

const readError = (err: Error): string => {
  const data = (
    err as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data;
  return data?.error?.message ?? err.message ?? '';
};

/** Duplicate beacon id → 409 / code 40901 "resource already exists". */
const isDuplicate = (err: Error): boolean => {
  const res = (
    err as {
      response?: { status?: number; data?: { error?: { code?: string } } };
    }
  )?.response;
  return (
    res?.status === 409 ||
    res?.data?.error?.code === '40901' ||
    readError(err) === 'resource already exists'
  );
};

const envelopeFailed = (env?: ApiEnvelope<unknown>): boolean =>
  Boolean(env?.error?.code || env?.error?.message);

const PAGE_SIZE = 10;

/**
 * Beacon CRUD for a single school. Rendered inside the School Detail
 * "Beacons" tab, so the school is fixed by the route — there's no school
 * picker; `school.id` is the `school_id` for every call.
 */
export function SchoolBeaconsTab({ school }: { school: AdminSchool }) {
  const t = useTranslations('Business.Beacons');
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBeacon | null>(null);
  const [deleting, setDeleting] = useState<AdminBeacon | null>(null);

  const listQuery = useApi<AdminBeaconListResponse>(
    apiKeys.adminBeacons.list({ school_id: school.id, page, size: PAGE_SIZE }),
    { enabled: !!school.id },
  );
  const beacons = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPage = listQuery.data?.totalPage ?? 1;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'beacons'] });

  // Quick is_active toggle from the list row.
  const toggleMutation = useApiMutation<
    ApiEnvelope<AdminBeacon>,
    { id: string; body: AdminBeaconUpdateInput }
  >(({ id, body }) => apiKeys.adminBeacons.update(id, body), {
    onSuccess: () => invalidate(),
    onError: (err) =>
      toast.error(t('errorTitle'), {
        description: readError(err) || t('errorGeneric'),
      }),
  });

  const handleToggle = (b: AdminBeacon) => {
    toggleMutation.mutate({
      id: b.id,
      body: {
        name: b.name,
        is_active: !b.is_active,
        ...(b.lane_id != null ? { lane_id: b.lane_id } : {}),
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header: count + Add */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[14px] font-semibold text-slate-700">
          {t('configured', { count: total })}
        </p>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-[38px] rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white shadow-sm font-semibold px-4 flex items-center gap-2"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />{' '}
          {t('addBeacon')}
        </Button>
      </div>

      {/* List */}
      {listQuery.isLoading && !listQuery.data ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('loading')}
        </div>
      ) : beacons.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50/40 py-14 flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Radio className="h-6 w-6" />
          </div>
          <p className="text-[14px] font-semibold text-slate-600">
            {t('emptyTitle')}
          </p>
          <p className="text-[13px] text-slate-400">{t('emptyBody')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {beacons.map((b) => (
            <Card
              key={b.id}
              className="rounded-[14px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-[10px] bg-orange-50 flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-bold text-slate-800 truncate">
                      {b.name}
                    </p>
                    <Badge
                      className={`border-none px-2 py-0.5 text-[10.5px] font-bold ${
                        b.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {b.is_active ? t('statusActive') : t('statusInactive')}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-slate-500 font-mono truncate">
                    {b.id}
                  </p>
                  <p className="text-[11.5px] text-slate-400">
                    {b.lane_id != null
                      ? t('laneAssigned', { lane: b.lane_id })
                      : t('laneUnassigned')}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Switch
                    checked={b.is_active}
                    onCheckedChange={() => handleToggle(b)}
                    disabled={toggleMutation.isPending}
                    aria-label={t('toggleActive')}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(b)}
                    className="h-8 w-8 rounded-[6px] text-slate-500 hover:text-slate-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(b)}
                    className="h-8 w-8 rounded-[6px] text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[13px] text-slate-500">
                {t('pageOf', { page, total: totalPage })} ·{' '}
                {t('countTotal', { count: total })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-9 rounded-[8px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 rounded-[8px]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create */}
      <BeaconFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        schoolId={school.id}
        onSaved={invalidate}
      />

      {/* Edit */}
      <BeaconFormDialog
        mode="edit"
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        schoolId={school.id}
        beacon={editing ?? undefined}
        onSaved={invalidate}
      />

      {/* Delete confirm */}
      <DeleteBeaconDialog
        beacon={deleting}
        schoolName={school.name}
        onOpenChange={(o) => !o && setDeleting(null)}
        onDeleted={invalidate}
      />
    </div>
  );
}

/* ── Create / Edit dialog ─────────────────────────────────────────────── */

function BeaconFormDialog({
  mode,
  open,
  onOpenChange,
  schoolId,
  beacon,
  onSaved,
}: {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  beacon?: AdminBeacon;
  onSaved: () => void;
}) {
  const t = useTranslations('Business.Beacons');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [laneId, setLaneId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Reset the form each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && beacon) {
      setId(beacon.id);
      setName(beacon.name);
      setLaneId(beacon.lane_id != null ? String(beacon.lane_id) : '');
      setIsActive(beacon.is_active);
    } else {
      setId('');
      setName('');
      setLaneId('');
      setIsActive(true);
    }
  }, [open, mode, beacon]);

  const createMutation = useApiMutation<
    ApiEnvelope<AdminBeacon>,
    AdminBeaconCreateInput
  >((input) => apiKeys.adminBeacons.create(input));
  const updateMutation = useApiMutation<
    ApiEnvelope<AdminBeacon>,
    AdminBeaconUpdateInput
  >((input) => apiKeys.adminBeacons.update(beacon?.id ?? '', input));
  const saving = createMutation.isPending || updateMutation.isPending;

  const laneValue = (): number | undefined => {
    const trimmed = laneId.trim();
    if (!trimmed) return undefined;
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error(t('errorTitle'), { description: t('nameRequired') });
      return;
    }
    const lane = laneValue();
    try {
      if (mode === 'create') {
        const trimmedId = id.trim();
        if (!trimmedId) {
          toast.error(t('errorTitle'), { description: t('idRequired') });
          return;
        }
        if (trimmedId.length > 50) {
          toast.error(t('errorTitle'), { description: t('idTooLong') });
          return;
        }
        const env = await createMutation.mutateAsync({
          id: trimmedId,
          name: trimmedName,
          school_id: schoolId,
          is_active: isActive,
          ...(lane != null ? { lane_id: lane } : {}),
        });
        if (envelopeFailed(env)) {
          toast.error(t('errorTitle'), {
            description: env.error.message || t('errorGeneric'),
          });
          return;
        }
        toast.success(t('createdTitle'), {
          description: t('createdDescription', { name: trimmedName }),
        });
      } else {
        // Omitting lane_id unassigns the beacon from its lane.
        const env = await updateMutation.mutateAsync({
          name: trimmedName,
          is_active: isActive,
          ...(lane != null ? { lane_id: lane } : {}),
        });
        if (envelopeFailed(env)) {
          toast.error(t('errorTitle'), {
            description: env.error.message || t('errorGeneric'),
          });
          return;
        }
        toast.success(t('savedTitle'), {
          description: t('savedDescription', { name: trimmedName }),
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(t('errorTitle'), {
        description: isDuplicate(err as Error)
          ? t('duplicateId')
          : readError(err as Error) || t('errorGeneric'),
      });
    }
  };

  const inputClass =
    'h-[44px] rounded-[10px] bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === 'create' ? t('createTitle') : t('editTitle')}
          </DialogTitle>
          <DialogDescription className="text-[14px] mt-1">
            {mode === 'create' ? t('createDescription') : t('editDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-slate-700">
              {t('idLabel')}
            </Label>
            <Input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={t('idPlaceholder')}
              className={inputClass}
              disabled={mode === 'edit'}
              maxLength={50}
            />
            {mode === 'edit' && (
              <p className="text-[12px] text-slate-400">{t('idImmutable')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-slate-700">
              {t('nameLabel')}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-slate-700">
              {t('laneLabel')}
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              value={laneId}
              onChange={(e) => setLaneId(e.target.value)}
              placeholder={t('lanePlaceholder')}
              className={inputClass}
            />
            <p className="text-[12px] text-slate-400">{t('laneHint')}</p>
          </div>

          <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div>
              <p className="text-[13.5px] font-semibold text-slate-700">
                {t('activeLabel')}
              </p>
              <p className="text-[12px] text-slate-400">{t('activeHint')}</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            className="h-11 px-6 rounded-xl border-border shadow-none font-medium"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('cancel')}
          </Button>
          <Button
            className="h-11 px-6 rounded-xl gap-2 font-medium bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Delete confirm ───────────────────────────────────────────────────── */

function DeleteBeaconDialog({
  beacon,
  schoolName,
  onOpenChange,
  onDeleted,
}: {
  beacon: AdminBeacon | null;
  schoolName?: string;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const t = useTranslations('Business.Beacons');
  const mutation = useApiMutation<ApiEnvelope<unknown>, string>((id) =>
    apiKeys.adminBeacons.remove(id),
  );

  const handleDelete = async () => {
    if (!beacon) return;
    try {
      await mutation.mutateAsync(beacon.id);
      toast.success(t('deletedTitle'), {
        description: t('deletedDescription', { name: beacon.name }),
      });
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      toast.error(t('errorTitle'), {
        description: readError(err as Error) || t('errorGeneric'),
      });
    }
  };

  return (
    <Dialog open={!!beacon} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t('deleteTitle')}
          </DialogTitle>
          <DialogDescription className="text-[14px] mt-1">
            {t('deleteConfirm', {
              name: beacon?.name ?? '',
              school: schoolName ?? '',
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            className="h-11 px-6 rounded-xl border-border shadow-none font-medium"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            className="h-11 px-6 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('deleting') : t('deleteButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
