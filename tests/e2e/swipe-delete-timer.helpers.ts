import type { Page } from "@playwright/test";

export async function gotoApp(page: Page) {
  await page.goto("/");
}

export async function seedLegacyTaskData(
  page: Page,
  overrides: Record<string, unknown> = {},
) {
  const defaultState = {
    calendars: [{ id: "calendar-1", name: "Client Work", color: "#de8f6e" }],
    events: [
      {
        id: "event-1",
        calendarId: "calendar-1",
        title: "Prepare sprint summary",
        description: "Review completed stories",
        priority: "alta",
        startISO: "2026-03-30T09:00:00.000Z",
        endISO: "2026-03-30T10:00:00.000Z",
      },
      {
        id: "event-2",
        calendarId: "calendar-1",
        title: "Draft client update",
        description: "Summarize blockers",
        priority: "media",
        startISO: "2026-03-31T09:00:00.000Z",
        endISO: "2026-03-31T10:00:00.000Z",
      },
    ],
    binEvents: [],
    ...overrides,
  };

  await page.addInitScript((state) => {
    window.localStorage.setItem("calendario:v1", JSON.stringify(state));
  }, defaultState);
}

export async function acceptNextDialog(page: Page) {
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
}

export async function dismissNextDialog(page: Page) {
  page.once("dialog", async (dialog) => {
    await dialog.dismiss();
  });
}

export async function swipeHorizontally(
  page: Page,
  {
    startX,
    endX,
    y,
  }: {
    startX: number;
    endX: number;
    y: number;
  },
) {
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 10 });
  await page.mouse.up();
}
