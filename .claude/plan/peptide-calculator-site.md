# Implementation Plan: Peptide Calculator Site Migration

## Objective
Transform the current Charter template into a production-ready peptide dosage calculator tool site — with a polished calculator (including save feature), robust SEO infrastructure, peptide-specific landing pages, and a properly structured blog (content to be written separately).

---

## Gap Analysis: Current vs Target

| Feature | Current State | Target |
|---|---|---|
| Homepage | Charter financial SaaS hero | Peptide calculator hero + feature highlights |
| Calculator | ✅ Basic dose calculator | + Save/load calculations (localStorage) |
| Peptide pages | ❌ None | 20 peptide-specific SEO landing pages |
| Blog UI | ✅ Exists (5 placeholder posts) | Improved layout; placeholder posts kept for now |
| Blog content | 5 unrelated Charter posts | ⏸ Deferred — to be written separately |
| Nav | Calculator / Blog / About / FAQ | Calculator / Peptides / Blog / FAQ |
| SEO infrastructure | Minimal | Canonical, JSON-LD, sitemap, meta per page |
| Save Calculation | ❌ None | ✅ localStorage save/load |

---

## Implementation Plan

### Phase 1 — Homepage & Core Cleanup (Priority: HIGH)

**1.1 Rewrite Hero Section**
- File: `src/components/sections/hero.tsx`
- Headline: "Free Peptide Dosage Calculator"
- Sub-headline: "Calculate the exact units to draw for any peptide. Enter your vial quantity, BAC water, and target dose — get instant results."
- Replace feature tabs with 3 calculator feature highlights (no images needed):
  - "Multi-peptide" — supports up to 5 peptides simultaneously
  - "Real-time visualization" — animated syringe shows exact fill
  - "All units" — mg, mcg, mL, IU supported
- CTA button: "Calculate Now" → `/calculator`
- Remove hero images (replace with calculator UI preview or simple illustration)

**1.2 Rewrite Homepage Sections**
- File: `src/pages/index.astro`
- REMOVE: CodeSecurity, Testimonials, WhyCharter, AIChatbot, LaunchPricing
- ADD: 3-card feature section (Accurate / Free / Multi-peptide)
- ADD: "How It Works" 3-step section (Mix → Enter → Draw)
- ADD: CTA banner → `/calculator`
- ADD: Featured peptides grid (links to peptide pages, 6–8 cards)

**1.3 Remove Unused Pages**
- Delete: `src/pages/login.astro`, `src/pages/signup.astro`, `src/pages/pricing.astro`

**1.4 Update Footer**
- File: `src/components/sections/footer.tsx`
- Links: Calculator / Peptides / Blog / FAQ / About / Contact / Privacy / Terms
- Remove all Charter/shadcnblocks branding

---

### Phase 2 — Save Calculation Feature (Priority: HIGH)

**2.1 Add Save/Load UI to Calculator**
- File: `src/components/sections/peptide-calculator.tsx`
- Add "Save Calculation" button (appears when results are valid)
- On save: prompt for a custom name/label (e.g. "BPC-157 Morning Dose")
- Storage: `localStorage` key `peptide-saved-calculations` — array of:
  ```ts
  {
    id: string
    label: string
    savedAt: string (ISO date)
    syringeVolume: number
    waterVolume: number | string
    waterUnit: "ml" | "IU"
    peptides: Peptide[]
  }
  ```
- Add "Saved Calculations" collapsible panel below the calculator
- Each saved item shows label + date + "Load" and "Delete" buttons
- Load: restores all inputs to saved values
- Delete: removes from localStorage

---

### Phase 3 — Peptide Landing Pages (Priority: HIGH — Core SEO)

**3.1 Add Peptide Content Collection**
- File: `src/content.config.ts`
- Add `peptides` collection (glob `src/content/peptides/**/*.md`):
  ```ts
  {
    name: z.string()              // "BPC-157"
    description: z.string()       // SEO meta description
    category: z.string()          // "Healing" | "GH" | "GLP-1" | etc.
    defaultDose: z.number()       // mcg, pre-fills calculator
    defaultVialSize: z.number()   // mg
    molecularWeight: z.string().optional()
    pubDate: z.coerce.date()
  }
  ```

**3.2 Create Dynamic Peptide Route**
- File: `src/pages/peptides/[slug].astro`
- Renders: MDX content (article) + `<PeptideCalculator>` pre-filled with `defaultDose` and `defaultVialSize`
- Layout: `DefaultLayout` with `prose` article content + embedded calculator section
- JSON-LD: `MedicalWebPage` or `Article` schema per page

**3.3 Create Peptides Index Page**
- File: `src/pages/peptides/index.astro`
- Grid of peptide cards grouped by category
- Each card: name, category badge, short description, "Calculate" link

**3.4 Create 20 Peptide MDX Pages**
Location: `src/content/peptides/`

Each file has frontmatter + article content:
- What is [Peptide]? (2–3 paragraphs)
- Common research dosing parameters
- How to reconstitute
- FAQ (3–5 Q&A)
- Calculator pre-filled with defaults

Priority order (highest search volume first):
1. `bpc-157.md` — Healing / tissue repair
2. `semaglutide.md` — GLP-1 (very high volume)
3. `tirzepatide.md` — GLP-1
4. `tb-500.md` — Recovery
5. `ipamorelin.md` — GH
6. `cjc-1295.md` — GHRH
7. `ghrp-2.md` — GH
8. `ghrp-6.md` — GH
9. `melanotan-2.md` — Tanning / libido
10. `pt-141.md` — Sexual health
11. `aod-9604.md` — Fat loss
12. `hexarelin.md` — GH
13. `sermorelin.md` — GHRH
14. `epithalon.md` — Anti-aging
15. `selank.md` — Nootropic
16. `semax.md` — Nootropic
17. `igf-1-lr3.md` — IGF
18. `ghk-cu.md` — Copper peptide / skin
19. `tesamorelin.md` — GH / fat loss
20. `nad-plus.md` — Longevity

---

### Phase 4 — Blog UI Improvements (Priority: MEDIUM)

> ⚠️ **Blog content writing is deferred.** Placeholder posts are kept as-is. Focus is on improving how the blog looks and is structured.

**4.1 Improve Blog Listing Page**
- File: `src/pages/blog/index.astro` + `src/components/sections/blog-posts.tsx`
- Add category/tag filter tabs (for when real content exists)
- Improve card design: larger featured image area, reading time estimate, tag badges
- Add "Coming Soon" empty state if no posts match filter

**4.2 Improve Blog Post Layout**
- File: `src/pages/blog/[...slug].astro`
- Add: Table of Contents (auto-generated from headings)
- Add: Reading progress indicator
- Add: "Related Articles" section at bottom (same tags)
- Add: "Try the Calculator" CTA box within articles

**4.3 Update Blog Schema**
- File: `src/content.config.ts`
- Add fields to blog schema: `category`, `keywords`, `readingTime` (optional)

---

### Phase 5 — SEO Infrastructure (Priority: HIGH)

**5.1 Canonical URLs**
- File: `src/components/BaseHead.astro`
- Add `<link rel="canonical" href={canonicalUrl} />` using `Astro.url`

**5.2 JSON-LD Structured Data**
- File: `src/components/BaseHead.astro` (accept `schema` prop)
- Calculator page (`/calculator`): `WebApplication` schema
- Peptide pages (`/peptides/[slug]`): `Article` + `FAQPage` schema
- Blog posts: `Article` schema with author, datePublished, dateModified

**5.3 Enhanced Meta Tags**
- File: `src/components/BaseHead.astro`
- Ensure every page passes unique `title`, `description`, `keywords`
- Add `og:type`, `og:url`, `article:published_time` for blog/peptide pages
- Add `<meta name="robots" content="index, follow">` globally

**5.4 Sitemap Verification**
- File: `astro.config.mjs`
- Confirm sitemap includes `/peptides/*` and `/blog/*`
- Add `changefreq` and `priority` hints if supported

**5.5 Update Navbar for Peptides**
- File: `src/components/sections/navbar.tsx`
- Add "Peptides" nav item → `/peptides`
- Mobile menu: add Peptides link

---

## Key Files Summary

| File | Action |
|---|---|
| `src/components/sections/hero.tsx` | Rewrite — peptide-focused |
| `src/pages/index.astro` | Rewrite — remove Charter sections |
| `src/components/sections/footer.tsx` | Edit — update links/branding |
| `src/components/sections/navbar.tsx` | Edit — add Peptides |
| `src/components/sections/peptide-calculator.tsx` | Add save/load feature |
| `src/components/BaseHead.astro` | Edit — canonical + JSON-LD |
| `src/content.config.ts` | Edit — add peptides collection, update blog schema |
| `src/pages/peptides/index.astro` | Create |
| `src/pages/peptides/[slug].astro` | Create |
| `src/content/peptides/*.md` | Create — 20 files |
| `src/pages/blog/index.astro` | Edit — improved UI |
| `src/pages/blog/[...slug].astro` | Edit — TOC, CTA, related |
| `src/pages/login.astro` | Delete |
| `src/pages/signup.astro` | Delete |
| `src/pages/pricing.astro` | Delete |
| `astro.config.mjs` | Edit — sitemap config |

---

## Execution Order

```
Phase 1 — Homepage cleanup & hero rewrite
Phase 2 — Save calculation feature (localStorage)
Phase 3 — Peptide landing pages (20 pages, SEO core)
Phase 4 — Blog UI improvements (no content writing)
Phase 5 — SEO infrastructure (canonical, JSON-LD, sitemap)
```

---

## Verification Checklist

- [ ] `npm run build` passes with 0 errors
- [ ] `/` shows peptide-focused hero and feature sections
- [ ] `/calculator` — save/load works via localStorage
- [ ] `/peptides` lists all 20 peptide cards by category
- [ ] `/peptides/bpc-157` has pre-filled calculator + article
- [ ] `/blog` shows improved card layout
- [ ] Each page has unique `<title>` and `<meta description>`
- [ ] Each page has `<link rel="canonical">`
- [ ] Calculator page has `WebApplication` JSON-LD
- [ ] Sitemap includes all peptide and blog URLs
