import {
  fetchMediaGraphQL,
  type InstagramProductInfo,
  type InstagramProductMedia,
} from "./instagram-session";

export type VideoManifestItem = {
  id: string;
  filename: string;
  proxyUrl: string;
  width: number;
  height: number;
  thumbnailUrl: string;
};

export type VideoManifestResult = {
  videos: VideoManifestItem[];
};

export type VideoManifestError = {
  message: string;
};

export type VideoManifestResponse =
  | { ok: true; data: VideoManifestResult }
  | { ok: false; error: VideoManifestError };

const PROXY_ENDPOINT = "/api/image-proxy?src=";

type VideoVersion = {
  url: string;
  width: number;
  height: number;
  id: string;
};

function extractShortcode(url: string): string | null {
  const match = /instagram\.com\/(?:p|tv|reel|reels)\/([^/?#]+)/i.exec(url);
  return match?.[1] ?? null;
}

function pickBestVideoVersion(versions: VideoVersion[]): VideoVersion | null {
  if (versions.length === 0) {
    return null;
  }
  let best = versions[0];
  for (const version of versions) {
    if (version.width >= best.width && version.height >= best.height) {
      best = version;
    }
  }
  return best;
}

function buildProxyUrl(cdnUrl: string): string {
  return `${PROXY_ENDPOINT}${encodeURIComponent(cdnUrl)}`;
}

function pickThumbnail(media: InstagramProductMedia): string {
  const candidates = media.image_versions2?.candidates;
  if (!candidates || candidates.length === 0) {
    return "";
  }
  return candidates[candidates.length - 1].url;
}

function buildManifestItem(
  media: InstagramProductMedia,
  shortcode: string,
  index: number,
): VideoManifestItem | null {
  const versions = media.video_versions;
  if (!versions || versions.length === 0) {
    return null;
  }
  const best = pickBestVideoVersion(versions);
  if (!best) {
    return null;
  }
  const filename =
    index === 0
      ? `instagram-${shortcode}.mp4`
      : `instagram-${shortcode}-${index + 1}.mp4`;
  return {
    id: media.pk ?? `${shortcode}-${index}`,
    filename,
    proxyUrl: buildProxyUrl(best.url),
    width: best.width,
    height: best.height,
    thumbnailUrl: pickThumbnail(media),
  };
}

function isVideoPost(productInfo: InstagramProductInfo): boolean {
  if (productInfo.carousel_media) {
    return productInfo.carousel_media.some(
      (m) => m.is_video || Boolean(m.video_versions?.length),
    );
  }
  return Boolean(productInfo.video_versions?.length);
}

export async function extractVideoManifest(
  url: string,
): Promise<VideoManifestResponse> {
  const shortcode = extractShortcode(url);
  if (!shortcode) {
    return {
      ok: false,
      error: { message: "Could not extract shortcode from URL" },
    };
  }

  let productInfo: InstagramProductInfo;
  try {
    productInfo = await fetchMediaGraphQL(shortcode);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Instagram request failed";
    return { ok: false, error: { message } };
  }

  if (!isVideoPost(productInfo)) {
    return {
      ok: false,
      error: { message: "This post does not contain any downloadable videos" },
    };
  }

  const videos: VideoManifestItem[] = [];

  if (productInfo.carousel_media) {
    let idx = 0;
    for (const media of productInfo.carousel_media) {
      if (!media.is_video && !media.video_versions?.length) {
        continue;
      }
      const item = buildManifestItem(media, shortcode, idx);
      if (item) {
        videos.push(item);
        idx++;
      }
    }
  } else {
    const item = buildManifestItem(productInfo, shortcode, 0);
    if (item) {
      videos.push(item);
    }
  }

  if (videos.length === 0) {
    return {
      ok: false,
      error: { message: "No video versions found in this post" },
    };
  }

  return { ok: true, data: { videos } };
}
