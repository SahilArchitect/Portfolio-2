import { z } from 'zod';

/**
 * Shared Zod schemas for every content type. Used by server actions, the
 * admin forms (client-side validation) and JSON import, so the three can
 * never disagree about what valid content looks like.
 *
 * Unknown facts are written as strings starting with `TODO:`. Such values
 * are allowed while an entry is a draft, but `assertPublishable` refuses to
 * publish anything that still contains one, and public queries filter them
 * out as a second line of defence.
 */

export const TODO_MARKER = 'TODO:';

export const CONTENT_TYPES = [
  'profile',
  'project',
  'reproduction',
  'note',
  'log',
  'teaching',
  'education',
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export const contentTypeSchema = z.enum(CONTENT_TYPES);

export const STATUSES = ['draft', 'published', 'archived'] as const;
export type Status = (typeof STATUSES)[number];
export const statusSchema = z.enum(STATUSES);

const todo = z.string().startsWith(TODO_MARKER);
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM');
const monthOrTodo = z.union([month, todo], { error: 'Use YYYY-MM or a TODO: note' });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const httpUrl = z
  .string()
  .trim()
  .refine((value) => /^https?:\/\//i.test(value), 'Must start with http:// or https://')
  .pipe(z.url());
/** URL or site-relative path (uploaded files are served from our own origin in dev). */
const linkUrl = z.union([httpUrl, z.string().regex(/^\/[^/]/, 'Must be a URL or /path')]);
const optionalUrl = z.union([linkUrl, z.literal('')]).optional();
const md = z.string().default('');
const tags = z.array(z.string().trim().min(1).max(40)).max(20).default([]);

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  researchStatement: z.string().trim().max(300).default(''),
  bioMarkdown: md,
  /** The bio only renders publicly once the owner has reviewed it. */
  bioReviewed: z.boolean().default(false),
  interests: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
  skills: z.array(z.string().trim().min(1).max(80)).max(60).default([]),
  email: z.union([z.email(), z.literal('')]).default(''),
  githubUrl: optionalUrl,
  scholarUrl: optionalUrl,
  orcidUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  location: z.string().trim().max(100).optional(),
  showLocation: z.boolean().default(false),
});

const figureType = z.enum(['bitflip-curve']);

export const projectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(1200).default(''),
  startMonth: monthOrTodo,
  endMonth: z.union([monthOrTodo, z.literal('')]).optional(),
  projectStatus: z.enum(['ongoing', 'completed']),
  tags,
  featured: z.boolean().default(false),
  thumbnailUrl: optionalUrl,
  thumbnailAlt: z.string().trim().max(300).default(''),
  sections: z
    .object({
      threatModel: md,
      method: md,
      results: md,
      limitations: md,
      nextSteps: md,
      reproduce: md,
    })
    .default({
      threatModel: '',
      method: '',
      results: '',
      limitations: '',
      nextSteps: '',
      reproduce: '',
    }),
  links: z
    .object({ code: optionalUrl, writeup: optionalUrl, data: optionalUrl })
    .default({ code: '', writeup: '', data: '' }),
  /** Rendered at the end of Results. Same allow-list as the ::figure shortcode. */
  interactiveFigure: z.object({ type: figureType, data: linkUrl }).nullable().optional(),
});

export const reproductionRowSchema = z.object({
  metric: z.string().trim().min(1).max(120),
  reported: z.string().trim().max(60).default(''),
  mine: z.string().trim().max(60).default(''),
  notes: z.string().trim().max(300).default(''),
});

export const reproductionSchema = z.object({
  paperTitle: z.string().trim().min(1).max(300),
  paperAuthors: z.string().trim().max(500).default(''),
  venue: z.string().trim().max(120).default(''),
  year: z.union([z.number().int().min(1950).max(2100), todo]).optional(),
  paperUrl: optionalUrl,
  claim: z.string().trim().max(1200).default(''),
  rows: z.array(reproductionRowSchema).max(50).default([]),
  seeds: z.number().int().min(0).max(10_000).optional(),
  setupDifferences: md,
  lessons: md,
  codeUrl: optionalUrl,
  tags,
});

export const noteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: isoDate,
  tags,
  paperRef: z.string().trim().max(500).optional(),
  summary: z.string().trim().max(300).optional(),
  bodyMarkdown: md,
});

export const logSchema = z.object({
  date: isoDate,
  text: z.string().trim().min(1).max(200),
  url: optionalUrl,
});

export const teachingSchema = z.object({
  course: z.string().trim().min(1).max(200),
  institution: z.string().trim().min(1).max(200),
  role: z.string().trim().max(120).default('Teaching Assistant'),
  startMonth: monthOrTodo,
  endMonth: z.union([monthOrTodo, z.literal('')]).optional(),
  description: z.string().trim().max(1000).optional(),
});

export const educationSchema = z.object({
  degree: z.string().trim().min(1).max(120),
  field: z.string().trim().max(200).default(''),
  institution: z.string().trim().min(1).max(200),
  startMonth: monthOrTodo,
  endMonth: z.union([monthOrTodo, z.literal('')]).optional(),
  thesisTitle: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const dataSchemas = {
  profile: profileSchema,
  project: projectSchema,
  reproduction: reproductionSchema,
  note: noteSchema,
  log: logSchema,
  teaching: teachingSchema,
  education: educationSchema,
} as const satisfies Record<ContentType, z.ZodType>;

export type ProfileData = z.infer<typeof profileSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type ReproductionData = z.infer<typeof reproductionSchema>;
export type ReproductionRow = z.infer<typeof reproductionRowSchema>;
export type NoteData = z.infer<typeof noteSchema>;
export type LogData = z.infer<typeof logSchema>;
export type TeachingData = z.infer<typeof teachingSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type DataFor<T extends ContentType> = z.infer<(typeof dataSchemas)[T]>;

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, digits and single dashes only');

/** Payload accepted by save/autosave actions. */
export const entryInputSchema = z.object({
  type: contentTypeSchema,
  slug: slugSchema,
  data: z.record(z.string(), z.unknown()),
  publishAt: z.iso.datetime({ offset: true }).nullable().optional(),
});

/** Display title derived from the type-specific data. */
export function titleFor(type: ContentType, data: Record<string, unknown>): string {
  const pick = (key: string) => (typeof data[key] === 'string' ? (data[key] as string) : '');
  switch (type) {
    case 'profile':
      return pick('name') || 'Site profile';
    case 'reproduction':
      return pick('paperTitle') || 'Untitled reproduction';
    case 'log':
      return pick('text').slice(0, 80) || 'Log entry';
    case 'teaching':
      return [pick('course'), pick('institution')].filter(Boolean).join(' · ') || 'Teaching';
    case 'education':
      return [pick('degree'), pick('institution')].filter(Boolean).join(' · ') || 'Education';
    default:
      return pick('title') || 'Untitled';
  }
}

/** Deep search for TODO markers in any string value. */
export function findTodos(value: unknown, path = ''): string[] {
  if (typeof value === 'string') return value.includes(TODO_MARKER) ? [path || '(value)'] : [];
  if (Array.isArray(value)) return value.flatMap((item, i) => findTodos(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      findTodos(item, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

export function hasTodo(value: unknown): boolean {
  return findTodos(value).length > 0;
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

export function validateData<T extends ContentType>(
  type: T,
  data: unknown,
): ValidationResult<DataFor<T>> {
  const parsed = dataSchemas[type].safeParse(data);
  if (parsed.success) return { ok: true, data: parsed.data as DataFor<T> };
  return { ok: false, errors: flattenIssues(parsed.error.issues) };
}

export function flattenIssues(issues: readonly z.core.$ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join('.') || '_';
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Extra rules that apply only when an entry goes public. */
export function publishProblems(type: ContentType, data: Record<string, unknown>): string[] {
  const problems = findTodos(data).map((path) => `${path} still contains a TODO: marker`);
  if (type === 'project') {
    const project = data as Partial<ProjectData>;
    if (!project.summary?.trim()) problems.push('summary is required to publish');
    if (project.thumbnailUrl && !project.thumbnailAlt?.trim()) {
      problems.push('thumbnailAlt is required when a thumbnail is set');
    }
  }
  return problems;
}
