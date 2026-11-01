'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiKeys, useApiMutation } from '@/lib/api';
import type { AdminGrade, ApiEnvelope } from '@/types';
import { toBackendCsv } from './_csv';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AddStudentDialogProps {
  /** The admin's own school — the backend files the student under it. */
  schoolId: string;
  /** The school's classes; a student must be filed under one. */
  grades: readonly AdminGrade[];
  /** Refetch the visible table once the student lands. */
  onAdded: () => void;
}

/**
 * Add one student. The backend has no single-student endpoint, so this sends
 * a one-row file through the same CSV import the Import dialog uses.
 */
export function AddStudentDialog({
  schoolId,
  grades,
  onAdded,
}: AddStudentDialogProps) {
  const t = useTranslations('Admin.Students.addStudent');
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const photoValid = !photoUrl.trim() || /^https?:\/\//i.test(photoUrl.trim());
  const canSubmit =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    grade !== '' &&
    emailValid &&
    photoValid;

  const addMutation = useApiMutation<ApiEnvelope<unknown>, string>((csv) =>
    apiKeys.adminStudents.bulkCreate(csv),
  );

  const close = () => {
    setOpen(false);
    setFirstName('');
    setLastName('');
    setGrade('');
    setEmail('');
    setPhotoUrl('');
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const csv = toBackendCsv(
      [
        {
          line: 2,
          values: {
            school_id: schoolId,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            grade,
            school_email: email.trim(),
            photo_url: photoUrl.trim(),
            notes: notes.trim(),
          },
        },
      ],
      schoolId,
    );
    try {
      await addMutation.mutateAsync(csv);
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? '';
      toast.error(t('failedTitle'), {
        description: message.includes('students_school_email_key')
          ? t('failedDuplicate')
          : t('failedGeneric'),
      });
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ['admin', 'students', 'list'],
    });
    onAdded();
    toast.success(
      t('successTitle', { name: `${firstName.trim()} ${lastName.trim()}` }),
    );
    close();
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="h-10 gap-2 rounded-xl font-semibold"
      >
        <UserPlus className="h-[17px] w-[17px]" />
        {t('button')}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
      >
        <DialogContent className="max-w-[560px]">
          <DialogTitle className="text-[18px] font-bold">
            {t('title')}
          </DialogTitle>
          <p className="-mt-1 text-[13.5px] font-medium text-muted-foreground">
            {t('subtitle')}
          </p>

          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="student-first"
                  className="text-xs font-semibold"
                >
                  {t('firstName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="student-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-last" className="text-xs font-semibold">
                  {t('lastName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="student-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                {t('class')} <span className="text-red-500">*</span>
              </Label>
              {grades.length > 0 ? (
                <Select
                  items={grades.map((g) => ({ label: g.name, value: g.name }))}
                  value={grade || null}
                  onValueChange={(v) => setGrade(v ?? '')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('classPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.id} value={g.name}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[12.5px] font-medium text-amber-800">
                  {t('noClasses')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-email" className="text-xs font-semibold">
                {t('email')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
              />
              <p className="text-[12px] text-muted-foreground">
                {email.trim() && !emailValid
                  ? t('emailInvalid')
                  : t('emailHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-photo" className="text-xs font-semibold">
                {t('photoUrl')}
              </Label>
              <Input
                id="student-photo"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://"
              />
              <p className="text-[12px] text-muted-foreground">
                {photoValid ? t('photoUrlHint') : t('photoUrlInvalid')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-notes" className="text-xs font-semibold">
                {t('notes')}
              </Label>
              <Textarea
                id="student-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={close}
                className="h-10 rounded-xl px-5 font-semibold"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || addMutation.isPending}
                className="h-10 gap-2 rounded-xl px-5 font-semibold"
              >
                {addMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t('submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
