import type { Metadata } from 'next';

import { ProjectCard } from '@/components/content/ProjectCard';
import { getImageDims, listPublic } from '@/lib/content/public';

export const metadata: Metadata = {
  title: 'Research',
  description: 'Research projects on the security of AI systems.',
  alternates: { canonical: '/research' },
};

export default async function ResearchIndex() {
  const [projects, dims] = await Promise.all([listPublic('project'), getImageDims()]);
  const groups = [
    { label: 'Ongoing', items: projects.filter((p) => p.data.projectStatus === 'ongoing') },
    { label: 'Completed', items: projects.filter((p) => p.data.projectStatus === 'completed') },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="pt-6 sm:pt-10">
      <h1 className="text-[1.6rem] font-semibold">Research</h1>
      {groups.length === 0 && <p className="mt-6 text-muted">Nothing published yet.</p>}
      {groups.map((group) => (
        <section key={group.label} className="mt-8">
          <h2 className="meta mb-1 tracking-wide uppercase">{group.label}</h2>
          {group.items.map((project) => (
            <ProjectCard key={project.id} project={project} dims={dims} />
          ))}
        </section>
      ))}
    </div>
  );
}
