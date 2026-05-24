# Android build notes

## Open the Android project in Android Studio

After Capacitor setup:

1. Open Android Studio
2. Choose **Open**
3. Select the `android/` folder from this repository
4. Let Android Studio sync the Gradle project

## Android system bars and back button

- Status bar color is set to a dark app-matching color: `#10141B`
- Navigation bar color is set to the same dark color: `#10141B`
- Light system bar icons are forced off so Android uses light icons on the dark background
- Android hardware back button is handled by the app:
  - it navigates back inside the app when you are in a nested screen
  - it exits only from the home screen

Test this on a real Android phone before building the final signed `.aab`.

## Build a signed Android App Bundle

In Android Studio:

1. Open **Build**
2. Select **Generate Signed Bundle / APK**
3. Choose **Android App Bundle**
4. Create or select your keystore
5. Fill in the key alias and passwords
6. Choose the `release` build variant
7. Build the signed `.aab`

## Security note

Do not commit any of these to the repository:

- keystore files
- signing keys
- passwords
- certificates

Release signing must stay local or in secure CI secrets.

## Upload to Google Play internal testing

In Google Play Console:

1. Open your app
2. Go to **Testing** -> **Internal testing**
3. Create a new release
4. Upload the signed `.aab`
5. Add release notes
6. Save and review the release
7. Roll out to internal testing

## Launcher icon note

The Android project currently points to the default launcher icon resources.

The intended source file is:

- `public/icons/icon-512.png`

That file is currently missing from the repository, so launcher icon generation still needs to be done manually later in Android Studio or with an icon generation tool after the final icon exists.
