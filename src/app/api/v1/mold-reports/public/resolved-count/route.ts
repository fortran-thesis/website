import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envOptions } from '@/configs/envOptions';

// Public endpoint to get count of resolved mold reports
// No authentication required - for public landing page statistics
export async function GET(req: NextRequest) {
  try {
    const upstreamUrl = new URL(`${envOptions.apiUrl}/mold-report/counts/statuses`);
    
    // Try to get session if available, but don't fail if missing
    const sessionCookie = req.cookies.get('session')?.value;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie}`;
    }
    
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const text = await upstreamRes.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Failed to parse upstream response:', e);
      payload = {};
    }

    // If upstream is 401 (no auth), we can still return a default response
    if (upstreamRes.status === 401) {
      console.warn('⚠️ Upstream requires auth - returning default count');
      return NextResponse.json({
        success: false,
        data: { resolvedCount: 0 },
        error: 'Authentication required for upstream'
      }, { status: 200 }); // Return 200 so frontend doesn't error
    }

    if (upstreamRes.ok && payload.success && payload.data) {
      // Extract just the resolved count
      const resolvedCount = payload.data.resolved || 0;
      return NextResponse.json({
        success: true,
        data: {
          resolvedCount,
          ...payload.data // Include all other counts for reference
        }
      }, { status: 200 });
    }

    // If upstream failed but returned data, try to extract count
    if (payload.data) {
      const resolvedCount = payload.data.resolved || 0;
      return NextResponse.json({
        success: true,
        data: { resolvedCount, ...payload.data }
      }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, data: { resolvedCount: 0 }, error: 'Failed to fetch from upstream' },
      { status: 200 }
    );
  } catch (err) {
    console.error('GET /api/v1/mold-reports/public/resolved-count error', err);
    return NextResponse.json(
      { success: false, data: { resolvedCount: 0 }, error: 'Server error' },
      { status: 200 }
    );
  }
}
