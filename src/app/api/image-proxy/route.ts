import { imageProxySrcSchema } from "@/lib/validators";

const ALLOWED_HOSTS = new Set([
  "scontent.cdninstagram.com",
  "scontent-iad3-1.cdninstagram.com",
  "scontent-iad3-2.cdninstagram.com",
  "video-iad3-1.cdninstagram.com",
  "video-iad3-2.cdninstagram.com",
  "scontent.cdninstagram.akadns.net",
]);

function isAllowedSource(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  if (ALLOWED_HOSTS.has(host)) {
    return true;
  }
  return host.endsWith(".cdninstagram.com") || host.endsWith(".fbcdn.net");
}

export async function GET(request: Request): Promise<Response> {
  const srcParam = new URL(request.url).searchParams.get("src");
  if (!srcParam) {
    return Response.json({ error: "Missing src parameter" }, { status: 400 });
  }

  const parsed = imageProxySrcSchema.safeParse(srcParam);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid source URL" },
      { status: 400 },
    );
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(parsed.data);
  } catch {
    return Response.json({ error: "Invalid source URL" }, { status: 400 });
  }

  if (!isAllowedSource(sourceUrl)) {
    return Response.json(
      { error: "Source domain is not allowed" },
      { status: 403 },
    );
  }

  const upstream = await fetch(parsed.data, {
    headers: { Referer: "https://www.instagram.com/" },
  });

  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { error: `Failed to fetch source (status ${upstream.status})` },
      { status: 502 },
    );
  }

  const contentType =
    upstream.headers.get("Content-Type") ?? "application/octet-stream";

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
