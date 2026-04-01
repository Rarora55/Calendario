import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { getMonthTaskCounts } from "@/src/features/calendar/monthCounts";
import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { useAppTranslation } from "@/src/i18n/useAppTranslation";
import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

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
  const { copy, locale } = useAppTranslation();
  const panHandlers = useTabSwipeNavigation();

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const counts = useMemo(() => getMonthTaskCounts(tasks, monthDate), [monthDate, tasks]);
  const matrix = useMemo(() => getMonthMatrix(monthDate), [monthDate]);
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(monthDate),
    [locale, monthDate],
  );
  const dayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    const monday = new Date(Date.UTC(2024, 0, 1));

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setUTCDate(monday.getUTCDate() + index);
      return formatter.format(date);
    });
  }, [locale]);

  return (
    <View {...panHandlers} style={{ flex: 1, backgroundColor: colors.background, padding: 18, gap: 18 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable onPress={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.calendar.previous}</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
          {monthLabel}
        </Text>
        <Pressable onPress={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.calendar.next}</Text>
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
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {count > 0 ? copy.calendar.taskCount(count) : ""}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
