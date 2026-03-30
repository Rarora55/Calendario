import { loadState } from "@/src/state/persist";
import type { TaskGroupRecord, TaskRecord } from "@/src/features/shared/types";

type LegacyCalendar = {
  id?: string;
  name?: string;
  color?: string;
};

type LegacyEvent = {
  id?: string;
  calendarId?: string;
  title?: string;
  description?: string;
  location?: string;
  label?: string;
  priority?: string;
  startISO?: string;
  endISO?: string;
};

type LegacyState = {
  calendars?: LegacyCalendar[];
  events?: LegacyEvent[];
  binEvents?: LegacyEvent[];
};

function createId(prefix: string, seed: string) {
  return `${prefix}-${seed.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}

function toDateOnly(iso: string | undefined) {
  if (!iso) {
    return null;
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function buildNotes(event: LegacyEvent) {
  const notes = [
    event.description?.trim(),
    event.location?.trim() ? `Imported location: ${event.location.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
  return notes || null;
}

export function mapLegacyStateToRecords(legacyState: LegacyState, importedAt = new Date().toISOString()) {
  const events = [...(legacyState.events ?? []), ...(legacyState.binEvents ?? [])];
  const calendars = legacyState.calendars ?? [];
  const groupMap = new Map<string, TaskGroupRecord>();

  for (const calendar of calendars) {
    const name = calendar.name?.trim();
    if (!name || groupMap.has(name.toLowerCase())) {
      continue;
    }

    groupMap.set(name.toLowerCase(), {
      id: createId("group", name),
      name,
      colorToken: calendar.color?.trim() || "#de8f6e",
      sortOrder: groupMap.size,
      createdAt: importedAt,
      updatedAt: importedAt,
      deletedAt: null,
      syncStatus: "pending_upsert",
      lastSyncedAt: null,
    });
  }

  for (const event of events) {
    const sourceName =
      event.label?.trim() ||
      calendars.find((calendar) => calendar.id === event.calendarId)?.name?.trim() ||
      "Imported";
    const key = sourceName.toLowerCase();

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        id: createId("group", sourceName),
        name: sourceName,
        colorToken: "#de8f6e",
        sortOrder: groupMap.size,
        createdAt: importedAt,
        updatedAt: importedAt,
        deletedAt: null,
        syncStatus: "pending_upsert",
        lastSyncedAt: null,
      });
    }
  }

  const taskGroups = Array.from(groupMap.values());
  const tasks: TaskRecord[] = events.map((event, index) => {
    const sourceName =
      event.label?.trim() ||
      calendars.find((calendar) => calendar.id === event.calendarId)?.name?.trim() ||
      "Imported";
    const taskGroupId = groupMap.get(sourceName.toLowerCase())?.id ?? taskGroups[0]?.id ?? "group-imported";
    const softDeleted = (legacyState.binEvents ?? []).some((binEvent) => binEvent.id === event.id);

    return {
      id: event.id?.trim() || `task-imported-${index + 1}`,
      taskGroupId,
      title: event.title?.trim() || "Imported task",
      notes: buildNotes(event),
      value: 0,
      estimatedTimeSeconds: 0,
      workedTimeSeconds: 0,
      scheduledStartDate: toDateOnly(event.startISO),
      scheduledEndDate: toDateOnly(event.endISO) ?? toDateOnly(event.startISO),
      isCompleted: false,
      completedAt: null,
      isPriority: event.priority === "alta",
      createdAt: importedAt,
      updatedAt: importedAt,
      deletedAt: softDeleted ? importedAt : null,
      syncStatus: "pending_upsert",
      lastSyncedAt: null,
    };
  });

  return { taskGroups, tasks };
}

export async function loadLegacyImportBundle() {
  const legacyState = (await loadState()) as LegacyState | null;
  if (!legacyState) {
    return null;
  }

  const hasRecords = Boolean((legacyState.events?.length ?? 0) || (legacyState.binEvents?.length ?? 0));
  if (!hasRecords) {
    return null;
  }

  return mapLegacyStateToRecords(legacyState);
}
