import { describe, expect, it } from 'vitest';

import { sniffUpload } from '@/lib/upload-validation';

const PNG_1x1 = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  ),
);
const ALL = ['png', 'jpg', 'webp', 'pdf', 'json'] as const;

describe('upload validation', () => {
  it('detects PNG by magic bytes and reads dimensions', () => {
    expect(sniffUpload(PNG_1x1, ALL)).toEqual({
      ok: true,
      contentType: 'image/png',
      extension: 'png',
      width: 1,
      height: 1,
    });
  });

  it('rejects SVG and HTML regardless of claimed type', () => {
    for (const text of [
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      '<?xml version="1.0"?><svg/>',
      '<!doctype html><script></script>',
    ]) {
      const r = sniffUpload(new TextEncoder().encode(text), ALL);
      expect(r.ok).toBe(false);
    }
  });

  it('accepts PDFs and valid JSON, rejects broken JSON', () => {
    expect(sniffUpload(new TextEncoder().encode('%PDF-1.7\n...'), ALL)).toMatchObject({
      ok: true,
      extension: 'pdf',
    });
    expect(sniffUpload(new TextEncoder().encode('{"series":[]}'), ALL)).toMatchObject({
      ok: true,
      extension: 'json',
    });
    expect(sniffUpload(new TextEncoder().encode('{"series":'), ALL).ok).toBe(false);
  });

  it('enforces the allow-list per use', () => {
    expect(sniffUpload(PNG_1x1, ['pdf']).ok).toBe(false);
  });

  it('rejects empty and oversized files', () => {
    expect(sniffUpload(new Uint8Array(), ALL).ok).toBe(false);
    expect(sniffUpload(new Uint8Array(4 * 1024 * 1024 + 1), ALL).ok).toBe(false);
  });
});
