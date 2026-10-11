import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { assets } from '@/db/schema';
import { getImageDims } from '@/lib/content/public';
import { bitflipDataSchema, type BitflipData } from '@/lib/markdown/bitflip';
import { renderMarkdown } from '@/lib/markdown/render';
import { getOwnerId } from '@/lib/server/owner';
import { storage } from '@/lib/storage';

/**
 * Live preview for the admin editor, using the public renderer. A route
 * handler rather than a server action so previews run in parallel with
 * autosaves (server actions from one client are queued). The proxy rejects
 * cross-origin POSTs to /api/admin/*.
 */
export async function POST(request: Request) {
  if (!(await getOwnerId())) return new Response('Unauthorized', { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    source?: unknown;
    headingOffset?: unknown;
  } | null;
  const source = typeof body?.source === 'string' ? body.source.slice(0, 200_000) : '';
  const headingOffset =
    typeof body?.headingOffset === 'number' ? Math.max(0, Math.min(3, body.headingOffset)) : 1;

  const { blocks } = await renderMarkdown(source, {
    headingOffset,
    imageDims: await getImageDims(),
  });

  // Read figure data straight from storage (uncached) so a fresh upload previews immediately.
  const figures: Record<string, BitflipData | null> = {};
  for (const block of blocks) {
    if (block.kind !== 'figure' || block.figure.data in figures) continue;
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.url, block.figure.data))
      .limit(1);
    const raw = asset?.contentType === 'application/json' ? await storage().read(asset.url) : null;
    let data: BitflipData | null = null;
    try {
      const parsed = raw ? bitflipDataSchema.safeParse(JSON.parse(raw.toString('utf8'))) : null;
      data = parsed?.success ? parsed.data : null;
    } catch {
      data = null;
    }
    figures[block.figure.data] = data;
  }
  return Response.json({ blocks, figures }, { headers: { 'Cache-Control': 'no-store' } });
}
