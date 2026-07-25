import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Harsimran',
  description: 'A sincere apology, made with care.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function HarsimranLayout({ children }: { children: React.ReactNode }) {
  return children;
}
