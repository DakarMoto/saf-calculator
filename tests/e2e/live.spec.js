const { test, expect } = require('@playwright/test');

test('live badge appears and SAF price populated', async ({ page }) => {
  await page.goto('http://localhost:8080');
  // Wait for SAF input to be populated (prices.json present in repo)
  await page.waitForSelector('#safPrice');
  const safVal = await page.inputValue('#safPrice');
  expect(safVal.length).toBeGreaterThan(0);
  // Live badge should be visible when prices.json contains a price
  const badgeVisible = await page.isVisible('#livePriceBadge');
  expect(badgeVisible).toBe(true);
});

test('quick conversion updates result', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.fill('#convAmt', '1000');
  await page.selectOption('#convFrom', 'liters');
  await page.selectOption('#convTo', 'tonnes');
  // Wait for conversion result to update
  await page.waitForTimeout(200);
  const out = await page.textContent('#convResult');
  expect(out).toContain('MT');
});
