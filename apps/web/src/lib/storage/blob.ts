import { del, put } from '@vercel/blob';

import type { StorageDriver } from './index';

export const blobDriver: StorageDriver = {
  async put(pathname, body, contentType) {
    const result = await put(pathname, body, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url: result.url, pathname: result.pathname };
  },
  async delete(pathname) {
    await del(pathname);
  },
  async read(url) {
    const response = await fetch(url);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  },
};
