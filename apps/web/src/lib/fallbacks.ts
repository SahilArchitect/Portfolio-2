import type {
  NowEntryView,
  PostDetailView,
  PostView,
  ProjectView,
  PublicMetricsView,
  ResumeVariantView,
} from './view-models';

const now = new Date('2026-05-07T12:00:00.000Z').toISOString();

export const fallbackProjects: ProjectView[] = [
  {
    id: 'project-lazarus-engine',
    slug: 'lazarus-engine',
    title: 'Lazarus Engine',
    summary:
      'A recovery-first AI backend that turns failed model calls, partial traces, and queue dead letters into replayable repair workflows.',
    body: `## System problem\n\nMost AI products treat failures as support tickets. Lazarus Engine treats them as durable state: every request is traced, replayable, and scored for blast radius.\n\n## Architecture\n\nRequests move through an API gateway, Redis-backed work queues, model adapters, and a Postgres event log. The important decision is that recovery paths are first-class, not bolted on after the happy path.\n\n## What it proves\n\nThe project demonstrates async Python, queue isolation, structured observability, and operational UX for engineers who need to debug AI systems under pressure.`,
    role: 'Backend architecture, observability, recovery UX',
    stack: ['FastAPI', 'Postgres', 'Redis', 'OpenTelemetry', 'Docker'],
    status: 'published',
    displayOrder: 1,
    coverImageUrl: null,
    repoUrl: null,
    liveUrl: null,
    demoUrl: 'https://example.com/demo/lazarus-engine',
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: now,
    featured: true,
  },
  {
    id: 'project-llm-gateway',
    slug: 'llm-gateway',
    title: 'LLM Gateway',
    summary:
      'A thin model access layer with retries, budgets, request logs, and provider switching designed to make AI cost and reliability visible.',
    body: `## System problem\n\nDirect provider calls hide the decisions that matter: retry policy, timeouts, token accounting, and degraded-mode behavior.\n\n## Architecture\n\nThe gateway centralizes model calls behind provider adapters. Every call records prompt size, completion size, latency, estimated cost, and endpoint ownership.\n\n## What it proves\n\nThis is the kind of small infrastructure seam that makes larger AI systems easier to reason about, test, and operate.`,
    role: 'LLM infrastructure, cost controls, API contracts',
    stack: ['Python', 'Anthropic', 'OpenAI', 'Redis', 'pgvector'],
    status: 'published',
    displayOrder: 2,
    coverImageUrl: null,
    repoUrl: null,
    liveUrl: null,
    demoUrl: 'https://example.com/demo/llm-gateway',
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: now,
    featured: true,
  },
  {
    id: 'project-trace-room',
    slug: 'trace-room',
    title: 'Trace Room',
    summary:
      'A read-only trace surface that redacts sensitive spans while preserving enough timing context to debug production AI flows.',
    body: `## System problem\n\nPublic demos often hide the hard parts. Trace Room exposes the shape of production traffic without exposing user data.\n\n## Architecture\n\nA metrics endpoint emits aggregate latency, RAG activity, and redacted spans. The public viewer polls without authentication and never shows request payloads.`,
    role: 'Frontend systems, telemetry design',
    stack: ['Next.js', 'SWR', 'OpenTelemetry', 'Tailwind'],
    status: 'published',
    displayOrder: 3,
    coverImageUrl: null,
    repoUrl: null,
    liveUrl: null,
    demoUrl: null,
    createdAt: '2026-04-28T10:00:00.000Z',
    updatedAt: now,
    featured: false,
  },
];

export const fallbackPosts: PostView[] = [
  {
    id: 'post-rag-without-magic',
    slug: 'rag-without-magic',
    title: 'RAG without magic words',
    summary:
      'A practical breakdown of chunking, retrieval, and answer synthesis when citations matter more than model charm.',
    body: `RAG gets clearer when you split it into four boring contracts: chunk, embed, retrieve, and generate.\n\nThe chunker owns document boundaries. The retriever owns relevance. The generator owns synthesis. The product owns what happens when there is not enough evidence.\n\nThat last part is where most systems fail. A credible assistant should say what it knows, cite where it found it, and stop before invention begins.`,
    tags: ['RAG', 'retrieval', 'systems'],
    publishedAt: '2026-05-01T09:00:00.000Z',
    canonicalUrl: 'https://sahil.substack.com/p/rag-without-magic',
    createdAt: '2026-05-01T09:00:00.000Z',
    updatedAt: '2026-05-01T09:00:00.000Z',
    readingMinutes: 3,
  },
  {
    id: 'post-cost-visibility',
    slug: 'cost-visibility-for-llm-apps',
    title: 'Cost visibility for LLM apps',
    summary:
      'Why every model call should carry endpoint ownership, token counts, retry metadata, and a clear budget path.',
    body: `LLM cost problems rarely arrive as one dramatic invoice. They arrive as quiet coupling.\n\nA model call belongs to a product surface, an endpoint, a user action, and a retry policy. If you cannot answer which of those created spend, you do not have cost visibility.\n\nThe fix is not a dashboard first. The fix is a gateway seam that logs every request the same way.`,
    tags: ['LLM Ops', 'cost', 'backend'],
    publishedAt: '2026-04-23T09:00:00.000Z',
    canonicalUrl: 'https://sahil.substack.com/p/cost-visibility-for-llm-apps',
    createdAt: '2026-04-23T09:00:00.000Z',
    updatedAt: '2026-04-23T09:00:00.000Z',
    readingMinutes: 2,
  },
  {
    id: 'post-traces-that-teach',
    slug: 'traces-that-teach',
    title: 'Traces that teach the system back to you',
    summary:
      'A trace viewer should explain causality, not just display spans in chronological order.',
    body: `Good traces compress time. They show the moment a request waited, branched, retried, or lost context.\n\nFor AI systems, traces need extra vocabulary: retrieval depth, top-k scores, token pressure, model latency, and fallback behavior.`,
    tags: ['observability', 'OpenTelemetry', 'AI infra'],
    publishedAt: '2026-04-12T09:00:00.000Z',
    canonicalUrl: 'https://sahil.substack.com/p/traces-that-teach',
    createdAt: '2026-04-12T09:00:00.000Z',
    updatedAt: '2026-04-12T09:00:00.000Z',
    readingMinutes: 2,
  },
];

export const fallbackPostDetails: PostDetailView[] = fallbackPosts.map((post) => ({
  ...post,
  related: fallbackPosts.filter((candidate) => candidate.slug !== post.slug).slice(0, 3),
}));

export const fallbackNowEntries: NowEntryView[] = [
  {
    id: 'now-current',
    headline: 'Building a portfolio that behaves like production infrastructure.',
    body: `Current focus: shipping the public site, admin console, RAG pipeline, and deployment story as one coherent system.\n\nThe aim is not decoration. The aim is proof: visible traces, real API surfaces, clean contracts, and a site that can explain how it works.`,
    mood: 'shipping carefully',
    isCurrent: true,
    createdAt: '2026-05-07T08:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'now-previous',
    headline: 'Turning backend learning into visible artifacts.',
    body: 'Recent work centered on FastAPI, async Postgres, RAG fundamentals, and writing implementation notes that can survive beyond a chat session.',
    mood: 'systems mode',
    isCurrent: false,
    createdAt: '2026-04-15T08:00:00.000Z',
    updatedAt: '2026-04-20T08:00:00.000Z',
  },
];

export const fallbackResumes: ResumeVariantView[] = [
  {
    id: 'resume-ai-backend',
    slug: 'ai-backend-engineer',
    label: 'AI Backend Engineer',
    fileUrl: '/resume/ai-backend-engineer.pdf',
    isDefault: true,
    createdAt: now,
    roleKeywords: ['RAG', 'FastAPI', 'LLM infrastructure'],
  },
  {
    id: 'resume-platform',
    slug: 'backend-platform',
    label: 'Backend Platform',
    fileUrl: '/resume/backend-platform.pdf',
    isDefault: false,
    createdAt: now,
    roleKeywords: ['Postgres', 'observability', 'distributed systems'],
  },
];

export const fallbackMetrics: PublicMetricsView = {
  ragQueries24h: 138,
  medianLatencyMs: 284,
  p99LatencyMs: 1180,
  throughputPerMin: 14,
  sparkline: [3, 5, 4, 8, 6, 9, 11, 7, 13, 15, 14, 18, 12, 16, 20, 17, 21, 19, 15, 13, 10, 9, 7, 6],
  updatedAt: now,
  traces: Array.from({ length: 50 }, (_, index) => ({
    id: `trace-${String(index + 1).padStart(2, '0')}`,
    name: index % 3 === 0 ? 'POST /api/search' : index % 3 === 1 ? 'GET /api/posts' : 'GET /api/projects',
    service: index % 2 === 0 ? 'api' : 'web',
    durationMs: 120 + ((index * 37) % 760),
    status: index % 17 === 0 ? 'error' : 'ok',
    startedAt: new Date(Date.parse(now) - index * 9 * 60 * 1000).toISOString(),
    spans: 4 + (index % 8),
  })),
};
