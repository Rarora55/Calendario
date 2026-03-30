import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";

import { buildWeeklyReport } from "@/src/features/reports/weeklyReport";
import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function ReportsScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const tasks = useAppStore((state) => state.tasks);
  const workSessions = useAppStore((state) => state.workSessions);
  const { colors } = useAppTheme();
  const panHandlers = useTabSwipeNavigation();

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const report = useMemo(() => buildWeeklyReport(tasks, workSessions), [tasks, workSessions]);

  return (
    <View {...panHandlers} style={{ flex: 1, backgroundColor: colors.background, padding: 18, gap: 14 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>Reports</Text>
        <Text style={{ color: colors.textMuted }}>
          Weekly reporting is calculated locally from tasks and work sessions.
        </Text>
      </View>

      <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>
          Week {report.weekStartDate} to {report.weekEndDate}
        </Text>
        <Text style={{ color: colors.textMuted }}>Completed {report.completedPercentage}%</Text>
        <Text style={{ color: colors.textMuted }}>In Progress {report.inProgressPercentage}%</Text>
        <Text style={{ color: colors.textMuted }}>Not Completed {report.notCompletedPercentage}%</Text>
        <Text style={{ color: colors.textMuted }}>Completed Value {report.completedValueTotal}</Text>
        <Text style={{ color: colors.textMuted }}>Time Invested {Math.round(report.timeInvestedSeconds / 60)} minutes</Text>
      </View>
    </View>
  );
}
