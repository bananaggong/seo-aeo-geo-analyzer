---
name: loam_phase1_structural_risks
description: Confirmed structural defects in LOAM Phase 1 implementation found by reading actual code — not assumptions
type: project
---

Documented structural risks in the current analyzer codebase as of 2026-03-13.

**Why:** These were found by reading actual source files during a rigorous design critique, not from proposals. They represent real false positive and score distortion risks already shipped.

**How to apply:** When any proposal touches AEO scoring, siteType classification, statistics/content checks, or org-schema, reference these findings before approving changes.

## Confirmed defects (with file + line references)

### 1. siteType misclassification inflates AEO score via denominator shrinkage
- `siteType.ts:129-132`: "about us", "contact", "문의", "연락처" matched against full body text. These appear in footers of nearly every site, adding +10/+10 to corporate score indiscriminately.
- Consequence: marketing/landing sites classified as corporate → question-headings (maxScore 15) and howto-schema (maxScore 10) skipped → AEO denominator shrinks → normalized AEO score rises.
- calcGroup returns 100 when all items in group are skipped (`aeo.ts:353`: `return max > 0 ? ... : 100`), so breakdown can show 100% on skipped groups.
- Estimated frequency: >50% of SaaS homepages and service landing pages.

### 2. statistics, sentence-complexity, content-length, paragraph-length use $("body").text()
- All four checks read the entire body including nav/header/footer.
- `aeo.ts:230`, `geo.ts:222`, `seo.ts:240` all use `$("body").text()` directly.
- citations check (`aeo.ts:254`) already has a contentSelectors fallback but the text-based checks don't share it.
- Causes false positives: footer copyright year "2024년", nav price "월 9,900원", breadcrumb numbers.

### 3. step-structure and comparison-structure check markup existence, not semantic intent
- `aeo.ts:318-319`: `$("ol").length >= 2` passes regardless of content. Breadcrumb `<ol>` + related posts `<ol>` = pass.
- `aeo.ts:293-294`: `table + th` passes for any table including pricing layouts unrelated to comparison.
- Easy to game and produces false positives on well-structured but non-procedural pages.

### 4. org-schema is checked independently in both geo.ts (lines 241-269, maxScore 20) and trust.ts (lines 68-84)
- Same JSON-LD signal contributes to GEO score AND Trust company-info.
- In Visibility Score: GEO (25%) and Trust (15%) both reward the same schema.
- One schema addition → GEO +20pts contribution + Trust +7-15pts contribution. Double-counted.

### 5. direct-answer uses $("p").first() which may be inside nav/header
- `aeo.ts:188`: first `<p>` anywhere in document, not scoped to main content.
- Cookie consent banners, nav descriptions, skip-to-content links can all be first `<p>`.

### 6. No SPA detection or warning
- `route.ts:86-103`: fetch + cheerio parse with no check for JS-heavy pages.
- SPA with client-side rendering returns near-empty HTML → most checks fail → user gets misleadingly low scores with no explanation.
- No field in API response to signal "this page may be SPA-rendered, results incomplete."
