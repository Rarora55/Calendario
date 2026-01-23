import { Text, View } from "react-native";

export default function SettingsScreen() {
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "700" }}>Ajustes</Text>
            <Text>Más adelante: backup, tema, etc.</Text>
        </View>
    );
}
