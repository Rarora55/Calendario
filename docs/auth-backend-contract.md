# Backend Contract for Secure Google Login

This app now requires backend validation of the Google `id_token` before creating a local session.

## Environment variable used by the app

```env
EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT=https://your-api.example.com/auth/google/verify
```

## Expected request

`POST /auth/google/verify`

```json
{
  "provider": "google",
  "idToken": "<google-id-token>"
}
```

## Expected success response

```json
{
  "user": {
    "id": "user_123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "picture": "https://..."
  },
  "session": {
    "accessToken": "<app-jwt>",
    "tokenType": "Bearer"
  }
}
```

## Required backend checks

1. Verify token signature against Google JWKS.
2. Validate `iss` is Google issuer.
3. Validate `aud` matches your Google OAuth client IDs.
4. Validate `exp` and `iat`.
5. Validate `email_verified`.
6. Map/create internal user and return only required profile fields.

## Authorization and abuse controls

1. Protect all private endpoints with your own session/JWT, never with Google token directly.
2. Enforce per-user authorization checks in every endpoint.
3. Add rate limiting to login and auth endpoints (for example: 5 requests/minute by IP + user id).
4. Never log raw tokens, auth headers, or full PII payloads.
