const DEFAULT_CALENDLY_LINK = 'sahilbhatti/intro';

export function sanitizeCalLink(value: string | undefined): string {
  const raw = (value ?? DEFAULT_CALENDLY_LINK).trim();
  const withoutOrigin = raw
    .replace(/^https?:\/\/(www\.)?calendly\.com\//i, '')
    .replace(/^https?:\/\/(www\.)?(app\.)?cal\.com\//i, '')
    .replace(/^\/+/, '')
    .replace(/[?#].*$/, '');

  return withoutOrigin.length > 0 ? withoutOrigin : DEFAULT_CALENDLY_LINK;
}

export function getCalLink(): string {
  return sanitizeCalLink(process.env.NEXT_PUBLIC_CALENDLY_LINK ?? process.env.NEXT_PUBLIC_CAL_LINK);
}

export function getCalBookingUrl(calLink: string): string {
  return `https://calendly.com/${sanitizeCalLink(calLink)}`;
}
