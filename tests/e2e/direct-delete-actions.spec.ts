import { expect, test } from "@playwright/test";

import { acceptNextDialog, gotoApp, seedLegacyTaskData } from "./swipe-delete-timer.helpers";

test("deletes a task from TIMER after confirmation", async ({ page }) => {
  await seedLegacyTaskData(page);
  await gotoApp(page);

  await page.getByText("Timer").click();
  await expect(page.getByText("Prepare sprint summary")).toBeVisible();

  await acceptNextDialog(page);
  await page.getByLabel("Delete Prepare sprint summary").click();

  await expect(page.getByText("Prepare sprint summary")).toHaveCount(0);
});

test("deletes a task group from GENERAL after confirmation", async ({ page }) => {
  await seedLegacyTaskData(page);
  await gotoApp(page);

  await expect(page.getByText("Client Work")).toBeVisible();

  await acceptNextDialog(page);
  await page.getByLabel("Delete group Client Work").click();

  await expect(page.getByText("Client Work")).toHaveCount(0);
});
