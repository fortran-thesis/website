/**
 * Typed API Client
 *
 * A thin wrapper around `fetch()` that:
 *   - Always routes through the Next.js proxy (`/api/v1/...`)
 *   - Includes credentials (session cookie)
 *   - Parses JSON & normalises errors
 *   - Works as the default SWR fetcher
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public info: ApiResponse,
    public retryAfterMs: number | null = null,
  ) {
    super(info.error ?? info.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

function parseRetryAfterMs(res: Response): number | null {
  const retryAfter = res.headers.get('Retry-After');
  if (!retryAfter) return null;

  const seconds = Number(retryAfter);
  if (!Number.isNaN(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const retryDate = Date.parse(retryAfter);
  if (Number.isNaN(retryDate)) return null;
  return Math.max(0, retryDate - Date.now());
}

/* ------------------------------------------------------------------ */
/*  Fetcher                                                            */
/* ------------------------------------------------------------------ */

/**
 * Default fetcher for SWR.
 * Accepts a URL string (relative to origin, e.g. `/api/v1/users`).
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });

  const text = await res.text();
  let json: ApiResponse<T>;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { success: false, data: text as unknown as T };
  }

  if (!res.ok) {
    throw new ApiError(res.status, json as ApiResponse, parseRetryAfterMs(res));
  }

  return json as unknown as T;
}

/* ------------------------------------------------------------------ */
/*  Mutation helpers                                                    */
/* ------------------------------------------------------------------ */

interface MutateOptions {
  method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  formData?: FormData;
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('csrfToken='));
  if (!match) return null;
  const [, value] = match.split('=');
  return value ? decodeURIComponent(value) : null;
}

/**
 * Execute a mutation (POST / PATCH / PUT / DELETE) through the proxy.
 *
 * ```ts
 * const result = await apiMutate('/api/v1/mycologists', { method: 'POST', body: { email } });
 * ```
 */
export async function apiMutate<T = unknown>(
  url: string,
  opts: MutateOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'POST', body, formData } = opts;

  const headers: Record<string, string> = {};
  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  let fetchBody: BodyInit | undefined;

  if (formData) {
    // Let the browser set the multipart boundary
    fetchBody = formData;
    headers['Accept'] = 'application/json';
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  } else {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers,
    body: fetchBody,
  });

  const text = await res.text();
  let json: ApiResponse<T>;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { success: false, data: text as unknown as T };
  }

  if (!res.ok) {
    throw new ApiError(res.status, json as ApiResponse, parseRetryAfterMs(res));
  }

  return json;
}

/* ------------------------------------------------------------------ */
/*  URL builder helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * Build a URL with query parameters, stripping `undefined`/`null` values.
 *
 * ```ts
 * apiUrl('/api/v1/users', { limit: 10, pageToken: undefined })
 * // → "/api/v1/users?limit=10"
 * ```
 */
export function apiUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return path;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      sp.set(k, String(v));
    }
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}
