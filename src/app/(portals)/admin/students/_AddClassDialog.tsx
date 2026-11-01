'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Layers, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiKeys, useApiMutation } from '@/lib/api';
import type { AdminGrade, AdminGradeCreateInput, ApiEnvelope } from '@/types';

interface AddClassDialogProps {
  /** The school's classes, to catch a repeat name before the backend does —
   *  names are unique per school. */
  grades: readonly AdminGrade[];
}

/**
 * Create a class (a backend "grade"). Students are filed under it, and the
 * lane it's assigned to in Settings decides which gate its pickups go to.
 */
export function AddClassDialog({ grades }: AddClassDialogProps) {
  const t = useTranslations('Admin.Students.addClass');
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const trimmed = name.trim();
  const exists = grades.some(
    (g) => g.name.toLowerCase() === trimmed.toLowerCase(),
  );

  const createMutation = useApiMutation<
    ApiEnvelope<AdminGrade>,
    AdminGradeCreateInput
  >((input) => apiKeys.adminGrades.create(input));

  const close = () => {
    setOpen(false);
    setName('');
  };

  const handleSubmit = async () => {
    if (!trimmed || exists) return;
    try {
      await createMutation.mutateAsync({ name: trimmed });
    } catch {
      toast.error(t('failedTitle'), { description: t('failedBody') });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['admin', 'grades'] });
    toast.success(t('successTitle', { name: trimmed }), {
      description: t('successBody'),
    });
    close();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 gap-2 rounded-xl font-semibold"
      >
        <Layers className="h-[17px] w-[17px]" />
        {t('button')}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
      >
        <DialogContent className="max-w-[460px]">
          <DialogTitle className="text-[18px] font-bold">
            {t('title')}
          </DialogTitle>
          <p className="-mt-1 text-[13.5px] font-medium text-muted-foreground">
            {t('subtitle')}
          </p>

          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <Label htmlFor="class-name" className="text-xs font-semibold">
              {t('nameLabel')}
            </Label>
            <Input
              id="class-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              autoFocus
            />
            {exists && (
              <p className="text-[12.5px] font-medium text-red-700">
                {t('exists', { name: trimmed })}
              </p>
            )}
            {grades.length > 0 && (
              <p className="text-[12.5px] font-medium text-muted-foreground">
                {t('existing', {
                  names: grades.map((g) => g.name).join(', '),
                })}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
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
                disabled={!trimmed || exists || createMutation.isPending}
                className="h-10 gap-2 rounded-xl px-5 font-semibold"
              >
                {createMutation.isPending && (
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
