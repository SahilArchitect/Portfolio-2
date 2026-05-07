/**
 * Server-side API helper. Attaches ADMIN_TOKEN; never import this from a client component.
 */

const API_BASE_URL =
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '';

export type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export type ActionResult = {
  ok: boolean;
  message: string;
};

export async function adminFetch(path: string, options: FetchOptions = {}) {
  const { headers = {}, body, ...rest } = options;
  const contentHeaders: Record<string, string> = body instanceof FormData ? {} : { 'Content-Type': 'application/json' };

  return fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    ...rest,
    body,
    headers: {
      ...contentHeaders,
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...headers,
    },
  });
}

export async function adminGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await adminFetch(path);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function adminCollection<T>(path: string, fallback: T[]): Promise<T[]> {
  try {
    const res = await adminFetch(path);
    if (!res.ok) return fallback;
    const data = (await res.json()) as unknown;
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (Array.isArray(record.items)) return record.items as T[];
      if (Array.isArray(record.data)) return record.data as T[];
      if (Array.isArray(record.results)) return record.results as T[];
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function adminMutation(
  path: string,
  options: FetchOptions,
  successMessage: string,
): Promise<ActionResult> {
  try {
    const res = await adminFetch(path, options);
    if (!res.ok) {
      const detail = await readError(res);
      return { ok: false, message: detail ?? `API returned ${res.status}` };
    }
    return { ok: true, message: successMessage };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Request failed.',
    };
  }
}

async function readError(res: Response) {
  try {
    const body = (await res.json()) as { detail?: unknown; message?: unknown };
    const detail = body.detail ?? body.message;
    return typeof detail === 'string' ? detail : JSON.stringify(detail);
  } catch {
    return null;
  }
}
