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
  ) {
    super(info.error ?? info.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
  }
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
    throw new ApiError(res.status, json as ApiResponse);
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
    throw new ApiError(res.status, json as ApiResponse);
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
