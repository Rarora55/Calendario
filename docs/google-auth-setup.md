# Google Sign-In Setup (Expo)

## 1. Crear variables locales
1. Copia `.env.example` a `.env`.
2. Completa estos valores:

```env
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

3. Reinicia Metro (`npm run start` de nuevo) para que Expo lea las variables.

## 2. Configurar Google Cloud Console
1. Crea (o usa) un proyecto.
2. Configura OAuth consent screen.
3. Crea OAuth client IDs:
   - `Web application` -> para `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
   - `Android` -> para `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.
   - `iOS` -> para `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.

## 3. Datos necesarios por plataforma
- Android:
  - Package name: `com.anonymous.calendario` (actual en `app.json`).
  - SHA-1 del certificado (debug/release según entorno).
- iOS:
  - Bundle Identifier de tu app (si aún no está definido en `app.json`, defínelo antes de crear el client ID).
- Expo/dev:
  - Usa `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` como fallback general de desarrollo.

## 4. Redirect URI usada por la app
La app genera redirect URI nativa con este formato:

`com.googleusercontent.apps.<CLIENT_ID_SIN_SUFFIX>:/oauthredirect`

Ejemplo si el client id es:
`1234567890-abcdef.apps.googleusercontent.com`

redirect:
`com.googleusercontent.apps.1234567890-abcdef:/oauthredirect`

## 5. Verificación rápida
1. Abre `Settings`.
2. Pulsa `Iniciar sesion con Google`.
3. Si el login funciona, debe mostrarse nombre + email y el botón `Cerrar sesion`.

## 6. Errores comunes
- `redirect_uri_mismatch`:
  - El client ID no corresponde a la plataforma o falta configurar bien el identificador.
- Botón deshabilitado o mensaje de IDs faltantes:
  - Variables `.env` vacías o Metro sin reiniciar.

## 7. Backend token verification (required)
Set this variable in `.env`:

```env
EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT=https://your-api.example.com/auth/google/verify
```

The app sends Google `idToken` to this endpoint and only logs in if backend verification succeeds.
See `docs/auth-backend-contract.md` for the expected payload and checks.
