import {
  fallbackMetrics,
  fallbackNowEntries,
  fallbackPostDetails,
  fallbackPosts,
  fallbackProjects,
  fallbackResumes,
} from './fallbacks';
import type {
  CitationView,
  InquiryInput,
  NowEntryView,
  PostDetailView,
  PostView,
  ProjectView,
  PublicMetricsView,
  PublicTraceView,
  ResumeVariantView,
  SearchResponseView,
} from './view-models';

type FetchOptions = {
  revalidate?: number;
  tags?: string[];
};

type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

type UnknownRecord = Record<string, unknown>;

const DEFAULT_SERVER_API_BASE = 'http://localhost:8000';

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function getServerApiBase(): string {
  return trimTrailingSlash(
    process.env.API_INTERNAL_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      DEFAULT_SERVER_API_BASE,
  );
}

export function getBrowserApiPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  return base ? `${trimTrailingSlash(base)}${path}` : path;
}

function toUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${getServerApiBase()}${path}`;
}

async function apiFetchUnknown(path: string, options: FetchOptions = {}): Promise<unknown> {
  const init: NextFetchOptions = {
    headers: { Accept: 'application/json' },
    next: { revalidate: options.revalidate ?? 60, tags: options.tags },
  };

  const response = await fetch(toUrl(path), init);
  if (!response.ok) {
    throw new Error(`API error ${response.status} fetching ${path}`);
  }

  return response.json() as Promise<unknown>;
}

async function apiPostUnknown(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(toUrl(path), {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status} posting ${path}`);
  }

  return response.json() as Promise<unknown>;
}

function record(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function numberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
    : [];
}

function arrayItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const obj = record(value);
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.results)) return obj.results;
  if (Array.isArray(obj.data)) return obj.data;
  return [];
}

function estimateReadingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function normalizeProject(input: unknown, index = 0): ProjectView {
  const obj = record(input);
  const slug = stringValue(obj.slug, `project-${index + 1}`);
  const summary = stringValue(obj.summary, 'Project details are being prepared.');
  const displayOrder = numberValue(obj.display_order ?? obj.displayOrder, index + 1);

  return {
    id: stringValue(obj.id, slug),
    slug,
    title: stringValue(obj.title, slug.replaceAll('-', ' ')),
    summary,
    body: stringValue(obj.body, summary),
    role: stringValue(obj.role, 'Engineering'),
    stack: stringArray(obj.stack),
    status: stringValue(obj.status, 'published'),
    displayOrder,
    coverImageUrl: nullableString(obj.cover_image_url ?? obj.coverImageUrl),
    repoUrl: nullableString(obj.repo_url ?? obj.repoUrl),
    liveUrl: nullableString(obj.live_url ?? obj.liveUrl),
    demoUrl: nullableString(obj.demo_url ?? obj.demoUrl),
    createdAt: stringValue(obj.created_at ?? obj.createdAt, new Date(0).toISOString()),
    updatedAt: stringValue(obj.updated_at ?? obj.updatedAt, new Date(0).toISOString()),
    featured: booleanValue(obj.featured, displayOrder <= 2),
  };
}

function normalizePost(input: unknown, index = 0): PostView {
  const obj = record(input);
  const slug = stringValue(obj.slug, `post-${index + 1}`);
  const body = stringValue(obj.body ?? obj.markdown, '');
  const publishedAt = stringValue(
    obj.published_at ?? obj.publishedAt ?? obj.created_at ?? obj.createdAt,
    new Date(0).toISOString(),
  );

  return {
    id: stringValue(obj.id, slug),
    slug,
    title: stringValue(obj.title, slug.replaceAll('-', ' ')),
    summary: stringValue(obj.summary ?? obj.subtitle, body.slice(0, 160)),
    body,
    tags: stringArray(obj.tags),
    publishedAt,
    canonicalUrl: nullableString(obj.canonical_url ?? obj.canonicalUrl ?? obj.url),
    createdAt: stringValue(obj.created_at ?? obj.createdAt, publishedAt),
    updatedAt: stringValue(obj.updated_at ?? obj.updatedAt, publishedAt),
    readingMinutes: numberValue(obj.reading_minutes ?? obj.readingMinutes, estimateReadingMinutes(body)),
  };
}

function normalizePostDetail(input: unknown, fallback: PostDetailView): PostDetailView {
  const obj = record(input);
  return {
    ...normalizePost(obj),
    related: arrayItems(obj.related).map((item, index) => normalizePost(item, index)).slice(0, 3),
  } satisfies PostDetailView;
}

function normalizeNow(input: unknown): NowEntryView {
  const obj = record(input);
  const fallback = fallbackNowEntries[0];
  if (!fallback) throw new Error('Missing fallback now entry');

  return {
    id: stringValue(obj.id, fallback.id),
    headline: stringValue(obj.headline ?? obj.title, fallback.headline),
    body: stringValue(obj.body, fallback.body),
    mood: nullableString(obj.mood),
    isCurrent: booleanValue(obj.is_current ?? obj.isCurrent, true),
    createdAt: stringValue(obj.created_at ?? obj.createdAt, fallback.createdAt),
    updatedAt: stringValue(obj.updated_at ?? obj.updatedAt, fallback.updatedAt),
  };
}

function normalizeResume(input: unknown, fallback: ResumeVariantView): ResumeVariantView {
  const obj = record(input);
  const slug = stringValue(obj.slug, fallback.slug);

  return {
    id: stringValue(obj.id, fallback.id),
    slug,
    label: stringValue(obj.label ?? obj.title, fallback.label),
    fileUrl: stringValue(obj.file_url ?? obj.fileUrl ?? obj.url, fallback.fileUrl),
    isDefault: booleanValue(obj.is_default ?? obj.isDefault, fallback.isDefault),
    createdAt: stringValue(obj.created_at ?? obj.createdAt, fallback.createdAt),
    roleKeywords: stringArray(obj.role_keywords ?? obj.roleKeywords).length
      ? stringArray(obj.role_keywords ?? obj.roleKeywords)
      : fallback.roleKeywords,
  };
}

function normalizeCitation(input: unknown): CitationView {
  const obj = record(input);
  const docId = stringValue(obj.doc_id ?? obj.docId ?? obj.id, 'source');

  return {
    docId,
    title: stringValue(obj.title, docId),
    url: nullableString(obj.url),
    excerpt: stringValue(obj.excerpt ?? obj.snippet, ''),
  };
}

function normalizeTrace(input: unknown, index = 0): PublicTraceView {
  const obj = record(input);
  const status = stringValue(obj.status, 'ok') === 'error' ? 'error' : 'ok';

  return {
    id: stringValue(obj.id ?? obj.trace_id ?? obj.traceId, `trace-${index + 1}`),
    name: stringValue(obj.name ?? obj.route, 'redacted operation'),
    service: stringValue(obj.service, 'api'),
    durationMs: numberValue(obj.duration_ms ?? obj.durationMs, 0),
    status,
    startedAt: stringValue(obj.started_at ?? obj.startedAt, new Date(0).toISOString()),
    spans: numberValue(obj.spans ?? obj.span_count ?? obj.spanCount, 1),
  };
}

function normalizeMetrics(input: unknown): PublicMetricsView {
  const obj = record(input);
  const fallback = fallbackMetrics;

  return {
    ragQueries24h: numberValue(obj.rag_queries_24h ?? obj.ragQueries24h, fallback.ragQueries24h),
    medianLatencyMs: numberValue(
      obj.median_latency_ms ?? obj.medianLatencyMs,
      fallback.medianLatencyMs,
    ),
    p99LatencyMs: numberValue(obj.p99_latency_ms ?? obj.p99LatencyMs, fallback.p99LatencyMs),
    throughputPerMin: numberValue(
      obj.throughput_per_min ?? obj.throughputPerMin,
      fallback.throughputPerMin,
    ),
    sparkline: numberArray(obj.sparkline).length ? numberArray(obj.sparkline) : fallback.sparkline,
    updatedAt: stringValue(obj.updated_at ?? obj.updatedAt, fallback.updatedAt),
    traces: arrayItems(obj.traces).length
      ? arrayItems(obj.traces).map((item, index) => normalizeTrace(item, index)).slice(0, 50)
      : fallback.traces,
  };
}

function filterFallbackPosts(params?: { q?: string; semantic?: string; tag?: string }): PostView[] {
  const query = (params?.q ?? params?.semantic ?? '').toLowerCase().trim();
  const tag = params?.tag?.toLowerCase().trim();

  return fallbackPosts.filter((post) => {
    const matchesQuery = query
      ? [post.title, post.summary, post.body, ...post.tags].join(' ').toLowerCase().includes(query)
      : true;
    const matchesTag = tag ? post.tags.some((candidate) => candidate.toLowerCase() === tag) : true;
    return matchesQuery && matchesTag;
  });
}

export async function fetchProjects(): Promise<ProjectView[]> {
  try {
    const data = await apiFetchUnknown('/api/projects?status=published', { revalidate: 60 });
    const projects = arrayItems(data).map((item, index) => normalizeProject(item, index));
    return projects.length ? projects.sort((a, b) => a.displayOrder - b.displayOrder) : fallbackProjects;
  } catch {
    return fallbackProjects;
  }
}

export async function fetchProject(slug: string): Promise<ProjectView | null> {
  try {
    const data = await apiFetchUnknown(`/api/projects/${encodeURIComponent(slug)}`, { revalidate: 300 });
    return normalizeProject(data);
  } catch {
    return fallbackProjects.find((project) => project.slug === slug) ?? null;
  }
}

export async function fetchPosts(params?: {
  q?: string;
  semantic?: string;
  tag?: string;
  page?: number;
}): Promise<PostView[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.semantic) qs.set('semantic', params.semantic);
  if (params?.tag) qs.set('tag', params.tag);
  if (params?.page) qs.set('page', String(params.page));
  const query = qs.toString() ? `?${qs.toString()}` : '';

  try {
    const data = await apiFetchUnknown(`/api/posts${query}`, { revalidate: 60 });
    const posts = arrayItems(data).map((item, index) => normalizePost(item, index));
    return posts.length ? posts : filterFallbackPosts(params);
  } catch {
    return filterFallbackPosts(params);
  }
}

export async function fetchPost(slug: string): Promise<PostDetailView | null> {
  const fallback = fallbackPostDetails.find((post) => post.slug === slug);
  if (!fallback) return null;

  try {
    const data = await apiFetchUnknown(`/api/posts/${encodeURIComponent(slug)}`, { revalidate: 300 });
    const normalized = normalizePostDetail(data, fallback);
    return normalized.related.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}

export async function fetchNow(): Promise<NowEntryView> {
  try {
    return normalizeNow(await apiFetchUnknown('/api/now', { revalidate: 60 }));
  } catch {
    const fallback = fallbackNowEntries[0];
    if (!fallback) throw new Error('Missing fallback now entry');
    return fallback;
  }
}

export async function fetchNowEntries(): Promise<NowEntryView[]> {
  const latest = await fetchNow();
  const rest = fallbackNowEntries.filter((entry) => entry.id !== latest.id);
  return [latest, ...rest].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function fetchResume(slug?: string): Promise<ResumeVariantView> {
  const fallback = fallbackResumes.find((resume) => resume.slug === slug) ?? fallbackResumes[0];
  if (!fallback) throw new Error('Missing fallback resume');

  try {
    const path = slug ? `/api/resume/${encodeURIComponent(slug)}` : '/api/resume';
    return normalizeResume(await apiFetchUnknown(path, { revalidate: 300 }), fallback);
  } catch {
    return fallback;
  }
}

export async function fetchResumeVariants(): Promise<ResumeVariantView[]> {
  const defaultResume = await fetchResume();
  const merged = [defaultResume, ...fallbackResumes.filter((resume) => resume.slug !== defaultResume.slug)];
  return merged.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

export async function fetchMetrics(): Promise<PublicMetricsView> {
  try {
    return normalizeMetrics(await apiFetchUnknown('/api/metrics/public', { revalidate: 10 }));
  } catch {
    return fallbackMetrics;
  }
}

export async function fetchFlags(): Promise<Record<string, boolean>> {
  try {
    const data = record(await apiFetchUnknown('/api/flags', { revalidate: 30 }));
    return Object.fromEntries(
      Object.entries(data).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'),
    );
  } catch {
    return {};
  }
}

export async function clientFetchMetrics(): Promise<PublicMetricsView> {
  const response = await fetch(getBrowserApiPath('/api/metrics/public'), {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Unable to load metrics');
  return normalizeMetrics(await response.json());
}

export async function clientSearchSite(query: string): Promise<SearchResponseView> {
  const response = await fetch(getBrowserApiPath('/api/search'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error('Search failed');
  const data = record(await response.json());

  return {
    answer: stringValue(data.answer, 'No answer was returned.'),
    citations: arrayItems(data.citations).map(normalizeCitation),
  };
}

export async function clientFetchResume(slug?: string): Promise<ResumeVariantView> {
  const path = slug ? `/api/resume/${encodeURIComponent(slug)}` : '/api/resume';
  const response = await fetch(getBrowserApiPath(path), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Unable to load resume');
  return normalizeResume(await response.json(), fallbackResumes[0] ?? {
    id: 'resume',
    slug: 'default',
    label: 'Resume',
    fileUrl: '/resume.pdf',
    isDefault: true,
    createdAt: new Date(0).toISOString(),
    roleKeywords: [],
  });
}

export async function submitInquiry(input: InquiryInput): Promise<void> {
  await apiPostUnknown('/api/inquiries', input);
}
