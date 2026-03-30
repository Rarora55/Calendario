import { Text, View } from "react-native";

import { useAppTheme } from "@/src/theme/useAppTheme";

export default function BinScreen() {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", textAlign: "center" }}>
        The legacy bin view has been retired in the task-first product setup.
      </Text>
    </View>
  );
}
