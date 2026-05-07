import type { ReactNode } from 'react';

import { cn } from '@engine-room/ui';

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
  headingLevel?: 'h1' | 'h2';
};

export function Section({ id, eyebrow, title, intro, children, className, headingLevel = 'h2' }: SectionProps) {
  const Heading = headingLevel;

  return (
    <section id={id} className={cn('mx-auto w-full max-w-6xl px-6 py-20 sm:py-28', className)}>
      {(eyebrow || title || intro) && (
        <div className="mb-10 max-w-3xl">
          {eyebrow && (
            <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">{eyebrow}</p>
          )}
          {title && <Heading className="mt-3 font-display text-display-md font-medium text-fg">{title}</Heading>}
          {intro && <p className="mt-4 text-body text-fg-muted">{intro}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
