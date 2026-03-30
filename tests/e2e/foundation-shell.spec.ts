import { expect, test } from "@playwright/test";

test("foundation shell exposes the primary product tabs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("General")).toBeVisible();
  await expect(page.getByText("Calendar")).toBeVisible();
  await expect(page.getByText("Priority")).toBeVisible();
  await expect(page.getByText("Timer")).toBeVisible();
  await expect(page.getByText("Reports")).toBeVisible();
  await expect(page.getByText("Settings")).toBeVisible();
});
