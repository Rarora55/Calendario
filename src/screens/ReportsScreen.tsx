import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";

import { buildWeeklyReport } from "@/src/features/reports/weeklyReport";
import { useAppStore } from "@/src/state/store";

export default function ReportsScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const tasks = useAppStore((state) => state.tasks);
  const workSessions = useAppStore((state) => state.workSessions);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const report = useMemo(() => buildWeeklyReport(tasks, workSessions), [tasks, workSessions]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff9f2", padding: 18, gap: 14 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#35291f" }}>Reports</Text>
        <Text style={{ color: "#6c5a4c" }}>
          Weekly reporting is calculated locally from tasks and work sessions.
        </Text>
      </View>

      <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#dfd2c4", gap: 8 }}>
        <Text style={{ color: "#35291f", fontWeight: "700" }}>
          Week {report.weekStartDate} to {report.weekEndDate}
        </Text>
        <Text style={{ color: "#6c5a4c" }}>Completed {report.completedPercentage}%</Text>
        <Text style={{ color: "#6c5a4c" }}>In Progress {report.inProgressPercentage}%</Text>
        <Text style={{ color: "#6c5a4c" }}>Not Completed {report.notCompletedPercentage}%</Text>
        <Text style={{ color: "#6c5a4c" }}>Completed Value {report.completedValueTotal}</Text>
        <Text style={{ color: "#6c5a4c" }}>Time Invested {Math.round(report.timeInvestedSeconds / 60)} minutes</Text>
      </View>
    </View>
  );
}
