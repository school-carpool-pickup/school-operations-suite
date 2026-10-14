import { describe, expect, it } from 'vitest';
import {
  buildTemplateCsv,
  parseStudentCsv,
  toBackendCsv,
} from '@/app/(portals)/admin/students/_csv';

const SCHOOL = '11111111-1111-1111-1111-111111111111';

describe('student CSV', () => {
  it('accepts the template it hands out', () => {
    const parsed = parseStudentCsv(buildTemplateCsv());
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0].values.notes).toBe('Allergic to peanuts');
  });

  it('no longer asks for section, date of birth or blood type', () => {
    const header = buildTemplateCsv().split('\n')[0];
    expect(header).not.toContain('section');
    expect(header).not.toContain('date_of_birth');
    expect(header).not.toContain('blood_type');
  });

  it('does not offer columns the backend would silently drop', () => {
    const header = buildTemplateCsv().split('\n')[0];
    expect(header).not.toContain('nickname');
    expect(header).not.toContain('emergency_contact');
  });

  it('imports a file without the optional columns', () => {
    const parsed = parseStudentCsv(
      'first_name,last_name,grade,school_email\nNina,W,2A,nina@school.ac.th',
    );
    expect(parsed.issues).toEqual([]);
  });

  it('rejects a file missing a required column', () => {
    const parsed = parseStudentCsv('first_name,last_name\nNina,W');
    expect(parsed.issues[0].message).toContain('grade');
    expect(parsed.issues[0].message).toContain('school_email');
  });

  it('carries notes through and fills school_id and blank optionals', () => {
    const parsed = parseStudentCsv(
      'first_name,last_name,grade,school_email,notes\nNina,W,2A,nina@school.ac.th,"Pick up at side gate, not front"',
    );
    const [header, row] = toBackendCsv(parsed.rows, SCHOOL).trim().split('\n');
    expect(header).toBe(
      'school_id,first_name,last_name,grade,school_email,photo_url,notes',
    );
    // The backend insists on photo_url being present, even blank; the note's
    // comma has to survive quoting.
    expect(row).toBe(
      `${SCHOOL},Nina,W,2A,nina@school.ac.th,,"Pick up at side gate, not front"`,
    );
  });
});
