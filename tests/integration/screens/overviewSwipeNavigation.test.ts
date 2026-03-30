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

describe("overview swipe navigation integration", () => {
  it("maps a full forward swipe sequence across the tab flow", () => {
    const current = normalizeTabPath("/tabs");
    const shouldHandle = shouldHandleHorizontalGesture(-70, 5);
    const target = shouldHandle && current ? getTargetRoute(current, -70, -0.5) : null;
    const nextTarget = target ? getTargetRoute(target, -70, -0.5) : null;
    const thirdTarget = nextTarget ? getTargetRoute(nextTarget, -70, -0.5) : null;

    expect(target).toBe("/tabs/calendars");
    expect(nextTarget).toBe("/tabs/priorities");
    expect(thirdTarget).toBe("/tabs/timer");
  });

  it("ignores vertical-dominant gestures in the combined flow", () => {
    const current = normalizeTabPath("/tabs");
    const shouldHandle = shouldHandleHorizontalGesture(20, 40);
    const target = shouldHandle && current ? getTargetRoute(current, 20, 0.1) : null;

    expect(target).toBeNull();
  });

  it("maps a backward swipe from the final tab toward the previous screen", () => {
    const current = normalizeTabPath("/tabs/settings");
    const shouldHandle = shouldHandleHorizontalGesture(70, 5);
    const target = shouldHandle && current ? getTargetRoute(current, 70, 0.5) : null;

    expect(target).toBe("/tabs/reports");
  });
});
