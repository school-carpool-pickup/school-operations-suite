'use client';

import { keepPreviousData } from '@tanstack/react-query';
import {
  AlertCircle,
  Ban,
  ChevronDown,
  GraduationCap,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { CRMFilterBar } from '@/components/shared/CRMFilterBar';
import { CRMPagination } from '@/components/shared/CRMPagination';
import { CRMStatCards } from '@/components/shared/CRMStatCards';
import { CRMTableWrapper } from '@/components/shared/CRMTableWrapper';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminFamily,
  AdminFamilyListResponse,
  AdminFamilyMember,
  AdminFamilyUpdateInput,
  ApiEnvelope,
} from '@/types';
import {
  classifyMember,
  familyInitial,
  findPrimaryMember,
  type MemberKind,
  memberFullName,
  memberInitials,
} from './_helpers';

const STATUS_BADGE: Record<string, string> = {
  active:
    'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[11px] font-semibold',
  inactive:
    'bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[11px] font-semibold',
};

const KIND_BADGE: Record<MemberKind, string> = {
  primary:
    'bg-purple-100/80 text-purple-700 hover:bg-purple-100 border-none px-2 py-0 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1',
  additional:
    'bg-blue-100/80 text-blue-700 hover:bg-blue-100 border-none px-2 py-0 text-[10px] font-bold uppercase tracking-wider',
  supplementary:
    'bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-none px-2 py-0 text-[10px] font-bold uppercase tracking-wider',
};

export default function FamilyCRMPage() {
  const t = useTranslations('Admin.Families');

  // Filter / pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [banningFamily, setBanningFamily] = useState<AdminFamily | null>(null);
  const [banningAccount, setBanningAccount] = useState<{
    member: AdminFamilyMember;
    familyName: string;
  } | null>(null);

  const filterParams = {
    page,
    size: pageSize,
    ...(search ? { search } : {}),
    ...(statusFilter
      ? { filter_field: 'status' as const, filter_value: statusFilter }
      : {}),
  };

  const listQuery = useApi<AdminFamilyListResponse>(
    apiKeys.adminFamilies.list(filterParams),
    { placeholderData: keepPreviousData },
  );

  const families = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPage = listQuery.data?.totalPage ?? 1;
  const isLoading = listQuery.isLoading && !listQuery.data;

  const banMutation = useApiMutation<
    ApiEnvelope<string>,
    { id: string; input: AdminFamilyUpdateInput; familyName: string }
  >(({ id, input }) => apiKeys.adminFamilies.update(id, input), {
    onSuccess: (envelope, vars) => {
      // Backend wraps every response in `{data, error, …}`. A 2xx with a
      // non-empty `error.code/message` means "logical failure" — don't
      // close the modal and don't claim success.
      if (envelope?.error?.code || envelope?.error?.message) {
        toast.error(t('banErrorTitle'), {
          id: `family-ban-${vars.id}`,
          description: envelope.error.message || t('banErrorGeneric'),
        });
        return;
      }
      toast.success(t('banSuccessTitle'), {
        id: `family-ban-${vars.id}`,
        description: t('banSuccessDescription', { name: vars.familyName }),
      });
      setBanningFamily(null);
      listQuery.refetch();
    },
    onError: (err, vars) => {
      // Axios error — pull the upstream `error.message` from the envelope.
      const data = (
        err as { response?: { data?: { error?: { message?: string } } } }
      )?.response?.data;
      const raw = data?.error?.message ?? err.message ?? '';
      toast.error(t('banErrorTitle'), {
        id: `family-ban-${vars.id}`,
        description: raw || t('banErrorGeneric'),
      });
    },
  });

  // Page-scoped derived counts. The backend doesn't (yet) expose a global
  // stats endpoint, so these reflect the visible page only. Acceptable for
  // small datasets; revisit when backend ships /admin/families/stats.
  const stats = [
    {
      label: t('statTotal'),
      value: total,
    },
    {
      label: t('statActive'),
      value: families.filter((f) => f.status === 'active').length,
      colorClass: 'text-emerald-500',
    },
    {
      label: t('statBanned'),
      value: families.filter((f) => f.status !== 'active').length,
      colorClass: 'text-red-500',
    },
    {
      label: t('statTotalMembers'),
      value: families.reduce((acc, f) => acc + f.members.length, 0),
      colorClass: 'text-blue-500',
    },
    // Total students isn't in the families response; backend currently has
    // no aggregated student count. Show em-dash until they ship it.
    {
      label: t('statTotalStudents'),
      value: '—',
      colorClass: 'text-violet-500',
    },
  ];

  const filters = [
    {
      placeholder: t('filterAllStatus'),
      value: statusFilter,
      onChange: (v: string) => {
        setStatusFilter(v);
        setPage(1);
      },
      options: [
        { label: t('statusActive'), value: 'active' },
        // UI calls this "Banned"; backend's wire value is `inactive`.
        { label: t('statusBanned'), value: 'inactive' },
      ],
    },
  ];

  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    if (page !== 1) setPage(1);
  };

  const handleConfirmBan = () => {
    if (!banningFamily) return;
    banMutation.mutate({
      id: banningFamily.id,
      familyName: banningFamily.family_name,
      input: {
        family_name: banningFamily.family_name,
        status: 'inactive',
      },
    });
  };

  /**
   * Per-member ban. Backend hasn't shipped a per-member status mutation
   * yet — `PUT /admin/families/:id` only updates the family-level record.
   * For now: open the confirm modal (UI parity with design), then surface
   * a toast informing the operator the action isn't wired through yet.
   *
   * When backend ships a `PATCH /admin/families/:fid/members/:mid` (or
   * similar), swap the toast for a real `useApiMutation` call.
   */
  const handleConfirmBanAccount = () => {
    if (!banningAccount) return;
    toast.warning(t('banAccountPendingTitle'), {
      id: `member-ban-${banningAccount.member.id}`,
      description: t('banAccountPendingDescription', {
        name: memberFullName(banningAccount.member),
      }),
    });
    setBanningAccount(null);
  };

  const statusLabel = (status: string): string => {
    if (status === 'active') return t('statusActive');
    if (status === 'inactive') return t('statusBanned');
    return status;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
      </div>

      <CRMStatCards metrics={stats} />

      <CRMFilterBar
        searchPlaceholder={t('searchPlaceholder')}
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        filters={filters}
      />

      <CRMTableWrapper title={t('familiesCount', { count: total })}>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('loading')}
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t('emptyState')}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/50 bg-white">
            {families.map((family) => (
              <FamilyRow
                key={family.id}
                family={family}
                isOpen={expandedId === family.id}
                onToggle={() =>
                  setExpandedId(expandedId === family.id ? null : family.id)
                }
                onBan={() => setBanningFamily(family)}
                onBanMember={(member) =>
                  setBanningAccount({
                    member,
                    familyName: family.family_name,
                  })
                }
                statusLabel={statusLabel}
                t={t}
              />
            ))}
          </div>
        )}
      </CRMTableWrapper>

      {/* Pagination */}
      {total > 0 && (
        <CRMPagination
          page={page}
          totalPage={totalPage}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          isFetching={listQuery.isFetching}
        />
      )}

      {/* Ban Family Modal */}
      <Dialog
        open={!!banningFamily}
        onOpenChange={(open) => !open && setBanningFamily(null)}
      >
        <DialogContent className="sm:max-w-[500px] p-6 gap-6 rounded-[16px]">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl font-bold">
              {t('banFamilyTitle')}
            </DialogTitle>
            <DialogDescription className="text-[14.5px] text-muted-foreground/90 leading-relaxed font-medium">
              {t('banFamilyDescription', {
                name: banningFamily?.family_name ?? '',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50/70 border border-red-200/80 rounded-[10px] p-4 flex gap-3 text-[14px] text-red-700 font-medium items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <p className="leading-snug">{t('banFamilyWarning')}</p>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBanningFamily(null)}
              disabled={banMutation.isPending}
              className="rounded-xl px-5 shadow-none font-medium text-foreground h-11"
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmBan}
              disabled={banMutation.isPending}
              className="rounded-xl px-5 h-11 gap-2 font-bold shadow-none text-md text-white bg-[#EF4444] hover:bg-[#DC2626]"
            >
              <Ban className="h-4 w-4" />
              {banMutation.isPending ? t('confirmingBan') : t('confirmBan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Account Modal — design-parity placeholder until backend ships
          a per-member status mutation. Confirm currently fires a toast. */}
      <Dialog
        open={!!banningAccount}
        onOpenChange={(open) => !open && setBanningAccount(null)}
      >
        <DialogContent className="sm:max-w-[500px] p-6 gap-6 rounded-[16px]">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl font-bold">
              {t('banAccountTitle')}
            </DialogTitle>
            <DialogDescription className="text-[14.5px] text-muted-foreground/90 leading-relaxed font-medium">
              {t('banAccountDescription', {
                name: banningAccount
                  ? memberFullName(banningAccount.member)
                  : '',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50/70 border border-red-200/80 rounded-[10px] p-4 flex gap-3 text-[14px] text-red-700 font-medium items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <p className="leading-snug">{t('banAccountWarning')}</p>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBanningAccount(null)}
              className="rounded-xl px-5 shadow-none font-medium text-foreground h-11"
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmBanAccount}
              className="rounded-xl px-5 h-11 gap-2 font-bold shadow-none text-md text-white bg-[#EF4444] hover:bg-[#DC2626]"
            >
              <Ban className="h-4 w-4" />
              {t('confirmBan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

interface FamilyRowProps {
  family: AdminFamily;
  isOpen: boolean;
  onToggle: () => void;
  onBan: () => void;
  onBanMember: (member: AdminFamilyMember) => void;
  statusLabel: (status: string) => string;
  t: ReturnType<typeof useTranslations<'Admin.Families'>>;
}

function FamilyRow({
  family,
  isOpen,
  onToggle,
  onBan,
  onBanMember,
  statusLabel,
  t,
}: FamilyRowProps) {
  const isInactive = family.status !== 'active';
  const primary = findPrimaryMember(family.members);
  const others = primary
    ? family.members.filter((m) => m.id !== primary.id)
    : family.members;
  const memberCount = family.members.length;
  // Backend doesn't return a students count yet — em-dash until it ships.
  const studentsLabel = '—';

  const primaryName = primary ? memberFullName(primary) : t('primaryUnknown');

  return (
    <div className="flex flex-col border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
      {/* Main Row Header */}
      <button
        type="button"
        className="flex items-center justify-between p-6 group cursor-pointer text-left w-full"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-[42px] w-[42px] bg-blue-100">
            <AvatarFallback className="text-blue-700 bg-blue-100 font-bold text-sm">
              {familyInitial(family.family_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px]">
                {family.family_name}
              </span>
              <Badge
                variant="secondary"
                className={STATUS_BADGE[family.status] ?? STATUS_BADGE.inactive}
              >
                {statusLabel(family.status)}
              </Badge>
            </div>
            <span className="text-[13px] text-muted-foreground/80 mt-0.5">
              {t('rowSummary', {
                primary: primaryName,
                members: memberCount,
                students: studentsLabel,
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/*
            Vehicles + pickups counts aren't in /admin/families response.
            Render-side placeholders kept off so we don't show fake numbers.
            Re-enable once backend includes aggregate counts on the row.
          */}
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground/40 group-hover:text-foreground/70 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-foreground/70' : ''
            }`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="flex flex-col px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-200 bg-white">
          {!isInactive && (
            <div className="flex items-center mb-6">
              <Button
                type="button"
                onClick={onBan}
                variant="outline"
                className="h-8 shadow-none border-[#FCA5A5] text-[#EF4444] hover:bg-red-50 hover:text-red-700 gap-1.5 rounded-[8px] px-3 font-semibold text-[13px]"
              >
                <Ban className="h-3.5 w-3.5" />
                {t('banEntireFamily')}
              </Button>
            </div>
          )}

          {/* Primary Account */}
          {primary && (
            <div className="flex flex-col gap-3 mb-6">
              <h4 className="text-[11px] font-bold text-muted-foreground tracking-wider">
                {t('primaryAccount')}
              </h4>
              <MemberCard
                member={primary}
                kind="primary"
                onBan={
                  primary.status === 'active'
                    ? () => onBanMember(primary)
                    : undefined
                }
                t={t}
              />
            </div>
          )}

          {/* Additional & Supplementary */}
          {others.length > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              <h4 className="text-[11px] font-bold text-muted-foreground tracking-wider">
                {t('additionalAccounts', { count: others.length })}
              </h4>
              <div className="flex flex-col gap-2">
                {others.map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    kind={classifyMember(m)}
                    onBan={
                      m.status === 'active' ? () => onBanMember(m) : undefined
                    }
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}

          {/*
            Students section. Backend doesn't return students per family yet
            (separate domain). Layout block kept commented for once that
            endpoint ships:

            <div className="flex flex-col gap-3 mb-6">
              <h4>...studentsHeading...</h4>
              {family.students.map(...)}
            </div>
          */}

          {/* Footer */}
          <div className="flex items-center gap-6 border-t border-border/50 pt-4 mt-2">
            <span className="text-[12px] font-medium text-muted-foreground">
              {t('joinedDate', {
                date: new Date(family.joined_at).toLocaleDateString(),
              })}
            </span>
            {/* vehicles + pickups counts: backend hasn't shipped these yet. */}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Member card ──────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: AdminFamilyMember;
  kind: MemberKind;
  /**
   * Click handler for the per-member ban icon. Only shown when defined —
   * pass `undefined` for already-inactive accounts to hide the icon.
   */
  onBan?: () => void;
  t: ReturnType<typeof useTranslations<'Admin.Families'>>;
}

function MemberCard({ member, kind, onBan, t }: MemberCardProps) {
  const initials = memberInitials(member);
  const fullName = memberFullName(member);
  const kindLabel =
    kind === 'primary'
      ? t('primaryBadge')
      : kind === 'supplementary'
        ? t('supplementaryBadge')
        : t('additionalBadge');

  return (
    <div className="flex items-center justify-between border border-border/60 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-4 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback
            className={
              kind === 'primary'
                ? 'bg-purple-100 text-purple-700 font-semibold text-sm'
                : 'bg-zinc-100 text-zinc-700 font-semibold text-sm'
            }
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-foreground truncate">
              {fullName}
            </span>
            <Badge variant="secondary" className={KIND_BADGE[kind]}>
              {kind === 'primary' && (
                <GraduationCap className="h-3 w-3 inline" />
              )}
              {kindLabel}
            </Badge>
            <Badge
              variant="secondary"
              className={STATUS_BADGE[member.status] ?? STATUS_BADGE.inactive}
            >
              {member.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground mt-1 font-medium flex-wrap">
            {member.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                {member.email}
              </span>
            )}
            {member.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                {member.phone}
              </span>
            )}
            {member.line_id && (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <MessageSquare className="h-3 w-3" />@{member.line_id}
              </span>
            )}
          </div>
        </div>
      </div>
      {onBan && (
        <button
          type="button"
          onClick={onBan}
          aria-label={t('banAccountTitle')}
          title={t('banAccountTitle')}
          className="ml-3 h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        >
          <Ban className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
