'use client';

import { useMemo } from 'react';

import { getCalBookingUrl, sanitizeCalLink } from '@/lib/cal';

type CalEmbedProps = {
  calLink: string;
};

export function CalEmbed({ calLink }: CalEmbedProps) {
  const normalizedCalLink = useMemo(() => sanitizeCalLink(calLink), [calLink]);
  const bookingUrl = getCalBookingUrl(normalizedCalLink);
  const embedUrl = `${bookingUrl}?hide_gdpr_banner=1&background_color=020617&text_color=e5e7eb&primary_color=00fff2`;

  return (
    <div className="relative min-h-[620px] overflow-hidden bg-bg">
      <iframe
        title="Schedule a conversation with Sahil Bhatti"
        src={embedUrl}
        className="h-full min-h-[620px] w-full"
        data-calendly-link={normalizedCalLink}
      />
      <div className="absolute inset-x-5 bottom-5 pointer-events-none flex justify-end">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          className="pointer-events-auto inline-flex min-h-11 items-center border border-border-strong bg-bg-elev/90 px-4 font-mono text-[11px] uppercase tracking-[2px] text-accent backdrop-blur transition hover:bg-accent-muted hover:text-fg"
        >
          Open Calendly directly
        </a>
      </div>
    </div>
  );
}
