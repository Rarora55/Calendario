# Calendario Auth Backend

Minimal backend for secure Google login verification.

## What it provides

- `POST /auth/google/verify`
  - Verifies Google `id_token` with Google public keys.
  - Validates issuer, audience, and `email_verified`.
  - Returns sanitized `user` data and an app `accessToken`.
- `GET /me`
  - Example protected endpoint requiring app token.
- `GET /users/:userId/calendars`
  - Example endpoint with per-user authorization check.
- Rate limiting for auth endpoint and general traffic.

## Setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Fill `.env`:

```env
PORT=4000
APP_JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
GOOGLE_OAUTH_AUDIENCES=client1.apps.googleusercontent.com,client2.apps.googleusercontent.com
```

3. Install and run:

```bash
npm install
npm run dev
```

## Connect mobile app

Set in app `.env`:

```env
EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT=http://localhost:4000/auth/google/verify
```

Notes:
- Android emulator usually needs `http://10.0.2.2:4000/auth/google/verify`.
- Physical devices need your machine LAN IP.
