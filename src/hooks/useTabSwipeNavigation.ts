import { Href, usePathname, useRouter } from "expo-router";
import { useMemo } from "react";
import { PanResponder } from "react-native";

const TAB_ROUTES = [
  "/tabs",
  "/tabs/calendars",
  "/tabs/priorities",
  "/tabs/bin",
  "/tabs/settings",
] as const;

type TabRoute = (typeof TAB_ROUTES)[number];

const DISTANCE_THRESHOLD = 48;
const VELOCITY_THRESHOLD = 0.25;
const AXIS_LOCK_DISTANCE = 12;
const HORIZONTAL_DOMINANCE_RATIO = 1.2;

function normalizeTabPath(pathname: string): TabRoute | null {
  const cleaned = pathname.replace(/\/+$/, "");

  if (cleaned === "/tabs" || cleaned === "/tabs/index") {
    return "/tabs";
  }

  if (TAB_ROUTES.includes(cleaned as TabRoute)) {
    return cleaned as TabRoute;
  }

  return null;
}

function getTargetRoute(current: TabRoute, dx: number, vx: number): TabRoute | null {
  const index = TAB_ROUTES.indexOf(current);
  const wantsNext = dx <= -DISTANCE_THRESHOLD || vx <= -VELOCITY_THRESHOLD;
  const wantsPrevious = dx >= DISTANCE_THRESHOLD || vx >= VELOCITY_THRESHOLD;

  if (wantsNext && index < TAB_ROUTES.length - 1) {
    return TAB_ROUTES[index + 1];
  }

  if (wantsPrevious && index > 0) {
    return TAB_ROUTES[index - 1];
  }

  return null;
}

export function useTabSwipeNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return useMemo(() => {
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const absDx = Math.abs(gestureState.dx);
        const absDy = Math.abs(gestureState.dy);
        return (
          absDx > AXIS_LOCK_DISTANCE &&
          absDx > absDy * HORIZONTAL_DOMINANCE_RATIO
        );
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const absDx = Math.abs(gestureState.dx);
        const absDy = Math.abs(gestureState.dy);
        return (
          absDx > AXIS_LOCK_DISTANCE &&
          absDx > absDy * HORIZONTAL_DOMINANCE_RATIO
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const current = normalizeTabPath(pathname);
        if (!current) return;

        const target = getTargetRoute(
          current,
          gestureState.dx,
          gestureState.vx
        );

        if (!target || target === current) {
          return;
        }

        router.navigate(target as Href);
      },
    });

    return panResponder.panHandlers;
  }, [pathname, router]);
}
