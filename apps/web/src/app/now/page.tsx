import type { Metadata } from 'next';

import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Section } from '@/components/Section';
import { fetchNowEntries } from '@/lib/api';
import { formatMonth } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Now',
  description: 'Current and recent operating state.',
};

export default async function NowPage() {
  const entries = await fetchNowEntries();

  return (
    <main id="content">
      <Section
        eyebrow="Now"
        title="Reverse-chron operating log."
        intro="Short status notes on what is being built, studied, and hardened right now."
      >
        <div className="space-y-5">
          {entries.map((entry) => (
            <article key={entry.id} className="rounded-xl border border-border bg-bg-elev p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p className="font-mono text-mono-sm text-fg-muted">{formatMonth(entry.updatedAt)}</p>
                  <h2 className="mt-2 font-display text-display-sm font-medium text-fg">{entry.headline}</h2>
                </div>
                {entry.mood && (
                  <span className="w-fit rounded-full border border-border px-2.5 py-0.5 font-mono text-mono-sm text-fg-muted">
                    {entry.mood}
                  </span>
                )}
              </div>
              <MarkdownRenderer content={entry.body} className="mt-6" />
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
