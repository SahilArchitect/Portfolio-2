import { getPublic, listPublic, slugParams } from '@/lib/content/public';
import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Note';

export async function generateStaticParams() {
  return slugParams(await listPublic('note'));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getPublic('note', slug);
  return ogImage({ title: note?.data.title ?? 'Notes', label: note ? `note · ${note.data.date}` : 'notes' });
}
