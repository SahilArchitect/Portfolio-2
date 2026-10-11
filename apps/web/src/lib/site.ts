export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bysahil.dev').replace(
  /\/$/,
  '',
);
export const SITE_NAME = 'Sahil Bhatti';
export const SITE_TITLE = 'Sahil Bhatti — Security of AI Systems';
export const SITE_DESCRIPTION =
  'Research on the security of AI systems: side-channel and fault attacks on neural networks, model extraction, and hardware-aware defenses.';
export const SOURCE_URL = 'https://github.com/SahilArchitect/Portfolio-2';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
