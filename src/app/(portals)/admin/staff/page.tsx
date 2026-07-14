'use client';

import { keepPreviousData } from '@tanstack/react-query';
import { Ban, CheckCircle, MoreVertical, Trash2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { CRMField } from '@/components/shared/CRMField';
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
  AdminUser,
  AdminUserCreateInput,
  AdminUserListResponse,
  AdminUserUpdateInput,
  ApiEnvelope,
} from '@/types';

const fullName = (u: AdminUser): string =>
  `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email;

const initialsOf = (u: AdminUser): string => {
  const combined = `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.trim();
  return (combined || u.email.slice(0, 2)).toUpperCase();
};

const isAdminRole = (role: string): boolean =>
  role === 'admin' || role === 'owner';

const formatDate = (value: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

const envelopeFailed = (env?: ApiEnvelope<unknown>): boolean =>
  Boolean(env?.error?.code || env?.error?.message);

const readError = (err: Error): string => {
  const data = (
    err as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data;
  return data?.error?.message ?? err.message ?? '';
};

/** Local Thai mobile: 10 digits, leading 0 (matches the backend validator). */
const isValidLocalPhone = (digits: string): boolean => /^0\d{9}$/.test(digits);

export default function StaffCRMPage() {
  const t = useTranslations('Admin.Staff');

  // Filter / pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [managingStaff, setManagingStaff] = useState<AdminUser | null>(null);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);

  const listQuery = useApi<AdminUserListResponse>(
    apiKeys.adminUsers.list({
      page,
      size: pageSize,
      ...(search ? { search } : {}),
    }),
    { placeholderData: keepPreviousData },
  );

  const allUsers = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPage = listQuery.data?.totalPage ?? 1;
  const isLoading = listQuery.isLoading && !listQuery.data;

  // Fetch fresh detail for the managed user (GET /admin/users/:id) so the
  // Manage modal reflects the latest role/status, not just the list-row copy.
  const detailQuery = useApi<ApiEnvelope<AdminUser>>(
    apiKeys.adminUsers.byId(managingStaff?.id ?? ''),
    { enabled: !!managingStaff },
  );
  const managingDetail = detailQuery.data?.data ?? managingStaff;

  // Role/status filters are applied client-side: the backend list endpoint
  // only supports page/size/search. Fine for small internal-staff directories;
  // revisit if the backend adds role/status filtering server-side.
  const users = allUsers.filter((u) => {
    const roleOk = !roleFilter || u.role === roleFilter;
    const statusOk = !statusFilter || u.status === statusFilter;
    return roleOk && statusOk;
  });

  const roleLabel = (role: string): string => {
    if (role === 'owner') return t('roleOwner');
    if (role === 'admin') return t('roleAdministrator');
    if (role === 'staff') return t('roleStaff');
    return role;
  };

  const statusLabel = (status: string): string => {
    if (status === 'active') return t('statusActive');
    if (status === 'suspended') return t('statusSuspended');
    if (status === 'pending') return t('statusPending');
    if (status === 'banned') return t('statusBanned');
    return status;
  };

  // Page-scoped counts (except total, which is from the server). The backend
  // has no aggregated stats endpoint yet, so these reflect the visible page.
  const stats = [
    { label: t('statTotal'), value: total },
    {
      label: t('statActive'),
      value: allUsers.filter((u) => u.status === 'active').length,
      colorClass: 'text-emerald-500',
    },
    {
      label: t('statAdministrators'),
      value: allUsers.filter((u) => isAdminRole(u.role)).length,
      colorClass: 'text-violet-500',
    },
    {
      label: t('statSuspended'),
      value: allUsers.filter((u) => u.status === 'suspended').length,
      colorClass: 'text-orange-500',
    },
  ];

  const filters = [
    {
      placeholder: t('filterAllRoles'),
      value: roleFilter,
      onChange: (v: string) => setRoleFilter(v),
      options: [
        { label: t('roleOwner'), value: 'owner' },
        { label: t('roleAdministrator'), value: 'admin' },
        { label: t('roleStaff'), value: 'staff' },
      ],
    },
    {
      placeholder: t('filterAllStatus'),
      value: statusFilter,
      onChange: (v: string) => setStatusFilter(v),
      options: [
        { label: t('statusActive'), value: 'active' },
        { label: t('statusSuspended'), value: 'suspended' },
        { label: t('statusPending'), value: 'pending' },
        { label: t('statusBanned'), value: 'banned' },
      ],
    },
  ];

  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    if (page !== 1) setPage(1);
  };

  // Map a create-error to a localized description regardless of whether the
  // upstream returned an envelope error (200 + error.code) or threw an HTTP
  // error (axios reject). Without this, code `40901` (email already exists)
  // would surface as the raw English "resource already exists" or — worse —
  // get lost behind a generic message.
  const createErrorDescription = (code?: string, message?: string): string => {
    if (code === '40901') return t('createErrorAlreadyExists');
    return message?.trim() || t('actionErrorGeneric');
  };

  // ── Mutations ──────────────────────────────────────────────────────
  // Direct create: the backend creates the account and emails a temporary
  // password (no invite/accept step). The admin's JWT carries the school, so
  // no school_id is sent — the backend scopes the new user to that school.
  const createMutation = useApiMutation<
    ApiEnvelope<unknown>,
    AdminUserCreateInput
  >((input) => apiKeys.adminUsers.create(input), {
    onSuccess: (env) => {
      if (envelopeFailed(env)) {
        toast.error(t('createErrorTitle'), {
          description: createErrorDescription(
            env.error.code,
            env.error.message,
          ),
        });
        return;
      }
      toast.success(t('createSuccessTitle'), {
        description: t('createSuccessDescription'),
      });
      setIsCreateModalOpen(false);
      setCreateFirstName('');
      setCreateLastName('');
      setCreateEmail('');
      setCreatePhone('');
      listQuery.refetch();
    },
    onError: (err) => {
      const data = (
        err as {
          response?: { data?: { error?: { code?: string; message?: string } } };
        }
      )?.response?.data;
      toast.error(t('createErrorTitle'), {
        description: createErrorDescription(
          data?.error?.code,
          data?.error?.message ?? err.message,
        ),
      });
    },
  });

  const updateMutation = useApiMutation<
    ApiEnvelope<AdminUser>,
    {
      id: string;
      input: AdminUserUpdateInput;
      successTitle: string;
      successDescription: string;
    }
  >(({ id, input }) => apiKeys.adminUsers.update(id, input), {
    onSuccess: (env, vars) => {
      if (envelopeFailed(env)) {
        toast.error(t('actionErrorTitle'), {
          description: env.error.message || t('actionErrorGeneric'),
        });
        return;
      }
      toast.success(vars.successTitle, {
        description: vars.successDescription,
      });
      setManagingStaff(null);
      listQuery.refetch();
    },
    onError: (err) => {
      toast.error(t('actionErrorTitle'), {
        description: readError(err) || t('actionErrorGeneric'),
      });
    },
  });

  const deleteMutation = useApiMutation<
    ApiEnvelope<string>,
    { id: string; name: string }
  >(({ id }) => apiKeys.adminUsers.delete(id), {
    onSuccess: (env, vars) => {
      if (envelopeFailed(env)) {
        toast.error(t('actionErrorTitle'), {
          description: env.error.message || t('actionErrorGeneric'),
        });
        return;
      }
      toast.error(t('staffRemovedTitle'), {
        description: t('staffRemovedDescription', { name: vars.name }),
      });
      setIsConfirmRemoveOpen(false);
      setManagingStaff(null);
      listQuery.refetch();
    },
    onError: (err) => {
      toast.error(t('actionErrorTitle'), {
        description: readError(err) || t('actionErrorGeneric'),
      });
    },
  });

  const handleCreate = () => {
    const first = createFirstName.trim();
    const last = createLastName.trim();
    const email = createEmail.trim();
    if (!first || !last) {
      toast.error(t('createErrorTitle'), {
        description: t('userNameRequired'),
      });
      return;
    }
    if (!email || !email.includes('@')) {
      toast.error(t('createErrorTitle'), { description: t('emailRequired') });
      return;
    }
    // Phone is optional, but if given it must be a valid local number.
    const digits = createPhone.replace(/\D/g, '');
    if (digits && !isValidLocalPhone(digits)) {
      toast.error(t('createErrorTitle'), { description: t('phoneInvalid') });
      return;
    }
    createMutation.mutate({
      first_name: first,
      last_name: last,
      email,
      role: 'staff',
      ...(digits ? { phone: digits } : {}),
    });
  };

  const handleSuspend = (member: AdminUser) => {
    updateMutation.mutate({
      id: member.id,
      input: { status: 'suspended' },
      successTitle: t('accountSuspendedTitle'),
      successDescription: t('accountSuspendedDescription', {
        name: fullName(member),
      }),
    });
  };

  const handleReactivate = (member: AdminUser) => {
    updateMutation.mutate({
      id: member.id,
      input: { status: 'active' },
      successTitle: t('accountReactivatedTitle'),
      successDescription: t('accountReactivatedDescription', {
        name: fullName(member),
      }),
    });
  };

  const handleRemove = () => {
    if (!managingStaff) return;
    deleteMutation.mutate({
      id: managingStaff.id,
      name: fullName(managingStaff),
    });
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
        actionLabel={t('addStaff')}
        actionIcon={<UserPlus className="h-4 w-4" />}
        onActionClick={() => setIsCreateModalOpen(true)}
      />

      <CRMTableWrapper title={t('directoryTitle', { count: total })}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">{t('columnStaffMember')}</TableHead>
              <TableHead>{t('columnRole')}</TableHead>
              <TableHead>{t('columnStatus')}</TableHead>
              <TableHead>{t('columnLastLogin')}</TableHead>
              <TableHead>{t('columnJoined')}</TableHead>
              <TableHead className="text-right pr-6">
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  {t('emptyState')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                          {initialsOf(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {fullName(member)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        isAdminRole(member.role)
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2.5 py-0.5'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none px-2.5 py-0.5'
                      }
                    >
                      {roleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5'
                          : member.status === 'banned'
                            ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none px-2.5 py-0.5'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2.5 py-0.5'
                      }
                    >
                      {statusLabel(member.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(member.last_login)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(member.created_at)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <button
                      type="button"
                      onClick={() => setManagingStaff(member)}
                      className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CRMTableWrapper>

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

      {/* Create Staff Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {t('createModalTitle')}
              </DialogTitle>
              <DialogDescription className="text-[15px] mt-1.5">
                {t('createModalDescription')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-5 p-6 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <CRMField
                label={t('firstNameLabel')}
                placeholder={t('firstNamePlaceholder')}
                value={createFirstName}
                onChange={(v) => setCreateFirstName((v as string) ?? '')}
              />
              <CRMField
                label={t('lastNameLabel')}
                placeholder={t('lastNamePlaceholder')}
                value={createLastName}
                onChange={(v) => setCreateLastName((v as string) ?? '')}
              />
            </div>

            <CRMField
              type="email"
              label={t('schoolEmailLabel')}
              placeholder={t('schoolEmailPlaceholder')}
              description={t('schoolEmailDescription')}
              value={createEmail}
              onChange={(v) => setCreateEmail((v as string) ?? '')}
            />

            <CRMField
              label={t('phoneLabel')}
              placeholder={t('phonePlaceholder')}
              value={createPhone}
              onChange={(v) => setCreatePhone((v as string) ?? '')}
            />

            <CRMField
              type="select"
              label={t('roleLabel')}
              value="staff"
              disabled
              description={t('createRoleNote')}
              options={[{ label: t('roleStaff'), value: 'staff' }]}
            />

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3.5 text-[12.5px] font-medium leading-relaxed text-blue-700/90">
              {t('tempPasswordNote')}
            </div>
          </div>

          <div className="p-6 pt-2 flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              className="h-11 px-6 rounded-xl border-border shadow-none font-medium"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              className="h-11 px-6 rounded-xl gap-2 font-medium shadow-none bg-[#C084FC] hover:bg-[#A855F7] text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <UserPlus className="h-[18px] w-[18px]" />
              {createMutation.isPending ? t('creatingUser') : t('createUser')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Staff Modal */}
      <Dialog
        open={!!managingStaff}
        onOpenChange={(open) => !open && setManagingStaff(null)}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
          <div className="p-6 pb-4 border-b border-border/50">
            <DialogHeader className="mb-1 text-left">
              <DialogTitle className="text-xl font-bold">
                {t('manageTitle', {
                  name: managingStaff ? fullName(managingStaff) : '',
                })}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {managingStaff?.email}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-4 p-6 pt-5">
            <div className="flex items-center border border-border/50 rounded-xl p-3 px-4 bg-muted/20">
              <span className="text-sm text-muted-foreground font-medium w-[120px]">
                {t('currentRole')}
              </span>
              <Badge
                variant="secondary"
                className={
                  isAdminRole(managingDetail?.role ?? '')
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2.5 py-0.5'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none px-2.5 py-0.5'
                }
              >
                {managingDetail ? roleLabel(managingDetail.role) : ''}
              </Badge>
            </div>

            <div className="flex items-center border border-border/50 rounded-xl p-3 px-4 bg-muted/20">
              <span className="text-sm text-muted-foreground font-medium w-[120px]">
                {t('currentStatus')}
              </span>
              <Badge
                variant="secondary"
                className={
                  managingDetail?.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2.5 py-0.5'
                }
              >
                {managingDetail ? statusLabel(managingDetail.status) : ''}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 mt-1">
              {managingDetail?.status === 'active' ? (
                <Button
                  variant="outline"
                  className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 h-11"
                  disabled={updateMutation.isPending}
                  onClick={() => managingStaff && handleSuspend(managingStaff)}
                >
                  <Ban className="mr-3 h-4 w-4" /> {t('suspendAccount')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 h-11"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    managingStaff && handleReactivate(managingStaff)
                  }
                >
                  <CheckCircle className="mr-3 h-4 w-4" />{' '}
                  {t('reactivateAccount')}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 h-11"
                onClick={() => setIsConfirmRemoveOpen(true)}
              >
                <Trash2 className="mr-3 h-4 w-4" /> {t('removeStaffMember')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Staff Modal */}
      <Dialog open={isConfirmRemoveOpen} onOpenChange={setIsConfirmRemoveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('confirmRemovalTitle')}</DialogTitle>
            <DialogDescription className="mt-2 text-[13px] leading-relaxed">
              {t.rich('confirmRemovalDescription', {
                name: managingStaff ? fullName(managingStaff) : '',
                strong: (chunks) => (
                  <strong className="text-foreground font-semibold">
                    {chunks}
                  </strong>
                ),
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              className="border-border shadow-none"
              onClick={() => setIsConfirmRemoveOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              className="gap-2 shadow-none"
              onClick={handleRemove}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" /> {t('remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
