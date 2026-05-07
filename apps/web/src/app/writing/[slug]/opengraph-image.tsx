import { ImageResponse } from 'next/og';

import { fetchPost } from '@/lib/api';

export const runtime = 'edge';
export const alt = 'Writing preview';
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
  const post = await fetchPost(params.slug);
  const title = post?.title ?? 'The Engine Room';
  const summary = post?.summary ?? 'Production AI infrastructure, in working order.';
  const tags = post?.tags.slice(0, 4).join(' / ') ?? 'Systems Notes';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#10100f',
          color: '#f8f4ec',
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
            color: '#b9b0a4',
          }}
        >
          <span>Sahil Bhatti</span>
          <span>Writing</span>
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
              fontSize: 78,
              lineHeight: 1,
              maxWidth: 980,
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
              color: '#d7d0c6',
            }}
          >
            {summary}
          </p>
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#b9b0a4',
          }}
        >
          {tags}
        </div>
      </div>
    ),
    size,
  );
}
