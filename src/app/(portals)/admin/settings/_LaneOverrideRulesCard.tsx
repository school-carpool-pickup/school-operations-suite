'use client';

import {
  ArrowUpDown,
  CheckCircle2,
  Info,
  MapPin,
  Pencil,
  Plus,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminGrade,
  AdminGradeListResponse,
  AdminLane,
  AdminLaneListResponse,
  AdminLaneRule,
  AdminLaneRuleCreateInput,
  AdminLaneRuleListResponse,
  AdminLaneRuleUpdateInput,
  ApiEnvelope,
  LaneRulePriorityType,
} from '@/types';

const PRIORITY_TYPES: LaneRulePriorityType[] = [
  'oldest_child',
  'youngest_child',
  'lowest_lane_code',
];

/**
 * Override Rules tab. Backend module isn't shipped yet — everything here
 * runs against `/api/v1/admin/lane-rules` mock fixtures. Wire-up reuses
 * the same `useApi` / `useApiMutation` pattern as lanes so when the
 * backend lands, no UI work is needed.
 *
 * Product invariant (enforced in the mock POST/PUT handlers): only one
 * rule may be `is_active: true` at a time.
 */
export function LaneOverrideRulesCard() {
  const t = useTranslations('Admin.Settings');

  const rulesQuery = useApi<AdminLaneRuleListResponse>(
    apiKeys.adminLaneRules.list(),
  );
  const lanesQuery = useApi<AdminLaneListResponse>(apiKeys.adminLanes.list());
  const gradesQuery = useApi<AdminGradeListResponse>(
    apiKeys.adminGrades.list(),
  );

  const rules = rulesQuery.data?.data ?? [];
  const lanes = lanesQuery.data?.data ?? [];
  const grades = gradesQuery.data?.data ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<AdminLaneRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<AdminLaneRule | null>(null);

  // Toggle a rule's active state. Backend enforces the one-active invariant.
  const toggleMutation = useApiMutation<
    ApiEnvelope<string>,
    { id: number; is_active: boolean }
  >(({ id, is_active }) => apiKeys.adminLaneRules.update(id, { is_active }), {
    onSuccess: () => {
      rulesQuery.refetch();
    },
    onError: (err) => {
      toast.error(t('ruleToggleErrorTitle'), {
        id: 'rule-toggle',
        description: err.message || t('ruleUpdateErrorGeneric'),
      });
    },
  });

  const activeRule = rules.find((r) => r.is_active) ?? null;

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {t('overrideRulesTitle')}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('overrideRulesSubtitle')}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-10 px-4 rounded-[10px] font-semibold gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t('addRule')}
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/60 shadow-none mb-5 p-0">
        <CardContent className="p-4 flex gap-3 text-sm text-blue-900">
          <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" />
          <div>
            <div className="font-bold mb-1">{t('howOverrideRulesWork')}</div>
            <p className="text-blue-800 leading-relaxed">
              {t('howOverrideRulesBody')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {rulesQuery.isLoading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            {t('rulesLoading')}
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            {t('rulesEmpty')}
          </div>
        ) : (
          rules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              onToggle={(v) =>
                toggleMutation.mutate({ id: rule.id, is_active: v })
              }
              onEdit={() => setRuleToEdit(rule)}
              onDelete={() => setRuleToDelete(rule)}
            />
          ))
        )}
      </div>

      {/* Preview only renders when we have lanes + grades to resolve against
          and an active rule to follow. Otherwise it's noise. */}
      {activeRule && lanes.length > 0 && grades.length > 0 && (
        <OverridePreview rule={activeRule} lanes={lanes} grades={grades} />
      )}

      <CreateRuleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => rulesQuery.refetch()}
      />
      <EditRuleDialog
        rule={ruleToEdit}
        onClose={() => setRuleToEdit(null)}
        onSaved={() => rulesQuery.refetch()}
      />
      <DeleteRuleDialog
        rule={ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onDeleted={() => rulesQuery.refetch()}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Rule row                                                                   */
/* -------------------------------------------------------------------------- */

interface RuleRowProps {
  rule: AdminLaneRule;
  onToggle: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function RuleRow({ rule, onToggle, onEdit, onDelete }: RuleRowProps) {
  const t = useTranslations('Admin.Settings');
  return (
    <Card
      className={`shadow-sm p-0 ${
        rule.is_active
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-border/80'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
              <ArrowUpDown className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[15px] font-bold text-foreground">
                  {rule.name}
                </h4>
                {rule.is_active ? (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 border-none font-semibold text-[11px] px-2 py-0.5"
                  >
                    {t('ruleActive')}
                  </Badge>
                ) : null}
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-semibold">
                {t(`priorityType.${rule.priority_type}`)}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`priorityDescription.${rule.priority_type}`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={rule.is_active}
              onCheckedChange={onToggle}
              aria-label={t('toggleRuleAria', { name: rule.name })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onEdit}
              aria-label={t('editRuleAria', { name: rule.name })}
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label={t('removeRuleAria', { name: rule.name })}
              className="h-9 w-9 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Override Preview                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Static mock families used to *visualise* the active override rule. We
 * don't have a real "families with multiple kids in different lanes"
 * endpoint, so this is illustrative — but the target lane is computed
 * against the real grades + lanes data, so it stays in sync when the
 * admin reassigns lanes.
 */
const PREVIEW_FAMILIES: { name: string; gradeNames: string[] }[] = [
  { name: 'Tanaka Family', gradeNames: ['Grade 3', 'Grade 1'] },
  { name: 'Chen Family', gradeNames: ['Grade 5'] },
];

interface OverridePreviewProps {
  rule: AdminLaneRule;
  lanes: AdminLane[];
  grades: AdminGrade[];
}

function OverridePreview({ rule, lanes, grades }: OverridePreviewProps) {
  const t = useTranslations('Admin.Settings');

  const resolveTargetLane = (gradeNames: string[]): AdminLane | null => {
    const matched = gradeNames
      .map((n) => grades.find((g) => g.name === n))
      .filter((g): g is AdminGrade => !!g);
    if (matched.length === 0) return null;
    const pick = pickGradeForRule(matched, rule.priority_type, lanes);
    if (!pick?.lane_id) return null;
    return lanes.find((l) => l.id === pick.lane_id) ?? null;
  };

  return (
    <Card className="shadow-sm border-border/80 mt-6 p-0">
      <CardContent className="p-6">
        <h4 className="text-lg font-bold text-foreground">
          {t('overridePreviewTitle')}
        </h4>
        <p className="text-sm text-muted-foreground mt-1">
          {t('overridePreviewSubtitle')}
        </p>
        <div className="mt-5 space-y-3">
          {PREVIEW_FAMILIES.map((fam) => {
            const targetLane = resolveTargetLane(fam.gradeNames);
            return (
              <div
                key={fam.name}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm text-foreground">
                    {fam.name}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {fam.gradeNames.map((n) => (
                      <span
                        key={n}
                        className="px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-semibold text-muted-foreground"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                {targetLane ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                    {targetLane.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic shrink-0">
                    {t('previewUnresolved')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Pick a representative grade from a sibling set based on the active rule.
 * Grade ordering: we treat `name` as a sortable label (KG-1 < KG-2 < Grade 1
 * < Grade 2 …) — string compare is good enough for the demo and matches
 * how grades render in the chip list.
 */
function pickGradeForRule(
  matched: AdminGrade[],
  rule: LaneRulePriorityType,
  lanes: AdminLane[],
): AdminGrade | null {
  if (matched.length === 0) return null;
  if (rule === 'oldest_child') {
    return [...matched].sort((a, b) => b.name.localeCompare(a.name))[0];
  }
  if (rule === 'youngest_child') {
    return [...matched].sort((a, b) => a.name.localeCompare(b.name))[0];
  }
  // lowest_lane_code: pick the grade whose assigned lane's code sorts lowest.
  return (
    [...matched]
      .filter((g) => g.lane_id != null)
      .sort((a, b) => {
        const codeA = lanes.find((l) => l.id === a.lane_id)?.code ?? '';
        const codeB = lanes.find((l) => l.id === b.lane_id)?.code ?? '';
        return codeA.localeCompare(codeB);
      })[0] ?? matched[0]
  );
}

/* -------------------------------------------------------------------------- */
/* Create / Edit dialogs                                                      */
/* -------------------------------------------------------------------------- */

interface CreateRuleDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

function CreateRuleDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateRuleDialogProps) {
  const t = useTranslations('Admin.Settings');
  const [name, setName] = useState('');
  const [priority, setPriority] =
    useState<LaneRulePriorityType>('oldest_child');

  useEffect(() => {
    if (open) {
      setName('');
      setPriority('oldest_child');
    }
  }, [open]);

  const mutation = useApiMutation<
    ApiEnvelope<AdminLaneRule>,
    AdminLaneRuleCreateInput
  >((input) => apiKeys.adminLaneRules.create(input), {
    onSuccess: (envelope) => {
      if (envelope?.error?.code) {
        toast.error(t('ruleCreateErrorTitle'), {
          id: 'rule-create',
          description: envelope.error.message || t('ruleCreateErrorGeneric'),
        });
        return;
      }
      toast.success(t('ruleCreateSuccessTitle'), {
        id: 'rule-create',
        description: t('ruleCreateSuccessDescription', {
          name: envelope.data.name,
        }),
      });
      onOpenChange(false);
      onCreated();
    },
    onError: (err) => {
      toast.error(t('ruleCreateErrorTitle'), {
        id: 'rule-create',
        description: err.message || t('ruleCreateErrorGeneric'),
      });
    },
  });

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.warning(t('ruleFormMissingTitle'), {
        id: 'rule-create',
        description: t('ruleFormMissingDescription'),
      });
      return;
    }
    mutation.mutate({
      name: trimmed,
      priority_type: priority,
      // New rules default to inactive — the admin flips the switch when ready.
      is_active: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('addRule')}</DialogTitle>
          <DialogDescription>{t('ruleDialogDescription')}</DialogDescription>
        </DialogHeader>
        <RuleFormFields
          name={name}
          priority={priority}
          onNameChange={setName}
          onPriorityChange={setPriority}
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
            {mutation.isPending ? t('ruleCreateSubmitting') : t('createRule')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditRuleDialogProps {
  rule: AdminLaneRule | null;
  onClose: () => void;
  onSaved: () => void;
}

function EditRuleDialog({ rule, onClose, onSaved }: EditRuleDialogProps) {
  const t = useTranslations('Admin.Settings');
  const [name, setName] = useState('');
  const [priority, setPriority] =
    useState<LaneRulePriorityType>('oldest_child');

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setPriority(rule.priority_type);
    }
  }, [rule]);

  const mutation = useApiMutation<
    ApiEnvelope<string>,
    { id: number; input: AdminLaneRuleUpdateInput }
  >(({ id, input }) => apiKeys.adminLaneRules.update(id, input), {
    onSuccess: (envelope) => {
      if (envelope?.error?.code) {
        toast.error(t('ruleUpdateErrorTitle'), {
          id: 'rule-update',
          description: envelope.error.message || t('ruleUpdateErrorGeneric'),
        });
        return;
      }
      toast.success(t('ruleUpdateSuccessTitle'), {
        id: 'rule-update',
        description: t('ruleUpdateSuccessDescription', { name: name.trim() }),
      });
      onClose();
      onSaved();
    },
    onError: (err) => {
      toast.error(t('ruleUpdateErrorTitle'), {
        id: 'rule-update',
        description: err.message || t('ruleUpdateErrorGeneric'),
      });
    },
  });

  const handleSubmit = () => {
    if (!rule) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.warning(t('ruleFormMissingTitle'), {
        id: 'rule-update',
        description: t('ruleFormMissingDescription'),
      });
      return;
    }
    mutation.mutate({
      id: rule.id,
      input: { name: trimmed, priority_type: priority },
    });
  };

  return (
    <Dialog open={!!rule} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('editRuleTitle')}</DialogTitle>
          <DialogDescription>{t('ruleDialogDescription')}</DialogDescription>
        </DialogHeader>
        <RuleFormFields
          name={name}
          priority={priority}
          onNameChange={setName}
          onPriorityChange={setPriority}
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
            {mutation.isPending ? t('ruleUpdateSubmitting') : t('updateRule')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RuleFormFieldsProps {
  name: string;
  priority: LaneRulePriorityType;
  onNameChange: (v: string) => void;
  onPriorityChange: (v: LaneRulePriorityType) => void;
}

function RuleFormFields({
  name,
  priority,
  onNameChange,
  onPriorityChange,
}: RuleFormFieldsProps) {
  const t = useTranslations('Admin.Settings');
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="rule-name" className="text-xs font-semibold">
          {t('ruleNameLabel')}
        </Label>
        <Input
          id="rule-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('ruleNamePlaceholder')}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold">
          {t('priorityTypeLabel')}
        </Label>
        <Select
          value={priority}
          onValueChange={(v) => onPriorityChange(v as LaneRulePriorityType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_TYPES.map((p) => (
              <SelectItem key={p} value={p}>
                {t(`priorityType.${p}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t(`priorityDescription.${priority}`)}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete dialog                                                              */
/* -------------------------------------------------------------------------- */

interface DeleteRuleDialogProps {
  rule: AdminLaneRule | null;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteRuleDialog({ rule, onClose, onDeleted }: DeleteRuleDialogProps) {
  const t = useTranslations('Admin.Settings');

  const mutation = useApiMutation<
    ApiEnvelope<string>,
    { id: number; name: string }
  >(({ id }) => apiKeys.adminLaneRules.delete(id), {
    onSuccess: (envelope, vars) => {
      if (envelope?.error?.code) {
        toast.error(t('ruleDeleteErrorTitle'), {
          id: `rule-delete-${vars.id}`,
          description: envelope.error.message || t('ruleDeleteErrorGeneric'),
        });
        return;
      }
      toast.success(t('ruleDeleteSuccessTitle'), {
        id: `rule-delete-${vars.id}`,
        description: t('ruleDeleteSuccessDescription', { name: vars.name }),
      });
      onClose();
      onDeleted();
    },
    onError: (err, vars) => {
      toast.error(t('ruleDeleteErrorTitle'), {
        id: `rule-delete-${vars.id}`,
        description: err.message || t('ruleDeleteErrorGeneric'),
      });
    },
  });

  return (
    <Dialog open={!!rule} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-8 rounded-[24px] border-border/40 shadow-2xl overflow-hidden gap-0">
        <DialogHeader className="text-center items-center">
          <div className="h-16 w-16 rounded-[18px] bg-red-50 flex items-center justify-center mb-5 rotate-3 shadow-sm border border-red-100">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {t('removeRuleTitle')}
          </DialogTitle>
          <DialogDescription className="text-[14.5px] font-medium text-muted-foreground mt-2 mb-2 px-2 leading-relaxed">
            {t.rich('removeRuleDescription', {
              name: rule?.name ?? '',
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
            onClick={() =>
              rule && mutation.mutate({ id: rule.id, name: rule.name })
            }
            disabled={mutation.isPending}
            className="h-[46px] flex-1 rounded-[14px] shadow-[0_4px_14px_0_rgba(239,68,68,0.2)] font-bold bg-[#EF4444] hover:bg-[#DC2626] text-white border-0 transition-all"
          >
            {mutation.isPending ? t('ruleDeleteSubmitting') : t('removeRule')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
