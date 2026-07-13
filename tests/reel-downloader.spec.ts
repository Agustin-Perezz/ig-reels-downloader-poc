import { expect, test } from "@playwright/test";

test("rejects non-Instagram URL with an error message", async ({ page }) => {
  await page.goto("/");

  const input = page.getByPlaceholder("Insert instagram link here");
  const button = page.getByRole("button", { name: "Get video" });

  await input.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await button.click();

  await expect(
    page.getByText("Must be an Instagram video, reel, or IGTV URL"),
  ).toBeVisible();
});

test("paste button fills input from clipboard", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(async () => {
    await navigator.clipboard.writeText(
      "https://www.instagram.com/reel/CxNWBWlIAcp/",
    );
  });

  const pasteButton = page.getByRole("button", { name: "Paste" });
  await pasteButton.click();

  const input = page.getByPlaceholder("Insert instagram link here");
  await expect(input).toHaveValue(
    "https://www.instagram.com/reel/CxNWBWlIAcp/",
  );
});

test("switching to Photo chip changes the input placeholder", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Photo" }).click();

  await expect(
    page.getByPlaceholder("Insert instagram photo link here"),
  ).toBeVisible();
});

test("Story chip is disabled with a hint tooltip", async ({ page }) => {
  await page.goto("/");

  const storyButton = page.getByRole("button", { name: "Story" });
  await expect(storyButton).toBeDisabled();
  await expect(storyButton).toHaveAttribute(
    "title",
    "Requires Instagram login — coming soon",
  );
});
