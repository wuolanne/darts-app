# Current Codex Task: Checkout logic, ranges and Around the Clock improvements

Repo: `wuolanne/darts-app`
Branch: `main`

Read this file before coding. Also keep `.codex/TASK.md` as the long-term product spec.

## Product principles

- App UI language: English.
- README and repo notes may be Finnish.
- This is a darts practice app, not a full X01 scorer.
- Keep practice low-input: the user should not have to mark every dart unless the specific mini game asks for a target choice.
- Store MVP data locally.
- Do not add backend, login, payments, camera scoring, AI or online play.
- Do not copy DartZone UI directly. Use our own calmer sports-app style.

## Current priorities

Implement and/or verify the following behaviour.

## 1. Checkout ranges

Checkout practice games must not include checkouts below 61.

Use these preset ranges for checkout-based games:

- 61-70
- 71-80
- 81-90
- 91-100
- 101-120
- 121-140
- 141-170
- All
- Custom

Apply to:

- Quick Checkout Practice
- Checkout Timed Run
- any checkout-based setup screen

Custom range rules:

- minimum: 61
- maximum: 170
- `from <= to`
- exclude bogey numbers:
  - 169
  - 168
  - 166
  - 165
  - 163
  - 162
  - 159

`All` means all playable checkout finishes from 61 to 170 excluding bogeys. If a mode requires route data, include only finishes with valid route data.

If an old saved setting points below 61, safely fall back to 61-70.

## 2. Checkout Library grouping

The Checkout Library should group finishes as:

- 61-80
- 81-100
- 101-120
- 121-140
- 141-180 / 141-170 depending on implemented data

Do not show the small right-side counter badge like `10 finishes` or `20 finishes`; it is unnecessary.

Selected finish details must be compact.

Preferred compact format:

```text
Finish 122
Main: T18 -> T20 -> D4
If S18: 104 left -> T18 -> Bull
```

Avoid unnecessary multi-line explanation like:

```text
Route: ...
If single hit: ...
Remaining: ...
Follow-up: ...
```

Use compact rows instead.

## 3. Checkout route data and single-hit continuation logic

Important concept:

A 3-dart checkout route and a single-hit continuation are different things.

If the first dart of a 3-dart checkout misses into the single, there are only 2 darts left. The continuation after that single-hit must be a max 2-dart checkout.

Example:

```text
Finish 122
Main route: T18 -> T20 -> D4
First dart miss: T18 becomes S18
Remaining: 122 - 18 = 104
Only 2 darts remain
Correct continuation: T18 -> Bull
```

Do not display this as the immediate continuation:

```text
T18 -> S18 -> D16
```

Reason: that is a 3-dart route for 104, not a valid immediate continuation after one dart has already been thrown.

### Helper requirement

Add or verify helper:

```ts
findTwoDartFinish(score): DartTarget[] | null
```

Rules:

- Returns only routes that finish the given score in max 2 darts.
- Final dart must be a double or Bull.
- Bull is valid and scores 50.
- 25/S25 is valid and scores 25.
- Do not return 3-dart routes.
- Do not invent invalid targets.

Valid examples:

```text
80 -> T20 -> D10
81 -> T19 -> D12
87 -> T17 -> D18
100 -> T20 -> D20
101 -> T17 -> Bull
104 -> T18 -> Bull
107 -> T19 -> Bull
110 -> T20 -> Bull
```

Invalid examples:

```text
104 -> T18 -> S18 -> D16
S104
D25
T25
S50
```

### Bull follow-up support

If a first-dart single-hit leaves one of these scores, show the bull finish:

```text
101 left -> T17 -> Bull
104 left -> T18 -> Bull
107 left -> T19 -> Bull
110 left -> T20 -> Bull
```

Use this for every checkout where the first treble misses into a single and the remaining score is one of those values.

Specific required case:

```text
Finish 122
Main: T18 -> T20 -> D4
If S18: 104 left -> T18 -> Bull
```

Quick Checkout Practice mini game behaviour for this case:

- If user taps S18 when expected target is T18:
  - remaining becomes 104
  - next expected target becomes T18
- If user then taps T18:
  - remaining becomes 50
  - next expected target becomes Bull
- If user taps Bull:
  - route is complete

Do not change sensible existing 2-dart alternative routes unless they are invalid. This task is about preventing impossible 3-dart follow-ups after the first dart has already been thrown.

## 4. Quick Checkout Practice mini game

The mini game idea is wanted, but logic must be correct.

Behaviour:

- The user taps the dartboard target they would choose.
- App checks target against the current expected route state.
- If user hits a single instead of the intended treble, calculate remaining and continue with a valid route for the darts remaining.
- Do not immediately hide/collapse feedback. The feedback/result panel must stay visible until the user moves to the next checkout/task.
- Avoid overly bright target highlights; use theme tokens and calmer colors.

Do not accept impossible continuations.

## 5. Timer formatting

No decimals or milliseconds anywhere in user-facing training timers.

Do not show:

```text
5.0s
5.23s
```

Show:

```text
5s
1:05
2:14
```

Apply to:

- Around the Clock current target time
- Around the Clock total time
- Checkout Timed Run current checkout time
- Checkout Timed Run total time
- result screens
- summaries
- stats/history where applicable

## 6. Checkout Timed Run naming

Use the name `Checkout Timed Run`, not `Checkout Speedrun` in the UI.

README can mention old name only as context if needed, but app UI should use `Checkout Timed Run`.

## 7. Around the Clock modes

Existing modes:

- Singles
- Doubles
- Trebles
- Full Sector

Add/verify:

- Common Doubles
- Custom

### Common Doubles

Targets and order:

```text
D20 -> D10 -> D5 -> D16 -> D8 -> D4 -> D12 -> D18
```

Requirements:

- starts with D20
- D5 is included after D10
- target count is 8
- progress displays 1/8, 2/8, etc.
- target labels show exact target, e.g. D20, D10, D5

### Custom mode

When Custom is selected, show a target picker.

Groups:

- Singles: S1-S20
- Doubles: D1-D20
- Trebles: T1-T20
- Center: 25 and Bull

Quick select buttons:

- Select all singles
- Select all doubles
- Select all trebles
- Select center
- Clear all
- Common doubles

Optional quick selects if easy:

- D16 path: D16, D8, D4, D2, D1
- Checkout doubles: D20, D10, D5, D16, D8, D4, D12, D18

Custom behaviour:

- User can select only the targets they want.
- User can exclude Bull/25.
- If no targets are selected, disable `START MODE` and show: `Select at least one target.`
- Persist last selected custom targets locally.
- Keep low-input flow: user taps only when current target is complete.

## 8. Theme and visual style

Theme options:

- Dark
- Light
- Dim
- System

The app does not need extra color-palette switching beyond these themes.

Style direction:

- Dark remains the default.
- Light must not be too bright or glaring.
- Dim should be genuinely different from Light and Dark: softer, muted, less contrast-heavy.
- Green buttons/highlights should be less neon and less intrusive.
- Avoid overly bright red/green target highlights.
- Use central theme tokens; do not scatter hardcoded colors across components.

## 9. Verification checklist

Before finalizing, verify:

- No checkout game range below 61.
- Custom checkout range cannot start below 61.
- Bogey numbers are excluded.
- Checkout Library compact route details work.
- Finish 122 shows: `Main: T18 -> T20 -> D4` and `If S18: 104 left -> T18 -> Bull`.
- No immediate continuation after first-dart miss has more than 2 darts.
- Bull is valid and scores 50.
- D25, T25, S50 and fake score targets are invalid.
- Quick Checkout Practice mini game keeps feedback visible until next checkout.
- Timers show whole seconds only.
- UI uses `Checkout Timed Run`.
- Around the Clock Common Doubles target count is 8 and includes D5.
- Around the Clock Custom can run only selected targets.
- Theme changes persist and affect the full app.
- `npm run typecheck` passes if available.
- `npm run build` passes.

## 10. Do not add

Do not add:

- full X01 scorer
- online multiplayer
- login
- backend
- payment/pro model
- donation popup
- camera scoring
- AI coaching
- heavy guided workout programs
- dart-by-dart logging to Around the Clock

## Final response expected from Codex

After implementation, summarize:

- files changed
- checkout range changes
- route logic changes
- bull follow-up handling
- Around the Clock additions
- theme/timer fixes
- commands run
- known limitations, if any
