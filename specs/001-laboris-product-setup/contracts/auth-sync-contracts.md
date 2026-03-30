# Auth and Sync Contracts

## Scope

This feature uses Supabase Auth as the primary authentication platform and Express as a thin sync orchestration layer. The contracts below define the client-side auth adapter, the payload shapes exchanged with the backend, and the most-recent-update-wins sync rules.

## Client Auth Contract

```ts
export type AuthIdentity = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: "google";
};

export type AuthSession = {
  identity: AuthIdentity;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export interface AuthGateway {
  getCurrentSession(): Promise<AuthSession | null>;
  signInWithGoogle(): Promise<AuthSession>;
  signOut(): Promise<void>;
  onSessionChanged(listener: (session: AuthSession | null) => void): () => void;
}
```

### Auth Rules

- The client must authenticate with Supabase Auth using Google.
- SecureStore may hold access and refresh tokens on native platforms. No business data is stored there.
- If the user stays signed out, all local SQLite functionality remains available.

## Shared Sync Record Shape

```ts
export type SyncStatus = "synced" | "pending_upsert" | "pending_delete";

export type SyncedRecordEnvelope<T> = T & {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
```

## Domain Payload Contracts

```ts
export type TaskGroupRecord = SyncedRecordEnvelope<{
  name: string;
  colorToken: string;
  sortOrder: number;
}>;

export type TaskRecord = SyncedRecordEnvelope<{
  taskGroupId: string;
  title: string;
  notes: string | null;
  value: number;
  estimatedTimeSeconds: number;
  workedTimeSeconds: number;
  scheduledStartDate: string | null;
  scheduledEndDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  isPriority: boolean;
}>;

export type WorkSessionRecord = SyncedRecordEnvelope<{
  taskId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  source: "timer" | "manual_adjustment";
}>;

export type UserPreferenceRecord = SyncedRecordEnvelope<{
  theme: "light" | "dark" | "system";
  language: string;
  urgencyWindowDays: number;
  linkedAuthUserId: string | null;
  linkedAuthProvider: "google" | null;
  lastSyncAt: string | null;
}>;
```

## Sync Transport Contract

### `POST /sync/bootstrap`

Used once after authentication when the account does not yet have remote business data.

#### Request

```json
{
  "deviceId": "device-uuid",
  "requestedAt": "2026-03-27T17:00:00.000Z",
  "payload": {
    "taskGroups": [],
    "tasks": [],
    "workSessions": [],
    "preferences": []
  }
}
```

#### Response

```json
{
  "serverTime": "2026-03-27T17:00:02.000Z",
  "bootstrapApplied": true,
  "nextCursor": "2026-03-27T17:00:02.000Z",
  "authoritative": {
    "taskGroups": [],
    "tasks": [],
    "workSessions": [],
    "preferences": []
  }
}
```

#### Rules

- Requires `Authorization: Bearer <supabase-access-token>`.
- Fails with `409` if the account already has remote synced rows and the client should switch to incremental sync.
- The server response is authoritative and must overwrite local `syncStatus` and `lastSyncedAt` fields for acknowledged rows.

### `POST /sync/changes`

Used for normal incremental synchronization.

#### Request

```json
{
  "deviceId": "device-uuid",
  "cursor": "2026-03-27T17:00:02.000Z",
  "changes": {
    "taskGroups": [],
    "tasks": [],
    "workSessions": [],
    "preferences": []
  }
}
```

#### Response

```json
{
  "serverTime": "2026-03-27T17:01:10.000Z",
  "nextCursor": "2026-03-27T17:01:10.000Z",
  "applied": {
    "taskGroups": [],
    "tasks": [],
    "workSessions": [],
    "preferences": []
  },
  "remoteChanges": {
    "taskGroups": [],
    "tasks": [],
    "workSessions": [],
    "preferences": []
  },
  "conflicts": {
    "taskGroups": [],
    "tasks": [],
    "preferences": []
  }
}
```

#### Rules

- `remoteChanges` contains any server rows updated after the provided cursor.
- `applied` contains the authoritative stored version of rows sent by the client.
- `conflicts` contains rows where the server copy won because `updatedAt` was newer.
- `WorkSession` conflicts should be rare. If they happen, the newest `updatedAt` still wins.

## Conflict Resolution Contract

- For `TaskGroup`, `Task`, and `UserPreference`, most-recent-update-wins is determined by `updatedAt`.
- Soft deletes participate in the same rule by setting `deletedAt` and bumping `updatedAt`.
- When timestamps are equal, the server copy wins to keep the outcome deterministic.
- The client must apply the server-authoritative row exactly as returned.

## Error Contract

| Status | Meaning | Client Action |
|--------|---------|---------------|
| `400` | Invalid payload or schema | Log and keep local pending rows unchanged |
| `401` | Missing or invalid Supabase token | Refresh or require sign-in before retry |
| `409` | Bootstrap not allowed because remote data already exists | Fall back to incremental sync |
| `422` | Domain validation failure | Mark sync error in UI and keep rows local for correction |
| `500` | Server failure | Retry later with exponential backoff |

## Minimal Express Route Surface

- `GET /health`
- `POST /sync/bootstrap`
- `POST /sync/changes`

No additional backend route should be introduced unless the planned product behavior cannot be expressed through Supabase Auth, PostgreSQL, Prisma, or the above sync transport.
