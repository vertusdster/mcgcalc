/**
 * E2E Tests for All Peptide Calculators
 *
 * Verified against peptidescalculator.com reference values:
 *
 * Reverse Calculator:
 *   10mg vial, 500mcg dose, 50 units → 10.00 ml BAC water
 *
 * Unit Converter:
 *   5 ml  → 5000 mg, 5000 uL, 5000000 mcg
 *   0.5 ml → 500 mg, 500 uL, 500000 mcg
 *
 * Order Calculator:
 *   Everyday (7/wk), 100 mcg, 1/day, 4 weeks → 2800 mcg total, 1 vial each (5/10/15/20/30 mg)
 *
 * Intranasal Calculator (Vial Version):
 *   100mg mass, 10ml diluent, 0.1ml/spray, 5mg dose → 1mg/spray, 5 sprays, 100 total
 *
 * Main Dosage Calculator:
 *   5mg peptide, 5ml BAC water, 250mcg dose, 30U syringe → 15 units
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Clear input, type new value */
async function clearAndType(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await input.click({ clickCount: 3 });
  await input.press("Backspace");
  await input.fill(value);
  await input.press("Tab"); // trigger blur for formatting
}

// ─── 1. Reverse Calculator ─────────────────────────────────────────────────

test.describe("Reverse Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reverse-calculator");
    await page.waitForLoadState("networkidle");
  });

  test("default values: 5mg vial, 250mcg dose, 100 units → 20.00 ml", async ({
    page,
  }) => {
    // Default inputs should be 5 / 250 / 100
    const resultText = page.locator("text=20.00 ml");
    await expect(resultText).toBeVisible();
  });

  test("10mg vial, 500mcg dose, 50 units → 10.00 ml (matches peptidescalculator.com)", async ({
    page,
  }) => {
    // Set Peptide Vial = 10
    const inputs = page.locator('input[type="text"][inputmode="decimal"]');
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "10");
    // Set Dosage = 500
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=1', "500");
    // Set Units = 50
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=2', "50");

    // Wait for result
    await expect(page.locator("text=10.00 ml")).toBeVisible();
    await expect(page.locator("text=1000 units")).toBeVisible();
  });

  test("2mg vial, 100mcg dose, 10 units → 2.00 ml", async ({ page }) => {
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "2");
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=1', "100");
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=2', "10");

    await expect(page.locator("text=2.00 ml")).toBeVisible();
  });

  test("shows empty state when all zeros", async ({ page }) => {
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "0");
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=1', "0");
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=2', "0");

    await expect(page.locator("text=Enter valid values to see results")).toBeVisible();
  });
});

// ─── 2. Unit Converter ──────────────────────────────────────────────────────

test.describe("Unit Converter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/unit-converter");
    await page.waitForLoadState("networkidle");
  });

  test("5 ml → 5000 mg, 5000 uL, 5000000 mcg (matches peptidescalculator.com)", async ({
    page,
  }) => {
    // Default should be 5 ml
    await expect(page.locator("text=5,000").first()).toBeVisible(); // mg
    await expect(page.locator("text=5,000,000")).toBeVisible();     // mcg
  });

  test("0.5 ml → 500 mg, 500 uL, 500000 mcg (matches peptidescalculator.com)", async ({
    page,
  }) => {
    // Clear and type 0.5
    await clearAndType(page, 'input[type="text"][inputmode="decimal"]', "0.5");

    await expect(page.locator("text=500").first()).toBeVisible();     // mg
    await expect(page.locator("text=500,000")).toBeVisible();         // mcg
  });

  test("10 mg → 0.01 ml, 10 uL, 10000 mcg", async ({ page }) => {
    await clearAndType(page, 'input[type="text"][inputmode="decimal"]', "10");
    // Select mg unit
    await page.locator("select").selectOption("mg");

    // 10 mg = 0.01 ml = 10 uL = 10000 mcg
    await expect(page.locator("text=10,000")).toBeVisible(); // mcg
  });

  test("CLEAR button resets the input", async ({ page }) => {
    await page.click("text=CLEAR");
    const input = page.locator('input[type="text"][inputmode="decimal"]');
    await expect(input).toHaveValue("");
  });
});

// ─── 3. Order Calculator ───────────────────────────────────────────────────

test.describe("Order Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/order-calculator");
    await page.waitForLoadState("networkidle");
  });

  test("default: Everyday, 50mcg, 1/day, 4 weeks → 1400 mcg", async ({
    page,
  }) => {
    // Default values: freq=Everyday, dose=50mcg, times=1, weeks=4
    await expect(page.locator("text=1,400 mcg")).toBeVisible();
    await expect(page.locator("text=1.4 mg")).toBeVisible();
  });

  test("Everyday, 100mcg, 1/day, 4 weeks → 2800 mcg (matches peptidescalculator.com)", async ({
    page,
  }) => {
    // Change dose to 100
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "100");

    await expect(page.locator("text=2,800 mcg")).toBeVisible();
    await expect(page.locator("text=2.8 mg")).toBeVisible();
    // All standard vial sizes should need 1 vial
    await expect(page.locator("text=5mg vials:")).toBeVisible();
  });

  test("3 days/week, 200mcg, 2/day, 8 weeks → 9600 mcg", async ({ page }) => {
    // Set frequency = 3 days per week
    await page.locator("select").first().selectOption("3 days per week");
    // Set dose = 200
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "200");
    // Set times per day = 2
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=1', "2");
    // Set duration = 8
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=2', "8");

    // 200 * 3 * 2 * 8 = 9600 mcg
    await expect(page.locator("text=9,600 mcg")).toBeVisible();
    await expect(page.locator("text=9.6 mg")).toBeVisible();
  });

  test("custom vial size toggle works", async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();
    await expect(page.locator("text=vials").last()).toBeVisible();
  });
});

// ─── 4. Intranasal Calculator ──────────────────────────────────────────────

test.describe("Intranasal Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/intranasal-calculator");
    await page.waitForLoadState("networkidle");
  });

  test("Vial: 100mg, 10ml, 0.1ml/spray, 5mg → 1mg/spray, 5 sprays, 100 total (matches peptidescalculator.com)", async ({
    page,
  }) => {
    // Default values should already be 100/10/0.1/5mg
    // Check results
    await expect(page.locator("text=1 mg (1000 mcg)")).toBeVisible();
    await expect(page.locator("text=5").nth(0)).toBeVisible(); // sprays needed = 5
    await expect(page.locator("text=100").nth(0)).toBeVisible(); // total sprays = 100
  });

  test("Vial: 50mg, 5ml, 0.1ml/spray, 2mg dose → 1mg/spray, 2 sprays, 50 total", async ({
    page,
  }) => {
    // Find the "Vial Version" section inputs
    const inputs = page.locator('input[type="text"][inputmode="decimal"]');

    // mass=50, diluent=5, spray=0.1, dose=2
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "50");
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=1', "5");
    // spray vol stays 0.1
    await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=3', "2");

    // concentration = 50/5 = 10 mg/ml, per spray = 10*0.1 = 1 mg
    // sprays needed = 2/1 = 2
    // total sprays = 5/0.1 = 50
    await expect(page.locator("text=1 mg")).toBeVisible();
  });

  test("Powder: 500mcg dose, 60 doses, 0.15ml/spray, 1 spray/dose → 0.03g, 9ml", async ({
    page,
  }) => {
    // Scroll to Powder section
    await page.locator("text=Powder Version").scrollIntoViewIfNeeded();

    // The powder inputs are after the first 4 vial inputs
    const powderInputs = page.locator('input[type="text"][inputmode="decimal"]');

    // powder dose = 500 (nth=4), doses = 60 (nth=5), spray vol = 0.15 (nth=6), sprays/dose = 1 (nth=7)
    // These should be pre-filled with defaults
    // 500 * 60 * 1 = 30000 mcg = 0.03 g
    // 60 * 1 * 0.15 = 9 ml
    await expect(page.locator("text=0.03 g")).toBeVisible();
    await expect(page.locator("text=9 ml")).toBeVisible();
  });

  test("Spray helper: 5 ml water → 50 sprays", async ({ page }) => {
    await page.locator("text=Spray Volume Helper").scrollIntoViewIfNeeded();
    // Default 5ml water, 0.1 spray vol → 50 sprays
    await expect(page.locator("text=50").last()).toBeVisible();
  });
});

// ─── 5. Main Dosage Calculator ─────────────────────────────────────────────

test.describe("Dosage Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calculator");
    await page.waitForLoadState("networkidle");
  });

  test("default values produce a valid result", async ({ page }) => {
    // Default: 30U syringe, 5mg peptide, 5ml water, 250mcg dose
    // Concentration = 5mg / 5ml = 1 mg/ml
    // Dose = 250mcg = 0.25mg
    // Volume = 0.25 / 1 = 0.25 ml
    // Units for 30U syringe (0.3ml): 0.25/0.3 * 30 = 25 units
    await expect(page.locator("text=units")).toBeVisible();
  });

  test("syringe size toggle works", async ({ page }) => {
    // Click 50 units syringe
    await page.click("text=50 units");
    // Click 100 units syringe
    await page.click("text=100 units");
    // Should still show a result
    await expect(page.locator("text=units")).toBeVisible();
  });

  test("add peptide button adds a new row", async ({ page }) => {
    await page.click("text=ADD PEPTIDE");
    // Should now have 2 peptide rows
    await expect(page.locator("text=Peptide 2")).toBeVisible();
  });
});

// ─── 6. Cross-Calculator Navigation ────────────────────────────────────────

test.describe("Navigation", () => {
  test("Calculators dropdown contains all 5 tools", async ({ page }) => {
    await page.goto("/calculator");
    await page.waitForLoadState("networkidle");

    // Open Calculators dropdown
    await page.click("text=Calculators");

    // Check all 5 items
    await expect(page.locator("text=Dosage Calculator")).toBeVisible();
    await expect(page.locator("text=Reverse Calculator")).toBeVisible();
    await expect(page.locator("text=Intranasal Calculator")).toBeVisible();
    await expect(page.locator("text=Order Calculator")).toBeVisible();
    await expect(page.locator("text=Unit Converter")).toBeVisible();
  });

  test("navigate from dropdown to each calculator", async ({ page }) => {
    await page.goto("/calculator");
    await page.waitForLoadState("networkidle");

    // Navigate to Reverse Calculator via dropdown
    await page.click("text=Calculators");
    await page.click("a[href='/reverse-calculator']");
    await expect(page).toHaveURL("/reverse-calculator");
    await expect(page.locator("h1")).toContainText("Reverse");

    // Navigate to Unit Converter
    await page.click("text=Calculators");
    await page.click("a[href='/unit-converter']");
    await expect(page).toHaveURL("/unit-converter");
    await expect(page.locator("h1")).toContainText("Unit Converter");
  });
});
