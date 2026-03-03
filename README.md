# SkiesFifty SAF Calculator

A browser-based Sustainable Aviation Fuel (SAF) emissions and cost calculator, built to the **IATA SAF Accounting & Reporting Methodology**.

No build step. No dependencies. Drop `index.html` anywhere and open it.

---

## Features

- **IATA §3.3 emissions reduction formula** — `ERy = EF × [mSAF,y × (1 − LCASAF / LCACAF)]`
- **WTW / TTW toggle** — switch between Well-to-Wake (GHGP sustainability reporting) and Tank-to-Wake (CORSIA / EU ETS regulatory scope)
- **Five volume units** — Litres, US Gallons, Kilograms, Metric Tonnes, Pounds — with automatic price and volume conversion on switch
- **ICAO CORSIA feedstock library** — 8 production pathways with default lifecycle CI values (gCO₂e/MJ)
- **Live SAF spot price** — daily SAFARS-SPO FOB ARA price fetched from QCIntel, pre-populating the SAF price input with a live badge indicator
- **Live cost analysis** — conventional vs SAF blend total cost, premium, and cost-per-tonne-CO₂e-avoided
- **Responsive layout** — single-column on mobile, two-column on desktop

---

## Calculation Methodology

| Parameter | Value | Source |
|-----------|-------|--------|
| WTW Emissions Factor | 3.84 kg CO₂e/kg fuel | IATA §2.2.4 |
| TTW Emissions Factor | 3.16 kg CO₂/kg fuel | IATA §2.2.5 |
| CAF baseline (LCACAF) | 89 gCO₂e/MJ | IATA §2.2.3 / ICAO CORSIA |
| Jet-A/A-1 density | 0.800 kg/L | ISO 14083:2023 Table K.3 |
| Max SAF blend | 50% | ASTM D7566 |

### Formula

```
ERy = EF × [mSAF,y × (1 − LCASAF / LCACAF)]
```

Where:
- `ERy` — Emissions reduction for year y (tonnes CO₂e or CO₂)
- `EF` — Emissions factor (WTW 3.84 or TTW 3.16 kg/kg)
- `mSAF,y` — Mass of neat SAF uplifted (tonnes)
- `LCASAF` — Lifecycle GHG intensity of the SAF feedstock (gCO₂e/MJ)
- `LCACAF` — Lifecycle GHG intensity of conventional aviation fuel (89 gCO₂e/MJ)

### Verification

The formula has been verified against the worked example in IATA §4:

| Scenario | Expected | Calculator |
|----------|----------|-----------|
| 10,000 t SAF, LCA = 16.7 gCO₂e/MJ, WTW | 31,194.61 t CO₂e | ✅ |
| 10,000 t SAF, LCA = 16.7 gCO₂e/MJ, TTW | 25,670.56 t CO₂  | ✅ |

---

## Feedstock CI Values (ICAO CORSIA 2023)

| Pathway | CI (gCO₂e/MJ) | GHG Reduction vs CAF |
|---------|:---:|:---:|
| HEFA — Used Cooking Oil (UCO) | 14.06 | 84.2% |
| HEFA — Tallow / Animal Fat | 17.4 | 80.4% |
| HEFA — Palm Fatty Acid Distillate | 17.4 | 80.4% |
| AtJ — Corn Stover | 17.9 | 79.9% |
| AtJ — Sugarcane | 32.7 | 63.3% |
| FT-SPK — Municipal Solid Waste | 18.1 | 79.7% |
| FT-SPK — Forestry Residues | 12.8 | 85.6% |
| DSHC — Direct Sugar to Hydrocarbon | 3.8 | 95.7% |

> CI values are ICAO CORSIA defaults. Actual values from supplier Proof of Sustainability (PoS) documentation may differ.

---

## Live SAF Price Integration

The calculator automatically pre-populates the SAF price input with the current **SAFARS-SPO** (SAF Assessment Rotterdam Spot) price from [QCIntel](https://www.qcintel.com/), published daily on weekdays.

### How it works

1. A **GitHub Actions workflow** (`.github/workflows/fetch-prices.yml`) runs Monday–Friday at 18:00 UTC.
2. It calls `scripts/fetch-price.js`, which hits the QCIntel API and writes `prices.json` to the repository root.
3. When the page loads, it fetches `prices.json` via a simple `fetch()` call and updates the SAF Price input.
4. A pulsing **Live price** badge appears next to the label, showing the price date.
5. If the fetch fails or the price is null, the default placeholder price remains — no error is shown.

### Unit conversion

The QCIntel SAFARS-SPO assessment is quoted in **USD/MT (FOB ARA)**. The script converts to USD/litre using the SAF density specified in the SAFARS-SPO product definition:

```
pricePerLitre = pricePerMT × 0.76 / 1000
```

Where **0.76 kg/L** is the SAF density for this assessment. The calculator's own volume conversions then handle display in whichever unit the user has selected.

### prices.json schema

```json
{
  "fetchedAt":     "2026-03-03T18:00:12.345Z",
  "priceDate":     "2026-03-03",
  "source":        "QCIntel SAFARS-SPO",
  "location":      "FOB ARA",
  "pricePerMT":    3125,
  "pricePerLitre": 2.375,
  "currency":      "USD",
  "density":       0.76
}
```

When no price is available (before the first Action run, or on API error), all price fields are `null`.

### GitHub repository setup

1. Push this repository to GitHub.
2. Go to **Settings → Secrets and variables → Actions**.
3. Create a repository secret named **`QCINTEL_TOKEN`** with your QCIntel API token.
4. The workflow will run automatically each weekday at 18:00 UTC.
   You can also trigger it manually via **Actions → Fetch SAF Spot Price → Run workflow**.

### Running the fetch script locally

```bash
QCINTEL_TOKEN=your_token_here node scripts/fetch-price.js
```

This writes `prices.json` to the repo root immediately. Open `index.html` via a local server to see the live badge.

---

## Usage

### Option A — Open directly
```bash
open index.html
```

### Option B — Local server (avoids any browser `file://` quirks, required for `prices.json` fetch)
```bash
npx serve .
# → http://localhost:3000
```

> **Note:** The live price badge requires a server context (HTTP/HTTPS). It will not appear when the page is opened directly as a `file://` URL due to browser fetch restrictions.

---

## Project Structure

```
SAF Calc/
├── index.html                          # Self-contained calculator (HTML + CSS + JS)
├── prices.json                         # Live SAF price — updated daily by GitHub Actions
├── skiesfifty-logo-white.png           # SkiesFifty wordmark (white, for dark header)
├── sky_empty.jpg                       # Header background photo
├── scripts/
│   └── fetch-price.js                  # Node.js price fetch script (no npm deps)
├── .github/
│   └── workflows/
│       └── fetch-prices.yml            # Daily GitHub Action (Mon–Fri 18:00 UTC)
└── README.md
```

All calculator logic is contained in `index.html` by design — no bundler, no framework, no runtime dependencies.

---

## Testing and Continuous Integration

This repository includes a small test harness that validates the core IATA ERy calculation against the worked examples in the IATA methodology PDF.

Run tests locally:

```bash
npm test
```

CI: A GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm test` on push and pull requests. The workflow uses Node.js and exits non-zero on failure, preventing merges when tests fail.

If you need additional checks (unit tests for conversion helpers, browser E2E), I can add a Jest suite and a Playwright job.

## Pushing changes to GitHub

If this repository isn't yet on GitHub, push it and enable Actions:

```bash
# create a repo on GitHub (or use an existing one)
git remote add origin git@github.com:USERNAME/REPO.git
git branch -M main
git push -u origin main
```

After pushing, add the `QCINTEL_TOKEN` secret under **Settings → Secrets and variables → Actions** to enable the live price fetch workflow.


## Rollback

A git tag `backup-pre-price-integration` marks the state of the repository before the price integration was added.

```bash
# View the backup
git show backup-pre-price-integration

# Restore to the backup state
git checkout backup-pre-price-integration
```

---

## Standards Referenced

- **IATA SAF Accounting & Reporting Methodology** — core calculation framework
- **ICAO CORSIA** — Default Lifecycle Values for SAF feedstocks (2023)
- **ASTM D7566** — Standard specification for SAF blending (max 50%)
- **ISO 14083:2023** — GHG quantification for transport chains (Table K.3)
- **GHGP** — Greenhouse Gas Protocol (WTW = Scope 1 + 3)
- **QCIntel SAFARS-SPO** — SAF spot price assessment, FOB ARA, USD/MT

---

## Disclaimer

For informational and planning use only. Not a substitute for certified SAF accounting under CORSIA, EU ETS, or SAF mandate frameworks. Actual emissions reductions depend on verified PoS documentation and applicable regulatory methodology. SAF prices are indicative; for contractual purposes always refer to official QCIntel assessments.

---

## License

MIT — see [LICENSE](LICENSE).

&copy; SkiesFifty
