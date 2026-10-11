import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Source_Serif_4 } from 'next/font/google';

import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';

import './globals.css';

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  // 'optional': no late re-paint when the font arrives (keeps LCP low); falls back to
  // a metric-matched local serif on very slow first loads.
  display: 'optional',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  // 'optional': no late re-paint when the font arrives (keeps LCP low); falls back to
  // a metric-matched local serif on very slow first loads.
  display: 'optional',
});

const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_GB' },
  twitter: { card: 'summary_large_image' },
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#141413' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint (inline: no extra request). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        {/* Cookieless Vercel Web Analytics, same-origin; off unless explicitly enabled. */}
        {process.env.NEXT_PUBLIC_ANALYTICS === 'true' && (
          <script defer src="/_vercel/insights/script.js" />
        )}
      </body>
    </html>
  );
}
