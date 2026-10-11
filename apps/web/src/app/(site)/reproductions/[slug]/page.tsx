import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import { ReproductionArticle } from '@/components/content/ReproductionArticle';
import { getProfile, getPublic, getSlugRedirect, listPublic, slugParams } from '@/lib/content/public';

export async function generateStaticParams() {
  return slugParams(await listPublic('reproduction'));
}

export async function generateMetadata({ params }: PageProps<'/reproductions/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublic('reproduction', slug);
  if (!item) return {};
  return {
    title: `Reproducing: ${item.data.paperTitle}`,
    description: item.data.claim.slice(0, 200),
    alternates: { canonical: `/reproductions/${item.slug}` },
  };
}

export default async function ReproductionPage({ params }: PageProps<'/reproductions/[slug]'>) {
  const { slug } = await params;
  const item = await getPublic('reproduction', slug);
  if (!item) {
    const moved = await getSlugRedirect('reproduction', slug);
    if (moved) permanentRedirect(`/reproductions/${moved}`);
    notFound();
  }
  const profile = await getProfile();
  return <ReproductionArticle entry={item} author={profile?.name ?? 'Sahil Bhatti'} />;
}
