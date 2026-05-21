# FinishLab / Darts Practice App

A mobile-first darts training app focused on real practice, not scorekeeping.

This app is **not** intended to replace DartCounter as a match scorer. DartCounter can remain the best tool for games and scoring. This app focuses on the parts that many scorer apps do not handle well: checkout practice, timed routines, sector-by-sector training, personal bests, and low-input training.

## Product positioning

**Not a scorer. Not just a checkout table. A fast darts practice app for finishing, routines, and timed training.**

The app should be built in English from the beginning because darts terminology and the target market are international.

Core principles:

- English-only UI for the MVP.
- Mobile-first design.
- Dark, clean, sport-focused UI.
- Large buttons, large numbers, easy one-handed use.
- During practice the user should look at the dartboard, not the phone.
- Do not require logging every dart.
- Default experience is low-input: one tap when a target, sector, or attempt is complete.
- Detailed dart-by-dart input can be added later, but it must never be required.

## Main feature pillars

### 1. Checkout Practice

DartZone-style checkout thinking, but with our own product identity and training philosophy.

The app should generate checkout situations and help the player learn good finishing routes, bogey avoidance, and preferred-double thinking.

MVP behaviour:

- Generate random checkout numbers by range.
- Supported ranges:
  - 41-60
  - 61-80
  - 81-100
  - 101-130
  - 131-170
- User can choose preferred double:
  - D16
  - D20
  - D18
  - D12
  - Custom later
- Timer options:
  - Off
  - 10 seconds
  - 20 seconds
  - 30 seconds
- Low-input result buttons:
  - FINISHED
  - GOOD LEAVE
  - FAILED
  - BUST
  - SHOW ROUTE
- The app should show short, clear feedback after each attempt.

Example feedback language:

- Good route
- Leaves D16 chain
- Avoids bogey number
- Leaves a finish under 60 after a single miss
- Bad leave
- Bust risk
- Does not match your preferred double route

The app should avoid unclear terms such as “rest easy double”. Use clear darts English: finish, leave, bogey, preferred double, route, bust, setup.

### 2. Timed Around the Clock

This is a core differentiator. The app must support timed practice where the user taps only when a target or sector is completed.

Basic modes:

- Around the Clock Singles
- Around the Clock Doubles
- Around the Clock Trebles
- Full Sector Around the Clock
- Custom Routine later

For timed training, the app records:

- Total time
- Active time
- Pause time
- Time per target/sector
- Fastest target/sector
- Slowest target/sector
- Average target/sector time
- Personal best comparison
- Estimated darts, if throw pace is set

### 3. Full Sector Around the Clock

The app must support a training mode called **Full Sector Around the Clock**.

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

For each numbered sector, the user must complete the selected requirements, for example:

- S7 + T7 + D7
- or S7 + T7 + D7 + D7

The double requirement must be configurable:

- 1 double hit
- 2 double hits
- custom amount later

Important: the app must **not** ask the user to mark individual hits. It only shows what needs to be completed. The user taps **SECTOR DONE** when the full sector is complete.

Example screen content:

```text
Full Sector Around the Clock

Current: 7

Complete:
S7 + T7 + D7 + D7

Sector time: 02:14
Total time: 18:42

[SECTOR DONE]
[PAUSE]
[UNDO]
```

### 4. Throw Pace and Estimated Darts

The user can optionally set an average throw pace. This is used to estimate darts thrown in long timed sessions.

Settings:

- Fast: 7 seconds per 3 darts
- Normal: 10 seconds per 3 darts
- Relaxed: 13 seconds per 3 darts
- Custom seconds per 3 darts
- Skip / not set

The app should always display this as an estimate:

```text
Estimated darts: ~716
Based on 9 sec / 3 darts
```

Pause time should not count toward estimated darts.

The setup can be offered during first launch, but it must not block the user. It must also be editable later in Settings.

### 5. Training Sessions

The app should include ready-made sessions so the user does not need to think what to practice.

Examples:

- 15 min D16 Finishing
- 10 min Checkout Pressure
- 41-60 Checkout Speedrun
- 61-80 Checkout Speedrun
- Around the Clock Doubles
- Full Sector Around the Clock
- D16 Ladder
- Favourite Double Pressure

Example 15 minute session:

```text
15 min D16 Finishing

3 min: D16 / D8 / D4 ladder
5 min: 41-60 checkouts
5 min: 61-80 D16 routes
2 min: favourite double pressure
```

### 6. Stats

Keep stats useful but not overwhelming.

MVP stats:

- Last 7 days
- Last 30 days
- Total
- Attempts
- Checkout success rate
- Good leave rate
- Bust rate
- Average attempt time
- Personal bests
- Around the Clock total times
- Sector breakdowns
- Fastest and slowest sectors
- Estimated darts for timed sessions

## Suggested MVP screens

### Home / Training

Cards:

- Quick Checkout Practice
- 15 Min Training
- Speedrun
- Around the Clock
- Checkout Library
- Stats
- Settings

### Checkout Practice

- Finish number
- Timer/progress bar if enabled
- Preferred double indicator
- Optional route hint
- Large result buttons:
  - FINISHED
  - GOOD LEAVE
  - FAILED
  - BUST
  - SHOW ROUTE

### Around the Clock

- Mode selection
- Current target/sector
- Total time
- Current target/sector time
- Large TARGET DONE or SECTOR DONE button
- Pause
- Undo

### Session Result

- Total time
- Active time
- Pause time
- Success rate when relevant
- Estimated darts when throw pace is set
- Personal best comparison
- Fastest/slowest sector
- Full sector breakdown

### Settings

- Preferred double
- Throw pace
- Timer defaults
- Vibration feedback
- Data export/import later

## What not to build in MVP

Do not build these yet:

- Online match play
- Full X01 scorer
- Camera or automatic scoring
- Cloud sync
- Leaderboards
- Payments/subscriptions
- User accounts
- Heavy gamification
- Exact DartZone UI clone
- Pixel-font retro copy
- Detailed dart-by-dart logging as the default

## Visual direction

Do not copy DartZone visually. It uses a strong pixel-font / dark blue / retro game style. Our app should have its own identity:

- Dark, clean, modern sports UI
- Large readable typography
- Clear cards
- High contrast
- Minimal interaction during practice
- Big buttons suitable for sweaty hands / quick taps between throws

## Working name

Possible names:

- FinishLab
- CheckoutLab
- OcheTimer
- Darts Practice Timer

Current preferred working name: **FinishLab**.
