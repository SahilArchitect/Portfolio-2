import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { StorageDriver } from './index';

/** Files live under .data/ and are served by /files/[...path]. Dev and tests only. */
export const LOCAL_ROOT = path.join(process.cwd(), '.data');

function resolveInside(pathname: string): string {
  const full = path.resolve(LOCAL_ROOT, pathname);
  if (!full.startsWith(LOCAL_ROOT + path.sep)) throw new Error('Invalid path');
  return full;
}

export const localDriver: StorageDriver = {
  async put(pathname, body) {
    const full = resolveInside(pathname);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body);
    return { url: `/files/${pathname}`, pathname };
  },
  async delete(pathname) {
    await rm(resolveInside(pathname), { force: true });
  },
  async read(url) {
    if (!url.startsWith('/files/')) return null;
    try {
      return await readFile(resolveInside(url.slice('/files/'.length)));
    } catch {
      return null;
    }
  },
};

export async function readLocalFile(pathname: string): Promise<Buffer | null> {
  try {
    return await readFile(resolveInside(pathname));
  } catch {
    return null;
  }
}
