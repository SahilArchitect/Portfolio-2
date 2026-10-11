import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import { NoteArticle } from '@/components/content/NoteArticle';
import {
  getProfile,
  getPublic,
  getSlugRedirect,
  listPublic,
  slugParams,
} from '@/lib/content/public';

export async function generateStaticParams() {
  return slugParams(await listPublic('note'));
}

export async function generateMetadata({ params }: PageProps<'/notes/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const note = await getPublic('note', slug);
  if (!note) return {};
  const description =
    note.data.summary || note.data.bodyMarkdown.replace(/[#*_`>[\]()!]/g, '').slice(0, 180);
  return {
    title: note.data.title,
    description,
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: {
      type: 'article',
      title: note.data.title,
      description,
      publishedTime: note.data.date,
    },
  };
}

export default async function NotePage({ params }: PageProps<'/notes/[slug]'>) {
  const { slug } = await params;
  const note = await getPublic('note', slug);
  if (!note) {
    const moved = await getSlugRedirect('note', slug);
    if (moved) permanentRedirect(`/notes/${moved}`);
    notFound();
  }
  const profile = await getProfile();
  return <NoteArticle note={note} author={profile?.name ?? 'Sahil Bhatti'} />;
}
