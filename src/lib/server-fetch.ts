/**
 * Server-side Fetch Utility
 *
 * Used by React Server Components to fetch data directly from the
 * backend API, bypassing the Next.js proxy layer for better performance.
 *
 * Benefits over client-side SWR fetching:
 *   - No extra proxy hop (RSC → backend directly)
 *   - ISR caching via `next: { revalidate }` — shared across all users
 *   - Zero client-side JS for the fetch itself
 *
 * For public endpoints (FAQ, resolved-count, etc.) no cookie is needed.
 * For authenticated endpoints, pass the `session` cookie from `cookies()`.
 */

import { envOptions } from '@/configs/envOptions';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ServerApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ServerFetchOptions {
  /** ISR revalidation period in seconds. Defaults to 300 (5 min). Use `false` for no caching. */
  revalidate?: number | false;
  /** Cache tags for on-demand revalidation via `revalidateTag()`. */
  tags?: string[];
  /** Raw `Cookie` header value — pass for authenticated endpoints. */
  cookie?: string;
}

/* ------------------------------------------------------------------ */
/*  Core                                                               */
/* ------------------------------------------------------------------ */

/**
 * Fetch JSON from the backend API (server-side only).
 *
 * ```ts
 * // In a React Server Component:
 * import { serverFetch } from '@/lib/server-fetch';
 * import { endpoints } from '@/services/endpoints';
 *
 * const res = await serverFetch<PaginatedFaq>(endpoints.faq.list, { revalidate: 300 });
 * const faqs = res?.data?.snapshot ?? [];
 * ```
 */
export async function serverFetch<T = unknown>(
  endpoint: string,
  options?: ServerFetchOptions,
): Promise<ServerApiResponse<T> | null> {
  const { revalidate = 300, tags, cookie } = options ?? {};
  const url = `${envOptions.apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) headers['Cookie'] = cookie;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
      next: {
        revalidate: revalidate === false ? 0 : revalidate,
        ...(tags?.length ? { tags } : {}),
      },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as ServerApiResponse<T>;
    return json;
  } catch {
    return null;
  }
}
