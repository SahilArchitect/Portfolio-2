import { getPublic, listPublic, slugParams } from '@/lib/content/public';
import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Research project';

export async function generateStaticParams() {
  return slugParams(await listPublic('project'));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublic('project', slug);
  return ogImage({ title: project?.data.title ?? 'Research', label: 'research' });
}
