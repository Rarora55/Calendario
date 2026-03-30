import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { getMonthTaskCounts } from "@/src/features/calendar/monthCounts";
import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthMatrix(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let index = 0; index < offset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const tasks = useAppStore((state) => state.tasks);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const { colors } = useAppTheme();
  const panHandlers = useTabSwipeNavigation();

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const counts = useMemo(() => getMonthTaskCounts(tasks, monthDate), [monthDate, tasks]);
  const matrix = useMemo(() => getMonthMatrix(monthDate), [monthDate]);

  return (
    <View {...panHandlers} style={{ flex: 1, backgroundColor: colors.background, padding: 18, gap: 18 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable onPress={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>Prev</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
          {monthLabels[monthDate.getMonth()]} {monthDate.getFullYear()}
        </Text>
        <Pressable onPress={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>Next</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 12, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {dayLabels.map((label, index) => (
            <View key={`day-label-${index}-${label}`} style={{ width: "14.28%", paddingVertical: 6 }}>
              <Text style={{ textAlign: "center", color: colors.textMuted, fontWeight: "700" }}>{label}</Text>
            </View>
          ))}
          {matrix.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={{ width: "14.28%", padding: 12 }} />;
            }

            const count = counts.get(dateKey(date)) ?? 0;
            return (
              <View key={date.toISOString()} style={{ width: "14.28%", padding: 8, alignItems: "center", gap: 4 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: count > 0 ? colors.primary : colors.surfaceMuted,
                  }}
                >
                  <Text style={{ color: count > 0 ? "#ffffff" : colors.text, fontWeight: "700" }}>{date.getDate()}</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{count > 0 ? `${count} tasks` : ""}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
