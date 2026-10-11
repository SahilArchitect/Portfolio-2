import { buildExport, buildExportZip } from '@/lib/content/transfer';
import { getOwnerId } from '@/lib/server/owner';

export async function GET() {
  if (!(await getOwnerId())) return new Response('Unauthorized', { status: 401 });
  const zip = await buildExportZip(await buildExport());
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="bysahil-export-${stamp}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
