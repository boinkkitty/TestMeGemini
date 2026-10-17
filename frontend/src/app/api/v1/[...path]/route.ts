import { NextRequest, NextResponse } from "next/server";

const configuredOrigin = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

function resolveBackendOrigin() {
  if (!configuredOrigin) {
    return "http://127.0.0.1:8000";
  }

  try {
    const url = new URL(configuredOrigin);
    if (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.port === "3000"
    ) {
      return "http://127.0.0.1:8000";
    }
    return url.origin;
  } catch {
    return "http://127.0.0.1:8000";
  }
}

const backendOrigin = resolveBackendOrigin();

async function proxy(request: NextRequest, path: string[]) {
  const upstreamUrl = new URL(`/api/v1/${path.join("/")}/`, backendOrigin);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstreamResponse = await fetch(upstreamUrl, init);
  const responseHeaders = new Headers(upstreamResponse.headers);

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}
