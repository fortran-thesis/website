import { NextResponse } from 'next/server';
import { envOptions } from '@/configs/envOptions';

const FALLBACK = { success: false, data: { resolvedCount: 0 } };
const RESOLVED_COUNT_REVALIDATE_SECONDS = 600;

export const revalidate = RESOLVED_COUNT_REVALIDATE_SECONDS;

/**
 * GET /api/v1/mold-reports/public/resolved-count
 * Public endpoint – extracts the `resolved` count from the statuses breakdown.
 * Returns 200 with `{ resolvedCount: 0 }` on any upstream failure.
 */
export async function GET() {
  try {
    const url = `${envOptions.apiUrl}/mold-report/counts/statuses`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const res = await fetch(url, {
      method: 'GET',
      headers,
      next: { revalidate: RESOLVED_COUNT_REVALIDATE_SECONDS },
    });

    if (res.status === 401) {
      return NextResponse.json(
        { ...FALLBACK, error: 'Authentication required for upstream' },
        {
          status: 200,
          headers: {
            'Cache-Control': `public, s-maxage=${RESOLVED_COUNT_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
          },
        },
      );
    }

    const payload = await res.json().catch(() => ({} as Record<string, any>));
    const data = payload?.data;
    if (data) {
      return NextResponse.json(
        {
          success: true,
          data: { resolvedCount: data.resolved || 0, ...data },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': `public, s-maxage=${RESOLVED_COUNT_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
          },
        },
      );
    }

    return NextResponse.json(
      { ...FALLBACK, error: 'Failed to fetch from upstream' },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${RESOLVED_COUNT_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
        },
      },
    );
  } catch {
    return NextResponse.json(
      { ...FALLBACK, error: 'Server error' },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${RESOLVED_COUNT_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
        },
      },
    );
  }
}
