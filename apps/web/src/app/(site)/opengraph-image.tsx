import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Sahil Bhatti — Machine learning and AI security';

export default function Image() {
  return ogImage({ title: 'Machine learning and AI security', label: 'bysahil.dev' });
}
