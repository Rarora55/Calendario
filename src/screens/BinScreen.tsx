import { View, Text } from "react-native";

export default function BinScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ color: "#35291f", fontSize: 18, fontWeight: "700", textAlign: "center" }}>
        The legacy bin view has been retired in the task-first product setup.
      </Text>
    </View>
  );
}
