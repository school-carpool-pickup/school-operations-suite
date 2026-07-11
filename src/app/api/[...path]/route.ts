/**
 * Catch-all API entry. Every `/api/<...>` request lands here and is handed
 * to `dispatch()`, which forwards it verbatim to the upstream backend.
 *
 * No per-endpoint code and no mock layer. To add a new endpoint, just call
 * it from the client; if the upstream backend has it, it works. If it
 * doesn't, the backend returns 404/501 and the page shows its empty /
 * not-connected state.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { dispatch, type HttpMethod } from '@/server/dispatch';

type RouteCtx = { params: Promise<{ path?: string[] }> };

async function handle(method: HttpMethod, req: NextRequest, ctx: RouteCtx) {
  const { path = [] } = await ctx.params;
  const fullPath = `/${path.join('/')}`;

  let body: unknown;
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = await req.json();
    } catch {
      body = undefined;
    }
  }

  const result = await dispatch({
    method,
    path: fullPath,
    query: req.nextUrl.searchParams,
    body,
    headers: req.headers,
  });

  // Null-body statuses (backend replies 204 on e.g. pickup complete/unmark).
  // `Response.json()` throws on these — "Response with null body status
  // cannot have body" — which surfaced as a 500 to the client even though
  // the upstream call had succeeded.
  if (result.status === 204 || result.status === 205 || result.status === 304) {
    return new NextResponse(null, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}

export const GET = (req: NextRequest, ctx: RouteCtx) => handle('GET', req, ctx);
export const POST = (req: NextRequest, ctx: RouteCtx) =>
  handle('POST', req, ctx);
export const PUT = (req: NextRequest, ctx: RouteCtx) => handle('PUT', req, ctx);
export const PATCH = (req: NextRequest, ctx: RouteCtx) =>
  handle('PATCH', req, ctx);
export const DELETE = (req: NextRequest, ctx: RouteCtx) =>
  handle('DELETE', req, ctx);
