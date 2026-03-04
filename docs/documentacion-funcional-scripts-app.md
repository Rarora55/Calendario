# Documentacion funcional detallada de scripts de la app Calendario

## 1. Alcance del documento

Este documento describe la funcion de cada script relevante que compone la aplicacion en este repositorio, separando:

- Frontend mobile/web (Expo + Expo Router + React Native)
- Estado, dominio y utilidades (`src/`)
- Componentes y helpers heredados del template de Expo (`components/`, `constants/`)
- Backend de autenticacion (`backend/src/`)
- Scripts de ejecucion en `package.json` (frontend y backend)

### Exclusiones (intencionales)

No se documentan como "scripts de la app" los siguientes elementos porque son dependencias o artefactos generados:

- `node_modules/` (frontend y backend)
- `.expo/`, `android/` generado, `package-lock.json`
- assets binarios (`assets/images`, fuentes, iconos)
- archivos de configuracion no ejecutables (`tsconfig.json`, `app.json`, `eas.json`) salvo mencion contextual

## 2. Arquitectura general (resumen)

La app esta organizada en dos capas principales:

1. **Capa de rutas (`app/`)**
   - Define la navegacion con Expo Router.
   - La mayoria de rutas son wrappers que reexportan pantallas implementadas en `src/screens`.

2. **Capa de logica/UI (`src/`)**
   - Pantallas reales (`src/screens/*`)
   - Estado global con Zustand (`src/state/store.ts`)
   - Tipos de dominio (`src/domain/*`)
   - Persistencia local (`src/state/persist.ts`)
   - Seguridad/sesion Google local (`src/security/googleSessionStorage.ts`)
   - Hook de gestos para navegar entre tabs (`src/hooks/useTabSwipeNavigation.ts`)

Adicionalmente:

- `components/` y `constants/` contienen helpers y componentes del template de Expo; algunos siguen activos (tema, componentes de modal/not-found).
- `backend/src/*` implementa un backend Express para validar `idToken` de Google y emitir un token propio de la app.

## 3. Flujo funcional global (end-to-end)

1. **Arranque**: `app/_layout.tsx`
   - Carga fuentes e iconos
   - Mantiene splash nativo hasta que assets estan listos
   - Muestra una pantalla de lanzamiento personalizada (`AppLaunchScreen`) por ~1.6s
   - Monta el stack de navegacion principal

2. **Navegacion por tabs**: `app/tabs/_layout.tsx`
   - Configura tabs: General, Calendario, Prioridades, Bin, Settings
   - Boton `+` en header para crear evento (`/event-editor`)

3. **Estado**: `src/state/store.ts`
   - Hidrata datos desde AsyncStorage
   - Si no hay datos, usa seeds (`src/state/seed.ts`)
   - Gestiona eventos activos, papelera, historial de etiquetas y calendarios visibles

4. **Pantallas**
   - `General`: listado cronologico + filtro por etiqueta + mover a papelera
   - `Calendario`: vista mensual + eventos por dia
   - `Prioridades`: eventos de prioridad alta
   - `Bin`: restaurar/eliminar permanentemente
   - `Settings`: login Google + almacenamiento de sesion local segura
   - `EventEditor`: crear/editar eventos
   - `EventDetail`: ver detalle y abrir Google Maps

5. **Backend auth (opcional pero integrado)**
   - `backend/src/server.js` recibe `idToken` de Google
   - Verifica token con Google (`google.js`)
   - Emite JWT de app (`auth.js`)

## 4. Scripts de ejecucion (`package.json`)

### `package.json` (raiz - frontend)

- `start`: ejecuta `expo start`
  - Levanta Metro bundler y servidor de desarrollo.
  - Permite abrir la app en emulador, dispositivo o web (segun flujo Expo).

- `android`: ejecuta `expo run:android`
  - Compila/ejecuta proyecto nativo Android localmente.
  - Es especialmente importante para features que no funcionan en Expo Go (por ejemplo, login Google seguro en esta app, como advierte `SettingsScreen`).

- `ios`: ejecuta `expo run:ios`
  - Compila/ejecuta proyecto nativo iOS localmente.
  - Mismo objetivo que Android, pero en entorno Apple.

- `web`: ejecuta `expo start --web`
  - Arranque del proyecto en navegador.
  - Usa los componentes y rutas con compatibilidad web de Expo Router.

### `backend/package.json` (backend auth)

- `dev`: `node --watch src/server.js`
  - Arranca el backend en modo desarrollo con recarga al cambiar archivos.
  - Util para iterar el flujo `/auth/google/verify`.

- `start`: `node src/server.js`
  - Arranque normal del backend sin watch.
  - Recomendado para ejecucion mas estable/local de prueba o despliegue simple.

## 5. Capa de rutas Expo Router (`app/`)

### `app/_layout.tsx`

**Responsabilidad:** layout raiz y stack de navegacion de toda la app.

**Que hace:**

- Carga fuente `SpaceMono` y el set de iconos de FontAwesome con `useFonts`.
- Llama `SplashScreen.preventAutoHideAsync()` para evitar que el splash nativo desaparezca antes de tiempo.
- Si las fuentes aun no estan listas, renderiza `null`.
- Una vez cargado, oculta splash nativo (`SplashScreen.hideAsync()`).
- Muestra `AppLaunchScreen` durante `APP_LAUNCH_SCREEN_MS = 1600` ms.
- Configura `ThemeProvider` usando `useColorScheme()` para `DarkTheme` o `DefaultTheme`.
- Define stack screens:
  - `tabs` (sin header)
  - `day`
  - `event-editor` (modal)

**Notas funcionales:**

- Exporta `ErrorBoundary` de `expo-router` para capturar errores del arbol de navegacion.
- Define `unstable_settings.initialRouteName = 'tabs'` para mejorar comportamiento de recarga.

### `app/index.tsx`

**Responsabilidad:** redireccion de entrada.

**Que hace:**

- Redirige automaticamente `/` hacia `/tabs`.
- Evita duplicar logica de pantalla inicial.

### `app/day.tsx`

**Responsabilidad:** wrapper de ruta.

**Que hace:**

- Reexporta `src/screens/DayScreen`.
- La logica real vive en `src/screens/DayScreen.tsx`.

### `app/event-editor.tsx`

**Responsabilidad:** wrapper de ruta para alta/edicion de eventos.

**Que hace:**

- Reexporta `src/screens/EventEditorScreen`.
- Se usa tanto para crear como editar (modo definido por query param `id`).

### `app/event/[id].tsx`

**Responsabilidad:** wrapper de ruta dinamica de detalle de evento.

**Que hace:**

- Reexporta `src/screens/EventDetailScreen`.
- La ruta recibe `id` y carga detalle desde store.

### `app/+not-found.tsx`

**Responsabilidad:** pantalla fallback para rutas inexistentes.

**Que hace:**

- Muestra un mensaje de error de ruta.
- Configura `Stack.Screen` con titulo `Oops!`.
- Ofrece link de retorno a `/tabs`.

**Dependencias:** usa componentes tematicos heredados (`components/Themed`).

### `app/+html.tsx` (solo web)

**Responsabilidad:** personalizar HTML raiz para render web.

**Que hace:**

- Define estructura `<html>`, `<head>`, `<body>` para render estatico web.
- Incluye `ScrollViewStyleReset` para que `ScrollView` se comporte parecido a nativo.
- Inserta CSS inline (`responsiveBackground`) para evitar flicker visual en cambios de esquema.

**Notas:**

- Solo se ejecuta en contexto web/Node (no en runtime nativo RN).

### `app/modal.tsx`

**Responsabilidad:** pantalla modal de ejemplo del template Expo.

**Que hace:**

- Renderiza contenido demostrativo (`EditScreenInfo`).
- Muestra `StatusBar` adaptado a iOS.

**Estado actual en la app:**

- Parece heredado del template y no forma parte del flujo principal de calendario.

### `app/tabs/_layout.tsx`

**Responsabilidad:** configuracion del navigator por pestañas.

**Que hace:**

- Declara `Tabs` con estilos compartidos.
- Ajusta colores de iconos activos/inactivos.
- Configura `headerShown` con `useClientOnlyValue` para evitar diferencias SSR/web.
- Define 5 tabs:
  - `index` -> General
  - `calendars` -> Calendario
  - `priorities` -> Prioridades
  - `bin` -> Bin
  - `settings` -> Settings
- En tab `index` agrega boton `+` en header para ir a `/event-editor`.

**Componente interno:** `TabBarIcon`

- Envuelve `FontAwesome` y unifica tamaño/estilo de iconos.

### `app/tabs/index.tsx`

**Responsabilidad:** wrapper de tab General.

**Que hace:** reexporta `src/screens/GeneralScreen`.

### `app/tabs/calendars.tsx`

**Responsabilidad:** wrapper de tab Calendario.

**Que hace:** reexporta `src/screens/CalendarScreen`.

**Observacion menor:**

- Hay un `;` extra al final del archivo. No rompe funcionalidad, pero es ruido.

### `app/tabs/priorities.tsx`

**Responsabilidad:** wrapper de tab Prioridades.

**Que hace:** reexporta `src/screens/PrioritiesScreen`.

### `app/tabs/bin.tsx`

**Responsabilidad:** wrapper de tab Papelera.

**Que hace:** reexporta `src/screens/BinScreen`.

### `app/tabs/settings.tsx`

**Responsabilidad:** wrapper de tab Ajustes.

**Que hace:** reexporta `src/screens/SettingsScreen`.

## 6. Dominio y estado (`src/domain`, `src/state`)

### `src/domain/Calendar.ts`

**Responsabilidad:** definir el tipo de calendario.

**Tipo `Calendar`:**

- `id`: identificador unico
- `name`: nombre visible
- `color`: color asociado al calendario
- `isVisible`: controla si sus eventos se muestran en listados/vistas

**Uso principal:** store y pantallas que filtran por calendarios visibles.

### `src/domain/Event.ts`

**Responsabilidad:** definir tipos del dominio de eventos.

**Tipos:**

- `EventPriority`: union `"baja" | "media" | "alta"`
- `CalendarEvent`: modelo de evento de calendario

**Campos relevantes de `CalendarEvent`:**

- Identidad: `id`, `calendarId`
- Contenido: `title`, `label`, `description`, `note`
- Clasificacion: `priority`, `color`
- Tiempo: `startISO`, `endISO`, `allDay`
- Ubicacion: `location`

**Nota:** varios campos son opcionales y se normalizan en editor/detalle.

### `src/state/persist.ts`

**Responsabilidad:** persistencia local del estado de la app (frontend).

**Que hace:**

- Usa `AsyncStorage` con clave fija `calendario:v1`.
- Expone:
  - `saveState(state)`
  - `loadState()`
  - `clearState()`

**Modelo persistido (`PersistedState`):**

- `calendars`
- `events`
- `binEvents` (opcional)
- `labelHistory` (opcional)

**Notas funcionales:**

- No valida schemas en lectura; el store hace validaciones basicas (`Array.isArray`).
- El versionado se resuelve por clave (`v1`).

### `src/state/seed.ts`

**Responsabilidad:** datos iniciales cuando no existe persistencia.

**Que hace:**

- Define dos calendarios semilla:
  - Personal
  - Trabajo
- Genera dos eventos de ejemplo en base a `now`, `inOneHour`, `inTwoHours`.

**Uso:** `src/state/store.ts` durante `hydrate()` si `loadState()` no devuelve datos validos.

### `src/state/store.ts`

**Responsabilidad:** store global de la aplicacion usando Zustand.

**Estado almacenado:**

- `hydrated`: indica si ya se cargo persistencia/seed
- `calendars`: lista de calendarios
- `events`: eventos activos
- `binEvents`: eventos enviados a papelera
- `labelHistory`: historial de etiquetas usadas para sugerencias/filtro

**Acciones principales (calendarios):**

- `hydrate()`
  - Carga desde `loadState()`
  - Valida forma minima (arrays)
  - Si no hay datos, usa seeds
- `addCalendar(c)`
  - Agrega calendario y persiste
- `toggleCalendarVisibility(id)`
  - Invierte `isVisible` de un calendario y persiste

**Acciones principales (eventos):**

- `addEvent(e)`
  - Inserta evento y persiste
- `updateEvent(id, patch)`
  - Fusiona cambios parciales en un evento y persiste
- `deleteEvent(id)`
  - Mueve evento de `events` a `binEvents` (papelera logica)
- `restoreEventFromBin(id)`
  - Devuelve evento de papelera a activos
- `deleteEventPermanently(id)`
  - Elimina solo de `binEvents`
- `clearBin()`
  - Vacia papelera completa
- `getEventById(id)`
  - Busca primero en `events`, luego en `binEvents`

**Acciones auxiliares:**

- `addLabelToHistory(label)`
  - Limpia espacios
  - Evita vacios
  - Deduplica case-insensitive
  - Mantiene maximo 20 items
  - Persiste historial

**Selectores/helpers:**

- `getVisibleCalendars()` -> `Set<string>` de IDs visibles
- `getGeneralEvents()` -> eventos visibles ordenados por `startISO`

**Patron de persistencia:**

- Cada accion que muta estado llama `saveState(...)` con snapshot parcial (calendars/events/bin/labels).
- `saveState` se invoca con `void` (fire-and-forget), evitando bloquear UI.

## 7. Seguridad y sesion local (`src/security`)

### `src/security/googleSessionStorage.ts`

**Responsabilidad:** guardar/cargar/cerrar sesion Google verificada en el dispositivo.

**Problema que resuelve:**

- En nativo, conviene usar almacenamiento seguro (`expo-secure-store`).
- En web o si SecureStore no esta disponible, hace fallback a `AsyncStorage`.

**Tipo `GoogleUserSession`:**

- `id`, `name`, `email`
- `picture?`
- `appAccessToken?` (JWT emitido por backend propio)

**Funciones:**

- `saveGoogleUserSession(user)`
  - Guarda JSON en SecureStore si esta disponible
  - Si usa SecureStore, limpia posible valor legacy en AsyncStorage
  - Si no, guarda en AsyncStorage

- `loadGoogleUserSession()`
  - Intenta leer de SecureStore
  - Si no existe, intenta migrar valor legacy desde AsyncStorage a SecureStore
  - En web/fallback, lee de AsyncStorage

- `clearGoogleUserSession()`
  - Elimina de SecureStore (si aplica) y de AsyncStorage

**Helper interno:** `canUseSecureStore()`

- Deshabilita SecureStore en web y captura errores de disponibilidad.

## 8. Hook de navegacion por gestos (`src/hooks`)

### `src/hooks/useTabSwipeNavigation.ts`

**Responsabilidad:** permitir cambio horizontal entre tabs mediante swipe.

**Como funciona:**

- Define rutas de tabs en `TAB_ROUTES`.
- Normaliza pathname actual (`normalizeTabPath`) para soportar `/tabs/index` y `/tabs`.
- Calcula destino segun desplazamiento/velocidad (`getTargetRoute`).
- Construye `PanResponder` y expone `panHandlers`.

**Umbrales importantes:**

- `DISTANCE_THRESHOLD = 48`
- `VELOCITY_THRESHOLD = 0.25`
- `AXIS_LOCK_DISTANCE = 12`
- `HORIZONTAL_DOMINANCE_RATIO = 1.2`

**Comportamiento:**

- Solo activa gesto cuando el movimiento es claramente horizontal.
- En `onPanResponderRelease`, navega a la tab anterior/siguiente con `router.navigate(...)`.
- Si la pantalla actual no es una tab reconocida, no hace nada.

**Uso:** se aplica en varias pantallas con `{...swipeHandlers}` en el `View` raiz.

## 9. Componentes y pantallas de `src/`

### `src/components/AppLaunchScreen.tsx`

**Responsabilidad:** pantalla de lanzamiento personalizada posterior al splash nativo.

**Que muestra:**

- Fondo segun tema (`Colors` + `useColorScheme`)
- Halo animado (`glow`)
- Logo (`assets/images/icon.png`) con fade/scale
- Titulo `Calendario`

**Animaciones:**

- Entrada (`logoOpacity`, `logoScale`)
- Pulso continuo del logo
- Pulso de opacidad del halo

**Detalles tecnicos:**

- Usa `Animated` API clasica de React Native con `useNativeDriver`.
- Limpia loops en `useEffect` cleanup.

### `src/screens/DayScreen.tsx`

**Responsabilidad:** placeholder para vista diaria.

**Estado actual:**

- Solo renderiza texto `Vista Dia`.
- No consume store ni implementa timeline diaria todavia.

**Impacto:** la navegacion existe desde `GeneralScreen`, pero la funcionalidad esta pendiente.

### `src/screens/GeneralScreen.tsx`

**Responsabilidad:** pantalla principal de listado general de eventos, con filtro por etiqueta y accion rapida a papelera.

**Funciones principales:**

1. **Hidratacion**
   - Si `hydrated` es `false`, llama `hydrate()`.
   - Muestra `Cargando...` mientras tanto.

2. **Listado de eventos visibles**
   - Toma `calendars` y `events` del store.
   - Construye `generalEvents` filtrando por calendarios visibles y ordenando por fecha de inicio.

3. **Filtro por etiqueta**
   - Estado local: `labelQuery`, `selectedLabel`, `isFilterFocused`
   - `filteredEvents` aplica:
     - filtro exacto si hay `selectedLabel`
     - filtro por inclusion si solo hay query escrita

4. **Sugerencias de etiquetas**
   - Une `labelHistory` (persistido) + etiquetas existentes en eventos
   - Deduplica case-insensitive
   - Filtra por query y limita a 12 sugerencias
   - Muestra chips horizontales al enfocar el input

5. **Seleccion de evento**
   - `selectedEventId` marca un evento seleccionado (toggle)
   - La tarjeta seleccionada cambia borde/fondo

6. **Mover a papelera**
   - Boton inferior `Bin` (con icono)
   - Usa `deleteEvent(selectedEventId)`
   - Se deshabilita si no hay evento seleccionado

7. **Acciones por tarjeta**
   - `EventCard` con boton `Ver` que navega a `/event/[id]`

8. **Navegacion a vista dia**
   - Boton `Abrir dia` que navega a `/day`

**Detalles de UX implementados:**

- Manejo fino de `blur` del input con timeout (`blurTimeoutRef`) para permitir tap en sugerencias antes de perder foco.
- `applyLabelFilter()` soporta togglear la misma etiqueta para desactivar filtro.
- Guarda etiquetas en historial al seleccionar sugerencia o al enviar el input.

### `src/screens/CalendarScreen.tsx`

**Responsabilidad:** vista mensual de calendario con conteo de eventos por dia y listado del dia seleccionado.

**Logica utilitaria interna:**

- `monthStart(date)`
- `getMonthMatrix(year, month)`
- `sameDay(a,b)`
- `dayKey(date)` -> clave `YYYY-MM-DD`
- `startOfDay(date)`
- `addDays(date, days)`

**Funciones principales:**

1. **Hidratacion** igual que otras pantallas.
2. **Estado de vista**
   - `viewDate`: mes actualmente mostrado
   - `selectedDate`: dia seleccionado dentro del mes
3. **Construccion de grilla mensual** (`monthDays`)
   - Incluye huecos `null` al inicio/fin para alinear semanas (L-D)
4. **Filtrado de eventos del mes** (`monthEvents`)
   - Solo calendarios visibles
   - Considera eventos multi-dia intersectando rango del mes
   - Normaliza casos donde `endISO < startISO`
5. **Indexado por dia** (`monthEventsByDay`)
   - Expande cada evento por cada dia del rango que ocupa
   - Permite mostrar conteos y listado del dia seleccionado
6. **Seleccion de eventos del dia** (`selectedEvents`)
7. **Cambio de mes** (`moveMonth`)
   - Cambia el mes y selecciona automaticamente el dia 1 del nuevo mes

**UI:**

- Cabecera con mes y botones `<` / `>`
- Grilla 7 columnas con dias de la semana
- Cada celda muestra numero de dia y conteo (capado visualmente a 9)
- Debajo, listado con `EventCard` de eventos del dia seleccionado

### `src/screens/PrioritiesScreen.tsx`

**Responsabilidad:** mostrar eventos de prioridad alta de calendarios visibles.

**Que hace:**

- Hidrata estado si hace falta.
- Calcula `highPriorityEvents` con `useMemo`:
  - calendarios visibles
  - `priority === "alta"`
  - orden ascendente por `startISO`
- Construye `calendarById` para resolver color por defecto del calendario.
- Renderiza `EventCard` con accion `Ver` a detalle.

**Caso vacio:** mensaje `No hay eventos con prioridad alta.`

### `src/screens/BinScreen.tsx`

**Responsabilidad:** gestionar la papelera de eventos.

**Que hace:**

- Hidrata estado si hace falta.
- Lee `binEvents` desde store.
- Si hay elementos, muestra boton `Vaciar papelera` (`clearBin`).
- Para cada evento en bin:
  - `EventCard` con accion `Restaurar` (`restoreEventFromBin`)
  - Boton adicional `Eliminar permanentemente` (`deleteEventPermanently`)

**Notas funcionales:**

- Mantiene colores de evento/calendario para contexto visual.
- No navega al detalle; esta pantalla prioriza recuperacion/borrado.

### `src/screens/EventDetailScreen.tsx`

**Responsabilidad:** mostrar detalle de un evento (activo o en papelera) y acciones basicas.

**Carga de datos:**

- Lee `id` desde `useLocalSearchParams`.
- Busca evento con `getEventById(id)` (incluye eventos en bin).

**Contenido mostrado:**

- Nombre/titulo
- Etiqueta
- Descripcion
- Localizacion (si existe)
- Prioridad (mapeada a etiqueta legible)
- Fecha/hora inicio y fin (`toLocaleString()`)

**Integracion Google Maps:**

- `toGoogleMapsLink()`:
  - si `location` ya es URL `http(s)`, la reutiliza
  - si no, construye URL de busqueda en Google Maps
- Boton `Abrir direccion en Google Maps` via `Linking.openURL(...)`

**Acciones:**

- `Editar` -> navega a `/event-editor?id=...`
- `Mover a Bin` -> llama `deleteEvent()` y vuelve atras

**Caso error:** si no existe el evento, muestra `No se encontro el evento.`

### `src/screens/EventEditorScreen.tsx`

**Responsabilidad:** formulario de creacion y edicion de eventos.

**Modo de operacion:**

- **Crear**: sin `id` en params
- **Editar**: con `id` en params y carga de `existingEvent`

**Subcomponente interno `CalendarPicker`**

**Rol:** selector de fecha basado en mini-calendario mensual (sin time picker).

- Estados locales de vista: `viewYear`, `viewMonth`
- Reusa helpers de matriz mensual y comparacion de dias
- Permite navegar mes anterior/siguiente
- Al pulsar un dia, actualiza solo Y/M/D preservando la hora (`withYMD`)

**Helpers internos relevantes:**

- `id()` -> genera sufijo pseudoaleatorio para nuevos eventos
- `safeDate()` -> parseo seguro de ISO con fallback
- `buildGoogleMapsSearchUrl()` -> URL de busqueda por direccion
- `getAddressFromLocation()` -> si `location` guardada es URL Google Maps, intenta extraer `query` para mostrar direccion editable

**Estado del formulario:**

- `title`, `label`, `description`, `locationQuery`
- `priority`, `allDay`, `color`
- `startDate`, `endDate`

**Carga de datos en modo edicion:**

- Cuando `hydrated` y existe evento:
  - hidrata todos los campos desde `existingEvent`
  - convierte fechas ISO a `Date`
  - reconstruye texto de localizacion con `getAddressFromLocation`

**Guardado (`handleSave`)**

- **Editar**:
  - llama `updateEvent(eventId, patch)` con valores normalizados
  - convierte localizacion a URL Google Maps si hay texto
  - vuelve atras (`router.back()`)

- **Crear**:
  - usa el primer calendario disponible (`calendars[0]`) como destino por defecto
  - genera `id` tipo `ev-xxxxxxxx`
  - llama `addEvent(...)`
  - vuelve atras

**UI funcional destacada:**

- `Stack.Screen` configura boton header `Guardar`
- Inputs para titulo/etiqueta/descripcion/localizacion
- Boton para abrir previsualizacion de busqueda en Google Maps
- Selector de prioridad (chips)
- Switch `Todo el dia`
- Dos `CalendarPicker` (inicio y fin)
- Selector de color con paleta + opcion `Sin color`

**Validaciones/comportamiento actual:**

- Si no hay calendarios, deshabilita guardado en modo crear y muestra aviso.
- No hay validacion fuerte de rango (por ejemplo, fin >= inicio); se guarda lo que el usuario seleccione.
- El titulo se normaliza a `Evento sin titulo` si queda vacio.

### `src/screens/SettingsScreen.tsx`

**Responsabilidad:** ajustes de la app con login Google (OAuth) y persistencia local de sesion.

**Inicializacion importante:**

- `WebBrowser.maybeCompleteAuthSession()` completa retorno de auth session en Expo.

**Configuracion OAuth (desde `.env`)**

Lee y memoiza:

- `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT`

**Detecciones de entorno:**

- `isExpoGo`: detecta si corre en Expo Go (`ExecutionEnvironment.StoreClient`)
  - Si esta en Expo Go, bloquea login seguro y muestra mensaje instructivo.

**Redirect URI nativo:**

- `toNativeRedirectScheme(clientId)` deriva el esquema tipo `com.googleusercontent.apps.<id>:/oauthredirect`
- `makeRedirectUri({ native: ... })` genera URI final para iOS/Android

**Auth request Google:**

- Usa `Google.useAuthRequest(...)` con:
  - scopes `openid profile email`
  - `ResponseType.Code`
  - `usePKCE: true`

**Carga de sesion local:**

- Al montar, intenta `loadGoogleUserSession()` y si hay email, restaura usuario en UI.

**Procesamiento de respuesta OAuth:**

- `useEffect` escucha `response`
- Si `response.type !== success`, muestra errores si aplica
- Extrae `idToken` (desde `response.authentication` o `response.params`)
- Llama `fetch(verifyEndpoint)` enviando `{ provider: 'google', idToken }`
- Si backend valida, recibe `user` + `session.accessToken`
- Guarda sesion local con `saveGoogleUserSession(...)`

**Proteccion basica anti abuso del boton login:**

- Ventana deslizante: `LOGIN_WINDOW_MS = 60000`
- Max intentos: `LOGIN_MAX_ATTEMPTS = 5`
- Cooldown: `LOGIN_COOLDOWN_MS = 10000`
- `canAttemptLogin()` aplica rate-limit en cliente y mensajes de espera

**Acciones de usuario:**

- `onPressGoogleLogin()` valida prerequisitos antes de abrir prompt OAuth:
  - no Expo Go
  - hay client IDs
  - hay verify endpoint
  - no excede intentos
- `onPressGoogleLogout()` limpia usuario local y storage

**UI:**

- Tarjeta de `Inicio de sesion con Google`
- Estado autenticado:
  - avatar (si hay `picture`)
  - nombre + email
  - boton `Cerrar sesion`
- Estado no autenticado:
  - boton `Iniciar sesion con Google`
  - deshabilitado si `busy`, falta `request`, falta endpoint o si corre en Expo Go
- Mensajes de estado/error debajo del bloque

## 10. Componentes y helpers heredados del template (`components/`, `constants/`)

### `constants/Colors.ts`

**Responsabilidad:** paleta de colores simple del template Expo para light/dark.

**Uso actual:**

- `src/components/AppLaunchScreen.tsx`
- componentes tematicos del template (`Themed.tsx`, etc.)

**Nota:** la app principal usa en gran parte colores del theme de React Navigation (`useTheme().colors`), por lo que esta paleta actua mas como soporte de template.

### `components/useColorScheme.ts`

**Responsabilidad:** wrapper reexport del hook nativo `useColorScheme`.

**Uso:** `app/_layout.tsx` y otros componentes/template para elegir tema light/dark.

### `components/useColorScheme.web.ts`

**Responsabilidad:** version web del hook de color scheme con salida estable.

**Que hace:**

- Devuelve siempre `"light"`.
- Evita mismatch SSR/cliente en web (comentado en el archivo).

**Tradeoff:** simplifica render pero ignora preferencia real del sistema en web inicial.

### `components/useClientOnlyValue.ts`

**Responsabilidad:** version web-only/simple (segun resolucion de plataforma) para devolver valor de cliente.

**Que hace:**

- En esta variante devuelve directamente `client`.
- Se usa para ocultar/mostrar header sin depender de SSR exacto.

### `components/useClientOnlyValue.web.ts`

**Responsabilidad:** variante web con comportamiento SSR-safe.

**Que hace:**

- Inicializa con valor `server`
- Tras `useEffect`, cambia a `client`
- Evita diferencias entre HTML inicial y cliente hidratado

### `components/Themed.tsx`

**Responsabilidad:** componentes `Text` y `View` tematicos del template.

**Que hace:**

- `useThemeColor(...)` resuelve color por props (`light`/`dark`) o por `Colors`
- Exporta wrappers `Text` y `View` sobre RN `Text`/`View`
- Permite overrides `lightColor`/`darkColor`

**Uso actual:** pantallas heredadas (`+not-found`, `modal`, `EditScreenInfo`, `StyledText`).

### `components/StyledText.tsx`

**Responsabilidad:** variante de texto mono-espaciado del template.

**Que hace:**

- Exporta `MonoText`, que aplica `fontFamily: 'SpaceMono'` sobre `Themed.Text`.

### `components/ExternalLink.tsx`

**Responsabilidad:** wrapper para enlaces externos compatible con web y nativo.

**Que hace:**

- En web, deja comportamiento estandar de `Link` con `target="_blank"`
- En nativo:
  - previene navegacion por defecto
  - abre URL con `WebBrowser.openBrowserAsync(...)`

**Uso actual:** `EditScreenInfo.tsx`.

### `components/EditScreenInfo.tsx`

**Responsabilidad:** componente informativo heredado del template Expo.

**Que hace:**

- Muestra instrucciones de edicion de una pantalla
- Incluye enlace de ayuda de Expo
- Usa `ExternalLink`, `MonoText`, `Themed`

**Estado actual:** componente de ejemplo usado por `app/modal.tsx`.

### `components/EventCard.tsx`

**Responsabilidad:** tarjeta reutilizable para mostrar eventos en listados.

**Props principales:**

- `title`, `subtitle`
- `color` (indicador del evento)
- `textColor`, `subtitleColor`, `borderColor`, `backgroundColor`
- `onPress` (seleccion/click tarjeta)
- `actionLabel`, `onActionPress` (accion secundaria, ej. Ver/Restaurar)
- `dragHandleProps` (soporte visual/funcional para futuro drag-and-drop)

**Comportamiento:**

- Renderiza indicador de color + titulo + subtitulo.
- Si `onActionPress` existe, muestra boton inline y hace `stopPropagation()` para no disparar `onPress` de la tarjeta.
- Si hay `dragHandleProps`, renderiza un handle `||` con estilo combinado.
- Si `onPress` existe, usa `Pressable`; si no, `View`.

**Valor de diseño:** centraliza presentacion de eventos y reduce duplicacion entre pantallas.

### `components/__tests__/StyledText-test.js`

**Responsabilidad:** test de snapshot del componente `MonoText`.

**Que hace:**

- Renderiza `MonoText` con `react-test-renderer`
- Compara salida con snapshot esperado

**Rol en la app:** no forma parte del runtime, pero si del soporte de calidad del template.

## 11. Backend de autenticacion (`backend/src/`)

### `backend/src/config.js`

**Responsabilidad:** cargar y validar configuracion del backend desde variables de entorno.

**Que hace:**

- Importa `dotenv/config` para cargar `.env`
- Helpers:
  - `parseIntWithDefault(value, fallback)`
  - `parseCsv(value)`
  - `required(name, value)`
- Construye `googleAudiences` desde `GOOGLE_OAUTH_AUDIENCES`
- Falla al arrancar si no hay audiencias configuradas
- Exporta `config` con:
  - `port`
  - `jwtSecret`
  - `jwtExpiresIn`
  - `googleAudiences`
  - `corsOrigins`

**Importancia:** evita que el servidor arranque con configuracion incompleta de auth.

### `backend/src/google.js`

**Responsabilidad:** verificar `idToken` de Google y normalizar datos de usuario.

**Que hace:**

- Instancia `OAuth2Client` de `google-auth-library`
- `verifyGoogleIdToken(idToken, audiences)`:
  - valida firma y audiencia con Google
  - obtiene payload
  - verifica issuer permitido
  - exige `sub`, `email` y `email_verified`
  - devuelve objeto de usuario normalizado (`id`, `email`, `name`, `picture`)

**Seguridad:** bloquea tokens de issuer invalido o correos no verificados.

### `backend/src/auth.js`

**Responsabilidad:** emitir y validar JWT propios de la aplicacion, y middlewares de autorizacion.

**Funciones:**

- `issueAppAccessToken(user, secret, expiresIn)`
  - firma JWT con claims basicos (`sub`, `email`, `name`)
  - define `issuer` y `audience` fijos

- `requireAuth(secret)`
  - middleware Express
  - extrae bearer token del header `Authorization`
  - valida JWT (`issuer`, `audience`, expiracion)
  - inyecta `req.user`
  - responde `401` si falta o es invalido

- `requireSameUserParam(paramName)`
  - middleware de autorizacion por identidad
  - compara `req.user.id` con `req.params[paramName]`
  - responde `403` si no coincide

**Uso:** `server.js` protege `/me` y `/users/:userId/calendars`.

### `backend/src/server.js`

**Responsabilidad:** servidor Express principal del backend de autenticacion.

**Setup base:**

- Deshabilita `x-powered-by`
- `helmet()` para headers de seguridad
- `express.json({ limit: '16kb' })`
- `cors(...)` si hay `config.corsOrigins`
- Rate limiting general y especifico de auth

**Rate limits definidos:**

- `generalLimiter`: 120 req / 15 min
- `authLimiter`: 5 intentos / min en `/auth/google/verify`

**Rutas expuestas:**

- `GET /health`
  - healthcheck simple `{ ok: true }`

- `POST /auth/google/verify`
  - valida body con Zod (`provider='google'`, `idToken`)
  - verifica token Google (`verifyGoogleIdToken`)
  - emite JWT de app (`issueAppAccessToken`)
  - responde `user` + `session.accessToken`
  - maneja errores `400`/`401`

- `GET /me`
  - protegida con `requireAuth`
  - devuelve usuario autenticado (`req.user`)

- `GET /users/:userId/calendars`
  - protegida con `requireAuth`
  - autorizada por `requireSameUserParam('userId')`
  - actualmente devuelve `items: []` (placeholder de futura integracion real)

- Fallback 404
  - responde JSON `{ error: 'Not found' }`

**Arranque:**

- `app.listen(config.port, ...)`
- Log minimo sin exponer tokens ni PII.

## 12. Relaciones clave entre scripts (mapa rapido)

- `app/_layout.tsx` -> `src/components/AppLaunchScreen.tsx`
- `app/tabs/*.tsx` -> `src/screens/*Screen.tsx`
- `src/screens/*` -> `src/state/store.ts`
- `src/state/store.ts` -> `src/state/persist.ts`, `src/state/seed.ts`, `src/domain/*`
- `src/screens/SettingsScreen.tsx` -> `src/security/googleSessionStorage.ts`
- `src/screens/SettingsScreen.tsx` -> backend endpoint `/auth/google/verify`
- `backend/src/server.js` -> `backend/src/google.js`, `backend/src/auth.js`, `backend/src/config.js`

## 13. Observaciones tecnicas utiles (para mantenimiento)

- Hay varios archivos de template Expo aun presentes (`app/modal.tsx`, `components/Themed.tsx`, etc.). No estorban, pero mezclan codigo de producto con codigo demo.
- `DayScreen` es un placeholder; la ruta existe pero la funcionalidad diaria no esta implementada.
- `GeneralScreen`, `CalendarScreen` y `EventEditorScreen` repiten algunos helpers de calendario/fechas. Se podria extraer una utilidad compartida si el proyecto crece.
- La persistencia del store usa validacion minima; si en el futuro el schema evoluciona, conviene versionar y migrar estado.
- El login Google en frontend depende de `EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT` y de ejecutar en development build (no Expo Go) para el flujo seguro actual.

## 14. Propuesta de organizacion futura (opcional)

Si quieres mantener esta documentacion viva, una siguiente iteracion util seria separar por documentos:

- `docs/frontend-rutas.md`
- `docs/frontend-estado-y-pantallas.md`
- `docs/backend-auth.md`
- `docs/flujo-completo-login-google.md`

Asi sera mas facil actualizarla cuando cambie una sola parte del sistema.
