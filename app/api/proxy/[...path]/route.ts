import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://34.47.73.100:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path, "DELETE");
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string,
) {
  const pathStr = path.join("/");
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/${pathStr}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authorization = request.headers.get("authorization");
  if (authorization) headers["Authorization"] = authorization;

  const body =
    method !== "GET" && method !== "DELETE" ? await request.text() : undefined;

  const response = await fetch(url, { method, headers, body });

  const text = await response.text();
  return new NextResponse(text || null, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
