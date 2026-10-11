/**
 * Content of the previous (pre-2026-10) site, kept verbatim so the seed can
 * import it as ARCHIVED entries: hidden publicly, recoverable from the admin.
 * Do not publish from here; edit through the admin instead.
 */

export type LegacyProject = {
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

export type LegacyPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  publishedAt: string;
  canonicalUrl: string;
  createdAt: string;
  updatedAt: string;
  readingMinutes: number;
};

export const legacyProjects: LegacyProject[] = [
  {
    id: 'project-stride',
    slug: 'stride',
    title: 'Stride',
    summary:
      'A local-first study command center for daily schedules, focused sessions, progress analytics, and private browser persistence.',
    body: `## What it is\n\nStride turns structured Bank Exam and GATE CSE schedules into a focused daily workflow. It combines task planning, a completion calendar, progress analytics, assessments, an error log, and a distraction-free focus timer.\n\n## Architecture\n\nThe application is built with Next.js, React, TypeScript, IndexedDB, and deterministic analytics. It is exported as a static application and deployed with this portfolio while preserving a separate source repository.\n\n## Privacy model\n\nProgress stays in the visitor's browser. Stride has no account system, analytics database, or server-side store. JSON backup and restore make the local-first model portable without silently uploading personal study data.`,
    role: 'Local-first productivity system',
    stack: ['Next.js', 'TypeScript', 'IndexedDB', 'Recharts'],
    status: 'published',
    displayOrder: 0,
    coverImageUrl: null,
    repoUrl: 'https://github.com/SahilArchitect/stride-daily-progress',
    liveUrl: 'https://www.bysahil.dev/tracker',
    demoUrl: 'https://www.bysahil.dev/tracker',
    createdAt: '2026-10-03T00:00:00.000Z',
    updatedAt: '2026-10-03T00:00:00.000Z',
    featured: true,
  },
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
    updatedAt: '2026-05-07T12:00:00.000Z',
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
    updatedAt: '2026-05-07T12:00:00.000Z',
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
    updatedAt: '2026-05-07T12:00:00.000Z',
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
    updatedAt: '2026-05-07T12:00:00.000Z',
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
    updatedAt: '2026-05-07T12:00:00.000Z',
    featured: true,
  },
];

export const legacyPosts: LegacyPost[] = [
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
