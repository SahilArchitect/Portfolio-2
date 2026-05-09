export type DashboardKpi = {
  visitorsToday: number;
  topPages: Array<{ path: string; views: number; change: number }>;
  ragQueries: number;
  llmCostMtd: number;
  inquiriesPending: number;
};

const publicResumeUrl = 'https://www.bysahil.dev/resume/ai-backend-engineer.pdf';

export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body_md: string;
  role: string;
  stack: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  display_order: number;
  live_url: string | null;
  repo_url: string | null;
  shipped_on: string | null;
  updated_at: string;
};

export type NowEntryRow = {
  id: string;
  headline: string;
  body_md: string;
  mood: string | null;
  is_current: boolean;
  posted_at: string;
  updated_at: string;
};

export type HeroVariant = {
  id: string;
  label: string;
  copy: string;
  allocation: number;
  impressions: number;
  inquiries: number;
};

export type ResumeVariantRow = {
  id: string;
  label: string;
  slug: string;
  body_md: string;
  pdf_url: string | null;
  is_default: boolean;
  role_keywords: string[];
  updated_at: string;
};

export type SyncLogRow = {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  created_at: string;
};

export type SubstackState = {
  lastSyncAt: string | null;
  embeddingModel: string;
  chunkSize: number;
  recentLog: SyncLogRow[];
};

export type InquiryRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  intent: 'recruiter' | 'founder' | 'spam' | 'other' | string;
  status: 'new' | 'read' | 'replied' | 'spam';
  priority_score: number;
  created_at: string;
};

export type LlmDaySpend = { date: string; cost_usd: number; calls: number };
export type LlmEndpointSpend = { endpoint: string; cost_usd: number; tokens: number };
export type LlmSlowCall = {
  id: string;
  endpoint: string;
  model: string;
  duration_ms: number;
  cost_usd: number;
  created_at: string;
};

export type LlmCostState = {
  spendByDay: LlmDaySpend[];
  spendByEndpoint: LlmEndpointSpend[];
  tokenHistogram: Array<{ bucket: string; calls: number }>;
  slowestCalls: LlmSlowCall[];
};

export type FeatureFlagRow = {
  name: string;
  enabled: boolean;
  description: string;
  updated_at: string;
};

export type AnalyticsState = {
  pageViews: Array<{ path: string; views: number; visitors: number }>;
  searchQueries: Array<{ query: string; count: number; zero_result_rate: number }>;
  funnel: Array<{ step: string; count: number }>;
};

export const fallbackDashboard: DashboardKpi = {
  visitorsToday: 128,
  topPages: [
    { path: '/', views: 412, change: 8 },
    { path: '/work/llm-gateway', views: 194, change: 14 },
    { path: '/hire', views: 81, change: -3 },
  ],
  ragQueries: 37,
  llmCostMtd: 24.82,
  inquiriesPending: 5,
};

export const fallbackProjects: ProjectRow[] = [
  {
    id: 'lazarus-engine',
    title: 'Lazarus Engine',
    slug: 'lazarus-engine',
    summary: 'A production-minded recovery loop for failed agent runs and partial tool traces.',
    body_md:
      '## Problem\nAgents fail in messy, partial states.\n\n## System\nLazarus Engine captures traces, classifies failure modes, and resumes from the last safe checkpoint.',
    role: 'Sole engineer',
    stack: ['FastAPI', 'Postgres', 'OpenTelemetry', 'Next.js'],
    status: 'published',
    featured: true,
    display_order: 1,
    live_url: null,
    repo_url: null,
    shipped_on: '2026-04-20',
    updated_at: '2026-05-07T00:00:00Z',
  },
  {
    id: 'llm-gateway',
    title: 'LLM Gateway',
    slug: 'llm-gateway',
    summary: 'A thin provider abstraction with retries, token accounting, and request-level cost visibility.',
    body_md:
      '## Why\nLLM calls need operational discipline.\n\n## Design\nThe gateway centralizes retries, timeouts, cost tracking, and logging.',
    role: 'Backend engineer',
    stack: ['Python', 'Anthropic', 'OpenAI', 'Redis'],
    status: 'draft',
    featured: false,
    display_order: 2,
    live_url: null,
    repo_url: null,
    shipped_on: null,
    updated_at: '2026-05-07T00:00:00Z',
  },
];

export const fallbackNowEntries: NowEntryRow[] = [
  {
    id: 'now-2026-05',
    headline: 'Building a portfolio that behaves like production infrastructure.',
    body_md:
      'Shipping the admin console, Substack ingestion, and RAG trace viewer as visible proof of engineering taste.',
    mood: 'focused',
    is_current: true,
    posted_at: '2026-05-07T00:00:00Z',
    updated_at: '2026-05-07T00:00:00Z',
  },
];

export const fallbackHeroVariants: HeroVariant[] = [
  {
    id: 'variant-a',
    label: 'Systems Positioning',
    copy: 'I build AI backend systems that stay observable when the demo ends.',
    allocation: 50,
    impressions: 940,
    inquiries: 31,
  },
  {
    id: 'variant-b',
    label: 'Hiring Positioning',
    copy: 'AI backend engineer focused on RAG, LLM gateways, and production traces.',
    allocation: 50,
    impressions: 917,
    inquiries: 27,
  },
];

export const fallbackResumeVariants: ResumeVariantRow[] = [
  {
    id: 'ai-backend',
    label: 'AI Backend Engineer',
    slug: 'ai-backend-engineer',
    body_md: '## Focus\nFastAPI, RAG systems, LLM gateways, and observability.',
    pdf_url: publicResumeUrl,
    is_default: true,
    role_keywords: ['AI backend', 'RAG', 'FastAPI'],
    updated_at: '2026-05-07T00:00:00Z',
  },
];

export const fallbackSubstack: SubstackState = {
  lastSyncAt: null,
  embeddingModel: 'text-embedding-3-small',
  chunkSize: 512,
  recentLog: [
    {
      id: 'sync-pending',
      level: 'info',
      message: 'Worker has not reported a sync yet.',
      created_at: '2026-05-07T00:00:00Z',
    },
  ],
};

export const fallbackInquiries: InquiryRow[] = [
  {
    id: 'inq-1',
    name: 'Avery Tan',
    email: 'avery@example.com',
    company: 'Atlas Robotics',
    message: 'We are hiring an AI backend engineer and want to talk about your LLM gateway work.',
    intent: 'recruiter',
    status: 'new',
    priority_score: 92,
    created_at: '2026-05-07T00:00:00Z',
  },
  {
    id: 'inq-2',
    name: 'Mira Shah',
    email: 'mira@example.com',
    company: 'Seedstage Labs',
    message: 'I am exploring a RAG-heavy product and would like to compare notes.',
    intent: 'founder',
    status: 'read',
    priority_score: 76,
    created_at: '2026-05-06T18:00:00Z',
  },
];

export const fallbackLlmCost: LlmCostState = {
  spendByDay: [
    { date: 'May 1', cost_usd: 2.1, calls: 24 },
    { date: 'May 2', cost_usd: 2.8, calls: 31 },
    { date: 'May 3', cost_usd: 3.4, calls: 44 },
    { date: 'May 4', cost_usd: 4.2, calls: 52 },
    { date: 'May 5', cost_usd: 3.7, calls: 48 },
    { date: 'May 6', cost_usd: 4.9, calls: 63 },
  ],
  spendByEndpoint: [
    { endpoint: '/api/search', cost_usd: 13.4, tokens: 184000 },
    { endpoint: '/api/inquiries', cost_usd: 4.8, tokens: 42000 },
    { endpoint: 'worker.ingest', cost_usd: 6.6, tokens: 126000 },
  ],
  tokenHistogram: [
    { bucket: '0-1k', calls: 44 },
    { bucket: '1k-4k', calls: 81 },
    { bucket: '4k-8k', calls: 28 },
    { bucket: '8k+', calls: 7 },
  ],
  slowestCalls: [
    {
      id: 'llm-1',
      endpoint: '/api/search',
      model: 'claude-sonnet',
      duration_ms: 2840,
      cost_usd: 0.19,
      created_at: '2026-05-07T00:00:00Z',
    },
  ],
};

export const fallbackFlags: FeatureFlagRow[] = [
  {
    name: 'enable_substack_blog',
    enabled: true,
    description: 'Show Substack-sourced writing on the public site.',
    updated_at: '2026-05-07T00:00:00Z',
  },
  {
    name: 'show_traces_page',
    enabled: true,
    description: 'Expose redacted public traces.',
    updated_at: '2026-05-07T00:00:00Z',
  },
  {
    name: 'hire_calendar_embed',
    enabled: false,
    description: 'Show the booking calendar on /hire.',
    updated_at: '2026-05-07T00:00:00Z',
  },
];

export const fallbackAnalytics: AnalyticsState = {
  pageViews: [
    { path: '/', views: 1220, visitors: 842 },
    { path: '/work', views: 640, visitors: 411 },
    { path: '/writing', views: 388, visitors: 250 },
    { path: '/hire', views: 216, visitors: 170 },
  ],
  searchQueries: [
    { query: 'rag pipeline', count: 18, zero_result_rate: 0.05 },
    { query: 'llm gateway', count: 15, zero_result_rate: 0 },
    { query: 'fastapi', count: 11, zero_result_rate: 0.09 },
  ],
  funnel: [
    { step: 'Visit', count: 1220 },
    { step: 'Open work', count: 640 },
    { step: 'Open hire', count: 216 },
    { step: 'Inquiry', count: 31 },
  ],
};
