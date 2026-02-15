import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const GOOGLE_USER_KEY = "calendario:google-user";

export type GoogleUserSession = {
  id: string;
  name: string;
  email: string;
  picture?: string;
  appAccessToken?: string;
};

async function canUseSecureStore() {
  if (Platform.OS === "web") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function saveGoogleUserSession(user: GoogleUserSession) {
  const payload = JSON.stringify(user);
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(GOOGLE_USER_KEY, payload);
    await AsyncStorage.removeItem(GOOGLE_USER_KEY);
    return;
  }
  await AsyncStorage.setItem(GOOGLE_USER_KEY, payload);
}

export async function loadGoogleUserSession(): Promise<GoogleUserSession | null> {
  if (await canUseSecureStore()) {
    const secureValue = await SecureStore.getItemAsync(GOOGLE_USER_KEY);
    if (secureValue) {
      return JSON.parse(secureValue) as GoogleUserSession;
    }

    // Legacy migration path from AsyncStorage.
    const legacyValue = await AsyncStorage.getItem(GOOGLE_USER_KEY);
    if (!legacyValue) return null;
    await SecureStore.setItemAsync(GOOGLE_USER_KEY, legacyValue);
    await AsyncStorage.removeItem(GOOGLE_USER_KEY);
    return JSON.parse(legacyValue) as GoogleUserSession;
  }

  const raw = await AsyncStorage.getItem(GOOGLE_USER_KEY);
  return raw ? (JSON.parse(raw) as GoogleUserSession) : null;
}

export async function clearGoogleUserSession() {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(GOOGLE_USER_KEY);
  }
  await AsyncStorage.removeItem(GOOGLE_USER_KEY);
}
