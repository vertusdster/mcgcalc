/**
 * E2E Tests for All Peptide Calculators
 *
 * Reference values verified against peptidescalculator.com:
 *
 * Reverse Calculator:
 *   5mg vial, 250mcg dose, 100 units → 20.00 ml BAC water
 *   10mg vial, 500mcg dose, 50 units → 10.00 ml BAC water
 *
 * Unit Converter:
 *   5 ml  → 5,000 mg, 5,000 uL, 5,000,000 mcg
 *   0.5 ml → 500 mg, 500 uL, 500,000 mcg
 *
 * Order Calculator:
 *   Everyday (7/wk), 50mcg, 1/day, 4 weeks → 1,400 mcg (1.4 mg)
 *   Everyday (7/wk), 100mcg, 1/day, 4 weeks → 2,800 mcg (2.8 mg)
 *
 * Intranasal Calculator (Vial Version):
 *   100mg mass, 10ml diluent, 0.1ml/spray, 5mg dose → 1mg/spray, 5 sprays, 100 total
 *
 * Intranasal Calculator (Powder Version):
 *   500mcg dose, 60 doses, 0.15ml/spray, 1 spray/dose → 0.03g, 9ml
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Scope to main content, excluding Astro dev toolbar */
function main(page: Page) {
  return page.locator("main, .mx-auto").first();
}

/** Clear an input then type a new value. Works with the NumberInput component. */
async function setInput(page: Page, index: number, value: string) {
  const input = main(page).locator('input[inputmode="decimal"]').nth(index);
  await input.click();
  await page.keyboard.press("Meta+a");
  await input.fill(value);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(200);
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
    const resultBlock = page.locator("[aria-live='polite']");
    await expect(resultBlock).toContainText("20.00 ml");
    await expect(resultBlock).toContainText("2000 units");
  });

  test("10mg vial, 500mcg dose, 50 units → 10.00 ml (matches peptidescalculator.com)", async ({
    page,
  }) => {
    await setInput(page, 0, "10");
    await setInput(page, 1, "500");
    await setInput(page, 2, "50");

    const resultBlock = page.locator("[aria-live='polite']");
    await expect(resultBlock).toContainText("10.00 ml");
    await expect(resultBlock).toContainText("1000 units");
  });

  test("2mg vial, 100mcg dose, 10 units → 2.00 ml", async ({ page }) => {
    await setInput(page, 0, "2");
    await setInput(page, 1, "100");
    await setInput(page, 2, "10");

    const resultBlock = page.locator("[aria-live='polite']");
    await expect(resultBlock).toContainText("2.00 ml");
  });

  test("boundary: 1mg vial, 1mcg dose, 1 unit → 10.00 ml", async ({
    page,
  }) => {
    await setInput(page, 0, "1");
    await setInput(page, 1, "1");
    await setInput(page, 2, "1");

    const resultBlock = page.locator("[aria-live='polite']");
    await expect(resultBlock).toContainText("10.00 ml");
  });

  test("shows empty state when values are zero", async ({ page }) => {
    await setInput(page, 0, "0");

    const resultBlock = page.locator("[aria-live='polite']");
    await expect(resultBlock).toContainText("Enter valid values");
  });
});

// ─── 2. Unit Converter ──────────────────────────────────────────────────────

test.describe("Unit Converter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/unit-converter");
    await page.waitForLoadState("networkidle");
  });

  test("5 ml → 5,000 mg, 5,000 uL, 5,000,000 mcg (matches peptidescalculator.com)", async ({
    page,
  }) => {
    await expect(page.getByText("5,000").first()).toBeVisible();
    await expect(page.getByText("5,000,000")).toBeVisible();
  });

  test("0.5 ml → 500 mg, 500 uL, 500,000 mcg (matches peptidescalculator.com)", async ({
    page,
  }) => {
    const input = main(page).locator('input[inputmode="decimal"]');
    await input.click();
    await page.keyboard.press("Meta+a");
    await input.fill("0.5");

    await expect(page.getByText("500,000")).toBeVisible();
  });

  test("10 mg → 10 uL, 10,000 mcg", async ({ page }) => {
    const input = main(page).locator('input[inputmode="decimal"]');
    await input.click();
    await page.keyboard.press("Meta+a");
    await input.fill("10");

    // Select mg from the unit dropdown (first select in main content area)
    await main(page).locator("select").first().selectOption("mg");

    await expect(page.getByText("10,000")).toBeVisible();
  });

  test("1000 mcg → 1 mg, 1 uL", async ({ page }) => {
    const input = main(page).locator('input[inputmode="decimal"]');
    await input.click();
    await page.keyboard.press("Meta+a");
    await input.fill("1000");

    await main(page).locator("select").first().selectOption("mcg");

    // 1000 mcg = 0.001 ml = 1 mg = 1 uL
    // Verify actual cross-unit conversions, not just mcg→mcg echo
    const mgRow = page.locator("text=Milligrams(mg)").locator("..");
    const uLRow = page.locator("text=Microlitres(uL)").locator("..");
    await expect(mgRow).toContainText("1");
    await expect(uLRow).toContainText("1");
  });

  test("CLEAR button resets input", async ({ page }) => {
    await page.getByText("CLEAR").click();
    const input = main(page).locator('input[inputmode="decimal"]');
    await expect(input).toHaveValue("");
    await expect(page.getByText("Enter a value to convert")).toBeVisible();
  });
});

// ─── 3. Order Calculator ───────────────────────────────────────────────────

test.describe("Order Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/order-calculator");
    await page.waitForLoadState("networkidle");
  });

  test("default: Everyday, 50mcg, 1/day, 4 weeks → 1,400 mcg (1.4 mg)", async ({
    page,
  }) => {
    const resultArea = main(page).locator(".border-t").last();
    await expect(resultArea).toContainText("1,400 mcg");
    await expect(resultArea).toContainText("1.4 mg");
  });

  test("Everyday, 100mcg, 1/day, 4 weeks → 2,800 mcg (matches peptidescalculator.com)", async ({
    page,
  }) => {
    await setInput(page, 0, "100");

    const resultArea = main(page).locator(".border-t").last();
    await expect(resultArea).toContainText("2,800 mcg");
    await expect(resultArea).toContainText("2.8 mg");
  });

  test("3 days/week, 200mcg, 2/day, 8 weeks → 9,600 mcg", async ({
    page,
  }) => {
    await main(page).locator("select").first().selectOption("3 days per week");
    await setInput(page, 0, "200");
    await setInput(page, 1, "2");
    await setInput(page, 2, "8");

    const resultArea = main(page).locator(".border-t").last();
    await expect(resultArea).toContainText("9,600 mcg");
    await expect(resultArea).toContainText("9.6 mg");
  });

  test("vial breakdown shows all standard sizes", async ({ page }) => {
    // The list items contain text like "5mg vials: 1" — use locator scoped to the list
    const vialList = main(page).locator("ul.list-disc");
    await expect(vialList.locator("li")).toHaveCount(5);
    await expect(vialList).toContainText("5mg vials:");
    await expect(vialList).toContainText("10mg vials:");
    await expect(vialList).toContainText("15mg vials:");
    await expect(vialList).toContainText("20mg vials:");
    await expect(vialList).toContainText("30mg vials:");
  });

  test("custom vial size toggle works", async ({ page }) => {
    await page.getByRole("checkbox", { name: "Custom Vial Size" }).check();
    // After checking, a custom vial input and result should appear
    await expect(main(page).getByText("vials").last()).toBeVisible();
  });

  test("units can switch between mcg and mg", async ({ page }) => {
    // Change dose unit to mg (it's the second select in the form)
    await main(page).locator("select").nth(1).selectOption("mg");
    await setInput(page, 0, "1");

    // 1 mg * 7 * 1 * 4 = 28 mg = 28000 mcg
    const resultArea = main(page).locator(".border-t").last();
    await expect(resultArea).toContainText("28,000 mcg");
  });
});

// ─── 4. Intranasal Calculator ──────────────────────────────────────────────

test.describe("Intranasal Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/intranasal-calculator");
    await page.waitForLoadState("networkidle");
  });

  // --- Vial Version ---

  test("Vial defaults: 100mg, 10ml, 0.1ml/spray, 5mg → 1mg/spray, 5 sprays, 100 total (matches peptidescalculator.com)", async ({
    page,
  }) => {
    const vialCard = page.locator("text=Vial Version").locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]");
    await expect(vialCard).toContainText("1 mg (1000 mcg)");
    await expect(vialCard).toContainText("5 sprays");
    await expect(vialCard).toContainText("100");
  });

  test("Vial: 50mg, 5ml, 0.1ml/spray, 2mg → 1mg/spray, 2 sprays, 50 total", async ({
    page,
  }) => {
    await setInput(page, 0, "50");
    await setInput(page, 1, "5");
    await setInput(page, 3, "2");

    const vialCard = page.locator("text=Vial Version").locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]");
    await expect(vialCard).toContainText("1 mg");
    await expect(vialCard).toContainText("2 sprays");
  });

  test("Vial: dose unit toggle to mcg works", async ({ page }) => {
    // Click the mcg button in dose unit group
    await page.locator('[aria-label="Dose unit"] button:has-text("mcg")').click();
    await setInput(page, 3, "5000");

    const vialCard = page.locator("text=Vial Version").locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]");
    await expect(vialCard).toContainText("5 sprays");
  });

  // --- Powder Version ---

  test("Powder defaults: 500mcg dose, 60 doses, 0.15ml/spray, 1 spray/dose → 0.03g, 9ml", async ({
    page,
  }) => {
    const powderCard = page.locator("text=Powder Version").locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]");
    await expect(powderCard).toContainText("0.03 g");
    await expect(powderCard).toContainText("9 ml");
  });

  test("Powder: 1000mcg dose, 30 doses, 0.1ml/spray, 2 sprays/dose → 0.06g, 6ml", async ({
    page,
  }) => {
    await setInput(page, 4, "1000");
    await setInput(page, 5, "30");
    await setInput(page, 6, "0.1");
    await setInput(page, 7, "2");

    const powderCard = page.locator("text=Powder Version").locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]");
    await expect(powderCard).toContainText("0.06 g");
    await expect(powderCard).toContainText("6 ml");
  });

  // --- Spray Helper ---

  test("Spray Helper: default 5ml water → 50 sprays at 0.1ml", async ({
    page,
  }) => {
    const helperCard = page.locator("text=Spray Volume Helper").locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]");
    await expect(helperCard).toContainText("No. of Sprays:");
    await expect(helperCard).toContainText("50");
    await expect(helperCard).toContainText("0.1");
  });

  test("Spray Helper: 10ml water → 100 sprays", async ({ page }) => {
    const helperCard = page.locator("text=Spray Volume Helper").locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]");
    await helperCard.locator("select").selectOption("10");

    await expect(helperCard).toContainText("100");
  });
});

// ─── 5. Main Dosage Calculator ─────────────────────────────────────────────

test.describe("Dosage Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/peptide-calculator");
    await page.waitForLoadState("networkidle");
  });

  test("page loads without error", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Peptide Dosage Calculator" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "30 units" })).toBeVisible();
  });

  test("default 5mg/5ml/250mcg/30U → 25 units", async ({ page }) => {
    // Default: 30U syringe (0.3ml), 5mg peptide, 5ml BAC water, 250mcg dose
    // Concentration = 5mg / 5ml = 1 mg/ml
    // Volume needed = 0.25mg / 1 mg/ml = 0.25 ml
    // Units = (0.25 / 0.3) × 30 = 25 units
    const resultSection = page.locator("[aria-live='polite']");
    await expect(resultSection).toContainText("25");
    await expect(resultSection).toContainText("units");
  });

  test("syringe size toggle switches between sizes", async ({ page }) => {
    // Click 50 units syringe button
    await page.getByRole("button", { name: "50 units" }).click();
    await page.waitForTimeout(200);
    // Click 100 units syringe button
    await page.getByRole("button", { name: "100 units" }).click();
    await page.waitForTimeout(200);
    // Verify 100 units is now pressed
    await expect(
      page.getByRole("button", { name: "100 units" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("Add Peptide button adds a new row", async ({ page }) => {
    await page.getByRole("button", { name: "ADD PEPTIDE" }).click();
    // "Peptide 2" appears in multiple places (quantity + dose sections)
    // Just check that a second peptide input row exists
    await expect(
      main(page).locator("text=Peptide 2").first()
    ).toBeVisible();
  });
});

// ─── 6. Cross-Calculator Navigation ────────────────────────────────────────

test.describe("Navigation", () => {
  test("Calculators dropdown contains all 5 tools", async ({ page }) => {
    await page.goto("/peptide-calculator");
    await page.waitForLoadState("networkidle");

    // Click the desktop Calculators trigger (first button with that name)
    await page.getByRole("button", { name: "Calculators" }).first().click();

    // Check dropdown content for all 5 calculator links
    await expect(page.getByRole("link", { name: /Dosage Calculator/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Reverse Calculator/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Intranasal Calculator/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Order Calculator/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Unit Converter/i }).first()).toBeVisible();
  });

  test("navigate to Reverse Calculator via dropdown", async ({ page }) => {
    await page.goto("/peptide-calculator");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Calculators" }).first().click();
    await page.locator("a[href='/reverse-calculator']").first().click();
    await expect(page).toHaveURL(/reverse-calculator/);
  });

  test("navigate to Unit Converter via dropdown", async ({ page }) => {
    await page.goto("/peptide-calculator");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Calculators" }).first().click();
    await page.locator("a[href='/unit-converter']").first().click();
    await expect(page).toHaveURL(/unit-converter/);
  });

  test("all calculator pages load successfully", async ({ page }) => {
    const pages = [
      { url: "/peptide-calculator", heading: "Peptide Dosage Calculator" },
      { url: "/reverse-calculator", heading: "Reverse Peptides Calculator" },
      { url: "/intranasal-calculator", heading: "Intranasal Calculator" },
      { url: "/order-calculator", heading: "Order Calculator" },
      { url: "/unit-converter", heading: "Unit Converter" },
    ];

    for (const p of pages) {
      await page.goto(p.url);
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("heading", { name: p.heading, level: 1 })
      ).toBeVisible();
    }
  });
});
