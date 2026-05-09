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
    id: 'project-llm-gateway',
    slug: 'llm-gateway',
    title: 'LLM Gateway',
    summary:
      'A self-hosted LLM API gateway for routing, rate limiting, cost tracking, and model abstraction.',
    body: `## What it is\n\nA self-hosted LLM API gateway that sits between product code and model providers. It handles request routing, rate limiting, cost tracking, and provider/model abstraction behind a backend API.\n\n## Stack\n\nFastAPI, Pydantic v2, PostgreSQL, and Docker.\n\n## Why it matters\n\nTechnical founders need LLM systems that are deployable, inspectable, and cost-aware. A gateway is the control plane that makes model usage visible instead of scattered across feature code.\n\n## Links\n\nGitHub and live demo links should be added after the public repo and hosted demo are ready.`,
    role: 'AI backend / LLM infrastructure',
    stack: ['FastAPI', 'Pydantic v2', 'PostgreSQL', 'Docker'],
    status: 'published',
    displayOrder: 1,
    coverImageUrl: null,
    repoUrl: null,
    liveUrl: null,
    demoUrl: null,
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: now,
    featured: true,
  },
  {
    id: 'project-lazarus-engine',
    slug: 'lazarus-engine',
    title: 'Lazarus Engine',
    summary:
      'A C++ legacy code migration tool using tree-sitter AST extraction, pgvector embeddings, and LLM-generated modernization.',
    body: `## What it is\n\nA legacy modernization system for C++ codebases. It parses source code with tree-sitter, extracts AST-aware structure, stores semantic embeddings in pgvector, and uses LLM APIs to generate more modern, idiomatic code.\n\n## Stack\n\nC++, Python, tree-sitter, PostgreSQL/pgvector, and LLM APIs.\n\n## Differentiator\n\nLegacy modernization is a $50B+ problem. The interesting work is not just code generation; it is preserving behavior, extracting structure, and making modernization reviewable.`,
    role: 'Legacy modernization / AI systems',
    stack: ['C++', 'Python', 'tree-sitter', 'pgvector', 'LLM APIs'],
    status: 'published',
    displayOrder: 2,
    coverImageUrl: null,
    repoUrl: null,
    liveUrl: null,
    demoUrl: null,
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: now,
    featured: true,
  },
  {
    id: 'project-mtech-thesis',
    slug: 'encrypted-network-traffic-classification',
    title: 'Encrypted Network Traffic Classification',
    summary:
      'IIT Jammu M.Tech thesis on ML-based encrypted network traffic classification without decryption.',
    body: `## Institution\n\nIIT Jammu, M.Tech Data Science, 2022.\n\n## What it involved\n\nMachine-learning-based classification of encrypted network traffic without decrypting payloads, keeping the classification problem privacy-preserving.\n\n## Links\n\nAdd paper or GitHub link when the artifact is available publicly.`,
    role: 'M.Tech thesis',
    stack: ['Machine Learning', 'Network Traffic', 'Privacy-preserving ML'],
    status: 'published',
    displayOrder: 3,
    coverImageUrl: null,
    repoUrl: null,
    liveUrl: null,
    demoUrl: null,
    createdAt: '2022-06-01T10:00:00.000Z',
    updatedAt: now,
    featured: true,
  },
  {
    id: 'project-car-brand-classification',
    slug: 'car-brand-classification',
    title: 'Car Brand Classification',
    summary:
      'A transfer-learning computer vision project using ResNet-50 for multi-class car brand image classification.',
    body: `## What it is\n\nA multi-class image classification project for identifying car brands from images.\n\n## Model\n\nResNet-50 with transfer learning.\n\n## Links\n\nAdd the GitHub repository when the code is cleaned and public.`,
    role: 'Computer vision project',
    stack: ['ResNet-50', 'Transfer Learning', 'Deep Learning'],
    status: 'published',
    displayOrder: 4,
    coverImageUrl: null,
    repoUrl: null,
    liveUrl: null,
    demoUrl: null,
    createdAt: '2021-01-01T10:00:00.000Z',
    updatedAt: now,
    featured: true,
  },
  {
    id: 'project-covid-xray-detection',
    slug: 'covid-19-detection-chest-xrays',
    title: 'COVID-19 Detection from Chest X-rays',
    summary:
      'A deep-learning medical imaging project for binary COVID-19 detection from chest X-ray images.',
    body: `## What it is\n\nA binary classification project using deep learning on chest X-ray images.\n\n## Task\n\nDetect COVID-19 from medical imaging inputs.\n\n## Links\n\nAdd the GitHub repository when the code is cleaned and public.`,
    role: 'Medical imaging ML project',
    stack: ['Deep Learning', 'Medical Imaging', 'Image Classification'],
    status: 'published',
    displayOrder: 5,
    coverImageUrl: null,
    repoUrl: null,
    liveUrl: null,
    demoUrl: null,
    createdAt: '2020-01-01T10:00:00.000Z',
    updatedAt: now,
    featured: true,
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
