#!/usr/bin/env node
// tests/iata_harness.js
// Simple test harness for verifying ERy calculations against IATA examples.

const EPS = 0.6; // acceptable tolerance in tonnes

const EF_WTW = 3.84;
const EF_TTW = 3.16;
const LCACAF = 89.0;

function ERy(EF, mSAF_t, LCASAF) {
  const lcaRatio = LCASAF / LCACAF;
  return EF * mSAF_t * (1 - lcaRatio);
}

function approx(a, b, eps) {
  return Math.abs(a - b) <= eps;
}

const tests = [
  {
    name: 'IATA example — WTW, 10,000 t HEFA-UCO (16.7 gCO2e/MJ)',
    EF: EF_WTW,
    mSAF_t: 10000,
    LCASAF: 16.7,
    expected: 31194.61,
  },
  {
    name: 'IATA example — TTW, 10,000 t HEFA-UCO (16.7 gCO2e/MJ)',
    EF: EF_TTW,
    mSAF_t: 10000,
    LCASAF: 16.7,
    expected: 25670.56,
  },
];

let failed = 0;
console.log('Running IATA ERy tests...');
for (const t of tests) {
  const got = ERy(t.EF, t.mSAF_t, t.LCASAF);
  const ok = approx(got, t.expected, EPS);
  console.log(`${t.name}\n  got=${got.toFixed(2)} t   expected=${t.expected} t   ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`${failed} test(s) failed`);
  process.exit(2);
} else {
  console.log('All tests passed');
  process.exit(0);
}
