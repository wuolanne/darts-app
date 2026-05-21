# Branch task: Around the Clock target summary

Branch: `feature-around-clock-summary`
Base: `main`

## Goal

Improve Around the Clock setup and active mode so the user can quickly see which targets are included before and during practice.

The app UI language must remain English.

## Requirements

1. On the Around the Clock setup screen, show a compact target summary under the mode buttons.

Examples:

- `Common Doubles: D20, D10, D5, D16, D8, D4, D12, D18`
- `Singles: S1-S20`
- `Doubles: D1-D20`
- `Trebles: T1-T20`
- `Full Sector: Bull, 25, then S/T/D for sectors 1-20`

For Custom:

- If targets are selected, show selected targets in order.
- If many targets are selected, keep it compact, for example: `Custom: D20, D16, D8, D4 + 4 more`.

2. In the active Around the Clock screen, add a small subtle target-summary line or chip.

For Common Doubles, show:

`D20 -> D10 -> D5 -> D16 -> D8 -> D4 -> D12 -> D18`

This must be small and must not compete with the current target title.

3. Common Doubles must remain exactly:

`D20 -> D10 -> D5 -> D16 -> D8 -> D4 -> D12 -> D18`

Progress count must be `1/8`, `2/8`, etc.

4. For Custom active practice, show selected count and preview:

`Custom: 8 targets · D20, D10, D5, D16 + 4 more`

5. Styling:

- Use existing theme tokens.
- Keep it subtle.
- Do not use bright neon colors.
- Do not redesign the screen.

## Do not change

Do not change checkout logic, Quick Checkout Practice, Checkout Library, timers, scoring data model, backend/login/payment.

## Validation

Verify:

- Common Doubles setup shows all included doubles including D5.
- Active Common Doubles shows the included doubles in order.
- Custom setup and active mode show selected targets compactly.
- No timer decimals are reintroduced.
- `npm run typecheck` and `npm run build` pass if available.
