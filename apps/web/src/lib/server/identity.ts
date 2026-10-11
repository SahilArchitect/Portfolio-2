/**
 * ADMIN_ALLOWED_IDENTITY names the single owner, as `github:<numeric user id>`
 * or a bare numeric id. Numeric ids survive username changes.
 */
export function allowedGithubId(raw = process.env.ADMIN_ALLOWED_IDENTITY): string | null {
  const value = raw?.trim().replace(/^github:/i, '');
  return value && /^\d+$/.test(value) ? value : null;
}
