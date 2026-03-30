import { expect, test } from "@playwright/test";

import { gotoApp, seedLegacyTaskData } from "./swipe-delete-timer.helpers";

test("timer requires explicit task selection before start", async ({ page }) => {
  await seedLegacyTaskData(page);
  await gotoApp(page);

  await page.getByText("Timer").click();
  await expect(page.getByText("Choose a task below before starting the timer.")).toBeVisible();
  await page.getByLabel("Start selected timer").click();
  await expect(page.getByText("Select a task before starting the timer.")).toBeVisible();

  await page.getByLabel("Select Prepare sprint summary").click();
  await page.getByLabel("Start selected timer").click();

  await expect(page.getByText("Stop Active Timer")).toBeVisible();
  await expect(page.getByText("Tracking Prepare sprint summary")).toBeVisible();
});
