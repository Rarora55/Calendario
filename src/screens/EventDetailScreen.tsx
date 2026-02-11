import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/src/state/store";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useAppStore((s) => (id ? s.getEventById(id) : undefined));
  const calendars = useAppStore((s) => s.calendars);
  const deleteEvent = useAppStore((s) => s.deleteEvent);

  if (!event) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>No se encontró el evento.</Text>
      </View>
    );
  }

  const cal = calendars.find((c) => c.id === event.calendarId);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>{event.title}</Text>
      <Text style={{ opacity: 0.7 }}>ID: {event.id}</Text>
      <Text style={{ opacity: 0.7 }}>Calendar ID: {event.calendarId}</Text>
      <Text style={{ opacity: 0.7 }}>Calendario: {cal?.name ?? "—"}</Text>
      <Text>Inicio: {new Date(event.startISO).toLocaleString()}</Text>
      <Text>Fin: {new Date(event.endISO).toLocaleString()}</Text>
      <Text>Todo el dia: {event.allDay ? "Si" : "No"}</Text>
      <Text>Ubicacion: {event.location ?? "—"}</Text>

      {event.description ? (
        <Text>Descripción: {event.description}</Text>
      ) : (
        <Text>(Sin descripción)</Text>
      )}

      <Pressable
        onPress={() => router.push({ pathname: "/event-editor", params: { id: event.id } })}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
      >
        <Text>Editar</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          deleteEvent(event.id);
          router.back();
        }}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
      >
        <Text>Borrar</Text>
      </Pressable>
    </View>
  );
}
