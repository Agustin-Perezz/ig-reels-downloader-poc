import { expect, test } from "@playwright/test";

test("home page loads and shows heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toContainText("IG Reels Downloader");
});
