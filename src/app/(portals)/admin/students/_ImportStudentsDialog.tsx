'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Download,
  FileUp,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminGrade,
  AdminStudentListResponse,
  ApiEnvelope,
} from '@/types';
import {
  buildTemplateCsv,
  type CsvIssue,
  type CsvRow,
  parseStudentCsv,
  toBackendCsv,
  USER_COLUMNS,
  validateRows,
} from './_csv';

/**
 * How many existing students we pull in to pre-check for duplicate school
 * emails. A repeat email aborts the entire batch server-side, so catching it
 * here is worth one extra request; past this size we say so rather than imply
 * the file is clean.
 */
const EMAIL_CHECK_LIMIT = 2000;

interface ImportStudentsDialogProps {
  /** The admin's own school — stamped onto every row the file didn't fill. */
  schoolId: string;
  /** Refetch the visible table once rows land. */
  onImported: () => void;
}

export function ImportStudentsDialog({
  schoolId,
  onImported,
}: ImportStudentsDialogProps) {
  const t = useTranslations('Admin.Students.import');
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [issues, setIssues] = useState<CsvIssue[]>([]);

  const gradesQuery = useApi<ApiEnvelope<AdminGrade[]>>(
    apiKeys.adminGrades.list(),
    { enabled: open, staleTime: 5 * 60 * 1000, retry: false },
  );
  const directoryQuery = useApi<AdminStudentListResponse>(
    apiKeys.adminStudents.list({ page: 1, size: EMAIL_CHECK_LIMIT }),
    { enabled: open, staleTime: 30 * 1000, retry: false },
  );

  const knownGrades = (gradesQuery.data?.data ?? []).map((g) => g.name);
  const directory = directoryQuery.data?.data ?? [];
  const directoryTotal = directoryQuery.data?.total ?? directory.length;
  const emailCheckComplete = directoryTotal <= EMAIL_CHECK_LIMIT;

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  const canUpload = rows.length > 0 && errors.length === 0;

  const importMutation = useApiMutation<ApiEnvelope<unknown>, string>((csv) =>
    apiKeys.adminStudents.bulkCreate(csv),
  );

  const reset = () => {
    setFileName('');
    setRows([]);
    setIssues([]);
    if (fileInput.current) fileInput.current.value = '';
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const existingEmailSet = () =>
    new Set(directory.map((s) => s.school_email.toLowerCase()));

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseStudentCsv(text);
    setRows(parsed.rows);
    setIssues([
      ...parsed.issues,
      ...validateRows(parsed.rows, {
        knownGrades,
        existingEmails: existingEmailSet(),
        emailCheckComplete,
      }),
    ]);
  };

  const downloadTemplate = () => {
    const blob = new Blob([buildTemplateCsv()], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    try {
      await importMutation.mutateAsync(toBackendCsv(rows, schoolId));
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? '';
      toast.error(t('failedTitle'), {
        description: message.includes('students_school_email_key')
          ? t('failedDuplicate')
          : message.includes('wrong number of fields')
            ? t('failedFieldCount')
            : message || t('failedGeneric'),
      });
      return;
    }

    // The endpoint answers `{"data":"success"}` whatever happened — it skips
    // unparseable rows without a word — so count what actually landed by
    // re-reading the directory and looking for this file's emails. That is
    // exact, unlike a before/after row count, which another admin importing
    // at the same moment would throw off.
    await queryClient.invalidateQueries({
      queryKey: ['admin', 'students', 'list'],
    });
    onImported();

    const refreshed = await directoryQuery.refetch();
    const landed = new Set(
      (refreshed.data?.data ?? []).map((s) => s.school_email.toLowerCase()),
    );
    const imported = rows.filter((r) =>
      landed.has(r.values.school_email.toLowerCase()),
    ).length;

    if (imported === rows.length) {
      toast.success(t('successTitle'), {
        description: t('successAll', { count: imported }),
      });
    } else {
      toast.warning(t('partialTitle'), {
        description: t('partialBody', {
          imported,
          total: rows.length,
          skipped: rows.length - imported,
        }),
      });
    }
    close();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 gap-2 rounded-xl font-semibold"
      >
        <FileUp className="h-[17px] w-[17px]" />
        {t('button')}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
      >
        <DialogContent className="max-w-[680px]">
          <DialogTitle className="text-[18px] font-bold">
            {t('title')}
          </DialogTitle>
          <p className="-mt-1 text-[13.5px] font-medium text-muted-foreground">
            {t('subtitle')}
          </p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <Button
                variant="outline"
                onClick={() => fileInput.current?.click()}
                className="h-10 gap-2 rounded-xl font-semibold"
              >
                <Upload className="h-[17px] w-[17px]" />
                {t('chooseFile')}
              </Button>
              <Button
                variant="ghost"
                onClick={downloadTemplate}
                className="h-10 gap-2 rounded-xl font-semibold"
              >
                <Download className="h-[17px] w-[17px]" />
                {t('template')}
              </Button>
              {fileName && (
                <span className="truncate text-[13px] font-medium text-muted-foreground">
                  {fileName}
                </span>
              )}
            </div>

            <p className="rounded-xl bg-muted/60 px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-muted-foreground">
              {t('columnsHint', { columns: USER_COLUMNS.join(', ') })}
            </p>

            {rows.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  {t('readyCount', { count: rows.length })}
                </span>
                {errors.length > 0 && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                    {t('errorCount', { count: errors.length })}
                  </span>
                )}
                {warnings.length > 0 && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    {t('warningCount', { count: warnings.length })}
                  </span>
                )}
              </div>
            )}

            {!emailCheckComplete && rows.length > 0 && (
              <p className="text-[12.5px] font-medium text-amber-700">
                {t('partialEmailCheck', { limit: EMAIL_CHECK_LIMIT })}
              </p>
            )}

            {issues.length > 0 && (
              <div className="max-h-[240px] overflow-y-auto rounded-xl border border-border/60">
                {issues.map((issue) => (
                  <div
                    key={`${issue.line}-${issue.level}-${issue.message}`}
                    className="flex items-start gap-2 border-b border-border/40 px-3.5 py-2 last:border-b-0"
                  >
                    {issue.level === 'error' ? (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    )}
                    <span className="text-[13px] font-medium text-foreground">
                      <span className="text-muted-foreground">
                        {t('lineLabel', { line: issue.line })}
                      </span>{' '}
                      {describeIssue(issue.message, t)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {errors.length > 0 && (
              <p className="text-[13px] font-semibold text-red-700">
                {t('blocked')}
              </p>
            )}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={close}
              className="h-10 rounded-xl px-5 font-semibold"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!canUpload || importMutation.isPending}
              className="h-10 gap-2 rounded-xl px-5 font-semibold"
            >
              {importMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {importMutation.isPending
                ? t('uploading')
                : t('upload', { count: rows.length })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Issue messages are encoded as `key:arg:arg` by the parser so it stays free
 * of translation concerns; this turns them back into a sentence.
 */
function describeIssue(
  message: string,
  t: (key: string, values?: Record<string, string | number>) => string,
): string {
  const [key, ...args] = message.split(':');
  switch (key) {
    case 'emptyFile':
      return t('issueEmptyFile');
    case 'noRows':
      return t('issueNoRows');
    case 'missingColumns':
      return t('issueMissingColumns', { columns: args.join(':') });
    case 'fieldCount':
      return t('issueFieldCount', { got: args[0], want: args[1] });
    case 'required':
      return t('issueRequired', { column: args[0] });
    case 'duplicateInFile':
      return t('issueDuplicateInFile', { email: args[0], line: args[1] });
    case 'duplicateExisting':
      return t('issueDuplicateExisting', { email: args[0] });
    case 'unknownGrade':
      return t('issueUnknownGrade', { grade: args[0] });
    default:
      return message;
  }
}
