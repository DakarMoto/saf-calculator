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
// TEMP: using date=current-1 (yesterday) for testing — change back to date=current for production
const API_URL = `https://www.qcintel.com/api/?action=Prices&date=current-1&format=json&price_codes=${CODE}&token=${TOKEN}`;

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
 * Search a parsed API response for the SAFARS-SPO price entry.
 *
 * Actual QCIntel response shape:
 *   [{ prime_code: "SAFARS", date: "YYYY-MM-DD", values: [{ laycan_code: "SPO", value: 2513.5 }] }]
 *
 * Returns { price: <number>, date: <string|null> } or null if not found.
 */
function extractPrice(parsed) {
  // Normalise to an array of top-level items
  let items = [];
  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (parsed && typeof parsed === 'object') {
    for (const key of ['prices', 'data', 'results', 'assessments']) {
      if (Array.isArray(parsed[key])) { items = parsed[key]; break; }
    }
    if (items.length === 0) items = [parsed];
  }

  for (const item of items) {
    if (!item) continue;

    // QCIntel nests laycan values inside item.values[]
    if (item.prime_code === 'SAFARS' && Array.isArray(item.values)) {
      const laycan = item.values.find(v => v && v.laycan_code === 'SPO');
      if (laycan && laycan.value != null) {
        const price = parseFloat(laycan.value);
        if (!isNaN(price) && price > 0) {
          return { price, date: item.date ? String(item.date) : null };
        }
      }
    }

    // Fallback: flat structure where code + price are on the same object
    const combined = item.prime_code && item.laycan_code
      ? `${item.prime_code}-${item.laycan_code}`.toUpperCase()
      : null;
    const codeMatch = combined === CODE ||
      (item.code  && String(item.code).toUpperCase()  === CODE) ||
      (item.Code  && String(item.Code).toUpperCase()  === CODE);

    if (codeMatch) {
      const rawPrice = item.value ?? item.price ?? item.mid ?? item.close ?? null;
      if (rawPrice != null) {
        const price = parseFloat(rawPrice);
        if (!isNaN(price) && price > 0) {
          const rawDate = item.date ?? item.Date ?? item.publishDate ?? null;
          return { price, date: rawDate ? String(rawDate) : null };
        }
      }
    }
  }

  return null;
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
      console.log('[fetch-price] raw response:', raw.slice(0, 1000));
      console.log(`[fetch-price] ${CODE} not found in API response — price not yet published. Keeping existing prices.json.`);
      process.exit(0);  // not an error — price just isn't available yet
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
