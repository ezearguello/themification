import { NextRequest, NextResponse } from 'next/server';

const FIGMA_API_BASE = 'https://api.figma.com';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const path = searchParams.get('path');
  const token = request.headers.get('x-figma-token');

  if (!path) {
    return NextResponse.json({ error: 'Missing path param' }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: 'Missing X-Figma-Token header' }, { status: 401 });
  }

  const url = `${FIGMA_API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      headers: { 'X-FIGMA-TOKEN': token },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy error' },
      { status: 500 },
    );
  }
}
