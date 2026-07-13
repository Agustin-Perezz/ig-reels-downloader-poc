import {
  fetchMediaGraphQL,
  type InstagramImageVersion,
  type InstagramProductInfo,
  type InstagramProductMedia,
} from "./instagram-session";

export type ImageManifestItem = {
  id: string;
  filename: string;
  proxyUrl: string;
  width: number;
  height: number;
  thumbnailUrl: string;
};

export type ImageManifestResult = {
  images: ImageManifestItem[];
};

export type ImageManifestError = {
  message: string;
};

export type ImageManifestResponse =
  | { ok: true; data: ImageManifestResult }
  | { ok: false; error: ImageManifestError };

const PROXY_ENDPOINT = "/api/image-proxy?src=";

function extractShortcode(url: string): string | null {
  const match = /instagram\.com\/p\/([^/?#]+)/i.exec(url);
  return match?.[1] ?? null;
}

function pickBestImageVersion(
  candidates: InstagramImageVersion[],
): InstagramImageVersion | null {
  if (candidates.length === 0) {
    return null;
  }
  let best = candidates[0];
  for (const candidate of candidates) {
    if (candidate.width >= best.width && candidate.height >= best.height) {
      best = candidate;
    }
  }
  return best;
}

function buildProxyUrl(cdnUrl: string): string {
  return `${PROXY_ENDPOINT}${encodeURIComponent(cdnUrl)}`;
}

function buildManifestItem(
  media: InstagramProductMedia,
  shortcode: string,
  index: number,
): ImageManifestItem | null {
  const candidates = media.image_versions2?.candidates;
  if (!candidates || candidates.length === 0) {
    return null;
  }
  const best = pickBestImageVersion(candidates);
  if (!best) {
    return null;
  }
  const filename =
    index === 0
      ? `instagram-${shortcode}.jpg`
      : `instagram-${shortcode}-${index + 1}.jpg`;
  const thumbnail = candidates[candidates.length - 1];
  return {
    id: media.pk ?? `${shortcode}-${index}`,
    filename,
    proxyUrl: buildProxyUrl(best.url),
    width: best.width,
    height: best.height,
    thumbnailUrl: thumbnail.url,
  };
}

function isImagePost(productInfo: InstagramProductInfo): boolean {
  if (productInfo.carousel_media) {
    const hasImage = productInfo.carousel_media.some(
      (m) => !m.is_video && m.image_versions2?.candidates?.length,
    );
    return hasImage;
  }
  return (
    !productInfo.video_versions?.length &&
    Boolean(productInfo.image_versions2?.candidates?.length)
  );
}

export async function extractImageManifest(
  url: string,
): Promise<ImageManifestResponse> {
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

  if (!isImagePost(productInfo)) {
    return {
      ok: false,
      error: { message: "This post does not contain any downloadable images" },
    };
  }

  const images: ImageManifestItem[] = [];

  if (productInfo.carousel_media) {
    let idx = 0;
    for (const media of productInfo.carousel_media) {
      if (media.is_video) {
        continue;
      }
      const item = buildManifestItem(media, shortcode, idx);
      if (item) {
        images.push(item);
        idx++;
      }
    }
  } else {
    const item = buildManifestItem(productInfo, shortcode, 0);
    if (item) {
      images.push(item);
    }
  }

  if (images.length === 0) {
    return {
      ok: false,
      error: { message: "No image candidates found in this post" },
    };
  }

  return { ok: true, data: { images } };
}
