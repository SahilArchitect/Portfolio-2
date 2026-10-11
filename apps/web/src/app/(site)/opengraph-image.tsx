import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Sahil Bhatti — Security of AI Systems';

export default function Image() {
  return ogImage({ title: 'Security of AI Systems', label: 'research homepage' });
}
