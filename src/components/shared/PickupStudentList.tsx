'use client';

import { PickupPhoto } from '@/components/shared/PickupPhoto';
import type { AdminPickupStudent } from '@/types';

interface PickupStudentListProps {
  students: readonly AdminPickupStudent[];
  onPhotoExpired?: () => void;
}

const initials = (s: AdminPickupStudent): string =>
  `${s.first_name?.[0] ?? ''}${s.last_name?.[0] ?? ''}`.toUpperCase() || '?';

/**
 * The children in a pickup, each with their photo and — directly under the
 * name — whatever note the school recorded in Student CRM. Staff read these at
 * the gate, so the note sits where their eye already is.
 */
export function PickupStudentList({
  students,
  onPhotoExpired,
}: PickupStudentListProps) {
  return (
    <div className="flex flex-col gap-2">
      {students.map((student) => {
        const name = `${student.first_name} ${student.last_name}`.trim();
        const note = student.notes?.trim();
        return (
          <div key={student.id} className="flex items-start gap-2.5">
            <PickupPhoto
              src={student.photo_url}
              alt={name}
              fallback={initials(student)}
              onExpired={onPhotoExpired}
              className="mt-0.5 h-8 w-8"
            />
            <div className="flex min-w-0 flex-col">
              <span className="text-[13px] font-medium text-foreground/90">
                {name}
              </span>
              {note ? (
                <span className="mt-0.5 max-w-[240px] whitespace-pre-line text-[11.5px] leading-snug text-amber-700">
                  {note}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
