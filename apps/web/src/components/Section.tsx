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
    <section id={id} className={cn('cyber-section', className)}>
      {(eyebrow || title || intro) && (
        <div className="cyber-section-header">
          {eyebrow && <p className="cyber-section-number">{'//'} {eyebrow}</p>}
          {title && <Heading className="cyber-section-title">{title}</Heading>}
          <div className="cyber-section-line" />
        </div>
      )}
      {intro && <p className="-mt-10 mb-10 max-w-3xl font-mono text-[13px] leading-7 text-fg/65">{intro}</p>}
      {children}
    </section>
  );
}
