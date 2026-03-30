import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { getMonthTaskCounts } from "@/src/features/calendar/monthCounts";
import { useAppStore } from "@/src/state/store";

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

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const counts = useMemo(() => getMonthTaskCounts(tasks, monthDate), [monthDate, tasks]);
  const matrix = useMemo(() => getMonthMatrix(monthDate), [monthDate]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff9f2", padding: 18, gap: 18 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable onPress={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}>
          <Text style={{ color: "#35291f", fontWeight: "700" }}>Prev</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#35291f" }}>
          {monthLabels[monthDate.getMonth()]} {monthDate.getFullYear()}
        </Text>
        <Pressable onPress={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}>
          <Text style={{ color: "#35291f", fontWeight: "700" }}>Next</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 12, borderWidth: 1, borderColor: "#dfd2c4" }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {dayLabels.map((label) => (
            <View key={label} style={{ width: "14.28%", paddingVertical: 6 }}>
              <Text style={{ textAlign: "center", color: "#6c5a4c", fontWeight: "700" }}>{label}</Text>
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
                    backgroundColor: count > 0 ? "#de8f6e" : "#f4ede4",
                  }}
                >
                  <Text style={{ color: count > 0 ? "#ffffff" : "#35291f", fontWeight: "700" }}>{date.getDate()}</Text>
                </View>
                <Text style={{ color: "#6c5a4c", fontSize: 12 }}>{count > 0 ? `${count} tasks` : ""}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
