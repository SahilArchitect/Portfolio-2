/**
 * URLs from the previous site. Each either redirects permanently to its
 * replacement or answers 410 Gone so search engines drop it.
 */
export type LegacyResult = { kind: 'redirect'; to: string } | { kind: 'gone' } | null;

const REDIRECTS: Record<string, string> = {
  '/work': '/research',
  '/work/encrypted-network-traffic-classification': '/research/encrypted-traffic-classification',
  '/writing': '/notes',
};

const GONE_EXACT = new Set([
  '/hire',
  '/now',
  '/traces',
  '/resume/ai-backend-engineer.pdf',
  '/work/stride',
  '/work/llm-gateway',
  '/work/lazarus-engine',
  '/work/car-brand-classification',
  '/work/covid-19-detection-chest-xrays',
  '/writing/rag-without-magic',
  '/writing/cost-visibility-for-llm-apps',
  '/writing/traces-that-teach',
]);

export function resolveLegacyPath(pathname: string): LegacyResult {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const target = REDIRECTS[path];
  if (target) return { kind: 'redirect', to: target };
  if (GONE_EXACT.has(path)) return { kind: 'gone' };
  // Anything else under the retired sections is gone too (e.g. /work/foo, /hire/thanks).
  if (/^\/(work|writing|hire|traces)\//.test(path)) return { kind: 'gone' };
  return null;
}
