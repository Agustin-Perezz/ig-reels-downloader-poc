import { expect, test } from "@playwright/test";

test("rejects non-Instagram URL with an error message", async ({ page }) => {
  await page.goto("/");

  const input = page.getByPlaceholder("https://www.instagram.com/reel/...");
  const button = page.getByRole("button", { name: "Download" });

  await input.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await button.click();

  await expect(page.getByText("Must be an Instagram reel URL")).toBeVisible();
});
