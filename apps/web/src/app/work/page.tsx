import type { Metadata } from 'next';

import { Section } from '@/components/Section';
import { WorkList } from '@/components/WorkList';
import { fetchProjects } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected backend and AI infrastructure projects.',
};

export default async function WorkPage() {
  const projects = await fetchProjects();

  return (
    <main id="content">
      <Section
        eyebrow="Work"
        title="Project list, not a trophy wall."
        intro="Each entry opens into a deep dive with architecture, live metrics, and the writing that explains the tradeoffs."
      >
        <WorkList projects={projects} />
      </Section>
    </main>
  );
}
