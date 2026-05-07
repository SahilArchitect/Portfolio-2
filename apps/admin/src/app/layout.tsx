import type { Metadata } from 'next';
import { MotionConfig } from 'framer-motion';

import { Cursor } from '@engine-room/ui';

import '@engine-room/ui/styles/globals.css';
import '@engine-room/ui/styles/cursor.css';

export const metadata: Metadata = {
  title: 'Admin — The Engine Room',
  description: 'Authenticated content and operations console.',
  robots: { index: false, follow: false },
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MotionConfig reducedMotion="user">
          <Cursor />
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
