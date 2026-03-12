---
name: TopIssues layout inversion
description: TopIssues placement relative to breakdown bars and tabs has been audited; correct order is now confirmed
type: project
---

The result page was originally: score gauges → breakdown bars → tabbed IssueList → TopIssues. This was fully inverted.

As of the commit at fbea648, TopIssues was moved to appear after breakdown bars and before the tab section. This is better, but still sub-optimal.

**Correct canonical order (confirmed in full redesign audit, 2026-03-12):**
1. Verdict strip (overall score + grade + one sentence)
2. Sub-score row (SEO/AEO/GEO/Trust)
3. TopIssues panel
4. Detail tabs + IssueList
5. Appendix (PageSpeed, site type, markdown preview)

The breakdown bar section (4 cards, 3 bars each) should be removed from the primary flow entirely, not just repositioned. It adds 12 unactionable numbers between scores and action guidance.

**Why:** Layout was assembled in implementation order (scores → detail → summary). User decision order is (verdict → priorities → evidence).

**How to apply:** Any layout or redesign work should ensure TopIssues is position 3 in reading order. Breakdown bars belong behind a disclosure toggle or removed. Verify no uninstructive number-heavy section interposes between scores and TopIssues.
