# Android Release Guide (Real App Install)

This guide is for installing your app as a real Android application, not as a development tool.

## 1. Prerequisites

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Login:

```bash
eas login
```

3. Configure EAS once in project root:

```bash
eas build:configure
```

## 2. Backend requirement for Google login

Your app now requires server token verification.
`EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT` must be a public reachable URL (HTTPS recommended).

Do not use:
- `localhost`
- `10.0.2.2`

For release builds, set for EAS environment:

```bash
eas env:create --name EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT --value https://api.yourdomain.com/auth/google/verify --environment preview
eas env:create --name EXPO_PUBLIC_AUTH_VERIFY_ENDPOINT --value https://api.yourdomain.com/auth/google/verify --environment production
```

## 3. Build APK for direct install (internal testing)

```bash
eas build -p android --profile preview
```

- Output is an APK.
- Download from the EAS build URL and install on device.

## 4. Build AAB for Play Store

```bash
eas build -p android --profile production
```

- Output is an AAB.
- Use this file for Google Play upload.

## 5. Optional: submit to Google Play

```bash
eas submit -p android --profile production
```

## 6. Current build profiles

Defined in `eas.json`:
- `preview`: internal distribution, `android.buildType=apk`
- `production`: `android.buildType=app-bundle`
