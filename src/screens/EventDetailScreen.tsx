import { useAppStore } from "@/src/state/store";
import { useTheme } from "@react-navigation/native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Linking, Pressable, Text, View } from "react-native";

const priorityLabel: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

function toGoogleMapsLink(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export default function EventDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useAppStore((s) => (id ? s.getEventById(id) : undefined));
  const deleteEvent = useAppStore((s) => s.deleteEvent);

  if (!event) {
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>No se encontro el evento.</Text>
      </View>
    );
  }

  const priority = event.priority ?? "media";
  const fromDate = new Date(event.startISO).toLocaleString();
  const toDate = new Date(event.endISO).toLocaleString();
  const locationLink = event.location?.trim() ? toGoogleMapsLink(event.location) : undefined;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: event.title }} />
      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>{event.title}</Text>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          borderColor: colors.border,
          padding: 12,
          gap: 10,
        }}
      >
        <Text style={{ color: colors.text }}>
          <Text style={{ fontWeight: "700" }}>Nombre: </Text>
          {event.title}
        </Text>
        <Text style={{ color: colors.text }}>
          <Text style={{ fontWeight: "700" }}>Etiqueta: </Text>
          {event.label?.trim() ? event.label : "Sin etiqueta"}
        </Text>
        <Text style={{ color: colors.text }}>
          <Text style={{ fontWeight: "700" }}>Descripcion: </Text>
          {event.description?.trim() ? event.description : "Sin descripcion"}
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ color: colors.text }}>
            <Text style={{ fontWeight: "700" }}>Localizacion: </Text>
            {locationLink ? "Google Maps" : "Sin localizacion"}
          </Text>
          {locationLink ? (
            <Pressable onPress={() => void Linking.openURL(locationLink)}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                Abrir direccion en Google Maps
              </Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={{ color: colors.text }}>
          <Text style={{ fontWeight: "700" }}>Prioridad: </Text>
          {priorityLabel[priority] ?? "Media"}
        </Text>
        <Text style={{ color: colors.text }}>
          <Text style={{ fontWeight: "700" }}>Comienza: </Text>
          {fromDate}
        </Text>
        <Text style={{ color: colors.text }}>
          <Text style={{ fontWeight: "700" }}>Termina: </Text>
          {toDate}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push({ pathname: "/event-editor", params: { id: event.id } })}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: "center",
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text }}>Editar</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          deleteEvent(event.id);
          router.back();
        }}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: "center",
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text }}>Mover a Bin</Text>
      </Pressable>
    </View>
  );
}
