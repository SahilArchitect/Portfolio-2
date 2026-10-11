import { describe, expect, it } from 'vitest';

import { resolveLegacyPath } from '@/lib/legacy-routes';

describe('legacy routes', () => {
  it('redirects the work index and thesis', () => {
    expect(resolveLegacyPath('/work')).toEqual({ kind: 'redirect', to: '/research' });
    expect(resolveLegacyPath('/work/')).toEqual({ kind: 'redirect', to: '/research' });
    expect(resolveLegacyPath('/work/encrypted-network-traffic-classification')).toEqual({
      kind: 'redirect',
      to: '/research/encrypted-traffic-classification',
    });
    expect(resolveLegacyPath('/writing')).toEqual({ kind: 'redirect', to: '/notes' });
  });

  it('answers 410 for removed projects, posts and pages', () => {
    for (const path of [
      '/work/stride',
      '/work/llm-gateway',
      '/work/lazarus-engine',
      '/work/car-brand-classification',
      '/work/covid-19-detection-chest-xrays',
      '/writing/rag-without-magic',
      '/hire',
      '/now',
      '/traces',
      '/resume/ai-backend-engineer.pdf',
      '/work/anything-else',
    ]) {
      expect(resolveLegacyPath(path), path).toEqual({ kind: 'gone' });
    }
  });

  it('leaves current routes alone', () => {
    for (const path of [
      '/',
      '/research',
      '/notes/x',
      '/trident/index.html',
      '/tracker',
      '/working',
    ]) {
      expect(resolveLegacyPath(path), path).toBeNull();
    }
  });
});
