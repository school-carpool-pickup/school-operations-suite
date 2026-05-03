import type { AdminFamilyMember } from '@/types';

/**
 * Page-local helpers for the Families CRM. The backend's `User.role` field
 * isn't a strict enum (just `string`), so we classify with case-insensitive
 * substring checks. Tweak when backend nails down the role vocabulary.
 */

export type MemberKind = 'primary' | 'additional' | 'supplementary';

export function classifyMember(member: AdminFamilyMember): MemberKind {
  const role = (member.role ?? '').toLowerCase();
  if (role.includes('primary')) return 'primary';
  if (role.includes('guardian') || role.includes('supplement')) {
    return 'supplementary';
  }
  return 'additional';
}

/**
 * Pick the family's primary contact. Falls back to the first member when no
 * member is explicitly tagged as primary.
 */
export function findPrimaryMember(
  members: readonly AdminFamilyMember[],
): AdminFamilyMember | undefined {
  return members.find((m) => classifyMember(m) === 'primary') ?? members[0];
}

export function memberInitials(member: AdminFamilyMember): string {
  const fi = (member.first_name?.[0] ?? '').toUpperCase();
  const li = (member.last_name?.[0] ?? '').toUpperCase();
  const combined = `${fi}${li}`.trim();
  if (combined) return combined;
  return (member.email?.[0] ?? '?').toUpperCase();
}

export function memberFullName(member: AdminFamilyMember): string {
  const name = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim();
  return name || member.email || member.id;
}

export function familyInitial(familyName: string): string {
  return (familyName.trim()[0] ?? '?').toUpperCase();
}
