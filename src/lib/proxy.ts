/**
 * Shared Proxy Utility
 *
 * Centralizes the boilerplate that every Next.js API route handler repeats:
 *   1. Extract the session cookie
 *   2. Build the upstream URL (with optional query-param forwarding)
 *   3. Fetch the backend
 *   4. Parse the JSON response
 *   5. Optionally forward Set-Cookie headers
 *   6. Return a NextResponse
 *
 * Usage examples:
 *
 *   // Simple authenticated GET proxy
 *   export const GET = createProxyHandler({ upstream: '/mold-report/unassigned' });
 *
 *   // Public (no auth) GET proxy
 *   export const GET = createProxyHandler({ upstream: '/faq', auth: false });
 *
 *   // With query-param forwarding
 *   export const GET = createProxyHandler({
 *     upstream: '/user/search',
 *     forwardSearchParams: true,
 *   });
 *
 *   // Dynamic route with path params
 *   export const GET = createProxyHandler({
 *     upstream: (params) => `/mold-report/${params.id}`,
 *   });
 */

import { NextRequest, NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProxyHandlerOptions {
  /**
   * The upstream path to proxy to.
   * - String: static path appended to `envOptions.apiUrl`
   * - Function: receives resolved route params and returns the path
   */
  upstream: string | ((params: Record<string, string>) => string);

  /** HTTP method to use for the upstream request (defaults to the incoming method). */
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

  /** Whether the endpoint requires authentication (default: true). */
  auth?: boolean;

  /** Whether to forward all incoming query/search params to the upstream URL (default: false). */
  forwardSearchParams?: boolean;

  /** Explicit list of query params to forward (takes precedence over forwardSearchParams). */
  forwardParams?: string[];

  /** Whether to forward Set-Cookie headers from the backend response (default: false). */
  forwardCookies?: boolean;

  /** Fetch cache strategy (default: 'no-store'). */
  cache?: RequestCache;

  /**
   * Whether the request body is FormData rather than JSON.
   * When true the proxy will NOT set Content-Type (lets the browser boundary through)
   * and will stream the raw body to the upstream.
   */
  formData?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Safely parse a JSON response, falling back to an object wrapping the raw text.
 */
function parseResponseText(text: string): Record<string, unknown> {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { data: text };
  }
}

/**
 * Strip the `Domain` attribute from a `Set-Cookie` header so the cookie is
 * scoped to the current origin (important for localhost / Vercel previews).
 */
function sanitizeSetCookie(raw: string): string {
  const parts = raw.split(';').map((p) => p.trim()).filter(Boolean);
  const nameValue = parts[0];
  const attrs = parts.slice(1).filter((p) => !p.toLowerCase().startsWith('domain='));

  if (!attrs.some((a) => a.toLowerCase().startsWith('path='))) attrs.push('Path=/');
  if (!attrs.some((a) => a.toLowerCase().startsWith('samesite='))) attrs.push('SameSite=Lax');

  return `${nameValue}; ${attrs.join('; ')}`;
}

/* ------------------------------------------------------------------ */
/*  Core proxy function                                                */
/* ------------------------------------------------------------------ */

/**
 * Execute a single proxy request to the backend and return a `NextResponse`.
 *
 * This is the low-level function used by `createProxyHandler` but can also be
 * called directly when you need custom pre/post-processing.
 */
export async function proxyFetch(
  req: NextRequest,
  opts: ProxyHandlerOptions & {
    /** Already-resolved route params (for dynamic segments). */
    resolvedParams?: Record<string, string>;
    /** Override body (for POST/PATCH/PUT). */
    body?: BodyInit | null;
  },
): Promise<NextResponse> {
  const {
    upstream,
    method,
    auth = true,
    forwardSearchParams = false,
    forwardParams,
    forwardCookies = false,
    cache = 'no-store',
    formData = false,
    resolvedParams = {},
    body,
  } = opts;

  // --- Auth check -----------------------------------------------------------
  const sessionCookie = req.cookies.get('session')?.value;

  if (auth && !sessionCookie) {
    return NextResponse.json(
      { success: false, error: 'Missing session' },
      { status: 403 },
    );
  }

  // --- Build upstream URL ----------------------------------------------------
  const upstreamPath = typeof upstream === 'function' ? upstream(resolvedParams) : upstream;
  const upstreamUrl = new URL(`${envOptions.apiUrl}${upstreamPath}`);

  // Forward query params
  if (forwardParams) {
    for (const key of forwardParams) {
      const val = req.nextUrl.searchParams.get(key);
      if (val !== null) upstreamUrl.searchParams.set(key, val);
    }
  } else if (forwardSearchParams) {
    req.nextUrl.searchParams.forEach((v, k) => {
      upstreamUrl.searchParams.set(k, v);
    });
  }

  // --- Build headers ---------------------------------------------------------
  const headers: Record<string, string> = {};

  if (!formData) {
    headers['Content-Type'] = 'application/json';
  }

  if (sessionCookie) {
    headers['Cookie'] = `session=${sessionCookie}`;
  }

  // For FormData: forward original Content-Type so multipart boundary is preserved
  if (formData) {
    const ct = req.headers.get('content-type');
    if (ct) headers['Content-Type'] = ct;
    headers['Accept'] = 'application/json';
  }

  // --- Determine body --------------------------------------------------------
  const httpMethod = (method ?? req.method) as string;
  let fetchBody: BodyInit | null | undefined = body ?? undefined;

  if (fetchBody === undefined && ['POST', 'PATCH', 'PUT'].includes(httpMethod)) {
    if (formData) {
      // Stream raw body for multipart
      fetchBody = req.body as ReadableStream;
    } else {
      try {
        const json = await req.json();
        fetchBody = JSON.stringify(json);
      } catch {
        fetchBody = undefined;
      }
    }
  }

  // --- Execute upstream fetch ------------------------------------------------
  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: httpMethod,
      headers,
      body: fetchBody,
      cache,
      // @ts-ignore duplex is required for streaming bodies in Node 18+
      ...(formData ? { duplex: 'half' } : {}),
    });

    const text = await upstreamRes.text();
    const payload = parseResponseText(text);

    // --- Build response -------------------------------------------------------
    const res = NextResponse.json(payload, { status: upstreamRes.status });

    // Forward Set-Cookie if requested
    if (forwardCookies) {
      const backendCookie =
        upstreamRes.headers.get('set-cookie') ?? upstreamRes.headers.get('Set-Cookie');
      if (backendCookie) {
        res.headers.set('Set-Cookie', sanitizeSetCookie(backendCookie));
      }
    }

    return res;
  } catch (error) {
    console.error(`Proxy error [${httpMethod} ${upstreamPath}]:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Factory: createProxyHandler                                        */
/* ------------------------------------------------------------------ */

type RouteContext = { params: Promise<Record<string, string>> };

/**
 * Create a Next.js route handler that proxies requests to the backend.
 *
 * Returns an `async function(req, context)` compatible with the Next.js
 * App Router route handler signature.
 */
export function createProxyHandler(opts: ProxyHandlerOptions) {
  return async function handler(
    req: NextRequest,
    context: RouteContext,
  ): Promise<NextResponse> {
    const resolvedParams = context?.params ? await context.params : {};
    return proxyFetch(req, { ...opts, resolvedParams });
  };
}
