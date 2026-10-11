/** Turn a title into a URL slug: lowercase ASCII, digits and single dashes. */
export function slugify(input: string, maxLength = 80): string {
  const slug = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > maxLength / 2 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, '');
}

/** First slug in `base`, `base-2`, `base-3`, ... that is not already taken. */
export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  const root = base || 'untitled';
  if (!taken.has(root)) return root;
  for (let n = 2; ; n += 1) {
    const candidate = `${root}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}
