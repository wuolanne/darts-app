# Branch task: Quick Checkout hidden route game flow

Branch: `feature-quick-checkout-game-flow`
Base: `main`

## Goal

Quick Checkout Practice should be a real learning/test game. During the attempt the app must not reveal the route too early. The player should know or decide the route, tap targets on the board, and only after success/failure/time-up should the app explain the route.

The app UI language must remain English.

## Current problem

The current game shows too much route information before the player has answered, for example expected target, best first target and optimal route. That makes the mini game too easy and defeats the purpose.

## Requirements

### 1. Hide route before answer

During an active checkout attempt, do not show:

- Expected target
- Best first target
- Optimal route
- Route hint
- Show Route button

The active screen may show:

- Finish number
- Current remaining score
- Timer/progress if timer is active
- Instruction text, for example: `Tap your target choice on the board.`
- Selected/tapped targets so far
- Undo button if there is at least one tapped target

### 2. Show what the user tapped

After every board tap, show a compact sequence of tapped targets.

Example:

```text
Your picks: T20 -> D8
```

or chips:

```text
T20   D8   Undo
```

The user must be able to undo the latest tap.

Undo rules:

- Undo removes the latest tapped target.
- Remaining score and route state must return to previous state.
- Undo must work before the attempt has ended.
- After result, Undo may be hidden or disabled unless implementation already supports safe rollback.

### 3. Result feedback

Only after the attempt ends, show route explanation.

Attempt can end when:

- User completes the checkout correctly.
- User taps a wrong target.
- User busts or invalidly finishes.
- Timer runs out.

Correct result:

- Praise the user.
- Show something like: `Correct! Good route.`
- Show tapped route and optimal/main route for confirmation.

Wrong/time-up result:

- Tell what the user tapped.
- Tell the correct main route.
- If relevant, tell the correct continuation after a single miss.

Example:

```text
Wrong
Your picks: T20
Main: T19 -> D5
```

For time-up:

```text
Time up
Main: T19 -> D5
```

### 4. Keep result panel visible

The result/explanation panel must stay visible until the user explicitly goes to next checkout/task.

No auto-collapse. No auto-disappearing feedback.

### 5. Route logic must remain correct

Keep the existing corrected logic:

- If first dart treble misses into a single, only two darts remain.
- Follow-up after single miss must be a max 2-dart finish.
- Bull is valid 50.
- Do not invent invalid targets like D25, T25, S50, S104.

Required example:

Finish 122:

- Main: `T18 -> T20 -> D4`
- If the user taps `S18`, remaining is 104.
- The continuation is `T18 -> Bull`, not a 3-dart route.

### 6. UI style

- Use existing theme tokens.
- Keep colors calm.
- Avoid bright green/red target highlights.
- Do not redesign the whole page.

## Do not change

Do not change checkout range presets, Around the Clock, Settings, payment, backend/login.

## Validation

Verify:

- Route is hidden before answer.
- Tapped targets are visible.
- Undo works.
- Correct route gives praise.
- Wrong route/time-up reveals the optimal route only after result.
- Result panel remains visible until Next.
- Finish 122 single-miss continuation is valid.
- `npm run typecheck` and `npm run build` pass if available.
