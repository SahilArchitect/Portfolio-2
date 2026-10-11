export type BibtexInput = {
  key: string;
  title: string;
  author: string;
  year: number | string;
  url: string;
  kind?: 'misc' | 'online';
  note?: string;
};

/** Escape characters that are special in BibTeX field values. */
export function escapeBibtex(value: string): string {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([{}&%$#_])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Citation key such as `bhatti2026bitflip`: surname + year + first meaningful title word. */
export function citationKey(author: string, year: number | string, title: string): string {
  const surname = (author.trim().split(/\s+/).pop() ?? 'anon').toLowerCase().replace(/[^a-z]/g, '');
  const stop = new Set(['a', 'an', 'the', 'on', 'of', 'in', 'for', 'and', 'to', 'with']);
  const word =
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .find((w) => w.length > 2 && !stop.has(w)) ?? 'work';
  return `${surname || 'anon'}${year}${word}`;
}

export function toBibtex(input: BibtexInput): string {
  const fields: [string, string][] = [
    ['author', escapeBibtex(input.author)],
    // Double braces keep the title's capitalisation in most styles.
    ['title', `{${escapeBibtex(input.title)}}`],
    ['year', String(input.year)],
    ['howpublished', `\\url{${input.url}}`],
    ['url', input.url],
  ];
  if (input.note) fields.push(['note', escapeBibtex(input.note)]);
  const body = fields.map(([k, v]) => `  ${k} = {${v}}`).join(',\n');
  return `@${input.kind ?? 'misc'}{${input.key},\n${body}\n}`;
}
