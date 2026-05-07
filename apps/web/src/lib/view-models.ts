export type ProjectView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  role: string;
  stack: string[];
  status: string;
  displayOrder: number;
  coverImageUrl: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  demoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
};

export type PostView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  publishedAt: string;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  readingMinutes: number;
};

export type PostDetailView = PostView & {
  related: PostView[];
};

export type NowEntryView = {
  id: string;
  headline: string;
  body: string;
  mood: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ResumeVariantView = {
  id: string;
  slug: string;
  label: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
  roleKeywords: string[];
};

export type CitationView = {
  docId: string;
  title: string;
  url: string | null;
  excerpt: string;
};

export type SearchResponseView = {
  answer: string;
  citations: CitationView[];
};

export type PublicTraceView = {
  id: string;
  name: string;
  service: string;
  durationMs: number;
  status: 'ok' | 'error';
  startedAt: string;
  spans: number;
};

export type PublicMetricsView = {
  ragQueries24h: number;
  medianLatencyMs: number;
  p99LatencyMs: number;
  throughputPerMin: number;
  sparkline: number[];
  updatedAt: string;
  traces: PublicTraceView[];
};

export type InquiryInput = {
  name: string;
  email: string;
  company?: string;
  message: string;
  intent: string;
};
