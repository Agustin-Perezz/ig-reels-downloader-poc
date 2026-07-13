const INSTAGRAM_BASE_URL = "https://www.instagram.com/";
const GRAPHQL_ENDPOINT = "https://www.instagram.com/api/graphql";
const WEB_APP_ID = "936619743392459";
const POST_QUERY_DOC_ID = "27130156389949648";
const QUERY_NAME = "PolarisLoggedOutDesktopWWWPostRootContentQuery";

const ENCODING_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export type InstagramMediaTypeKind =
  | "GraphImage"
  | "GraphVideo"
  | "GraphSidecar";

export type InstagramImageVersion = {
  url: string;
  width: number;
  height: number;
};

export type InstagramProductMedia = {
  pk: string;
  __typename?: InstagramMediaTypeKind;
  is_video?: boolean;
  image_versions2?: {
    candidates: InstagramImageVersion[];
  };
  video_versions?: { url: string; width: number; height: number; id: string }[];
  carousel_media?: InstagramProductMedia[];
};

export type InstagramProductInfo = {
  pk: string;
  caption?: { text?: string };
  user?: { username?: string; full_name?: string; pk?: string };
  taken_at?: number;
  carousel_media?: InstagramProductMedia[];
  image_versions2?: {
    candidates: InstagramImageVersion[];
  };
  video_versions?: { url: string; width: number; height: number; id: string }[];
};

export type InstagramMediaResponse = {
  data?: {
    xig_polaris_media?: {
      if_not_gated_logged_out?: InstagramProductInfo | null;
    };
  };
};

function decodeBaseN(value: string, table: string): string {
  const base = BigInt(table.length);
  let result = BigInt(0);
  for (const char of value) {
    const index = table.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid character in value: ${char}`);
    }
    result = result * base + BigInt(index);
  }
  return result.toString();
}

export function shortcodeToMediaId(shortcode: string): string {
  const cleanCode = shortcode.length > 28 ? shortcode.slice(0, -28) : shortcode;
  return decodeBaseN(cleanCode, ENCODING_CHARS).toString();
}

function buildApiHeaders(
  lsdToken: string,
  csrfToken: string | null,
): Record<string, string> {
  return {
    "X-IG-App-ID": WEB_APP_ID,
    "X-ASBD-ID": "359341",
    "X-IG-WWW-Claim": "0",
    Origin: "https://www.instagram.com",
    Accept: "*/*",
    "X-FB-Friendly-Name": QUERY_NAME,
    "X-CSRFToken": csrfToken ?? "",
    "X-FB-LSD": lsdToken,
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

type SessionInit = {
  lsdToken: string;
  csrfToken: string | null;
};

export async function initInstagramSession(): Promise<SessionInit> {
  const response = await fetch(INSTAGRAM_BASE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Instagram homepage (status ${response.status})`,
    );
  }

  const html = await response.text();
  const setCookies = response.headers.getSetCookie?.() ?? [];
  const csrfCookie = setCookies.find((c) => c.startsWith("csrftoken="));
  const csrfToken = csrfCookie
    ? (csrfCookie.split("=")[1]?.split(";")[0] ?? null)
    : null;

  const lsdMatch = html.match(/\["LSD",\[\],\{"token":"([^"]+)"/);
  if (!lsdMatch?.[1]) {
    const eqmcMatch = html.match(
      /<script[^>]*id="__eqmc"[^>]*>(\{.+?\})<\/script>/,
    );
    if (eqmcMatch?.[1]) {
      try {
        const eqmc = JSON.parse(eqmcMatch[1]) as { l?: string };
        if (eqmc.l) {
          return { lsdToken: eqmc.l, csrfToken };
        }
      } catch {
        // fall through
      }
    }
    throw new Error("Failed to extract Instagram LSD token");
  }

  return { lsdToken: lsdMatch[1], csrfToken };
}

export async function fetchMediaGraphQL(
  shortcode: string,
): Promise<InstagramProductInfo> {
  const { lsdToken, csrfToken } = await initInstagramSession();
  const mediaId = shortcodeToMediaId(shortcode);

  const variables = JSON.stringify({ media_id: mediaId });
  const body = new URLSearchParams({
    lsd: lsdToken,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: QUERY_NAME,
    server_timestamps: "true",
    variables,
    doc_id: POST_QUERY_DOC_ID,
  });

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      ...buildApiHeaders(lsdToken, csrfToken),
      Referer: `https://www.instagram.com/p/${shortcode}/`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(
      `Instagram GraphQL request failed (status ${response.status})`,
    );
  }

  const json = (await response.json()) as InstagramMediaResponse;
  const productInfo = json.data?.xig_polaris_media?.if_not_gated_logged_out;

  if (!productInfo) {
    throw new Error(
      "Instagram returned empty media data. The post may be private, login-walled, or rate-limited.",
    );
  }

  return productInfo;
}
