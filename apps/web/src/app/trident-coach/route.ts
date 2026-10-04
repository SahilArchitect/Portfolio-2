import { analyze } from '@/lib/trident/coach.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const response = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET() {
  return response({ configured: Boolean(process.env.DEEPSEEK_API_KEY && process.env.TRIDENT_COACH_TOKEN), supportsPersonalKey: true });
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return response({ error: 'Use coaching from the Trident website.' }, 403);
    if (Number(request.headers.get('content-length')) > 500000) return response({ error: 'Review data is too large.' }, 413);
    const raw = await request.text();
    if (raw.length > 500000) return response({ error: 'Review data is too large.' }, 413);
    const result = await analyze(JSON.parse(raw), request.headers, process.env);
    return response(result);
  } catch (error) {
    const failure = error as Error & { status?: number };
    return response({ error: failure.status ? failure.message : 'The review could not be processed.' }, failure.status ?? 400);
  }
}
