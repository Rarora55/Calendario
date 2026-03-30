import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAppStore } from "@/src/state/store";

export default function TimerScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const tasks = useAppStore((state) => state.tasks);
  const activeTimer = useAppStore((state) => state.activeTimer);
  const startTimer = useAppStore((state) => state.startTimer);
  const stopTimer = useAppStore((state) => state.stopTimer);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff9f2" }} contentContainerStyle={{ padding: 18, gap: 14 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#35291f" }}>Timer</Text>
        <Text style={{ color: "#6c5a4c" }}>
          Work-session persistence is available. Start on a task, then stop to write a session into the local database.
        </Text>
      </View>

      {activeTimer ? (
        <Pressable
          onPress={() => void stopTimer()}
          style={{ borderRadius: 18, backgroundColor: "#35291f", paddingVertical: 16, alignItems: "center" }}
        >
          <Text style={{ color: "#fff9f2", fontWeight: "700" }}>Stop Active Timer</Text>
        </Pressable>
      ) : null}

      {tasks.map((task) => (
        <View key={task.id} style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#dfd2c4", gap: 8 }}>
          <Text style={{ color: "#35291f", fontWeight: "700", fontSize: 18 }}>{task.title}</Text>
          <Text style={{ color: "#6c5a4c" }}>Worked {Math.round(task.workedTimeSeconds / 60)} minutes</Text>
          <Pressable
            onPress={() => startTimer(task.id)}
            style={{ borderRadius: 12, backgroundColor: "#de8f6e", paddingVertical: 10, alignItems: "center" }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>
              {activeTimer?.taskId === task.id ? "Running" : "Start Timer"}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
