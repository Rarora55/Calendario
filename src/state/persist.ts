import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "calendario:v1";

export type PersistedState = {
    calendars: unknown;
    events: unknown;
    binEvents?: unknown;
};

export async function saveState(state: PersistedState) {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
export async function loadState(): Promise<PersistedState | null> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
}

export async function clearState() {
    await AsyncStorage.removeItem(KEY);
}
