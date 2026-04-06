# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: calculators.spec.ts >> Reverse Calculator >> 10mg vial, 500mcg dose, 50 units → 10.00 ml (matches peptidescalculator.com)
- Location: e2e/calculators.spec.ts:52:3

# Error details

```
Error: locator.click: Test ended.
Call log:
  - waiting for locator('input[type="text"][inputmode="decimal"]').first()

```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests for All Peptide Calculators
  3   |  *
  4   |  * Verified against peptidescalculator.com reference values:
  5   |  *
  6   |  * Reverse Calculator:
  7   |  *   10mg vial, 500mcg dose, 50 units → 10.00 ml BAC water
  8   |  *
  9   |  * Unit Converter:
  10  |  *   5 ml  → 5000 mg, 5000 uL, 5000000 mcg
  11  |  *   0.5 ml → 500 mg, 500 uL, 500000 mcg
  12  |  *
  13  |  * Order Calculator:
  14  |  *   Everyday (7/wk), 100 mcg, 1/day, 4 weeks → 2800 mcg total, 1 vial each (5/10/15/20/30 mg)
  15  |  *
  16  |  * Intranasal Calculator (Vial Version):
  17  |  *   100mg mass, 10ml diluent, 0.1ml/spray, 5mg dose → 1mg/spray, 5 sprays, 100 total
  18  |  *
  19  |  * Main Dosage Calculator:
  20  |  *   5mg peptide, 5ml BAC water, 250mcg dose, 30U syringe → 15 units
  21  |  */
  22  | 
  23  | import { test, expect, type Page } from "@playwright/test";
  24  | 
  25  | // ─── Helpers ────────────────────────────────────────────────────────────────
  26  | 
  27  | /** Clear input, type new value */
  28  | async function clearAndType(page: Page, selector: string, value: string) {
  29  |   const input = page.locator(selector);
> 30  |   await input.click({ clickCount: 3 });
      |               ^ Error: locator.click: Test ended.
  31  |   await input.press("Backspace");
  32  |   await input.fill(value);
  33  |   await input.press("Tab"); // trigger blur for formatting
  34  | }
  35  | 
  36  | // ─── 1. Reverse Calculator ─────────────────────────────────────────────────
  37  | 
  38  | test.describe("Reverse Calculator", () => {
  39  |   test.beforeEach(async ({ page }) => {
  40  |     await page.goto("/reverse-calculator");
  41  |     await page.waitForLoadState("networkidle");
  42  |   });
  43  | 
  44  |   test("default values: 5mg vial, 250mcg dose, 100 units → 20.00 ml", async ({
  45  |     page,
  46  |   }) => {
  47  |     // Default inputs should be 5 / 250 / 100
  48  |     const resultText = page.locator("text=20.00 ml");
  49  |     await expect(resultText).toBeVisible();
  50  |   });
  51  | 
  52  |   test("10mg vial, 500mcg dose, 50 units → 10.00 ml (matches peptidescalculator.com)", async ({
  53  |     page,
  54  |   }) => {
  55  |     // Set Peptide Vial = 10
  56  |     const inputs = page.locator('input[type="text"][inputmode="decimal"]');
  57  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "10");
  58  |     // Set Dosage = 500
  59  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=1', "500");
  60  |     // Set Units = 50
  61  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=2', "50");
  62  | 
  63  |     // Wait for result
  64  |     await expect(page.locator("text=10.00 ml")).toBeVisible();
  65  |     await expect(page.locator("text=1000 units")).toBeVisible();
  66  |   });
  67  | 
  68  |   test("2mg vial, 100mcg dose, 10 units → 2.00 ml", async ({ page }) => {
  69  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "2");
  70  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=1', "100");
  71  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=2', "10");
  72  | 
  73  |     await expect(page.locator("text=2.00 ml")).toBeVisible();
  74  |   });
  75  | 
  76  |   test("shows empty state when all zeros", async ({ page }) => {
  77  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=0', "0");
  78  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=1', "0");
  79  |     await clearAndType(page, 'input[type="text"][inputmode="decimal"] >> nth=2', "0");
  80  | 
  81  |     await expect(page.locator("text=Enter valid values to see results")).toBeVisible();
  82  |   });
  83  | });
  84  | 
  85  | // ─── 2. Unit Converter ──────────────────────────────────────────────────────
  86  | 
  87  | test.describe("Unit Converter", () => {
  88  |   test.beforeEach(async ({ page }) => {
  89  |     await page.goto("/unit-converter");
  90  |     await page.waitForLoadState("networkidle");
  91  |   });
  92  | 
  93  |   test("5 ml → 5000 mg, 5000 uL, 5000000 mcg (matches peptidescalculator.com)", async ({
  94  |     page,
  95  |   }) => {
  96  |     // Default should be 5 ml
  97  |     await expect(page.locator("text=5,000").first()).toBeVisible(); // mg
  98  |     await expect(page.locator("text=5,000,000")).toBeVisible();     // mcg
  99  |   });
  100 | 
  101 |   test("0.5 ml → 500 mg, 500 uL, 500000 mcg (matches peptidescalculator.com)", async ({
  102 |     page,
  103 |   }) => {
  104 |     // Clear and type 0.5
  105 |     await clearAndType(page, 'input[type="text"][inputmode="decimal"]', "0.5");
  106 | 
  107 |     await expect(page.locator("text=500").first()).toBeVisible();     // mg
  108 |     await expect(page.locator("text=500,000")).toBeVisible();         // mcg
  109 |   });
  110 | 
  111 |   test("10 mg → 0.01 ml, 10 uL, 10000 mcg", async ({ page }) => {
  112 |     await clearAndType(page, 'input[type="text"][inputmode="decimal"]', "10");
  113 |     // Select mg unit
  114 |     await page.locator("select").selectOption("mg");
  115 | 
  116 |     // 10 mg = 0.01 ml = 10 uL = 10000 mcg
  117 |     await expect(page.locator("text=10,000")).toBeVisible(); // mcg
  118 |   });
  119 | 
  120 |   test("CLEAR button resets the input", async ({ page }) => {
  121 |     await page.click("text=CLEAR");
  122 |     const input = page.locator('input[type="text"][inputmode="decimal"]');
  123 |     await expect(input).toHaveValue("");
  124 |   });
  125 | });
  126 | 
  127 | // ─── 3. Order Calculator ───────────────────────────────────────────────────
  128 | 
  129 | test.describe("Order Calculator", () => {
  130 |   test.beforeEach(async ({ page }) => {
```