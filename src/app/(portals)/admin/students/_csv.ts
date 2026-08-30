/**
 * CSV parsing + validation for the student bulk import.
 *
 * The backend is unusually unhelpful here, which is why so much of this runs
 * client-side (all verified against dev):
 *
 *  - it reads the RAW request body, despite swagger saying multipart;
 *  - one row with the wrong number of fields fails the WHOLE file with a 500
 *    (`record on line N: wrong number of fields`) and inserts nothing;
 *  - `school_email` is UNIQUE, so a single already-imported student aborts the
 *    entire batch with a raw Postgres constraint error;
 *  - a row whose `school_id` doesn't parse is skipped SILENTLY;
 *  - an unknown grade is accepted and stored with a null grade_id;
 *  - and the response is always `{"data":"success"}` — no counts, no rows.
 *
 * So we check what we can before posting, and let the caller report the rest.
 */

/** Columns the backend reads, in the exact positional order it expects. */
export const CSV_COLUMNS = [
  'school_id',
  'first_name',
  'last_name',
  'grade',
  'section',
  'school_email',
  'date_of_birth',
  'blood_type',
  'photo_url',
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];

/** Columns the user must supply; `school_id` is filled in from their school. */
export const USER_COLUMNS = CSV_COLUMNS.filter(
  (c) => c !== 'school_id',
) as readonly Exclude<CsvColumn, 'school_id'>[];

/** Values that must be present on every row for the record to be usable. */
const REQUIRED_VALUES: CsvColumn[] = [
  'first_name',
  'last_name',
  'school_email',
];

export interface CsvRow {
  /** 1-based line number in the source file, header included — matches the
   *  line numbers the backend reports when it rejects a file. */
  line: number;
  values: Record<CsvColumn, string>;
}

export interface CsvIssue {
  line: number;
  /** `error` blocks the import; `warning` is shown but still uploads. */
  level: 'error' | 'warning';
  message: string;
}

export interface ParsedCsv {
  rows: CsvRow[];
  issues: CsvIssue[];
  /** Header columns as found in the file, lowercased and trimmed. */
  header: string[];
}

/**
 * Minimal RFC-4180 reader: double quotes, `""` escapes, embedded commas and
 * newlines, CRLF or LF. Go's `encoding/csv` on the backend parses the same
 * shape, so what passes here is what it will read.
 */
function splitCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let started = false;

  const endField = () => {
    row.push(field);
    field = '';
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
    started = false;
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"' && field === '') {
      quoted = true;
      started = true;
    } else if (ch === ',') {
      endField();
      started = true;
    } else if (ch === '\n') {
      endRow();
    } else if (ch === '\r') {
      // swallow; the \n that follows ends the row
    } else {
      field += ch;
      started = true;
    }
  }

  // A file not ending in a newline still has a final row to flush.
  if (started || field !== '' || row.length > 0) endRow();

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

/**
 * Parse an uploaded file into rows keyed by column name.
 *
 * Columns are matched by HEADER NAME rather than position, so a file whose
 * columns are ordered differently — or that omits `school_id` entirely, which
 * is the shape our template hands out — still imports correctly. The
 * positional order the backend wants is restored in `toBackendCsv`.
 */
export function parseStudentCsv(text: string): ParsedCsv {
  const table = splitCsv(text.replace(/^﻿/, ''));
  if (table.length === 0) {
    return {
      rows: [],
      issues: [{ line: 1, level: 'error', message: 'emptyFile' }],
      header: [],
    };
  }

  const header = table[0].map((h) => h.trim().toLowerCase());
  const missing = USER_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    return {
      rows: [],
      issues: [
        {
          line: 1,
          level: 'error',
          message: `missingColumns:${missing.join(', ')}`,
        },
      ],
      header,
    };
  }

  const rows: CsvRow[] = [];
  const issues: CsvIssue[] = [];

  for (let i = 1; i < table.length; i++) {
    const record = table[i];
    const line = i + 1;

    if (record.length !== header.length) {
      issues.push({
        line,
        level: 'error',
        message: `fieldCount:${record.length}:${header.length}`,
      });
      continue;
    }

    const values = Object.fromEntries(
      CSV_COLUMNS.map((col) => {
        const idx = header.indexOf(col);
        return [col, idx === -1 ? '' : (record[idx] ?? '').trim()];
      }),
    ) as Record<CsvColumn, string>;

    rows.push({ line, values });
  }

  if (rows.length === 0 && issues.length === 0) {
    issues.push({ line: 1, level: 'error', message: 'noRows' });
  }

  return { rows, issues, header };
}

export interface ValidateContext {
  /** Grade names that exist for this school (`GET /admin/grades`). */
  knownGrades: readonly string[];
  /** School emails already in the directory — a repeat aborts the batch. */
  existingEmails: ReadonlySet<string>;
  /** False when the directory was too large to load in full, so the
   *  duplicate check above is only partial. */
  emailCheckComplete: boolean;
}

/** Row-level checks that go beyond shape. Order is by line for display. */
export function validateRows(
  rows: readonly CsvRow[],
  ctx: ValidateContext,
): CsvIssue[] {
  const issues: CsvIssue[] = [];
  const seenEmails = new Map<string, number>();

  for (const row of rows) {
    for (const col of REQUIRED_VALUES) {
      if (!row.values[col]) {
        issues.push({
          line: row.line,
          level: 'error',
          message: `required:${col}`,
        });
      }
    }

    const email = row.values.school_email.toLowerCase();
    if (email) {
      const firstSeen = seenEmails.get(email);
      if (firstSeen !== undefined) {
        issues.push({
          line: row.line,
          level: 'error',
          message: `duplicateInFile:${email}:${firstSeen}`,
        });
      } else {
        seenEmails.set(email, row.line);
        if (ctx.existingEmails.has(email)) {
          issues.push({
            line: row.line,
            level: 'error',
            message: `duplicateExisting:${email}`,
          });
        }
      }
    }

    const grade = row.values.grade;
    if (
      grade &&
      ctx.knownGrades.length > 0 &&
      !ctx.knownGrades.includes(grade)
    ) {
      // Not fatal: the backend stores the row with a null grade_id rather than
      // rejecting it, which is worse — so warn loudly instead of blocking.
      issues.push({
        line: row.line,
        level: 'warning',
        message: `unknownGrade:${grade}`,
      });
    }
  }

  return issues.sort((a, b) => a.line - b.line);
}

const escapeField = (v: string): string =>
  /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

/**
 * Serialise rows back into the exact 9-column positional layout the backend
 * reads, injecting the caller's `school_id` on any row that didn't carry one.
 * (Every row needs it: the backend skips rows whose school_id won't parse, and
 * it does so without saying a word.)
 */
export function toBackendCsv(
  rows: readonly CsvRow[],
  schoolId: string,
): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const row of rows) {
    const values = CSV_COLUMNS.map((col) =>
      col === 'school_id' ? row.values.school_id || schoolId : row.values[col],
    );
    lines.push(values.map(escapeField).join(','));
  }
  return `${lines.join('\n')}\n`;
}

/** Blank template with one example row, matching what `parseStudentCsv` wants. */
export function buildTemplateCsv(): string {
  return [
    USER_COLUMNS.join(','),
    'Somchai,Sukjai,P1,A,somchai.s@school.ac.th,2015-04-21,O,',
  ].join('\n');
}
