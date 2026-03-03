#!/usr/bin/env node
/**
 * scripts/fetch-price.js
 *
 * Fetches the current SAFARS-SPO spot price from QCIntel and writes
 * prices.json to the repository root.
 *
 * Called by .github/workflows/fetch-prices.yml on a daily schedule.
 *
 * Environment variables:
 *   QCINTEL_TOKEN  — QCIntel API bearer token (stored as a GitHub Secret)
 *
 * Output schema (prices.json):
 *   {
 *     "fetchedAt":     "<ISO 8601 timestamp>",
 *     "priceDate":     "<YYYY-MM-DD from API>",
 *     "source":        "QCIntel SAFARS-SPO",
 *     "location":      "FOB ARA",
 *     "pricePerMT":    <number | null>,
 *     "pricePerLitre": <number | null>,
 *     "currency":      "USD",
 *     "density":       0.76
 *   }
 *
 * Unit conversion:
 *   SAFARS-SPO is quoted in USD/MT.
 *   SAF density used for conversion: 0.76 kg/L  (per QCIntel SAFARS-SPO spec).
 *   pricePerLitre = pricePerMT * 0.76 / 1000
 *
 * No npm dependencies — uses only Node.js built-ins (https, fs, path).
 */

'use strict';

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Configuration ──────────────────────────────────────────────────────────────

const TOKEN       = process.env.QCINTEL_TOKEN;
const CODE        = 'SAFARS-SPO';     // QCIntel assessment code (Quantum Prime: SAFARS, Laycan: SPO)
const SAF_DENSITY = 0.76;             // kg/L — per QCIntel SAFARS-SPO specification
const OUT_FILE    = path.join(__dirname, '..', 'prices.json');

// price_codes= targets the assessment directly; no product filter needed
const API_URL = `https://www.qcintel.com/api/?action=Prices&date=current&format=json&price_codes=${CODE}&token=${TOKEN}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Write a prices.json with a null price entry.
 * Used on fetch failure so the file schema stays consistent.
 */
function writeNull(reason) {
  const payload = {
    fetchedAt:     new Date().toISOString(),
    priceDate:     null,
    source:        'QCIntel SAFARS-SPO',
    location:      'FOB ARA',
    pricePerMT:    null,
    pricePerLitre: null,
    currency:      'USD',
    density:       SAF_DENSITY,
    error:         reason,
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
  console.warn(`[fetch-price] null written — ${reason}`);
}

/**
 * Search a parsed API response (any shape) for the SAFARS-SPO price entry.
 *
 * QCIntel may return:
 *   - An array at the root level
 *   - An object with a "prices", "data", or "results" array key
 *   - A single object
 *
 * Returns { price: <number>, date: <string|null> } or null if not found.
 */
function extractPrice(parsed) {
  // Normalise to an array of candidate objects
  let candidates = [];

  if (Array.isArray(parsed)) {
    candidates = parsed;
  } else if (parsed && typeof parsed === 'object') {
    // Try common envelope keys
    for (const key of ['prices', 'data', 'results', 'assessments']) {
      if (Array.isArray(parsed[key])) {
        candidates = parsed[key];
        break;
      }
    }
    // Fallback: treat the single object itself as a candidate
    if (candidates.length === 0) candidates = [parsed];
  }

  // Find the SAFARS-SPO entry — code field may vary in casing
  const entry = candidates.find(item =>
    item && (
      (item.code  && String(item.code).toUpperCase()  === CODE) ||
      (item.Code  && String(item.Code).toUpperCase()  === CODE) ||
      (item.name  && String(item.name).toUpperCase()  === CODE) ||
      (item.label && String(item.label).toUpperCase() === CODE)
    )
  );

  if (!entry) return null;

  // Price field may be named "price", "value", "mid", "close"
  const rawPrice = entry.price ?? entry.value ?? entry.mid ?? entry.close ?? null;
  const rawDate  = entry.date  ?? entry.Date  ?? entry.publishDate ?? null;

  if (rawPrice === null || rawPrice === undefined) return null;

  const price = parseFloat(rawPrice);
  if (isNaN(price) || price <= 0) return null;

  return { price, date: rawDate ? String(rawDate) : null };
}

// ── Main fetch ─────────────────────────────────────────────────────────────────

if (!TOKEN) {
  writeNull('QCINTEL_TOKEN environment variable not set');
  process.exit(1);
}

console.log(`[fetch-price] Fetching ${CODE} from QCIntel…`);

const req = https.get(API_URL, (res) => {
  if (res.statusCode !== 200) {
    writeNull(`HTTP ${res.statusCode}`);
    res.resume();
    process.exit(1);
    return;
  }

  let raw = '';
  res.setEncoding('utf8');
  res.on('data', chunk => { raw += chunk; });
  res.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      writeNull(`JSON parse error: ${e.message}`);
      process.exit(1);
      return;
    }

    // Handle empty array — price not yet published today (e.g. before market close)
    if (Array.isArray(parsed) && parsed.length === 0) {
      console.log(`[fetch-price] API returned [] — no price published yet today. Keeping existing prices.json.`);
      process.exit(0);  // success exit — nothing to update
      return;
    }

    const result = extractPrice(parsed);
    if (!result) {
      console.error('[fetch-price] ERROR — raw response:', raw.slice(0, 1000));
      writeNull(`${CODE} not found in API response`);
      process.exit(1);
      return;
    }

    const pricePerLitre = parseFloat((result.price * SAF_DENSITY / 1000).toFixed(4));

    const payload = {
      fetchedAt:     new Date().toISOString(),
      priceDate:     result.date,
      source:        'QCIntel SAFARS-SPO',
      location:      'FOB ARA',
      pricePerMT:    result.price,
      pricePerLitre,
      currency:      'USD',
      density:       SAF_DENSITY,
    };

    fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
    console.log(`[fetch-price] Done — ${CODE}: $${result.price}/MT → $${pricePerLitre}/L`);
    if (result.date) console.log(`[fetch-price] Price date: ${result.date}`);
  });
});

req.on('error', (e) => {
  writeNull(`Network error: ${e.message}`);
  process.exit(1);
});

req.setTimeout(15000, () => {
  writeNull('Request timeout (15 s)');
  req.destroy();
  process.exit(1);
});
