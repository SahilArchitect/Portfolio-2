import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import { ProjectArticle } from '@/components/content/ProjectArticle';
import { getProfile, getPublic, getSlugRedirect, listPublic, slugParams } from '@/lib/content/public';

export async function generateStaticParams() {
  return slugParams(await listPublic('project'));
}

export async function generateMetadata({ params }: PageProps<'/research/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublic('project', slug);
  if (!project) return {};
  return {
    title: project.data.title,
    description: project.data.summary,
    alternates: { canonical: `/research/${project.slug}` },
    openGraph: { type: 'article', title: project.data.title, description: project.data.summary },
  };
}

export default async function ResearchPage({ params }: PageProps<'/research/[slug]'>) {
  const { slug } = await params;
  const project = await getPublic('project', slug);
  if (!project) {
    const moved = await getSlugRedirect('project', slug);
    if (moved) permanentRedirect(`/research/${moved}`);
    notFound();
  }
  const profile = await getProfile();
  return <ProjectArticle project={project} author={profile?.name ?? 'Sahil Bhatti'} />;
}
