const DEFAULT_CAL_LINK = 'sahilbhatti/intro';

export function sanitizeCalLink(value: string | undefined): string {
  const raw = (value ?? DEFAULT_CAL_LINK).trim();
  const withoutOrigin = raw
    .replace(/^https?:\/\/(www\.)?(app\.)?cal\.com\//i, '')
    .replace(/^\/+/, '')
    .replace(/[?#].*$/, '');

  return withoutOrigin.length > 0 ? withoutOrigin : DEFAULT_CAL_LINK;
}

export function getCalLink(): string {
  return sanitizeCalLink(process.env.NEXT_PUBLIC_CAL_LINK);
}

export function getCalBookingUrl(calLink: string): string {
  return `https://cal.com/${sanitizeCalLink(calLink)}`;
}
