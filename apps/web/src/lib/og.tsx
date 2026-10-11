import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

// Copies of the @fontsource files (SIL OFL), vendored so the OG route can read them at runtime.
function font(file: string) {
  return readFile(join(process.cwd(), 'assets/og', file));
}

export const OG_SIZE = { width: 1200, height: 630 };

/** Plain typographic card: name, page title, small mono label. Same faces as the site. */
export async function ogImage({ title, label }: { title: string; label: string }) {
  const [serif, serifBold, mono] = await Promise.all([
    font('source-serif-4-latin-400-normal.woff'),
    font('source-serif-4-latin-600-normal.woff'),
    font('jetbrains-mono-latin-400-normal.woff'),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: '#fbfaf7',
        color: '#1b1b1a',
        fontFamily: 'Source Serif',
      }}
    >
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 26, color: '#595752' }}>{label}</div>
      <div style={{ fontSize: title.length > 60 ? 56 : 68, fontWeight: 600, lineHeight: 1.15 }}>
        {title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30 }}>
        <span>Sahil Bhatti</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, color: '#1d4f91' }}>
          bysahil.dev
        </span>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Source Serif', data: serif, weight: 400, style: 'normal' },
        { name: 'Source Serif', data: serifBold, weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
