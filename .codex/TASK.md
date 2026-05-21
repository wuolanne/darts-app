# Codex Task: Build the FinishLab darts practice app MVP

## Repository

`wuolanne/darts-app`

## Goal

Build a mobile-first darts practice app called **FinishLab**.

This is **not** a DartCounter replacement and **not** a full match scorer. The product is focused on practice: checkout training, timed routines, sector-by-sector Around the Clock, personal bests, and low-input training.

The app must be in **English**.

## Core product principles

1. Do not build a full X01 scorer for MVP.
2. Do not build online play.
3. Do not require users to log every dart.
4. Default practice flow must be low-input.
5. The user should be able to practice by looking at the dartboard, not the phone.
6. Use large buttons and readable text.
7. Store data locally first.
8. No login, no payments, no backend in MVP unless the existing project already has a simple local-only setup.
9. Do not copy DartZone’s UI. Similar product category is OK, but create our own layout and visual style.
10. The app must support switchable visual themes: Dark, Light, Dim and System.

## MVP features to implement

### 1. Home / Training screen

Create a home/training screen with cards for:

- Quick Checkout Practice
- 15 Min Training
- Speedrun
- Around the Clock
- Checkout Library
- Stats
- Settings

The first functional paths should be:

- Quick Checkout Practice
- Around the Clock
- Stats
- Settings

Other cards can be present as placeholders if needed, but should look intentional.

### 2. Settings

Implement local settings:

#### Preferred double

Options:

- D16
- D20
- D18
- D12
- Not sure

Default: D16.

#### Throw pace

Used for estimated darts in timed sessions.

Options:

- Fast: 7 sec / 3 darts
- Normal: 10 sec / 3 darts
- Relaxed: 13 sec / 3 darts
- Custom seconds per 3 darts
- Not set

Display estimated darts only as an estimate:

```text
Estimated darts: ~716
Based on 9 sec / 3 darts
```

Pause time must not count toward estimated darts.

#### Timer defaults

- Off
- 10 seconds
- 20 seconds
- 30 seconds

#### Theme

The user must be able to switch the app theme.

Options:

- Dark
- Light
- Dim
- System

Default: Dark.

Theme definitions:

- Dark: the default dark sports-style app theme.
- Light: a clean light theme for bright environments.
- Dim: a middle theme between dark and light, softer than Dark and less bright than Light.
- System: follow device appearance if the selected framework supports it reasonably.

The selected theme must affect the whole app:

- screen backgrounds
- cards
- text
- buttons
- accents
- timers/progress bars
- stats views
- practice views

Implementation requirement:

- Use a central theme/tokens structure.
- Do not hardcode colors directly throughout components.
- It must be easy to add more themes later.

#### Vibration feedback

Boolean setting. It can be UI-only if native haptics are not available yet.

### 3. Checkout Practice

Implement a low-input checkout practice mode.

#### Setup

User can choose:

- Checkout range:
  - 41-60
  - 61-80
  - 81-100
  - 101-130
  - 131-170
- Timer:
  - Off
  - 10 sec
  - 20 sec
  - 30 sec
- Preferred double uses global setting.

#### Practice screen

Show:

- Current finish number, for example `Finish: 76`
- Timer/progress if enabled
- Preferred double indicator, for example `Preferred double: D16`
- Optional route hint hidden behind `Show route`

Default low-input result buttons:

- FINISHED
- GOOD LEAVE
- FAILED
- BUST
- SHOW ROUTE

Do not require dart-by-dart input.

#### Feedback

After each attempt, show short feedback and a Next Checkout button.

Use clear English. Avoid unclear terms like “rest easy double”.

Examples:

- Good route
- Leaves D16 chain
- Avoids bogey number
- Leaves a finish under 60 after a single miss
- Bad leave
- Bust risk
- Does not match your preferred double route

Store attempt data locally:

- timestamp
- finish number
- range
- result: finished / good_leave / failed / bust
- preferred double
- elapsed time if timer was active

### 4. Around the Clock

Implement low-input timed Around the Clock.

Modes:

- Singles
- Doubles
- Trebles
- Full Sector

#### Common timed session behaviour

Show:

- Mode name
- Current target or sector
- Total time
- Current target/sector time
- Large button:
  - TARGET DONE for Singles/Doubles/Trebles/Bull/25
  - SECTOR DONE for Full Sector
- Pause
- Undo

When the user taps done:

- record elapsed active time for that target/sector
- advance to next target/sector

At the end, save the session locally and show results:

- Total time
- Active time
- Pause time
- Estimated darts if throw pace is set
- Fastest target/sector
- Slowest target/sector
- Average target/sector time
- Full breakdown
- Personal best comparison if possible

### 5. Full Sector Around the Clock

This is a key custom feature.

Default order:

1. Bull
2. 25
3. Sector 1
4. Sector 2
5. ...
6. Sector 20

For Bull:

- User completes Bull.
- User taps TARGET DONE.

For 25:

- User completes 25.
- User taps TARGET DONE.

For each numbered sector, show the required work but do not ask the user to mark individual hits.

Example for sector 7 with two doubles required:

```text
Current: 7
Complete:
S7 + T7 + D7 + D7
```

Double requirement must be configurable before starting:

- 1 double hit
- 2 double hits

Default: 1 double hit.

The user taps SECTOR DONE only after the whole sector is complete.

### 6. Stats

Implement simple stats from local data.

Tabs or filters:

- 7 Days
- 30 Days
- Total

Checkout stats:

- Attempts
- Success rate
- Good leave rate
- Bust rate
- Average attempt time when timer is enabled

Timed practice stats:

- Number of sessions
- Best total time per mode
- Average total time per mode
- Latest result per mode
- Fastest/slowest sectors for Around the Clock modes
- Estimated darts when available

Keep stats simple and useful. Avoid overbuilding.

## Data model suggestion

Use local storage / AsyncStorage / SQLite / whatever fits the stack. Keep it simple.

Suggested objects:

```ts
type PreferredDouble = 'D16' | 'D20' | 'D18' | 'D12' | 'NOT_SURE';

type ThrowPace = {
  mode: 'FAST' | 'NORMAL' | 'RELAXED' | 'CUSTOM' | 'NOT_SET';
  secondsPerVisit?: number; // one visit = 3 darts
};

type ThemeMode = 'DARK' | 'LIGHT' | 'DIM' | 'SYSTEM';

type AppSettings = {
  preferredDouble: PreferredDouble;
  throwPace: ThrowPace;
  theme: ThemeMode;
  timerDefaultSeconds?: 10 | 20 | 30;
  vibrationFeedback: boolean;
};

type CheckoutAttempt = {
  id: string;
  createdAt: string;
  finish: number;
  range: string;
  preferredDouble: PreferredDouble;
  result: 'FINISHED' | 'GOOD_LEAVE' | 'FAILED' | 'BUST';
  elapsedSeconds?: number;
};

type TimedTargetResult = {
  label: string; // e.g. Bull, 25, D16, Sector 7
  elapsedSeconds: number;
};

type TimedSession = {
  id: string;
  createdAt: string;
  mode: 'ATC_SINGLES' | 'ATC_DOUBLES' | 'ATC_TREBLES' | 'FULL_SECTOR';
  doubleRequirement?: 1 | 2;
  totalSeconds: number;
  activeSeconds: number;
  pausedSeconds: number;
  estimatedDarts?: number;
  throwPaceSecondsPerVisit?: number;
  targets: TimedTargetResult[];
};
```

## Checkout route logic

For MVP, route logic can be simple. It does not need to be perfect professional-level logic on day one.

Implement a route table for common finishes, especially 41-100. Add basic routes for 101-170 if easy.

The app should be structured so route logic can be improved later.

Preferred-double support can be basic in MVP:

- Show default route.
- If preferred double is D16 and there is a known D16-friendly route, show it.
- Otherwise show default route and label it clearly.

## Visual design

Create our own look:

- Dark sports-style theme by default
- Switchable themes: Dark, Light, Dim, System
- Clean sports-app style
- Large typography
- Big buttons
- Clear cards
- High contrast in Dark and Light
- Softer contrast in Dim
- Centralized theme tokens
- No direct DartZone clone
- No pixel-font requirement

## Acceptance criteria

The MVP is acceptable when:

1. App starts and shows English Home / Training screen.
2. User can change preferred double and throw pace in Settings.
3. User can switch the app theme between Dark, Light, Dim and System.
4. Theme selection affects the whole app and persists locally.
5. User can run a Checkout Practice session without logging every dart.
6. Checkout attempts are stored locally.
7. User can run Around the Clock Singles/Doubles/Trebles.
8. User can run Full Sector Around the Clock with 1 or 2 required double hits.
9. Timed sessions record per-target/per-sector time.
10. Session result shows total time, active time, fastest/slowest target or sector, and estimated darts when throw pace is set.
11. Stats screen shows basic 7 day / 30 day / total stats.
12. No login, backend, payment, online play, camera scoring, or full X01 scorer is added.

## Build and quality

- Keep code simple and maintainable.
- Add README notes for how to run the app.
- Do not add unnecessary dependencies.
- Ensure the project builds successfully.
- If tests or lint scripts exist, run them and fix failures.
