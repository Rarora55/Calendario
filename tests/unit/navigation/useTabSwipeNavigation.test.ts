jest.mock("expo-router", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("react-native", () => ({
  PanResponder: {
    create: jest.fn(),
  },
}));

import {
  getTargetRoute,
  normalizeTabPath,
  shouldHandleHorizontalGesture,
} from "@/src/hooks/useTabSwipeNavigation";

describe("useTabSwipeNavigation helpers", () => {
  it("normalizes every swipe-enabled tab route", () => {
    expect(normalizeTabPath("/tabs")).toBe("/tabs");
    expect(normalizeTabPath("/tabs/index")).toBe("/tabs");
    expect(normalizeTabPath("/tabs/calendars")).toBe("/tabs/calendars");
    expect(normalizeTabPath("/tabs/priorities")).toBe("/tabs/priorities");
    expect(normalizeTabPath("/tabs/timer")).toBe("/tabs/timer");
    expect(normalizeTabPath("/tabs/reports")).toBe("/tabs/reports");
    expect(normalizeTabPath("/tabs/settings")).toBe("/tabs/settings");
    expect(normalizeTabPath("/tabs/bin")).toBeNull();
  });

  it("requires horizontal-dominant gestures before handling swipe navigation", () => {
    expect(shouldHandleHorizontalGesture(60, 10)).toBe(true);
    expect(shouldHandleHorizontalGesture(20, 25)).toBe(false);
  });

  it("returns the adjacent tab route for valid swipe directions", () => {
    expect(getTargetRoute("/tabs", -60, -0.3)).toBe("/tabs/calendars");
    expect(getTargetRoute("/tabs/calendars", -60, -0.3)).toBe("/tabs/priorities");
    expect(getTargetRoute("/tabs/priorities", -60, -0.3)).toBe("/tabs/timer");
    expect(getTargetRoute("/tabs/timer", -60, -0.3)).toBe("/tabs/reports");
    expect(getTargetRoute("/tabs/reports", -60, -0.3)).toBe("/tabs/settings");
    expect(getTargetRoute("/tabs/settings", 60, 0.3)).toBe("/tabs/reports");
    expect(getTargetRoute("/tabs/calendars", 60, 0.3)).toBe("/tabs");
    expect(getTargetRoute("/tabs", 60, 0.3)).toBeNull();
  });
});
