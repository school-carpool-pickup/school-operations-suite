import type { AdminStudent, AdminStudentUpdateInput } from '@/types';

export function studentInitials(s: AdminStudent): string {
  const fi = (s.first_name?.[0] ?? '').toUpperCase();
  const li = (s.last_name?.[0] ?? '').toUpperCase();
  const combined = `${fi}${li}`.trim();
  if (combined) return combined;
  return (s.school_email?.[0] ?? '?').toUpperCase();
}

export function studentFullName(s: AdminStudent): string {
  const name = `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim();
  return name || s.school_email || s.id;
}

/**
 * Combine `grade` + `section` for display. Backend returns them split, e.g.
 * `{ grade: "Grade 3", section: "3A" }` → "Grade 3 - 3A". Falls back to
 * just `grade` when section is empty.
 */
export function studentGradeSection(s: AdminStudent): string {
  if (s.section) return `${s.grade} - ${s.section}`;
  return s.grade;
}

/**
 * Whether a student row has a meaningful note. Backend stores empty string
 * (or sometimes `-` from legacy mocks) when there's no note.
 */
export function hasNote(s: AdminStudent): boolean {
  const n = s.notes?.trim();
  return !!n && n !== '-';
}

/**
 * Backend's PUT is a full replace, not a patch. Pack the existing
 * student's fields into an update payload and let the caller override
 * specific ones (typically `notes`).
 */
export function toUpdateInput(
  s: AdminStudent,
  override: Partial<AdminStudentUpdateInput> = {},
): AdminStudentUpdateInput {
  const baseStatus =
    s.status === 'enrolled' ||
    s.status === 'graduated' ||
    s.status === 'withdrawn'
      ? s.status
      : 'enrolled';
  return {
    family_id: s.family_id || undefined,
    first_name: s.first_name,
    last_name: s.last_name,
    grade: s.grade,
    section: s.section,
    school_email: s.school_email,
    date_of_birth: s.date_of_birth || undefined,
    blood_type: s.blood_type || undefined,
    photo_url: s.photo_url || undefined,
    preferred_gate: s.preferred_gate || undefined,
    photo_consent: s.photo_consent,
    status: baseStatus,
    notes: s.notes ?? '',
    ...override,
  };
}
