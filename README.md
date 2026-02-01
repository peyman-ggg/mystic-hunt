# Mystic Hunt

Fixed mobile prototype.

## Pricing & math changes (Hi-Lo / streak extender)

This branch implements a two-layer model:

- Animal cards store only the success probability `p` (no per-card multipliers).
- The game prices each offered step using a fixed pricing model (constant per-decision RTP):

  stepMultiplier = (1 / p) * TARGET_RTP

  Multipliers are represented internally as integers using fixed-point scaling (`MULT_SCALE` = 1,000,000) to avoid rounding drift.

- Bets and balances are stored in cents (integers).
- Streaks compound multiplicatively using scaled integers, e.g.:

  currentStreakScaled = applyStepToStreak(currentStreakScaled, stepScaled)

- Tests:
  - `node tests/simulate.mjs` — Monte Carlo test verifying empirical per-decision RTP matches `TARGET_RTP`.
  - `node tests/unit_compound.mjs` — unit checks for pricing stability and multiplicative compounding.

Run the tests locally with Node.js v18+:

  node tests/simulate.mjs
  node tests/unit_compound.mjs

These updates ensure stable, auditable payouts and deterministic rounding (display only rounds to 2 decimals).
