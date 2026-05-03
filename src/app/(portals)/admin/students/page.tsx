'use client';

import { keepPreviousData } from '@tanstack/react-query';
import {
  Camera,
  Eye,
  FileText,
  Info,
  Lock,
  Save,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CRMFilterBar } from '@/components/shared/CRMFilterBar';
import { CRMPagination } from '@/components/shared/CRMPagination';
import { CRMStatCards } from '@/components/shared/CRMStatCards';
import { CRMTableWrapper } from '@/components/shared/CRMTableWrapper';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminStudent,
  AdminStudentListResponse,
  AdminStudentUpdateInput,
  ApiEnvelope,
} from '@/types';
import {
  hasNote,
  studentFullName,
  studentGradeSection,
  studentInitials,
  toUpdateInput,
} from './_helpers';

/** Common Thai/Intl school grades. Hardcoded until the backend ships a
 *  `/admin/schools/:id/grades` (or similar) lookup. */
const GRADE_OPTIONS = [
  'KG-1',
  'KG-2',
  'KG-3',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
];

export default function StudentCRMPage() {
  const t = useTranslations('Admin.Students');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [gradeFilter, setGradeFilter] = useState<string>('');

  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(
    null,
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');

  const filterParams = {
    page,
    size: pageSize,
    ...(search ? { search } : {}),
    ...(gradeFilter
      ? { filter_field: 'grade' as const, filter_value: gradeFilter }
      : {}),
  };

  const listQuery = useApi<AdminStudentListResponse>(
    apiKeys.adminStudents.list(filterParams),
    { placeholderData: keepPreviousData },
  );

  const students = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPage = listQuery.data?.totalPage ?? 1;
  const isLoading = listQuery.isLoading && !listQuery.data;

  const updateMutation = useApiMutation<
    ApiEnvelope<string>,
    { id: string; input: AdminStudentUpdateInput }
  >(({ id, input }) => apiKeys.adminStudents.update(id, input), {
    onSuccess: (envelope) => {
      if (envelope.error?.code) {
        // Surface the error somewhere visible (toast would be nicer, but
        // keep it simple inside the dialog state for now).
        return;
      }
      setIsEditingNotes(false);
      // Optimistically reflect the new note in the open detail.
      if (selectedStudent) {
        setSelectedStudent({ ...selectedStudent, notes: draftNotes });
      }
      listQuery.refetch();
    },
  });

  const stats = [
    { label: t('statTotal'), value: total },
    {
      label: t('statEnrolled'),
      value: students.filter((s) => s.status === 'enrolled').length,
      colorClass: 'text-emerald-500 font-bold',
    },
    {
      label: (
        <span className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" /> {t('statWithNotes')}
        </span>
      ) as unknown as string,
      value: students.filter(hasNote).length,
      colorClass: 'text-blue-500 font-bold',
    },
  ];

  const filters = [
    {
      placeholder: t('filterAllGrades'),
      value: gradeFilter,
      onChange: (v: string) => {
        setGradeFilter(v);
        setPage(1);
      },
      options: GRADE_OPTIONS.map((g) => ({ label: g, value: g })),
    },
  ];

  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    if (page !== 1) setPage(1);
  };

  const openDetail = (s: AdminStudent) => {
    setSelectedStudent(s);
    setIsEditingNotes(false);
    setDraftNotes(s.notes ?? '');
  };

  const closeDetail = () => {
    setSelectedStudent(null);
    setIsEditingNotes(false);
  };

  const startEditNotes = () => {
    if (!selectedStudent) return;
    setDraftNotes(selectedStudent.notes ?? '');
    setIsEditingNotes(true);
  };

  const saveNotes = () => {
    if (!selectedStudent) return;
    updateMutation.mutate({
      id: selectedStudent.id,
      input: toUpdateInput(selectedStudent, { notes: draftNotes }),
    });
  };

  const statusLabel = (status: string): string => {
    if (status === 'enrolled') return t('statusEnrolled');
    if (status === 'graduated') return t('statusGraduated');
    if (status === 'withdrawn') return t('statusWithdrawn');
    return status;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
      </div>

      {/* Sync banner */}
      <div className="flex gap-3 rounded-[12px] border border-blue-200/70 bg-blue-50/70 p-4">
        <Info className="h-5 w-5 shrink-0 text-blue-600" />
        <div className="flex flex-col gap-1">
          <p className="text-[13.5px] font-bold text-blue-900">
            {t('syncBannerTitle')}
          </p>
          <p className="text-[13px] leading-snug text-blue-800/90">
            {t.rich('syncBannerBody', {
              strong: (chunks) => (
                <strong className="font-bold">{chunks}</strong>
              ),
            })}
          </p>
        </div>
      </div>

      <CRMStatCards metrics={stats} />

      <CRMFilterBar
        searchPlaceholder={t('searchPlaceholder')}
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        filters={filters}
      />

      <CRMTableWrapper title={t('directoryTitle', { count: total })}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-border/50">
              <TableHead className="pl-6 font-bold text-foreground h-12">
                {t('columnStudent')}
              </TableHead>
              <TableHead className="font-bold text-foreground">
                {t('columnGrade')}
              </TableHead>
              <TableHead className="font-bold text-foreground">
                {t('columnFamily')}
              </TableHead>
              <TableHead className="font-bold text-foreground">
                {t('columnNotes')}
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
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  {t('emptyState')}
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow
                  key={s.id}
                  className="hover:bg-muted/10 border-b-border/40 transition-colors"
                >
                  <TableCell className="pl-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-[38px] w-[38px] bg-blue-100 border-0">
                        <AvatarFallback className="text-blue-700 bg-blue-100 text-[13px] font-bold">
                          {studentInitials(s)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-[13.5px] text-foreground/90">
                          {studentFullName(s)}
                        </span>
                        <span className="text-[12.5px] text-muted-foreground mt-0.5">
                          {s.school_email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100/80 text-blue-700 hover:bg-blue-100 border-none px-2 py-0 text-[11px] font-semibold tracking-wide"
                    >
                      {studentGradeSection(s)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-[13.5px] text-muted-foreground/90">
                    {/* Backend doesn't embed family name in student response —
                        fall back to the student's last_name as the design does. */}
                    {s.last_name || '—'}
                  </TableCell>
                  <TableCell className="text-[13.5px] text-muted-foreground max-w-[220px] truncate">
                    {hasNote(s) ? s.notes : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[11px] font-semibold tracking-wide"
                    >
                      {statusLabel(s.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <button
                      type="button"
                      onClick={() => openDetail(s)}
                      className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground/60 hover:text-foreground"
                      aria-label={t('viewDetail')}
                    >
                      <Eye className="h-[18px] w-[18px]" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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

      {/* Detail Modal */}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[16px] gap-0 border-border/40 shadow-xl">
          <DialogTitle className="sr-only">
            {selectedStudent ? studentFullName(selectedStudent) : ''}
          </DialogTitle>
          {selectedStudent && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-4">
                  <Avatar className="h-[52px] w-[52px] bg-blue-100 border-0">
                    <AvatarFallback className="text-blue-700 bg-blue-100 text-lg font-bold">
                      {studentInitials(selectedStudent)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="text-[19px] font-bold text-foreground leading-tight">
                      {studentFullName(selectedStudent)}
                    </h3>
                    <span className="text-[13.5px] text-muted-foreground">
                      {selectedStudent.school_email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-7">
                {/* BASIC INFORMATION */}
                <div className="space-y-3.5">
                  <SectionHeader
                    label={t('basicInformation')}
                    fromSchoolApi
                    t={t}
                  />
                  <div className="grid grid-cols-2 gap-3.5">
                    <ReadOnlyField
                      label={t('id')}
                      value={selectedStudent.id}
                      mono
                    />
                    <ReadOnlyField
                      label={t('gradeAndSection')}
                      value={studentGradeSection(selectedStudent)}
                    />
                    <ReadOnlyField
                      icon={<Users className="h-3.5 w-3.5" />}
                      label={t('family')}
                      value={selectedStudent.last_name || '—'}
                    />
                    <ReadOnlyField
                      icon={<Camera className="h-3.5 w-3.5" />}
                      label={t('photoConsent')}
                      valueClassName={
                        selectedStudent.photo_consent
                          ? 'text-emerald-600 font-bold'
                          : 'text-red-500 font-bold'
                      }
                      value={
                        selectedStudent.photo_consent
                          ? t('granted')
                          : t('notGranted')
                      }
                    />
                  </div>
                </div>

                {/* EMERGENCY CONTACT */}
                <div className="space-y-3.5">
                  <SectionHeader
                    icon={<ShieldAlert className="h-4 w-4" />}
                    label={t('emergencyContact')}
                    fromSchoolApi
                    accent="red"
                    t={t}
                  />
                  {/*
                    Backend has an EmergencyContact domain struct but no
                    handler exposes it yet. Show a placeholder until a
                    GET /admin/students/:id/emergency-contact (or similar)
                    ships.
                  */}
                  <div className="bg-red-50/40 border border-red-100 rounded-[12px] p-4 text-[13.5px] text-muted-foreground italic">
                    {t('emergencyContactNotAvailable')}
                  </div>
                </div>

                {/* ENROLLMENT STATUS */}
                <div className="space-y-3.5">
                  <SectionHeader
                    label={t('enrollmentStatus')}
                    fromSchoolApi
                    t={t}
                  />
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5 text-[12px] font-semibold tracking-wide"
                  >
                    {statusLabel(selectedStudent.status)}
                  </Badge>
                </div>

                {/* IMPORTANT NOTES */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <FileText className="h-4 w-4" /> {t('importantNotes')}
                    </h4>
                    {!isEditingNotes && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={startEditNotes}
                        className="h-[30px] gap-1.5 rounded-[8px] px-3 font-semibold text-[12.5px] shadow-none"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {t('editNotes')}
                      </Button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <>
                      <Textarea
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        placeholder={t('notesPlaceholder')}
                        rows={4}
                        className="resize-y"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingNotes(false)}
                          disabled={updateMutation.isPending}
                          className="rounded-[8px] h-9 px-4 font-semibold text-[13px] gap-1.5 shadow-none"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t('cancel')}
                        </Button>
                        <Button
                          type="button"
                          onClick={saveNotes}
                          disabled={updateMutation.isPending}
                          className="rounded-[8px] h-9 px-4 font-semibold text-[13px] gap-1.5 shadow-none bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {updateMutation.isPending
                            ? t('saving')
                            : t('saveNotes')}
                        </Button>
                      </div>
                    </>
                  ) : hasNote(selectedStudent) ? (
                    <p className="text-[14.5px] font-medium text-foreground/90 leading-relaxed">
                      {selectedStudent.notes}
                    </p>
                  ) : (
                    <p className="text-[14.5px] font-medium text-blue-400/80">
                      {t('noNotesAdded')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface SectionHeaderProps {
  label: string;
  icon?: React.ReactNode;
  accent?: 'red' | 'default';
  fromSchoolApi?: boolean;
  t: ReturnType<typeof useTranslations<'Admin.Students'>>;
}

function SectionHeader({
  label,
  icon,
  accent = 'default',
  fromSchoolApi,
  t,
}: SectionHeaderProps) {
  return (
    <h4
      className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider ${
        accent === 'red' ? 'text-red-500' : 'text-muted-foreground'
      }`}
    >
      {icon}
      {label}
      {fromSchoolApi && (
        <Badge
          variant="secondary"
          className="ml-1 bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-none px-2 py-0 text-[10px] font-bold normal-case tracking-normal flex items-center gap-1"
        >
          <Lock className="h-2.5 w-2.5" />
          {t('fromSchoolApi')}
        </Badge>
      )}
    </h4>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
  valueClassName?: string;
}

function ReadOnlyField({
  label,
  value,
  icon,
  mono,
  valueClassName,
}: ReadOnlyFieldProps) {
  return (
    <div className="bg-muted/30 border border-border/60 rounded-[12px] p-3.5">
      <span className="text-[12px] font-medium text-muted-foreground flex gap-1.5 items-center mb-0.5">
        {icon}
        {label}
      </span>
      <span
        className={`text-[14.5px] font-medium text-foreground/90 truncate block ${mono ? 'font-mono' : ''} ${valueClassName ?? ''}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
