import { priceMultiplierScaled, applyStepToStreak, MULT_SCALE } from '../lib/gameEngine.js';
import { deck } from '../lib/deck.js';

function approxEq(a,b,tol=1){
  return Math.abs(a-b) <= tol;
}

(function(){
  // Test: pricing is stable for same p
  const p = 0.4;
  const a = priceMultiplierScaled(p);
  const b = priceMultiplierScaled(p);
  if (a !== b) throw new Error('Pricing not stable for same p');

  // Test: pricing does not change across same card entries
  for (const c of deck){
    const s1 = priceMultiplierScaled(c.normal.p);
    const s2 = priceMultiplierScaled(c.normal.p);
    if (s1 !== s2) throw new Error(`Pricing drift on card ${c.name}`);
  }

  // Test: compounding m^n
  const step = priceMultiplierScaled(0.5); // e.g. 0.5
  let acc = MULT_SCALE; // 1.0
  const n = 5;
  const repeated = [];
  for (let i=0;i<n;i++){
    acc = applyStepToStreak(acc, step);
    repeated.push(acc);
  }

  // compute expected by floating point multiplication for comparison
  const stepFloat = step / MULT_SCALE;
  let expectedFloat = 1.0;
  for (let i=0;i<n;i++) expectedFloat *= stepFloat;
  const expectedScaled = Math.round(expectedFloat * MULT_SCALE);

  if (!approxEq(repeated[repeated.length-1], expectedScaled, 2)){
    throw new Error(`Compounding mismatch: got ${repeated[repeated.length-1]} expected ${expectedScaled}`);
  }

  console.log('Unit tests passed.');
})();
