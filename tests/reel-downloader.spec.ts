import { expect, test } from "@playwright/test";

test("rejects non-Instagram URL with an error message", async ({ page }) => {
  await page.goto("/");

  const input = page.getByPlaceholder("https://www.instagram.com/reel/...");
  const button = page.getByRole("button", { name: "Fetch Reel" });

  await input.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await button.click();

  await expect(page.getByText("Must be an Instagram reel URL")).toBeVisible();
});

test("paste button fills input from clipboard", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(async () => {
    await navigator.clipboard.writeText(
      "https://www.instagram.com/reel/CxNWBWlIAcp/",
    );
  });

  const pasteButton = page.getByRole("button", {
    name: "Paste URL from clipboard",
  });
  await pasteButton.click();

  const input = page.getByPlaceholder("https://www.instagram.com/reel/...");
  await expect(input).toHaveValue(
    "https://www.instagram.com/reel/CxNWBWlIAcp/",
  );
});
