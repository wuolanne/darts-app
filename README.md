# Darts Practice

Mobile-first darts practice app for checkout training, timed checkout routines and Around the Clock drills.

The app is intentionally **not** a full X01 scorer, match scorer or online darts platform. The product focus is simple: help a player practise useful checkout decisions under light time pressure with as little phone input as possible.

> Public app name for Google Play is still a product decision. For store search visibility, the strongest direction is to start the listing title with **Darts**, for example **Darts Practice**, **Darts Checkout Trainer**, **Darts FinishLab** or **Darts Practice – DartFlow**.

---

## Current product direction before Google Play release

The app should be positioned as a **practice tool**, not as another darts scorer.

Core promise:

```text
Practise real checkout decisions. Beat your times. Learn better routes.
```

The strongest MVP angle is:

- checkout practice from realistic finish ranges
- timed checkout runs
- Around the Clock routines
- route hints when needed
- local personal bests and session history
- no account, no backend, no camera setup, no complicated scoring

### What the app should not emphasize

Before the first Play Store release, avoid features and wording that make the app feel heavier than it is.

Do not emphasize:

- full X01 match scoring
- online play
- camera scoring
- AI coaching
- detailed dart-by-dart statistics
- hit accuracy analytics
- throw pace analytics
- onboarding questions about skill level, accuracy or throw speed
- Pro subscription as a launch requirement

The app is strongest when it feels like a fast training timer and checkout helper.

---

## Deep research summary

### Market position

The darts app market already has strong scoring and match-tracking apps. The clearest opportunity for this app is a narrower practice-focused position:

```text
A lightweight darts checkout practice app for players who already know how to score, but want better routines.
```

Most players do not need another full scorer. They need a simple way to practise:

- what to throw on common checkouts
- what to do after a single miss
- how quickly they can clear a range
- which doubles or sectors are slowest
- whether their practice is improving over time

This gives the app a clean niche:

| Category | Typical competitor focus | This app should focus on |
| --- | --- | --- |
| X01 scorers | match scoring, legs, sets, averages | not the focus |
| Online darts apps | camera play, remote matches, accounts | not the focus |
| Training apps | many modes, often broad stats | checkout routes + timed routines |
| Manual notes/spreadsheets | flexible but slow | low-input mobile training |

### Recommended first-release positioning

Use a direct Play Store message:

```text
Darts practice app for checkout training, timed finish runs and Around the Clock routines.
```

Avoid overpromising. The first version should feel polished, reliable and honest.

Recommended keywords for store text:

- darts practice
- darts checkout
- checkout trainer
- darts training
- around the clock darts
- darts doubles practice
- darts finish routes
- darts timer

### Naming research and recommendation

For app store discovery, the listing title should contain the searched word **Darts** early.

Best practical options:

1. **Darts Practice**
   - clearest keyword match
   - broad and simple
   - slightly generic

2. **Darts Checkout Trainer**
   - strongest match to the core feature
   - immediately tells what the app does
   - less brand-like, more utility-like

3. **Darts Practice – DartFlow**
   - keeps a brand name but still includes search keywords
   - good if DartFlow is used as the product identity
   - better than using only “DartFlow”

4. **Darts FinishLab**
   - brandable and still keyword-friendly
   - slightly less obvious for casual users than “Checkout Trainer”

Recommended launch title:

```text
Darts Checkout Trainer
```

Alternative if brand is important:

```text
Darts Practice – DartFlow
```

### Monetization recommendation

Do **not** force Pro into the first release unless the implementation is already clean and low-risk.

Recommended launch model:

- free MVP
- no account
- no paywall blocking the core experience
- collect feedback first
- add Pro later only after the training loop is proven useful

Possible future Pro features:

- more saved history
- advanced personal bests
- custom routines
- export/import data
- theme packs
- advanced checkout route sets
- more detailed training summaries

Do not build Pro around hit accuracy or throw pace if the app direction is checkout learning and timed practice.

---

## Play Store release readiness

This repository is currently a React + TypeScript + Vite app. For Google Play release, the app also needs an Android packaging path, for example Capacitor, a Trusted Web Activity, or another Android wrapper/build setup.

### Google Play technical checklist

Before production release:

- create final package name carefully because package names are permanent and cannot be reused later
- build an Android App Bundle (`.aab`) for Play distribution
- target the current required Android API level
- enable Play App Signing
- prepare privacy policy URL
- complete Data safety form
- complete content rating questionnaire
- add store listing text and graphics
- test install on real Android devices
- verify offline/local-storage behaviour
- verify that no private/test text is visible in production

### Current Google Play requirements to keep in mind

Google Play requires new apps and app updates submitted from 31 August 2025 onward to target Android 15 / API level 35 or higher, except certain non-phone form factors. If this app is packaged for Android, the Android project must therefore target API 35 or newer.

Google Play uses Android App Bundles for optimized delivery. The Play Console app setup flow also requires declaring whether the app is free or paid, adding a contact email, accepting Play App Signing terms and completing policy declarations.

Even apps that do not collect user data must complete the Data safety form and provide a privacy policy. For this app, the safest launch position is to keep all training history local-only and avoid analytics/ads/SDKs until the first release is accepted.

### Personal developer account testing note

If the Google Play developer account is a new personal account created after 13 November 2023, Google Play may require closed testing before production release. Plan the release schedule so testing requirements do not delay launch unexpectedly.

---

## Privacy and data model

MVP principle:

```text
Training data stays on the device.
```

The app should not require login or transmit training data to a backend in the first release.

Locally stored data may include:

- user settings
- checkout attempts
- timed checkout sessions
- Around the Clock sessions
- custom target selections
- local personal bests

Data that should not be collected in MVP:

- name
- email
- precise location
- contacts
- photos/videos
- microphone/audio
- device advertising ID
- payment data
- health data
- unnecessary analytics identifiers

If analytics, crash reporting, ads or billing are added later, the privacy policy and Google Play Data safety form must be updated before release.

---

## Product principles

1. The app must be usable at the dartboard with minimal taps.
2. The user should mostly look at the board, not the phone.
3. Buttons must be large and readable.
4. Timers must be simple and easy to understand.
5. Checkout routes must be practical, not over-explained.
6. Local progress must be visible without building heavy statistics.
7. The app should teach better checkout thinking through repetition.
8. The app should not ask unnecessary setup questions before training starts.
9. The first release should be polished before it is broad.
10. Build future Pro features behind clean architecture, not rushed paywalls.

---

## Implemented / planned MVP features

### Home / Training

Main entry points:

- Quick Checkout Practice
- Checkout Timed Run
- Around the Clock
- Checkout Library
- Stats
- Settings

### Quick Checkout Practice

Purpose:

```text
Practise one checkout at a time with low input.
```

Expected behaviour:

- checkout ranges start from 61
- bogey numbers are excluded
- route hint is optional
- user can practise route decisions without full dart-by-dart scoring
- feedback stays visible until the next checkout
- single-hit continuation logic must not suggest impossible 3-dart follow-ups after the first dart has already been thrown

Important route example:

```text
Finish 122
Main: T18 -> T20 -> D4
If S18: 104 left -> T18 -> Bull
```

### Checkout Timed Run

Purpose:

```text
Measure how fast the user can complete a checkout range.
```

Recommended ranges:

- 61-70
- 71-80
- 81-90
- 91-100
- 101-120
- 121-140
- 141-170
- All
- Custom

Expected results:

- total time
- finished count
- failed/bust count
- full checkout breakdown
- local personal best comparison

Use UI name:

```text
Checkout Timed Run
```

Do not use old UI name:

```text
Checkout Speedrun
```

### Around the Clock

Modes:

- Singles
- Doubles
- Trebles
- Common Doubles
- Custom
- Full Sector

Common Doubles order:

```text
D20 -> D10 -> D5 -> D16 -> D8 -> D4 -> D12 -> D18
```

Full Sector idea:

- Bull
- 25
- Sector 1
- Sector 2
- ...
- Sector 20

For each numbered sector, the user completes the required single, treble and double work, then taps `SECTOR DONE`.

### Checkout Library

Purpose:

```text
Fast reference for practical checkout routes.
```

Recommended grouping:

- 61-80
- 81-100
- 101-120
- 121-140
- 141-170

Keep details compact:

```text
Finish 122
Main: T18 -> T20 -> D4
If S18: 104 left -> T18 -> Bull
```

### Stats

Stats should support the core training promise without becoming the main product.

Useful stats:

- recent sessions
- best times
- completed ranges
- fastest/slowest targets or sectors
- simple 7 day / 30 day / total filters

Avoid for launch:

- hit accuracy dashboards
- throw pace analytics
- complex performance scoring
- confusing percentages that do not directly help checkout practice

---

## Out of scope for the first Play Store release

Do not add before first release unless explicitly decided:

- full X01 scorer
- online multiplayer
- login/account system
- backend sync
- camera scoring
- AI coach
- paid Pro subscription
- ads
- social sharing
- global leaderboards
- detailed hit accuracy tracking
- throw pace calibration/onboarding
- heavy guided workout programme builder

---

## Suggested Google Play listing draft

### Short description

```text
Darts checkout practice, timed finish runs and Around the Clock training.
```

### Full description draft

```text
Darts Checkout Trainer helps you practise real darts checkout situations with simple, low-input training modes.

Train useful checkout ranges, run timed finish challenges, practise doubles with Around the Clock routines and check compact route hints when you need them.

Built for players who want to improve at the board without turning every practice session into complicated scorekeeping.

Features:
• Quick checkout practice from realistic finish ranges
• Timed checkout runs for personal bests
• Around the Clock singles, doubles, trebles and custom targets
• Common doubles routine
• Compact checkout route library
• Local session history and simple stats
• No login required
• Training data stays on your device

This is not a full match scorer or online darts platform. It is a focused practice tool for checkout training and timed routines.
```

### Screenshot ideas

Use screenshots that show the value immediately:

1. Home / Training screen
2. Quick Checkout Practice with a clear finish number
3. Route hint example for a real checkout
4. Checkout Timed Run result screen
5. Around the Clock Common Doubles
6. Stats / personal bests
7. Settings / theme choice if visually strong

### First screenshots should communicate

- “This is for darts.”
- “This is about checkout practice.”
- “This is easy to use at the board.”
- “I can improve my times.”

---

## Technical stack

- React 18
- TypeScript
- Vite 5
- LocalStorage

Current package scripts:

```bash
npm run dev
npm run typecheck
npm run build
npm run preview
```

`npm run build` runs TypeScript checking first and then creates the Vite production build.

---

## Project structure

Expected source areas:

```text
src/screens
src/components
src/storage
src/theme
src/utils
src/types
```

Product direction files:

```text
.codex/TASK.md
.codex/CURRENT_TASK.md
docs/monetization-and-naming.md
```

Before coding, read the Codex task files and keep the implementation aligned with the latest product direction.

---

## Local development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Run typecheck:

```bash
npm run typecheck
```

Create production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Pre-release QA checklist

Run before Play Store submission:

### Product checks

- [ ] App opens directly to a useful training/home screen
- [ ] UI language is English
- [ ] No unfinished Pro/paywall UI is visible
- [ ] No test/debug copy is visible
- [ ] Checkout games do not include finishes below 61
- [ ] Bogey numbers are excluded
- [ ] Finish 122 route is correct
- [ ] Bull is handled as a valid 50-point finish
- [ ] Timers show whole seconds only
- [ ] Feedback panels do not disappear too quickly
- [ ] Around the Clock Common Doubles includes D5
- [ ] Custom targets can be selected and persisted
- [ ] Theme selection persists
- [ ] Local stats/history survives app restart

### Technical checks

- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Android build produces a valid `.aab`
- [ ] App targets required Android API level
- [ ] App installs on at least one real Android device
- [ ] App works offline
- [ ] App does not request unnecessary permissions
- [ ] Local storage reset/empty state works
- [ ] Production build has no console errors in normal flows

### Play Console checks

- [ ] Final app name selected
- [ ] Final package name selected
- [ ] App category selected
- [ ] Contact email added
- [ ] Privacy policy published
- [ ] Data safety form completed
- [ ] Content rating completed
- [ ] Store listing text added
- [ ] Screenshots added
- [ ] Feature graphic added
- [ ] Closed/internal testing completed if required
- [ ] Production release notes written

---

## Recommended next actions before Play Store

1. Decide final store name.
2. Remove or hide launch-confusing features: hit accuracy, throw pace analytics and onboarding skill questions.
3. Verify the checkout route logic with the most common finishes from 61-170.
4. Polish the first 3 screenshots because they will sell the app more than long text.
5. Add Android packaging if it is not already present.
6. Create privacy policy matching the local-only data model.
7. Run a small closed test with real darts players.
8. Release free MVP first.
9. Add Pro only after users confirm the core practice loop is useful.

---

## Codex continuation prompt

Use this when continuing implementation with Codex:

```text
Repo: wuolanne/darts-app
Branch: main

Read README.md, .codex/TASK.md and .codex/CURRENT_TASK.md first.

The app is close to Google Play release. Keep the scope focused:
- mobile-first darts checkout practice app
- no full X01 scorer
- no backend
- no login
- no Pro/paywall for first release unless already explicitly implemented cleanly
- no hit accuracy dashboard
- no throw pace onboarding or analytics emphasis

Before coding, verify the current implementation against the README pre-release checklist.

Prioritize:
1. Play Store readiness
2. route correctness
3. mobile usability
4. clean visual polish
5. local-only privacy model
6. build stability

Run:
- npm run typecheck
- npm run build

Fix failures caused by your changes.

Final response: summarize files changed, checks run, and remaining Play Store blockers.
```

---

## Sources for release planning

Official references to verify before submission:

- Google Play target API level requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play app setup and app bundles: https://support.google.com/googleplay/android-developer/answer/9859152
- Google Play Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play testing requirements for new personal developer accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Android core app quality guidelines: https://developer.android.com/docs/quality-guidelines/core-app-quality
