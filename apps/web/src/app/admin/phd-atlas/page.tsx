import { Suspense } from 'react';
import { requireOwnerPage } from '@/lib/server/owner';
import { atlasHTML } from '@/phd-atlas/atlas';

export const metadata = {
  title: 'Private PhD Atlas',
  robots: { index: false, follow: false, noarchive: true },
};

async function ProtectedAtlas() {
  await requireOwnerPage();
  return (
    <main style={{ margin: 0, padding: 0, width: '100%', height: '100dvh' }}>
      <iframe
        title="Private PhD Atlas 2027"
        srcDoc={atlasHTML}
        style={{ display: 'block', border: 0, width: '100%', height: '100%' }}
      />
    </main>
  );
}

export default function PhDAtlasPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading private tracker…</main>}>
      <ProtectedAtlas />
    </Suspense>
  );
}
