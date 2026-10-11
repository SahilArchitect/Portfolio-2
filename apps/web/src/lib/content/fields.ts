import type { ContentType } from './schemas';

/**
 * Form layout for each content type. The generic admin editor renders these;
 * validation itself always comes from the Zod schemas in schemas.ts.
 * `path` uses dots for nested objects (e.g. "sections.method").
 */
export type FieldKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'month'
  | 'date'
  | 'number'
  | 'bool'
  | 'select'
  | 'tags'
  | 'list'
  | 'markdown'
  | 'rows'
  | 'image'
  | 'figure';

export type FieldSpec = {
  path: string;
  label: string;
  kind: FieldKind;
  help?: string;
  options?: { value: string; label: string }[];
  /** Heading offset used when previewing Markdown, matching the public page. */
  headingOffset?: number;
  maxLength?: number;
  /** Optional numeric fields: empty input stores undefined instead of 0. */
  optional?: boolean;
  /** Image fields: sibling field that takes the chosen asset's alt text. */
  altPath?: string;
};

export const TYPE_LABELS: Record<
  ContentType,
  { singular: string; plural: string; publicPath?: string }
> = {
  profile: { singular: 'Site profile', plural: 'Site profile', publicPath: '/' },
  project: { singular: 'Project', plural: 'Projects', publicPath: '/research' },
  reproduction: { singular: 'Reproduction', plural: 'Reproductions', publicPath: '/reproductions' },
  note: { singular: 'Note', plural: 'Notes', publicPath: '/notes' },
  log: { singular: 'Log entry', plural: 'Log', publicPath: '/log' },
  teaching: { singular: 'Teaching', plural: 'Teaching', publicPath: '/cv' },
  education: { singular: 'Education', plural: 'Education', publicPath: '/cv' },
};

/** Public URL of an entry, for "view" links. */
export function publicPathFor(type: ContentType, slug: string): string {
  switch (type) {
    case 'project':
      return `/research/${slug}`;
    case 'reproduction':
      return `/reproductions/${slug}`;
    case 'note':
      return `/notes/${slug}`;
    default:
      return TYPE_LABELS[type].publicPath ?? '/';
  }
}

export const HAS_SLUG_URL: Record<ContentType, boolean> = {
  profile: false,
  project: true,
  reproduction: true,
  note: true,
  log: false,
  teaching: false,
  education: false,
};

const month = 'YYYY-MM, or a TODO: note while drafting';

export const FIELDS: Record<ContentType, FieldSpec[]> = {
  profile: [
    { path: 'name', label: 'Name', kind: 'text' },
    {
      path: 'researchStatement',
      label: 'Research statement (one line)',
      kind: 'textarea',
      maxLength: 300,
    },
    { path: 'bioMarkdown', label: 'Bio', kind: 'markdown', headingOffset: 1 },
    {
      path: 'bioReviewed',
      label: 'Bio reviewed — show it publicly',
      kind: 'bool',
      help: 'The bio stays hidden until this is ticked.',
    },
    {
      path: 'interests',
      label: 'Research interests',
      kind: 'list',
      help: 'Items containing TODO: are hidden publicly.',
    },
    { path: 'skills', label: 'Skills (CV)', kind: 'list' },
    { path: 'email', label: 'Email', kind: 'email' },
    { path: 'githubUrl', label: 'GitHub URL', kind: 'url' },
    { path: 'scholarUrl', label: 'Google Scholar URL', kind: 'url', help: 'Hidden until set.' },
    { path: 'orcidUrl', label: 'ORCID URL', kind: 'url', help: 'Hidden until set.' },
    { path: 'linkedinUrl', label: 'LinkedIn URL', kind: 'url' },
    { path: 'location', label: 'Location', kind: 'text' },
    { path: 'showLocation', label: 'Show location publicly', kind: 'bool' },
  ],
  project: [
    { path: 'title', label: 'Title', kind: 'text' },
    { path: 'summary', label: 'Summary (3–4 sentences)', kind: 'textarea', maxLength: 1200 },
    { path: 'startMonth', label: 'Start month', kind: 'month', help: month },
    { path: 'endMonth', label: 'End month', kind: 'month', help: 'Empty while ongoing' },
    {
      path: 'projectStatus',
      label: 'Project status',
      kind: 'select',
      options: [
        { value: 'ongoing', label: 'ongoing' },
        { value: 'completed', label: 'completed' },
      ],
    },
    { path: 'tags', label: 'Tags', kind: 'tags' },
    { path: 'featured', label: 'Featured on home page', kind: 'bool' },
    { path: 'thumbnailUrl', label: 'Thumbnail', kind: 'image', altPath: 'thumbnailAlt' },
    {
      path: 'thumbnailAlt',
      label: 'Thumbnail alt text',
      kind: 'text',
      help: 'Required when a thumbnail is set.',
    },
    {
      path: 'sections.threatModel',
      label: 'Threat model',
      kind: 'markdown',
      headingOffset: 2,
      help: 'Attacker goal, capabilities, assumptions.',
    },
    { path: 'sections.method', label: 'Method', kind: 'markdown', headingOffset: 2 },
    {
      path: 'sections.results',
      label: 'Results',
      kind: 'markdown',
      headingOffset: 2,
      help: 'Figures, tables, ::figure{type="bitflip-curve" data="…"}',
    },
    { path: 'sections.limitations', label: 'Limitations', kind: 'markdown', headingOffset: 2 },
    { path: 'sections.nextSteps', label: 'Next steps', kind: 'markdown', headingOffset: 2 },
    {
      path: 'sections.reproduce',
      label: 'Reproduce',
      kind: 'markdown',
      headingOffset: 2,
      help: 'Commands, environment, seeds.',
    },
    { path: 'links.code', label: 'Code URL', kind: 'url' },
    { path: 'links.writeup', label: 'Write-up (PDF) URL', kind: 'url' },
    { path: 'links.data', label: 'Data URL', kind: 'url' },
    { path: 'interactiveFigure', label: 'Interactive figure (end of Results)', kind: 'figure' },
  ],
  reproduction: [
    { path: 'paperTitle', label: 'Paper title', kind: 'text' },
    { path: 'paperAuthors', label: 'Paper authors', kind: 'text' },
    { path: 'venue', label: 'Venue', kind: 'text' },
    { path: 'year', label: 'Year', kind: 'number', optional: true },
    { path: 'paperUrl', label: 'Paper URL / DOI link', kind: 'url' },
    { path: 'claim', label: 'Claim being reproduced', kind: 'textarea', maxLength: 1200 },
    { path: 'rows', label: 'Reported vs. mine', kind: 'rows', help: 'Write mean ± std in "mine".' },
    { path: 'seeds', label: 'Number of seeds', kind: 'number', optional: true },
    { path: 'setupDifferences', label: 'Differences in setup', kind: 'markdown', headingOffset: 2 },
    { path: 'lessons', label: 'What I learned', kind: 'markdown', headingOffset: 2 },
    { path: 'codeUrl', label: 'Code URL', kind: 'url' },
    { path: 'tags', label: 'Tags', kind: 'tags' },
  ],
  note: [
    { path: 'title', label: 'Title', kind: 'text' },
    { path: 'date', label: 'Date', kind: 'date' },
    { path: 'tags', label: 'Tags', kind: 'tags' },
    { path: 'paperRef', label: 'Paper reference (optional)', kind: 'text' },
    {
      path: 'summary',
      label: 'Summary (for feeds and previews)',
      kind: 'textarea',
      maxLength: 300,
    },
    { path: 'bodyMarkdown', label: 'Body', kind: 'markdown', headingOffset: 1 },
  ],
  log: [
    { path: 'date', label: 'Date', kind: 'date' },
    { path: 'text', label: 'Text (≤ 200 characters)', kind: 'textarea', maxLength: 200 },
    { path: 'url', label: 'Link (optional)', kind: 'url' },
  ],
  teaching: [
    { path: 'course', label: 'Course', kind: 'text' },
    { path: 'institution', label: 'Institution', kind: 'text' },
    { path: 'role', label: 'Role', kind: 'text' },
    { path: 'startMonth', label: 'Start month', kind: 'month', help: month },
    { path: 'endMonth', label: 'End month', kind: 'month', help: month },
    { path: 'description', label: 'Description', kind: 'textarea' },
  ],
  education: [
    { path: 'degree', label: 'Degree', kind: 'text' },
    { path: 'field', label: 'Field', kind: 'text' },
    { path: 'institution', label: 'Institution', kind: 'text' },
    { path: 'startMonth', label: 'Start month', kind: 'month', help: month },
    { path: 'endMonth', label: 'End month', kind: 'month', help: month },
    { path: 'thesisTitle', label: 'Thesis title', kind: 'text' },
    { path: 'notes', label: 'Notes', kind: 'textarea' },
  ],
};

export function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined,
      obj,
    );
}

export function setPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const [head, ...rest] = path.split('.');
  if (!head) return obj;
  if (rest.length === 0) return { ...obj, [head]: value };
  const child = obj[head];
  return {
    ...obj,
    [head]: setPath(
      child && typeof child === 'object' ? (child as Record<string, unknown>) : {},
      rest.join('.'),
      value,
    ),
  };
}
