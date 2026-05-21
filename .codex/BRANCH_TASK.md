# Branch task: Checkout alternative route / single-miss scenario mode

Branch: `feature-checkout-miss-scenarios`
Base: `main`

## Goal

Add a separate checkout practice mode for alternative routes after a treble attempt lands in the single. The app gives the scenario and the user must choose the continuation.

The app UI language must remain English.

## Requirements implemented in this merge

- Add a Quick Checkout mode selector with `Main route` and `Single miss scenarios`.
- Generate scenarios from checkout route data when the planned first dart is a treble and the single-hit continuation is a valid max two-dart route.
- Show the miss scenario before the answer, for example `Tried T18, hit S18. 104 left. Choose the continuation.`
- Keep the continuation answer hidden until the result panel.
- Keep feedback visible until explicit `NEXT CHECKOUT`.
- Keep Bull valid as 50 and avoid invalid targets like D25, T25, S50, S104.

## Important example

Finish 122:

- Main: `T18 -> T20 -> D4`
- If the user taps `S18`, remaining is 104.
- The continuation is `T18 -> Bull`, not a 3-dart route.

## Validation

Verify:

- Finish 122 scenario: Tried T18, hit S18, 104 left, answer T18 -> Bull.
- 101/104/107/110 bull endings are supported.
- No invalid targets are generated.
- Wrong answer reveals correct continuation only after result.
- Result remains visible until Next.
- `npm run typecheck` and `npm run build` pass if available.
