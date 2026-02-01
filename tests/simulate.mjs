import { deck } from '../lib/deck.js';
import { priceMultiplierScaled, MULT_SCALE, payoutFromScaled, TARGET_RTP } from '../lib/gameEngine.js';

async function simulate({trials=200000, mode='normal'}){
  let totalPayoutCents = 0;
  for (let i=0;i<trials;i++){
    const idx = Math.floor(Math.random() * deck.length);
    const c = deck[idx];
    const p = c[mode].p;
    const stepScaled = priceMultiplierScaled(p);
    const hit = Math.random() < p;
    if (hit) totalPayoutCents += payoutFromScaled(100, stepScaled); // bet=100c
  }
  const empRtp = totalPayoutCents / (trials * 100);
  return empRtp;
}

(async function(){
  console.log('Running Monte Carlo RTP test for single-step play...');
  const trials = 150000;
  const rtpNormal = await simulate({trials, mode:'normal'});
  const rtpHigh = await simulate({trials, mode:'high'});

  console.log(`Target per-decision RTP: ${TARGET_RTP}`);
  console.log(`Empirical NORMAL RTP (N=${trials}): ${rtpNormal.toFixed(6)}`);
  console.log(`Empirical HIGH   RTP (N=${trials}): ${rtpHigh.toFixed(6)}`);

  const tol = 0.005; // 0.5% tolerance
  if (Math.abs(rtpNormal - TARGET_RTP) > tol) throw new Error(`NORMAL RTP outside tolerance: ${rtpNormal}`);
  if (Math.abs(rtpHigh - TARGET_RTP) > tol) throw new Error(`HIGH RTP outside tolerance: ${rtpHigh}`);

  console.log('PASS: Empirical RTP matches target within tolerance.');
})();
