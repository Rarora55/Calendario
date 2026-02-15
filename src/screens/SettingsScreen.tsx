import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import {
    clearGoogleUserSession,
    loadGoogleUserSession,
    saveGoogleUserSession,
    type GoogleUserSession,
} from "@/src/security/googleSessionStorage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useTheme } from "@react-navigation/native";
import { makeRedirectUri, ResponseType } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_COOLDOWN_MS = 10_000;

function toNativeRedirectScheme(clientId?: string) {
    if (!clientId) return undefined;
    const id = clientId.replace(".apps.googleusercontent.com", "").trim();
    if (!id) return undefined;
    return `com.googleusercontent.apps.${id}:/oauthredirect`;
}

export default function SettingsScreen() {
    const { colors } = useTheme();
    const swipeHandlers = useTabSwipeNavigation();
    const [googleUser, setGoogleUser] = useState<GoogleUserSession | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const loginAttemptsRef = useRef<number[]>([]);

    const clientIds = useMemo(
        () => ({
            clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
            androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        }),
        []
    );

    const hasGoogleClientId = useMemo(
        () => Object.values(clientIds).some((value) => Boolean(value)),
        [clientIds]
    );
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    const verifyEndpoint = process.env.EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT?.trim();
    const hasVerifyEndpoint = Boolean(verifyEndpoint);

    const redirectUri = useMemo(() => {
        if (Platform.OS === "web") {
            return undefined;
        }
        const nativeClientId =
            Platform.OS === "ios"
                ? (clientIds.iosClientId ?? clientIds.clientId)
                : (clientIds.androidClientId ?? clientIds.clientId);
        const nativeScheme = toNativeRedirectScheme(nativeClientId);
        if (!nativeScheme) return undefined;
        return makeRedirectUri({ native: nativeScheme });
    }, [clientIds]);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: clientIds.clientId,
        androidClientId: clientIds.androidClientId,
        iosClientId: clientIds.iosClientId,
        webClientId: clientIds.webClientId,
        redirectUri,
        scopes: ["openid", "profile", "email"],
        responseType: ResponseType.Code,
        usePKCE: true,
    });

    useEffect(() => {
        const loadUser = async () => {
            try {
                const parsed = await loadGoogleUserSession();
                if (!parsed) return;
                if (parsed?.email) setGoogleUser(parsed);
            } catch {
                // ignore corrupted cache
            }
        };
        void loadUser();
    }, []);

    useEffect(() => {
        const syncAuthResponse = async () => {
            if (!response) return;

            if (response.type !== "success") {
                if (response.type === "error") {
                    setMessage("No se pudo iniciar sesion con Google.");
                }
                return;
            }

            if (!hasVerifyEndpoint || !verifyEndpoint) {
                setMessage("Falta EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT para validar sesion.");
                return;
            }
            const idToken =
                response.authentication?.idToken ??
                ("params" in response ? response.params?.id_token : undefined);
            if (!idToken) {
                setMessage("Google no devolvio un ID token valido.");
                return;
            }

            setBusy(true);
            setMessage(null);

            try {
                const verifyRes = await fetch(verifyEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        provider: "google",
                        idToken,
                    }),
                });

                if (!verifyRes.ok) {
                    throw new Error("No se pudo validar el token con el backend.");
                }

                const payload = (await verifyRes.json()) as {
                    user?: {
                        id?: string;
                        name?: string;
                        email?: string;
                        picture?: string;
                    };
                    session?: {
                        accessToken?: string;
                    };
                };

                if (!payload.user?.id || !payload.user?.email) {
                    throw new Error("Respuesta invalida del backend.");
                }

                const nextUser: GoogleUserSession = {
                    id: payload.user.id,
                    name: payload.user.name ?? payload.user.email,
                    email: payload.user.email,
                    picture: payload.user.picture,
                    appAccessToken: payload.session?.accessToken,
                };

                setGoogleUser(nextUser);
                await saveGoogleUserSession(nextUser);
            } catch {
                setMessage("No se pudo completar el inicio de sesion.");
            } finally {
                setBusy(false);
            }
        };

        void syncAuthResponse();
    }, [hasVerifyEndpoint, response, verifyEndpoint]);

    const getRemainingCooldownSeconds = () =>
        Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));

    const canAttemptLogin = () => {
        const now = Date.now();
        loginAttemptsRef.current = loginAttemptsRef.current.filter(
            (ts) => now - ts < LOGIN_WINDOW_MS
        );

        if (now < cooldownUntil) {
            setMessage(
                `Demasiados intentos. Espera ${getRemainingCooldownSeconds()}s para reintentar.`
            );
            return false;
        }

        if (loginAttemptsRef.current.length >= LOGIN_MAX_ATTEMPTS) {
            const nextCooldown = now + LOGIN_COOLDOWN_MS;
            setCooldownUntil(nextCooldown);
            setMessage("Demasiados intentos de login. Espera unos segundos.");
            return false;
        }

        loginAttemptsRef.current.push(now);
        return true;
    };

    const onPressGoogleLogin = async () => {
        if (isExpoGo) {
            setMessage(
                "Google login seguro requiere Development Build (no Expo Go). Usa npm run android o npm run ios."
            );
            return;
        }
        if (!hasGoogleClientId) {
            setMessage(
                "Falta configurar IDs de Google OAuth (EXPO_PUBLIC_GOOGLE_*_CLIENT_ID)."
            );
            return;
        }
        if (!hasVerifyEndpoint) {
            setMessage("Configura EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT en .env.");
            return;
        }
        if (!canAttemptLogin()) {
            return;
        }
        setMessage(null);
        await promptAsync();
    };

    const onPressGoogleLogout = async () => {
        setGoogleUser(null);
        await clearGoogleUserSession();
    };

    return (
        <View
            {...swipeHandlers}
            style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }}
        >
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Ajustes</Text>

            <View
                style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 12,
                    gap: 10,
                }}
            >
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                    Inicio de sesion con Google
                </Text>

                {googleUser ? (
                    <View style={{ gap: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            {googleUser.picture ? (
                                <Image
                                    source={{ uri: googleUser.picture }}
                                    style={{ width: 44, height: 44, borderRadius: 22 }}
                                />
                            ) : null}
                            <View style={{ gap: 2, flexShrink: 1 }}>
                                <Text style={{ color: colors.text, fontWeight: "700" }}>
                                    {googleUser.name}
                                </Text>
                                <Text style={{ color: colors.text }}>{googleUser.email}</Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={() => void onPressGoogleLogout()}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 10,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: colors.text }}>Cerrar sesion</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        onPress={() => void onPressGoogleLogin()}
                        disabled={busy || !request || !hasVerifyEndpoint || isExpoGo}
                        style={{
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 10,
                            alignItems: "center",
                            opacity: busy || !request || !hasVerifyEndpoint || isExpoGo ? 0.6 : 1,
                        }}
                    >
                        {busy ? (
                            <ActivityIndicator color={colors.text} />
                        ) : (
                            <Text style={{ color: colors.text, fontWeight: "700" }}>
                                Iniciar sesion con Google
                            </Text>
                        )}
                    </Pressable>
                )}

                {message ? (
                    <Text style={{ color: colors.text, opacity: 0.8 }}>{message}</Text>
                ) : null}
            </View>
        </View>
    );
}
