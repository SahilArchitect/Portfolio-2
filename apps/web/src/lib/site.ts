export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bysahil.dev').replace(
  /\/$/,
  '',
);
export const SITE_NAME = 'Sahil Bhatti';
export const SITE_TITLE = 'Sahil Bhatti — Machine learning and AI security';
export const SITE_DESCRIPTION =
  'M.Tech in Data Science from IIT Jammu. I work on machine learning and how AI systems fail or leak. Projects, notes and CV.';
export const SOURCE_URL = 'https://github.com/SahilArchitect/Portfolio-2';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
