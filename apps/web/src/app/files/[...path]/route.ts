import { readLocalFile } from '@/lib/storage/local';

const TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf',
  json: 'application/json',
};

/** Serves files from the local storage driver. Only active when Vercel Blob is not configured. */
export async function GET(_request: Request, { params }: RouteContext<'/files/[...path]'>) {
  if (process.env.BLOB_READ_WRITE_TOKEN) return new Response('Not found', { status: 404 });
  const { path } = await params;
  const pathname = path.join('/');
  if (!/^(uploads|cv)\/[A-Za-z0-9_-]+\.(png|jpg|webp|pdf|json)$/.test(pathname)) {
    return new Response('Not found', { status: 404 });
  }
  const body = await readLocalFile(pathname);
  if (!body) return new Response('Not found', { status: 404 });
  const ext = pathname.split('.').pop() ?? '';
  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
