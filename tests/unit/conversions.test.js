const { DENSITY, BARREL_LITRES, toLitresFromKey, fromLitresToKey } = require('../../lib/conversions');

test('barrel to litres', () => {
  expect(toLitresFromKey('bbl', 1)).toBeCloseTo(BARREL_LITRES, 8);
});

test('1000 L equals 0.8 MT (with density 0.8 kg/L)', () => {
  const litres = 1000;
  const tonnes = fromLitresToKey('tonnes', litres);
  expect(tonnes).toBeCloseTo((litres * DENSITY) / 1000, 8);
});

test('gallons conversion roundtrip', () => {
  const gallons = 100;
  const litres = toLitresFromKey('gallons', gallons);
  const back = fromLitresToKey('gallons', litres);
  expect(back).toBeCloseTo(gallons, 8);
});
