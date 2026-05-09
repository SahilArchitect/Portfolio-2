import type { Metadata } from 'next';
import { MotionConfig } from 'framer-motion';

import { Cursor } from '@engine-room/ui';

import { CyberChrome } from '@/components/CyberChrome';
import { SiteHeader } from '@/components/SiteHeader';
import { SITE_URL } from '@/lib/site';

import '@engine-room/ui/styles/globals.css';
import '@engine-room/ui/styles/cursor.css';
import './fonts.css';

export const metadata: Metadata = {
  title: {
    template: '%s - Sahil Bhatti',
    default: 'Sahil Bhatti - AI Backend / LLM Infrastructure Engineer',
  },
  description:
    'AI backend engineer building LLM gateways, RAG pipelines, inference APIs, and vector search systems.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Sahil Bhatti',
  },
};

const themeScript = `(function(){
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle('light', theme === 'light');
    if (window.self !== window.top) document.documentElement.dataset.embedded = 'true';
  } catch(e) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/Sohne.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MotionConfig reducedMotion="user">
          <CyberChrome />
          <Cursor />
          <a
            href="#content"
            className="focus:z-modal focus:border-border-strong focus:bg-bg-elev focus:text-mono-sm focus:text-fg sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-md focus:border focus:px-3 focus:py-2 focus:font-mono"
          >
            Skip to content
          </a>
          <SiteHeader />
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
