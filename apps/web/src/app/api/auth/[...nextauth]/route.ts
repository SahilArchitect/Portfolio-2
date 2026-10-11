import type { NextRequest } from 'next/server';

import { handlers } from '@/auth';
import { clientIp, rateLimit } from '@/lib/server/rate-limit';

async function limited(request: NextRequest, handler: (req: NextRequest) => Promise<Response>) {
  const allowed = await rateLimit(`auth:${clientIp(request.headers)}`, 30, 10 * 60);
  if (!allowed) return new Response('Too many sign-in attempts. Try again later.', { status: 429 });
  return handler(request);
}

export const GET = (request: NextRequest) => limited(request, handlers.GET);
export const POST = (request: NextRequest) => limited(request, handlers.POST);
