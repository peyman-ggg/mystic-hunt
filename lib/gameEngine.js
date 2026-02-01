// Game engine helpers (ES module)
export const TARGET_RTP = 0.98; // house per-decision RTP factor
export const MULT_SCALE = 1000000; // fixed-point scale for multipliers (6 decimals)

// Price the step multiplier for a given probability p (0<p<=1)
// Uses: stepMultiplier = (TARGET_RTP / p)
// Returns integer scaled multiplier = round(stepMultiplier * MULT_SCALE)
export function priceMultiplierScaled(p){
  if (!(p > 0 && p <= 1)) throw new Error('invalid p');
  const scaled = Math.round((TARGET_RTP * MULT_SCALE) / p);
  return Math.max(1, scaled);
}

// Apply step multiplier (both scaled) to current streak (scaled)
export function applyStepToStreak(streakScaled, stepScaled){
  // exact integer-safe multiplication with rounding
  return Math.round((streakScaled * stepScaled) / MULT_SCALE);
}

// Compute payout cents given bet cents and current scaled multiplier
export function payoutFromScaled(betCents, streakScaled){
  return Math.round((betCents * streakScaled) / MULT_SCALE);
}

// Monte Carlo simulate: returns {trials, totalPayoutCents}
export function monteCarlo({trials=100000, deck, policy, seedMathRandom=false}){
  // policy: function(drawIndex, mode, stepScaled, streakScaled) -> boolean: whether to continue or cash out
  // For simplicity trades off full policy; we'll implement simple "play 1 step" or "play up to K" policies by callers

  let payoutCents = 0;
  const rng = Math.random;
  for (let t=0;t<trials;t++){
    // pick random card
    const idx = Math.floor(rng() * deck.length);
    const c = deck[idx];
    // pick mode according to policy (policy may define it)
    const mode = c.mode || 'normal';
    const p = c[mode].p;
    const stepScaled = priceMultiplierScaled(p);
    const hit = rng() < p;
    if (hit){
      // for single-step policy: payout = bet * step
      // assume betCents=100 (1$) => payout = 100 * stepScaled / MULT_SCALE
      payoutCents += payoutFromScaled(100, stepScaled);
    } else {
      payoutCents += 0;
    }
  }
  return {trials, totalPayoutCents: payoutCents};
}