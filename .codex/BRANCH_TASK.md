# Branch task: Checkout alternative route / single-miss scenario mode

Branch: `feature-checkout-miss-scenarios`
Base: `main`

## Goal

Add a separate checkout practice mode for alternative routes after a treble attempt lands in the single. The app gives the scenario and the user must choose the continuation.

The app UI language must remain English.

## User need

Player wants to train situations like:

- The planned route starts with a treble.
- The treble misses into the same number as a single.
- The player now has two darts left and must still know the best way to finish or leave a good double.

Example:

```text
Finish 122
You went for T18 but hit S18.
104 left. What now?
Correct continuation: T18 -> Bull
```

## Requirements

### 1. Add mode to Quick Checkout Practice setup

Add a small mode selector or toggle:

- `Main route`
- `Single miss scenarios`

Default mode: `Main route`.

Do not remove existing Quick Checkout Practice.

### 2. Main route mode

Main route mode keeps the existing hidden-route game flow from the other branch if that branch has been merged. If not merged yet, keep current main practice behavior and avoid conflicts.

### 3. Single miss scenario mode

In this mode, each task must show the player the miss scenario before they answer.

Show:

```text
Finish 122
Tried T18, hit S18.
104 left. Choose the continuation.
```

Then the user taps the next target(s) on the dartboard.

The user is expected to answer only the continuation after the single hit, not the original first dart.

For the 122 example, user should tap:

```text
T18 -> Bull
```

### 4. Scenario generation

Use existing checkout route data.

For each finish:

- Find main route where first dart is a treble, for example T18.
- Build single miss target from that treble, for example S18.
- Calculate remaining after the single hit.
- Find a valid continuation for the remaining score with max 2 darts.
- Include bull continuation when valid.

Important bull endings:

```text
101 left -> T17 -> Bull
104 left -> T18 -> Bull
107 left -> T19 -> Bull
110 left -> T20 -> Bull
```

Do not create scenarios where there is no valid max-2-dart continuation, unless the UI clearly says the aim is to leave a double instead of finishing. MVP should prefer only valid finishable continuations.

### 5. Target validation

Valid targets:

- S1-S20
- D1-D20
- T1-T20
- 25
- Bull

Bull value is 50.
25 value is 25.

Invalid target strings must not be generated:

- D25
- T25
- S50
- S104

### 6. Result feedback

Before answer, show the scenario but not the answer.

After answer:

Correct:

```text
Correct! T18 -> Bull finishes 104.
```

Wrong:

```text
Wrong. From 104 the continuation is T18 -> Bull.
```

Show user taps as well:

```text
Your picks: T20 -> D12
```

Keep feedback visible until Next.

### 7. Ranges

Use same checkout range presets as Quick Checkout Practice:

- 61-70
- 71-80
- 81-90
- 91-100
- 101-120
- 121-140
- 141-170
- ALL
- CUSTOM

Do not include finishes below 61.
Do not include bogey numbers.

### 8. Stats

For MVP, save attempts using the existing checkout attempt structure if possible.
Add a mode field if needed, for example:

```ts
mode: 'main-route' | 'single-miss-scenario'
```

Do not break old localStorage data.

## Do not change

Do not change Around the Clock, theme, Settings, backend/login/payment.

## Validation

Verify at least:

- Finish 122 scenario: Tried T18, hit S18, 104 left, answer T18 -> Bull.
- 101/104/107/110 bull endings are supported.
- No invalid targets are generated.
- Wrong answer reveals correct continuation only after result.
- Result remains visible until Next.
- `npm run typecheck` and `npm run build` pass if available.
