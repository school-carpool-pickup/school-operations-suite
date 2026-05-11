'use client';

import {
  CheckCircle2,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminGrade,
  AdminGradeListResponse,
  AdminLane,
  AdminLaneCreateInput,
  AdminLaneListResponse,
  AdminLaneUpdateInput,
  ApiEnvelope,
} from '@/types';

/**
 * "Lanes / Gates" tab on the admin settings page.
 *
 * Layout matches the new design: a header row with the title + Add Lane
 * button, then each lane as a self-contained card (avatar + name + grade
 * count + toggle + edit + delete + grade chips).
 *
 * Backend caveat: `AdminLane` doesn't yet expose an `is_active` field, so
 * the per-lane toggle is **local-only state** for now. It's wired so the
 * UI feels real; when the backend ships an enable/disable flag we'll point
 * the toggle at it. (TODO marked at `enabledMap` below.)
 */
export function LanesConfigCard() {
  const t = useTranslations('Admin.Settings');

  const lanesQuery = useApi<AdminLaneListResponse>(apiKeys.adminLanes.list());
  const lanes = lanesQuery.data?.data ?? [];

  const gradesQuery = useApi<AdminGradeListResponse>(
    apiKeys.adminGrades.list(),
  );
  const allGrades = gradesQuery.data?.data ?? [];

  // Modal state — only one of these is open at a time.
  const [createOpen, setCreateOpen] = useState(false);
  const [laneToEdit, setLaneToEdit] = useState<AdminLane | null>(null);
  const [laneToDelete, setLaneToDelete] = useState<AdminLane | null>(null);

  // Local-only per-lane on/off, keyed by lane.id. Lanes default to enabled.
  // TODO: replace with `lane.is_active` once backend ships it.
  const [enabledMap, setEnabledMap] = useState<Record<number, boolean>>({});
  const isEnabled = (id: number) => enabledMap[id] ?? true;

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {t('lanesGatesTitle')}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('lanesGatesSubtitle')}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-10 px-4 rounded-[10px] font-semibold gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t('addLane')}
        </Button>
      </div>

      <div className="space-y-4">
        {lanesQuery.isLoading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            {t('lanesLoading')}
          </div>
        ) : lanes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            {t('lanesEmpty')}
          </div>
        ) : (
          lanes.map((lane) => (
            <LaneRow
              key={lane.id}
              lane={lane}
              enabled={isEnabled(lane.id)}
              onToggle={(v) =>
                setEnabledMap((prev) => ({ ...prev, [lane.id]: v }))
              }
              onEdit={() => setLaneToEdit(lane)}
              onDelete={() => setLaneToDelete(lane)}
            />
          ))
        )}
      </div>

      <CreateLaneDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        allGrades={allGrades}
        gradesLoading={gradesQuery.isLoading}
        onCreated={() => {
          lanesQuery.refetch();
          gradesQuery.refetch();
        }}
      />

      <EditLaneDialog
        lane={laneToEdit}
        onClose={() => setLaneToEdit(null)}
        allGrades={allGrades}
        gradesLoading={gradesQuery.isLoading}
        onSaved={() => {
          lanesQuery.refetch();
          gradesQuery.refetch();
        }}
      />

      <DeleteLaneDialog
        lane={laneToDelete}
        onClose={() => setLaneToDelete(null)}
        onDeleted={() => {
          lanesQuery.refetch();
          gradesQuery.refetch();
        }}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Lane row                                                                   */
/* -------------------------------------------------------------------------- */

interface LaneRowProps {
  lane: AdminLane;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function LaneRow({ lane, enabled, onToggle, onEdit, onDelete }: LaneRowProps) {
  const t = useTranslations('Admin.Settings');
  const grades = lane.grades ?? [];
  // Avatar letter: prefer the trailing letter of the code (e.g. "GATE-A" → "A"),
  // otherwise the first letter of the name.
  const codeTail = lane.code.split('-').pop() ?? lane.code;
  const avatar = (codeTail || lane.name).charAt(0).toUpperCase();

  return (
    <Card className="shadow-sm border-border/80 p-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg shrink-0">
              {avatar}
            </div>
            <div className="min-w-0">
              <h4 className="text-[15px] font-bold text-foreground truncate">
                {lane.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('gradesAssignedCount', { count: grades.length })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              aria-label={t('toggleLaneAria', { name: lane.name })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onEdit}
              aria-label={t('editLaneAria', { name: lane.name })}
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label={t('removeLaneAria', { name: lane.name })}
              className="h-9 w-9 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {grades.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pl-15">
            {grades.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-semibold"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                {g.name}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Create dialog                                                              */
/* -------------------------------------------------------------------------- */

interface CreateLaneDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  allGrades: AdminGrade[];
  gradesLoading: boolean;
  onCreated: () => void;
}

function CreateLaneDialog({
  open,
  onOpenChange,
  allGrades,
  gradesLoading,
  onCreated,
}: CreateLaneDialogProps) {
  const t = useTranslations('Admin.Settings');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [gradeIds, setGradeIds] = useState<number[]>([]);

  // Reset form whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setName('');
      setCode('');
      setGradeIds([]);
    }
  }, [open]);

  const mutation = useApiMutation<ApiEnvelope<AdminLane>, AdminLaneCreateInput>(
    (input) => apiKeys.adminLanes.create(input),
    {
      onSuccess: (envelope) => {
        if (envelope?.error?.code) {
          toast.error(t('laneCreateErrorTitle'), {
            id: 'lane-create',
            description: envelope.error.message || t('laneCreateErrorGeneric'),
          });
          return;
        }
        toast.success(t('laneCreateSuccessTitle'), {
          id: 'lane-create',
          description: t('laneCreateSuccessDescription', {
            name: envelope.data.name,
          }),
        });
        onOpenChange(false);
        onCreated();
      },
      onError: (err) => {
        const data = (
          err as { response?: { data?: { error?: { message?: string } } } }
        )?.response?.data;
        toast.error(t('laneCreateErrorTitle'), {
          id: 'lane-create',
          description:
            data?.error?.message ?? err.message ?? t('laneCreateErrorGeneric'),
        });
      },
    },
  );

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode) {
      toast.warning(t('laneFormMissingTitle'), {
        id: 'lane-create',
        description: t('laneFormMissingDescription'),
      });
      return;
    }
    mutation.mutate({
      name: trimmedName,
      code: trimmedCode,
      grade_ids: gradeIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('createLaneTitle')}</DialogTitle>
          <DialogDescription>{t('laneDialogDescription')}</DialogDescription>
        </DialogHeader>
        <LaneFormFields
          name={name}
          code={code}
          gradeIds={gradeIds}
          onNameChange={setName}
          onCodeChange={setCode}
          onToggleGrade={(id) =>
            setGradeIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          allGrades={allGrades}
          gradesLoading={gradesLoading}
          ownedLaneId={null}
        />
        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {mutation.isPending ? t('laneCreateSubmitting') : t('createLane')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Edit dialog                                                                */
/* -------------------------------------------------------------------------- */

interface EditLaneDialogProps {
  lane: AdminLane | null;
  onClose: () => void;
  allGrades: AdminGrade[];
  gradesLoading: boolean;
  onSaved: () => void;
}

function EditLaneDialog({
  lane,
  onClose,
  allGrades,
  gradesLoading,
  onSaved,
}: EditLaneDialogProps) {
  const t = useTranslations('Admin.Settings');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [gradeIds, setGradeIds] = useState<number[]>([]);

  // Hydrate form from the selected lane whenever it changes.
  useEffect(() => {
    if (lane) {
      setName(lane.name);
      setCode(lane.code);
      setGradeIds((lane.grades ?? []).map((g) => g.id));
    }
  }, [lane]);

  const mutation = useApiMutation<
    ApiEnvelope<AdminLane>,
    { id: number; input: AdminLaneUpdateInput }
  >(({ id, input }) => apiKeys.adminLanes.update(id, input), {
    onSuccess: (envelope) => {
      if (envelope?.error?.code) {
        toast.error(t('laneUpdateErrorTitle'), {
          id: 'lane-update',
          description: envelope.error.message || t('laneUpdateErrorGeneric'),
        });
        return;
      }
      toast.success(t('laneUpdateSuccessTitle'), {
        id: 'lane-update',
        description: t('laneUpdateSuccessDescription', {
          name: name.trim(),
        }),
      });
      onClose();
      onSaved();
    },
    onError: (err) => {
      const data = (
        err as { response?: { data?: { error?: { message?: string } } } }
      )?.response?.data;
      toast.error(t('laneUpdateErrorTitle'), {
        id: 'lane-update',
        description:
          data?.error?.message ?? err.message ?? t('laneUpdateErrorGeneric'),
      });
    },
  });

  const handleSubmit = () => {
    if (!lane) return;
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode) {
      toast.warning(t('laneFormMissingTitle'), {
        id: 'lane-update',
        description: t('laneFormMissingDescription'),
      });
      return;
    }
    mutation.mutate({
      id: lane.id,
      input: {
        name: trimmedName,
        code: trimmedCode,
        grade_ids: gradeIds,
      },
    });
  };

  return (
    <Dialog open={!!lane} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('editLaneTitle')}</DialogTitle>
          <DialogDescription>{t('laneDialogDescription')}</DialogDescription>
        </DialogHeader>
        <LaneFormFields
          name={name}
          code={code}
          gradeIds={gradeIds}
          onNameChange={setName}
          onCodeChange={setCode}
          onToggleGrade={(id) =>
            setGradeIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          allGrades={allGrades}
          gradesLoading={gradesLoading}
          ownedLaneId={lane?.id ?? null}
        />
        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {mutation.isPending
              ? t('laneUpdateSubmitting')
              : t('laneUpdateSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared form fields                                                         */
/* -------------------------------------------------------------------------- */

interface LaneFormFieldsProps {
  name: string;
  code: string;
  gradeIds: number[];
  onNameChange: (v: string) => void;
  onCodeChange: (v: string) => void;
  onToggleGrade: (id: number) => void;
  allGrades: AdminGrade[];
  gradesLoading: boolean;
  /**
   * When editing, the lane this form is *for*. Grades attached to this lane
   * are still selectable. When creating, pass `null` and only unassigned
   * grades become selectable (others render as disabled "assigned" chips).
   */
  ownedLaneId: number | null;
}

function LaneFormFields({
  name,
  code,
  gradeIds,
  onNameChange,
  onCodeChange,
  onToggleGrade,
  allGrades,
  gradesLoading,
  ownedLaneId,
}: LaneFormFieldsProps) {
  const t = useTranslations('Admin.Settings');
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="lane-name" className="text-xs font-semibold">
          {t('laneNameLabel')}
        </Label>
        <Input
          id="lane-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('laneNamePlaceholder')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lane-code" className="text-xs font-semibold">
          {t('shortCodeLabel')}
        </Label>
        <Input
          id="lane-code"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder={t('shortCodePlaceholder')}
          className="max-w-[200px]"
        />
        <p className="text-xs text-muted-foreground">{t('shortCodeHint')}</p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold">
          {t('assignGradesLabel')}
        </Label>
        {gradesLoading ? (
          <p className="text-xs text-muted-foreground italic py-1">
            {t('gradesLoading')}
          </p>
        ) : allGrades.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-1">
            {t('gradesAllAssigned')}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {allGrades.map((g) => {
              const selected = gradeIds.includes(g.id);
              // A grade is "owned elsewhere" if it's attached to another lane
              // (not unassigned, not this lane). Render it as a disabled chip
              // with an "assigned" footnote — mirrors the design's grayed-out
              // state.
              const ownedElsewhere =
                g.lane_id != null && g.lane_id !== ownedLaneId;
              if (ownedElsewhere) {
                return (
                  <div
                    key={g.id}
                    className="px-3 py-2 rounded-lg text-xs font-semibold border border-border bg-muted/40 text-muted-foreground/60 text-center cursor-not-allowed"
                  >
                    <div>{g.name}</div>
                    <div className="text-[10px] font-medium opacity-70 mt-0.5">
                      {t('gradeAssignedHint')}
                    </div>
                  </div>
                );
              }
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onToggleGrade(g.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors text-center ${
                    selected
                      ? 'bg-primary/10 text-primary border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete dialog                                                              */
/* -------------------------------------------------------------------------- */

interface DeleteLaneDialogProps {
  lane: AdminLane | null;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteLaneDialog({ lane, onClose, onDeleted }: DeleteLaneDialogProps) {
  const t = useTranslations('Admin.Settings');

  const mutation = useApiMutation<
    ApiEnvelope<string>,
    { id: number; name: string }
  >(({ id }) => apiKeys.adminLanes.delete(id), {
    onSuccess: (envelope, vars) => {
      if (envelope?.error?.code) {
        toast.error(t('laneDeleteErrorTitle'), {
          id: `lane-delete-${vars.id}`,
          description: envelope.error.message || t('laneDeleteErrorGeneric'),
        });
        return;
      }
      toast.success(t('laneDeleteSuccessTitle'), {
        id: `lane-delete-${vars.id}`,
        description: t('laneDeleteSuccessDescription', { name: vars.name }),
      });
      onClose();
      onDeleted();
    },
    onError: (err, vars) => {
      const data = (
        err as { response?: { data?: { error?: { message?: string } } } }
      )?.response?.data;
      toast.error(t('laneDeleteErrorTitle'), {
        id: `lane-delete-${vars.id}`,
        description:
          data?.error?.message ?? err.message ?? t('laneDeleteErrorGeneric'),
      });
    },
  });

  const handleConfirm = () => {
    if (!lane) return;
    mutation.mutate({ id: lane.id, name: lane.name });
  };

  return (
    <Dialog open={!!lane} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-8 rounded-[24px] border-border/40 shadow-2xl overflow-hidden gap-0">
        <DialogHeader className="text-center items-center">
          <div className="h-16 w-16 rounded-[18px] bg-red-50 flex items-center justify-center mb-5 rotate-3 shadow-sm border border-red-100">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {t('removeLaneTitle')}
          </DialogTitle>
          <DialogDescription className="text-[14.5px] font-medium text-muted-foreground mt-2 mb-2 px-2 leading-relaxed">
            {t.rich('removeLaneDescription', {
              name: lane?.name ?? '',
              strong: (chunks) => (
                <span className="font-bold text-foreground">{chunks}</span>
              ),
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex w-full gap-3 mt-6 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
            className="h-[46px] flex-1 rounded-[14px] shadow-none font-bold text-foreground/80 border-border/60 hover:bg-muted/30"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={mutation.isPending}
            className="h-[46px] flex-1 rounded-[14px] shadow-[0_4px_14px_0_rgba(239,68,68,0.2)] font-bold bg-[#EF4444] hover:bg-[#DC2626] text-white border-0 transition-all"
          >
            {mutation.isPending ? t('laneDeleteSubmitting') : t('removeLane')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
