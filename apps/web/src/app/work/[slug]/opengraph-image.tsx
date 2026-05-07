import { ImageResponse } from 'next/og';

import { fetchProject } from '@/lib/api';

export const runtime = 'edge';
export const alt = 'Project preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

type ImageProps = {
  params: {
    slug: string;
  };
};

export default async function Image({ params }: ImageProps) {
  const project = await fetchProject(params.slug);
  const title = project?.title ?? 'The Engine Room';
  const summary = project?.summary ?? 'Production AI infrastructure, in working order.';
  const stack = project?.stack.slice(0, 4).join(' / ') ?? 'AI Backend Engineering';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f7f4ee',
          color: '#111111',
          padding: 72,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#55524d',
          }}
        >
          <span>Sahil Bhatti</span>
          <span>Project</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div
            style={{
              width: 104,
              height: 8,
              background: '#d84f2a',
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: 82,
              lineHeight: 0.98,
              maxWidth: 960,
              letterSpacing: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 880,
              fontSize: 30,
              lineHeight: 1.35,
              color: '#3f3c37',
            }}
          >
            {summary}
          </p>
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#55524d',
          }}
        >
          {stack}
        </div>
      </div>
    ),
    size,
  );
}
