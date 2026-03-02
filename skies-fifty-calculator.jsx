import { useState } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
document.head.appendChild(fontLink);

// ── Skies Fifty Logo (base64) ─────────────────────────────────────────────────
const LOGO_B64 =
  "data:image/jpeg;base64,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";

// ── Brand Colors ──────────────────────────────────────────────────────────────
const PURPLE = "#5b3585";
const PURPLE_LIGHT = "#7b4fb5";
const PURPLE_PALE = "#f3effe";
const PURPLE_BORDER = "#ddd0f0";
const GRAY = "#f7f8fc";
const GRAY2 = "#f0f1f6";
const TEXT = "#1a1429";
const TEXT2 = "#6b7280";
const WHITE = "#ffffff";

// ── Constants ─────────────────────────────────────────────────────────────────
const JET_A_DENSITY_KG_L = 0.804;
const JET_A_ENERGY_MJ_KG = 43.2;
const BASELINE_CI = 89.0;

const UNIT_TO_KG = {
  "US Gallons": 3.78541 * JET_A_DENSITY_KG_L,
  Liters: JET_A_DENSITY_KG_L,
  Pounds: 0.453592,
  Kilograms: 1,
  "Metric Tons": 1000,
  "Cubic Meters (KL)": 804,
};

const PRICE_UNITS = ["USD/MT", "USD/KL", "CAG", "EUR/MT", "EUR/KL", "EUR/TA"];

function toUSDperMT(value, unit, eurRate) {
  switch (unit) {
    case "USD/MT": return value;
    case "USD/KL": return value / 0.804;
    case "CAG": return value / 0.03044;
    case "EUR/MT": return value / eurRate;
    case "EUR/KL": return value / (0.804 * eurRate);
    case "EUR/TA": return value / (3.044 * eurRate);
    default: return value;
  }
}
function fromUSDperMT(v, unit, r) {
  switch (unit) {
    case "USD/MT": return v;
    case "USD/KL": return v * 0.804;
    case "CAG": return v * 0.03044;
    case "EUR/MT": return v * r;
    case "EUR/KL": return v * 0.804 * r;
    case "EUR/TA": return v * 3.044 * r;
    default: return v;
  }
}

function fmt(n, d = 2) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

// ── Shared UI Components ──────────────────────────────────────────────────────
const Input = ({ label, value, onChange, placeholder, suffix }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: TEXT2, letterSpacing: "0.07em", textTransform: "uppercase" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: suffix ? "10px 44px 10px 14px" : "10px 14px",
          border: `1.5px solid ${PURPLE_BORDER}`,
          borderRadius: 10,
          fontSize: 14,
          fontFamily: "'Poppins', sans-serif",
          color: TEXT,
          background: WHITE,
          outline: "none",
          transition: "border 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = PURPLE)}
        onBlur={(e) => (e.target.style.borderColor = PURPLE_BORDER)}
      />
      {suffix && (
        <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: TEXT2, pointerEvents: "none" }}>
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: TEXT2, letterSpacing: "0.07em", textTransform: "uppercase" }}>
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "10px 14px",
        border: `1.5px solid ${PURPLE_BORDER}`,
        borderRadius: 10,
        fontSize: 14,
        fontFamily: "'Poppins', sans-serif",
        color: TEXT,
        background: WHITE,
        outline: "none",
        cursor: "pointer",
      }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </span>
    <div style={{ flex: 1, height: 1, background: PURPLE_BORDER }} />
  </div>
);

const ResultCard = ({ label, value, unit, highlight }) => (
  <div
    style={{
      background: highlight ? PURPLE_PALE : GRAY,
      border: `1.5px solid ${highlight ? PURPLE_BORDER : "#e5e7eb"}`,
      borderRadius: 14,
      padding: "18px 20px",
    }}
  >
    <div style={{ fontSize: 10, fontWeight: 600, color: highlight ? PURPLE_LIGHT : TEXT2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
      {label}
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, color: highlight ? PURPLE : TEXT, lineHeight: 1.2 }}>
      {value}
    </div>
    {unit && <div style={{ fontSize: 11, color: TEXT2, marginTop: 4 }}>{unit}</div>}
  </div>
);

const Divider = () => <div style={{ height: 1, background: "#e9eaf0", margin: "24px 0" }} />;

const Note = ({ children, color = PURPLE }) => (
  <div
    style={{
      marginTop: 20,
      padding: "12px 16px",
      borderRadius: 10,
      background: color === PURPLE ? PURPLE_PALE : "#fffbeb",
      border: `1px solid ${color === PURPLE ? PURPLE_BORDER : "#fde68a"}`,
      fontSize: 12,
      color: TEXT2,
      lineHeight: 1.7,
    }}
  >
    {children}
  </div>
);

// ── SAF Calculator ────────────────────────────────────────────────────────────
function SAFCalculator() {
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("US Gallons");
  const [blend, setBlend] = useState("");
  const [lcf, setLcf] = useState("");

  const q = parseFloat(qty);
  const b = parseFloat(blend) / 100;
  const l = parseFloat(lcf);

  let res = null;
  if (q > 0 && b > 0 && b <= 1 && l >= 0 && l < BASELINE_CI) {
    const totalKg = q * UNIT_TO_KG[unit];
    const neatKg = totalKg * b;
    const energyMJ = neatKg * JET_A_ENERGY_MJ_KG;
    const co2 = (energyMJ * (BASELINE_CI - l)) / 1e6;
    res = {
      co2,
      pct: ((BASELINE_CI - l) / BASELINE_CI) * 100,
      cars: co2 / 4.6,
      neatMT: neatKg / 1000,
    };
  }

  const presets = [
    { label: "HEFA — Waste fats", value: "15" },
    { label: "FT-SPK — Woody biomass", value: "8" },
    { label: "AtJ — Corn stover", value: "20" },
    { label: "SIP — Sugar cane", value: "10" },
    { label: "HEFA — Palm", value: "45" },
  ];

  return (
    <div>
      <SectionTitle>Inputs</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <Input label="Total Blended Fuel Quantity" value={qty} onChange={setQty} placeholder="e.g. 10 000" />
        <Select label="Unit" value={unit} onChange={setUnit} options={Object.keys(UNIT_TO_KG)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Input label="SAF Blend Percentage" value={blend} onChange={setBlend} placeholder="e.g. 30" suffix="%" />
        <Input label="Life Cycle Factor (LCF)" value={lcf} onChange={setLcf} placeholder="e.g. 15 – 50" suffix="gCO₂e/MJ" />
      </div>

      {/* LCF presets */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: TEXT2, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Common LCF Presets
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setLcf(p.value)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: `1.5px solid ${lcf === p.value ? PURPLE : PURPLE_BORDER}`,
                background: lcf === p.value ? PURPLE_PALE : WHITE,
                color: lcf === p.value ? PURPLE : TEXT2,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: "'Poppins', sans-serif",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {p.label} ({p.value})
            </button>
          ))}
        </div>
      </div>

      <Divider />
      <SectionTitle>Results</SectionTitle>

      {res ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <ResultCard label="CO₂ Reduction" value={fmt(res.co2)} unit="metric tonnes CO₂e" highlight />
          <ResultCard label="Lifecycle Reduction" value={`${fmt(res.pct, 1)}%`} unit={`vs Jet-A baseline (${BASELINE_CI} gCO₂e/MJ)`} />
          <ResultCard label="Neat SAF Used" value={fmt(res.neatMT)} unit="metric tons of neat SAF" />
          <ResultCard label="Equiv. Cars Off-Road" value={fmt(res.cars, 1)} unit="cars removed for one year" />
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            borderRadius: 14,
            border: `2px dashed ${PURPLE_BORDER}`,
            color: "#c4b8db",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Enter valid inputs above to see your SAF emissions reduction
        </div>
      )}

      <Note>
        <strong>Methodology:</strong> Baseline CI: <strong>89.0 gCO₂e/MJ</strong> (CORSIA Jet-A default) · Jet-A energy:
        <strong> 43.2 MJ/kg</strong> · Density: <strong>0.804 kg/L</strong>. Results are estimates — consult a certified SAF expert for regulatory compliance.
      </Note>
    </div>
  );
}

// ── Unit Converter ────────────────────────────────────────────────────────────
function UnitConverter() {
  const units = Object.keys(UNIT_TO_KG);
  const [from, setFrom] = useState("US Gallons");
  const [to, setTo] = useState("Liters");
  const [val, setVal] = useState("");

  const n = parseFloat(val);
  const convert = (v, f, t) => (v * UNIT_TO_KG[f]) / UNIT_TO_KG[t];
  const result = !isNaN(n) && n > 0 ? convert(n, from, to) : null;

  return (
    <div>
      <SectionTitle>Convert</SectionTitle>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ flex: "2 1 160px" }}>
          <Input label="Amount" value={val} onChange={setVal} placeholder="Enter quantity" />
        </div>
        <div style={{ flex: "2 1 140px" }}>
          <Select label="From" value={from} onChange={setFrom} options={units} />
        </div>
        <button
          onClick={() => { setFrom(to); setTo(from); }}
          style={{
            padding: "10px 16px",
            border: `1.5px solid ${PURPLE_BORDER}`,
            borderRadius: 10,
            background: PURPLE_PALE,
            color: PURPLE,
            fontSize: 18,
            cursor: "pointer",
            alignSelf: "flex-end",
            fontFamily: "'Poppins', sans-serif",
            marginBottom: 1,
          }}
          title="Swap"
        >
          ⇄
        </button>
        <div style={{ flex: "2 1 140px" }}>
          <Select label="To" value={to} onChange={setTo} options={units} />
        </div>
      </div>

      {/* Primary result */}
      <div
        style={{
          background: PURPLE_PALE,
          border: `1.5px solid ${PURPLE_BORDER}`,
          borderRadius: 14,
          padding: "24px 28px",
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: PURPLE_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Result</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: PURPLE }}>
            {result !== null ? fmt(result, 4) : "—"}
          </div>
          <div style={{ fontSize: 13, color: TEXT2, marginTop: 4 }}>{to}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 13, color: TEXT2 }}>
          {n > 0 ? `${fmt(n, 4)} ${from}` : "Enter a value"}
        </div>
      </div>

      <SectionTitle>All Conversions</SectionTitle>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${PURPLE_BORDER}` }}>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Unit</th>
            <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Equivalent</th>
          </tr>
        </thead>
        <tbody>
          {units.filter((u) => u !== from).map((u) => {
            const v = !isNaN(n) && n > 0 ? convert(n, from, u) : null;
            return (
              <tr
                key={u}
                style={{ borderBottom: `1px solid #f0f0f6` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PURPLE_PALE)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 12px", fontSize: 14, color: TEXT }}>{u}</td>
                <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 600, fontSize: 14, color: v !== null ? PURPLE : "#d1c4e9" }}>
                  {v !== null ? fmt(v, 4) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Note>
        All mass/volume conversions assume standard <strong>Jet-A density of 0.804 kg/L</strong> at 15°C. Actual density varies with temperature. 1 US Gallon = 3.78541 L.
      </Note>
    </div>
  );
}

// ── Price Converter ───────────────────────────────────────────────────────────
function PriceConverter() {
  const [amount, setAmount] = useState("");
  const [fromUnit, setFromUnit] = useState("USD/MT");
  const [eurRate, setEurRate] = useState("0.92");

  const val = parseFloat(amount);
  const eur = parseFloat(eurRate);
  const usdMT = !isNaN(val) && val > 0 && !isNaN(eur) && eur > 0 ? toUSDperMT(val, fromUnit, eur) : null;

  const descriptions = {
    "USD/MT": "US Dollars per Metric Ton",
    "USD/KL": "US Dollars per Cubic Metre (1,000 L)",
    CAG: "US Cents per American Gallon",
    "EUR/MT": "Euros per Metric Ton",
    "EUR/KL": "Euros per Cubic Metre",
    "EUR/TA": "Euros per Thousand American Gallons",
  };

  const formatPrice = (v, u) => {
    if (v === null) return "—";
    if (u === "CAG") return `¢ ${fmt(v, 4)}`;
    if (u.startsWith("EUR")) return `€ ${fmt(v, 2)}`;
    return `$ ${fmt(v, 2)}`;
  };

  return (
    <div>
      <SectionTitle>Price Inputs</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        <Input label="Fuel Price" value={amount} onChange={setAmount} placeholder="e.g. 850" />
        <Select label="From Unit" value={fromUnit} onChange={setFromUnit} options={PRICE_UNITS} />
        <Input label="EUR / USD Rate" value={eurRate} onChange={setEurRate} placeholder="0.92" />
      </div>

      {usdMT !== null && (
        <div
          style={{
            background: "#fffbf5",
            border: "1.5px solid #f8d6a3",
            borderRadius: 14,
            padding: "18px 24px",
            marginBottom: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b45309", marginBottom: 4 }}>
              Base price (USD / MT)
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#d97706" }}>${fmt(usdMT, 2)}</div>
          </div>
          <div style={{ fontSize: 12, color: "#92400e", textAlign: "right" }}>
            All prices normalised<br />to USD/Metric Ton
          </div>
        </div>
      )}

      <SectionTitle>Converted Prices</SectionTitle>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${PURPLE_BORDER}` }}>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Unit</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Description</th>
            <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {PRICE_UNITS.filter((u) => u !== fromUnit).map((u) => {
            const v = usdMT !== null ? fromUSDperMT(usdMT, u, eur) : null;
            return (
              <tr
                key={u}
                style={{ borderBottom: "1px solid #f0f0f6" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PURPLE_PALE)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 12px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 6,
                      background: PURPLE_PALE,
                      border: `1px solid ${PURPLE_BORDER}`,
                      fontSize: 11,
                      fontWeight: 700,
                      color: PURPLE,
                    }}
                  >
                    {u}
                  </span>
                </td>
                <td style={{ padding: "12px 12px", fontSize: 13, color: TEXT2 }}>{descriptions[u]}</td>
                <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 700, fontSize: 15, color: v !== null ? TEXT : "#d1c4e9" }}>
                  {formatPrice(v, u)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Note color="amber">
        Conversions based on Jet-A density <strong>0.804 kg/L</strong>. KL→MT assumes 804 kg/KL.
        Update the EUR/USD rate to match current market figures — ECB reference rate recommended.
      </Note>
    </div>
  );
}

// ── EASA ReFuelEU Reference Prices ────────────────────────────────────────────
function ReFuelEU() {
  const FUEL_TYPES = [
    { label: "Conventional Aviation Fuel (CAF)", short: "CAF", eur: 640, type: "real", desc: "Real index price (Platts, Argus, General Index)" },
    { label: "Aviation Biofuels (HEFA-SPK)", short: "Biofuel", eur: 1925, type: "real", desc: "Real index price — SAF HEFA NWE CIF Cargoes" },
    { label: "Advanced Aviation Biofuels", short: "Advanced Bio", eur: 2760, type: "est", range: "1,790 – 3,130", desc: "Production cost estimation (FOAK plant)" },
    { label: "Recycled Carbon Aviation Fuels", short: "RCAF", eur: 2195, type: "est", range: "1,805 – 2,540", desc: "Production cost estimation" },
    { label: "Synthetic SAF — Industrial CO₂", short: "e-SAF (Ind.)", eur: 7520, type: "est", range: "6,710 – 8,420", desc: "Production cost estimation (FOAK)" },
    { label: "Synthetic SAF — Biogenic CO₂", short: "e-SAF (Bio.)", eur: 7520, type: "est", range: "6,710 – 8,420", desc: "Production cost estimation (FOAK)" },
    { label: "Synthetic SAF — Atmospheric CO₂", short: "e-SAF (Atm.)", eur: 8625, type: "est", range: "7,815 – 9,525", desc: "Production cost estimation (FOAK)" },
    { label: "Renewable H₂ for Aviation", short: "Green H₂", eur: 7705, type: "est", range: "6,810 – 8,700", desc: "Production cost estimation" },
    { label: "Low-Carbon H₂ for Aviation", short: "Blue H₂", eur: 4790, type: "est", desc: "Production cost estimation" },
    { label: "Synthetic Low-Carbon Aviation Fuels", short: "Syn LC SAF", eur: 5415, type: "est", range: "4,890 – 5,940", desc: "Production cost estimation" },
  ];

  const maxEur = 9000;

  // RFEUA penalty reference prices
  const refs = [
    { label: "CAF (P_conv)", eur: 640 },
    { label: "SAF (P_SAF)", eur: 1925 },
    { label: "Synthetic aviation fuels (P_syn)", eur: 7520 },
    { label: "Blended aviation fuels (P_af)", eur: 666 },
  ];

  return (
    <div>
      {/* Header banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
          borderRadius: 14,
          padding: "18px 22px",
          marginBottom: 28,
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div style={{ fontSize: 28 }}>✈</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            EASA 2026 Briefing Note
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
            2025 Aviation Fuels Reference Prices — ReFuelEU Aviation
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255