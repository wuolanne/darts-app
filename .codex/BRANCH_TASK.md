# Branch task: Quick Checkout hidden route game flow

Branch: `feature-quick-checkout-game-flow`
Base: `main`

## Goal

Quick Checkout Practice should be a real learning/test game. During the attempt the app must not reveal the route too early. The player should know or decide the route, tap targets on the board, and only after success/failure/time-up should the app explain the route.

The app UI language must remain English.

## Requirements implemented in this merge

- Hide route guidance during active attempts.
- Show selected/tapped targets as `Your picks`.
- Allow undo before attempt result.
- Keep result feedback visible until explicit `NEXT CHECKOUT`.
- Add `Single miss scenarios` mode where the app gives a tried treble + hit single situation and the player must choose the continuation.
- Keep first-dart treble miss continuation max two darts.
- Bull is valid 50.
- Do not invent invalid targets like D25, T25, S50, S104.

## Important example

Finish 122:

- Main: `T18 -> T20 -> D4`
- If the user taps `S18`, remaining is 104.
- The continuation is `T18 -> Bull`, not a 3-dart route.

## Validation

Verify:

- Route is hidden before answer.
- Tapped targets are visible.
- Undo works before result.
- Correct route gives praise.
- Wrong route/time-up reveals the optimal route only after result.
- Result panel remains visible until Next.
- Single miss scenarios are selectable in setup.
- `npm run typecheck` and `npm run build` pass if available.
