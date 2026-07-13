import { extractImageManifest } from "@/lib/instagram-image";
import { photoUrlSchema } from "@/lib/validators";

type DownloadImageBody = {
  url?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let body: DownloadImageBody;
  try {
    body = (await request.json()) as DownloadImageBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = photoUrlSchema.safeParse(body.url);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid URL" },
      { status: 400 },
    );
  }

  const result = await extractImageManifest(parsed.data);
  if (!result.ok) {
    const status = /private|login|rate-limit/i.test(result.error.message)
      ? 502
      : 500;
    return Response.json({ error: result.error.message }, { status });
  }

  return Response.json(result.data);
}
