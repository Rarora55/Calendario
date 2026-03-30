import { expect, test } from "@playwright/test";

import { gotoApp, seedLegacyTaskData, swipeHorizontally } from "./swipe-delete-timer.helpers";

test("swipes across the full tab flow", async ({ page }) => {
  await seedLegacyTaskData(page);
  await gotoApp(page);

  await expect(page.getByText("General")).toBeVisible();

  await swipeHorizontally(page, { startX: 320, endX: 40, y: 300 });
  await expect(page.getByText("March 2026")).toBeVisible();

  await swipeHorizontally(page, { startX: 320, endX: 40, y: 300 });
  await expect(page.getByText("Priority")).toBeVisible();

  await swipeHorizontally(page, { startX: 320, endX: 40, y: 300 });
  await expect(page.getByText("Timer")).toBeVisible();

  await swipeHorizontally(page, { startX: 320, endX: 40, y: 300 });
  await expect(page.getByText("Reports")).toBeVisible();

  await swipeHorizontally(page, { startX: 320, endX: 40, y: 300 });
  await expect(page.getByText("Settings")).toBeVisible();
});
