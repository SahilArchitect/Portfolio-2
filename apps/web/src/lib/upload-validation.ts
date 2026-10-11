import { imageSize } from 'image-size';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_JSON_BYTES = 1024 * 1024;

export type SniffedFile =
  | {
      ok: true;
      contentType: string;
      extension: 'png' | 'jpg' | 'webp' | 'pdf' | 'json';
      width?: number;
      height?: number;
    }
  | { ok: false; error: string };

function startsWith(buf: Uint8Array, bytes: number[], offset = 0) {
  return bytes.every((b, i) => buf[offset + i] === b);
}

/**
 * Decides the file type from its bytes, never from the client's name or MIME
 * type. Allowed: PNG, JPEG, WebP, PDF and JSON. SVG is rejected outright
 * (it can carry script); so is anything else.
 */
export function sniffUpload(buf: Uint8Array, allowed: readonly string[]): SniffedFile {
  if (buf.byteLength === 0) return { ok: false, error: 'The file is empty' };
  if (buf.byteLength > MAX_UPLOAD_BYTES)
    return { ok: false, error: 'Files must be 4 MB or smaller' };

  let result: SniffedFile = {
    ok: false,
    error: 'Unsupported file type (allowed: PNG, JPEG, WebP, PDF, JSON)',
  };
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    result = { ok: true, contentType: 'image/png', extension: 'png' };
  } else if (startsWith(buf, [0xff, 0xd8, 0xff])) {
    result = { ok: true, contentType: 'image/jpeg', extension: 'jpg' };
  } else if (
    startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    result = { ok: true, contentType: 'image/webp', extension: 'webp' };
  } else if (startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    result = { ok: true, contentType: 'application/pdf', extension: 'pdf' };
  } else {
    const text = new TextDecoder('utf-8', { fatal: false })
      .decode(buf.subarray(0, 512))
      .trimStart();
    if (/^<(\?xml|svg|!doctype|html)/i.test(text))
      return { ok: false, error: 'SVG/HTML uploads are not allowed' };
    if (text.startsWith('{') || text.startsWith('[')) {
      if (buf.byteLength > MAX_JSON_BYTES)
        return { ok: false, error: 'JSON files must be 1 MB or smaller' };
      try {
        JSON.parse(new TextDecoder().decode(buf));
        result = { ok: true, contentType: 'application/json', extension: 'json' };
      } catch {
        return { ok: false, error: 'The JSON file does not parse' };
      }
    }
  }
  if (!result.ok) return result;
  if (!allowed.includes(result.extension)) {
    return { ok: false, error: `Only ${allowed.join(', ').toUpperCase()} files are accepted here` };
  }
  if (result.contentType.startsWith('image/')) {
    try {
      const dims = imageSize(buf);
      if (!dims.width || !dims.height)
        return { ok: false, error: 'Could not read image dimensions' };
      return { ...result, width: dims.width, height: dims.height };
    } catch {
      return { ok: false, error: 'The image appears to be corrupt' };
    }
  }
  return result;
}
