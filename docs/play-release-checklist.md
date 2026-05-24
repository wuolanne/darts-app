# Play Store release checklist

## A. Repo / app readiness

- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] no debug text
- [ ] no test data
- [ ] no Pro/paywall UI
- [ ] no login UI
- [ ] no ads/analytics SDK
- [ ] localStorage empty state works
- [ ] old localStorage data does not crash app
- [ ] English/Finnish language switch works
- [ ] checkout logic verified
- [ ] Around the Clock stats verified
- [ ] home stats verified
- [ ] app title/name checked
- [ ] privacy policy added
- [ ] app icon master file added or still marked as missing

## B. App icon / visual assets

- [ ] 512x512 PNG app icon created
- [ ] no transparency in Play Store icon
- [ ] no text in icon
- [ ] icon works at small size
- [ ] app icon stored as `public/icons/icon-512.png` or documented equivalent
- [ ] favicon generated if needed
- [ ] Android launcher icons generated later from master icon
- [ ] feature graphic created
- [ ] screenshots created

## C. Android packaging

- [ ] Capacitor/Android project exists
- [ ] package name selected
- [ ] app icon added
- [ ] splash screen added
- [ ] versionName set
- [ ] versionCode set
- [ ] targetSdkVersion 35 or newer
- [ ] `.aab` build created
- [ ] app installs on real Android device
- [ ] app works offline

## D. Google Play Console

- [ ] create app
- [ ] default language selected
- [ ] app name added
- [ ] app type: App
- [ ] price: Free
- [ ] contact email added
- [ ] app category selected
- [ ] content rating completed
- [ ] Data safety completed
- [ ] privacy policy URL added
- [ ] screenshots added
- [ ] feature graphic added
- [ ] internal testing release created
- [ ] closed testing started if required
- [ ] production access requested if required
- [ ] production release created

## E. Store assets

- [ ] app icon
- [ ] feature graphic
- [ ] phone screenshots
- [ ] short description
- [ ] full description
- [ ] privacy policy URL
- [ ] support email

## F. Manual GitHub Pages notes

- Preferred:
  - Repo Settings -> Pages -> Deploy from branch -> `main` -> `/docs`
- Expected privacy URL:
  - `https://wuolanne.github.io/darts-app/privacy-policy.html`
- Verify the URL works before entering it in Play Console.
- If repo is private and GitHub Pages does not publish on current plan, either:
  1. make this repo public, or
  2. create a separate public repo for legal/privacy pages.

## G. Fallback public privacy repo notes

- Optional fallback repo name:
  - `wuolanne/dartsflow-legal`
- Add `privacy-policy.html` there.
- Enable GitHub Pages.
- Expected fallback URL:
  - `https://wuolanne.github.io/dartsflow-legal/privacy-policy.html`
