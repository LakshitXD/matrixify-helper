import { NextResponse } from "next/server";

const MAX_URLS = 500;
const TIMEOUT_MS = 5000;

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type ImageCheckResult = {
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string;
  error?: string;
};

async function checkUrl(url: string): Promise<ImageCheckResult> {
  const trimmed = url.trim();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res = await fetch(trimmed, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    if (res.status === 405) {
      clearTimeout(timeout);
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), TIMEOUT_MS);
      res = await fetch(trimmed, {
        method: "GET",
        signal: getController.signal,
        redirect: "follow",
      });
      clearTimeout(getTimeout);
    } else {
      clearTimeout(timeout);
    }
    const contentType = res.headers.get("content-type") ?? undefined;
    return {
      url: trimmed,
      ok: res.ok,
      status: res.status,
      contentType,
    };
  } catch (err) {
    return {
      url: trimmed,
      ok: false,
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}

export async function POST(request: Request) {
  let body: { urls?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const urls = Array.isArray(body?.urls) ? body.urls : [];
  if (urls.length > MAX_URLS) {
    return NextResponse.json(
      { error: `Too many URLs. Maximum ${MAX_URLS} per request.` },
      { status: 400 }
    );
  }

  const validUrls = urls.filter((u) => typeof u === "string" && isValidUrl(u));
  const results = await Promise.all(validUrls.map((u) => checkUrl(u)));

  return NextResponse.json({ results });
}
