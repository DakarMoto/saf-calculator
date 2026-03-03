// Small conversion helpers used by unit tests.
const DENSITY = 0.800; // kg/L
const BARREL_LITRES = 158.987294928;

const UNITS = {
  liters:  { toLitres: v => v, fromLitres: v => v },
  gallons: { toLitres: v => v * 3.785411784, fromLitres: v => v / 3.785411784 },
  kg:      { toLitres: v => v / DENSITY, fromLitres: v => v * DENSITY },
  tonnes:  { toLitres: v => v * 1000 / DENSITY, fromLitres: v => v * DENSITY / 1000 },
  lbs:     { toLitres: v => v * 0.453592 / DENSITY, fromLitres: v => v * DENSITY / 0.453592 },
};

function toLitresFromKey(key, v) {
  if (key === 'bbl') return v * BARREL_LITRES;
  if (!UNITS[key]) return Number(v) || 0;
  return UNITS[key].toLitres(Number(v) || 0);
}

function fromLitresToKey(key, litres) {
  if (key === 'bbl') return litres / BARREL_LITRES;
  if (!UNITS[key]) return litres;
  return UNITS[key].fromLitres(litres);
}

module.exports = { DENSITY, BARREL_LITRES, toLitresFromKey, fromLitresToKey };
