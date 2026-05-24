# Android packaging plan

Current app stack:

- React
- TypeScript
- Vite

Google Play release requires Android packaging.

## Recommended path

Recommended wrapper/build path: Capacitor

## Recommended Android package name

Recommended:

`com.wuolanne.dartflow`

Alternative:

`com.wuolanne.dartsflow`

Preferred recommendation:

`com.wuolanne.dartflow`

## Draft commands

Do not run these until you are ready to create the Android project:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "DartsFlow" "com.wuolanne.dartflow" --web-dir=dist
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## Manual Android Studio steps

- verify `targetSdkVersion` 35 or newer
- set app icon
- set splash screen
- build signed Android App Bundle
- upload `.aab` to Play Console internal testing

## Security note

Do not commit signing keys, keystore files, passwords or Play Console secrets into the repository.

Keystore creation and release signing should be done safely later:

- locally on a trusted machine, or
- through CI secrets
