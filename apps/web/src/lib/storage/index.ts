import 'server-only';

import { randomBytes } from 'node:crypto';

import { blobDriver } from './blob';
import { localDriver } from './local';

export type StoredFile = { url: string; pathname: string };

export interface StorageDriver {
  put(pathname: string, body: Buffer, contentType: string): Promise<StoredFile>;
  delete(pathname: string): Promise<void>;
  read(url: string): Promise<Buffer | null>;
}

/** Vercel Blob when a token is configured, otherwise files on local disk (dev/test only). */
export function storage(): StorageDriver {
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobDriver;
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required in production');
  }
  return localDriver;
}

/** Random, non-guessable object name; the user never controls the path. */
export function randomObjectName(folder: 'uploads' | 'cv', extension: string): string {
  return `${folder}/${randomBytes(12).toString('base64url')}.${extension}`;
}
