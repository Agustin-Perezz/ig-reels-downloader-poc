import { z } from "zod";

export enum InstagramMediaType {
  Video = "video",
  Photo = "photo",
  Story = "story",
}

const VIDEO_PATHS = "p|tv|reel|reels";

export const videoUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .url("Must be a valid URL")
  .regex(
    new RegExp(
      `^https?://(www\\.)?instagram\\.com/(?:${VIDEO_PATHS})/[^/]+`,
      "i",
    ),
    "Must be an Instagram video, reel, or IGTV URL",
  );

export const photoUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .url("Must be a valid URL")
  .regex(
    /^https?:\/\/(www\.)?instagram\.com\/p\/[^/]+/i,
    "Must be an Instagram photo post URL",
  );

export const storyUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .url("Must be a valid URL")
  .regex(
    /^https?:\/\/(www\.)?instagram\.com\/stories\/[^/?#]+(\/\d+)?/i,
    "Must be an Instagram story URL",
  );

export const imageProxySrcSchema = z
  .string()
  .min(1, "Source is required")
  .url("Must be a valid URL");

export type VideoUrl = z.infer<typeof videoUrlSchema>;
export type PhotoUrl = z.infer<typeof photoUrlSchema>;
export type StoryUrl = z.infer<typeof storyUrlSchema>;

export const reelUrlSchema = videoUrlSchema;
export type ReelUrl = VideoUrl;
