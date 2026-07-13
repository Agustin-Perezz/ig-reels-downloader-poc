import { videoUrlSchema } from "@/lib/validators";
import { downloadAndZipVideos, fetchMediaInfo, streamReel } from "@/lib/yt-dlp";

const VIDEO_CONTENT_TYPE = "video/mp4";
const ZIP_CONTENT_TYPE = "application/zip";

type DownloadBody = {
  url?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let body: DownloadBody;
  try {
    body = (await request.json()) as DownloadBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = videoUrlSchema.safeParse(body.url);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid URL" },
      { status: 400 },
    );
  }

  const url = parsed.data;
  const info = await fetchMediaInfo(url);
  if (!info.ok) {
    return Response.json({ error: info.error.message }, { status: 500 });
  }

  const timestamp = Date.now();

  if (info.data.isPlaylist && info.data.entryCount > 1) {
    const zip = await downloadAndZipVideos(url);
    if (!zip.ok) {
      return Response.json({ error: zip.error.message }, { status: 500 });
    }
    return new Response(zip.data.stream, {
      headers: {
        "Content-Type": ZIP_CONTENT_TYPE,
        "Content-Disposition": `attachment; filename="instagram-${timestamp}.zip"`,
      },
    });
  }

  const result = await streamReel(url);
  if (!result.ok) {
    return Response.json({ error: result.error.message }, { status: 500 });
  }

  const filename = `instagram-${timestamp}.mp4`;

  return new Response(result.data.stream, {
    headers: {
      "Content-Type": VIDEO_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
