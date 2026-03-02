# SkiesFifty SAF Calculator

A browser-based Sustainable Aviation Fuel (SAF) emissions and cost calculator, built to the **IATA SAF Accounting & Reporting Methodology**.

No build step. No dependencies. Drop `index.html` anywhere and open it.

---

## Features

- **IATA §3.3 emissions reduction formula** — `ERy = EF × [mSAF,y × (1 − LCASAF / LCACAF)]`
- **WTW / TTW toggle** — switch between Well-to-Wake (GHGP sustainability reporting) and Tank-to-Wake (CORSIA / EU ETS regulatory scope)
- **Five volume units** — Litres, US Gallons, Kilograms, Metric Tonnes, Pounds — with automatic price and volume conversion on switch
- **ICAO CORSIA feedstock library** — 8 production pathways with default lifecycle CI values (gCO₂e/MJ)
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

## Usage

### Option A — Open directly
```bash
open index.html
```

### Option B — Local server (avoids any browser file:// quirks)
```bash
npx serve .
# → http://localhost:3000
```

---

## Project Structure

```
SAF Calc/
└── index.html      # Self-contained calculator (HTML + CSS + JS)
└── README.md
└── LICENSE
```

All logic is contained in `index.html` by design — no bundler, no framework, no runtime dependencies.

---

## Standards Referenced

- **IATA SAF Accounting & Reporting Methodology** — core calculation framework
- **ICAO CORSIA** — Default Lifecycle Values for SAF feedstocks (2023)
- **ASTM D7566** — Standard specification for SAF blending (max 50%)
- **ISO 14083:2023** — GHG quantification for transport chains (Table K.3)
- **GHGP** — Greenhouse Gas Protocol (WTW = Scope 1 + 3)

---

## Disclaimer

For informational and planning use only. Not a substitute for certified SAF accounting under CORSIA, EU ETS, or SAF mandate frameworks. Actual emissions reductions depend on verified PoS documentation and applicable regulatory methodology.

---

## License

MIT — see [LICENSE](LICENSE).

&copy; SkiesFifty
