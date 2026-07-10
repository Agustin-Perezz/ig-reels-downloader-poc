import { z } from "zod";

export const reelUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .url("Must be a valid URL")
  .regex(
    /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[^/]+/i,
    "Must be an Instagram reel URL",
  );

export type ReelUrl = z.infer<typeof reelUrlSchema>;
