export function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatMonth(value: string): string {
  return formatDate(value, { month: 'long', year: 'numeric', day: undefined });
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
}
