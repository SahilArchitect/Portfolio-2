'use client';

import { useEffect, useId, useMemo, useState } from 'react';

import { getCalBookingUrl, sanitizeCalLink } from '@/lib/cal';

type CalEmbedProps = {
  calLink: string;
};

type CalFunction = {
  (...args: unknown[]): void;
  loaded?: boolean;
  q?: unknown[][];
  ns?: Record<string, CalFunction>;
};

declare global {
  interface Window {
    Cal?: CalFunction;
  }
}

const CAL_ORIGIN = 'https://cal.com';
const CAL_SCRIPT = 'https://cal.com/embed/embed.js';

function bootCal() {
  if (window.Cal) return window.Cal;

  const Cal = ((...args: unknown[]) => {
    const cal = window.Cal;
    if (!cal) return;

    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q ?? [];
      const script = document.createElement('script');
      script.src = CAL_SCRIPT;
      script.async = true;
      document.head.appendChild(script);
      cal.loaded = true;
    }

    cal.q = cal.q ?? [];
    cal.q.push(args);
  }) as CalFunction;

  window.Cal = Cal;
  return Cal;
}

export function CalEmbed({ calLink }: CalEmbedProps) {
  const id = useId().replace(/:/g, '');
  const normalizedCalLink = useMemo(() => sanitizeCalLink(calLink), [calLink]);
  const bookingUrl = getCalBookingUrl(normalizedCalLink);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const timeout = window.setTimeout(() => setFailed(true), 6500);
    const Cal = bootCal();
    Cal('init', { origin: CAL_ORIGIN });
    Cal('inline', {
      elementOrSelector: `#${id}`,
      calLink: normalizedCalLink,
      layout: 'month_view',
    });
    Cal('ui', {
      theme: 'dark',
      hideEventTypeDetails: false,
      styles: {
        branding: { brandColor: '#00fff2' },
        body: { background: '#020617' },
      },
    });

    return () => window.clearTimeout(timeout);
  }, [id, normalizedCalLink]);

  return (
    <div className="relative min-h-[620px] overflow-hidden bg-bg">
      <div id={id} className="h-full min-h-[620px] w-full" data-cal-link={normalizedCalLink} />
      {failed ? (
        <div className="absolute inset-x-5 bottom-5 border border-border bg-bg-elev/95 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-warning">
            Calendar blocked by browser or network
          </p>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="mt-3 inline-flex min-h-11 items-center border border-border-strong px-4 font-mono text-[11px] uppercase tracking-[2px] text-accent transition hover:bg-accent-muted hover:text-fg"
          >
            Open Cal.com directly
          </a>
        </div>
      ) : null}
    </div>
  );
}
