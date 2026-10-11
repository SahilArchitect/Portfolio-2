const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10" -> "Oct 2026". Anything else is returned unchanged. */
export function formatMonth(value: string | undefined | null): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${MONTHS[Number(match[2]) - 1] ?? match[2]} ${match[1]}`;
}

export function formatMonthRange(start?: string | null, end?: string | null): string {
  const from = formatMonth(start);
  const to = end ? formatMonth(end) : 'present';
  return from ? `${from} – ${to}` : '';
}

/** ISO date or Date -> "2026-10-11". */
export function isoDay(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
