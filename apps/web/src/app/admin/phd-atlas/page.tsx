import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { requireOwnerPage } from '@/lib/server/owner';

export const dynamic = 'force-dynamic';

export default async function PhDAtlasPage() {
  await requireOwnerPage();
  const html = await readFile(path.join(process.cwd(), 'src/phd-atlas/atlas.html'), 'utf8');
  return (
    <main style={{ margin: 0, padding: 0, width: '100%', height: '100dvh' }}>
      <iframe
        title="Private PhD Atlas 2027"
        srcDoc={html}
        style={{ display: 'block', border: 0, width: '100%', height: '100%' }}
      />
    </main>
  );
}
