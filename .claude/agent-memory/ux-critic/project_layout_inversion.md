---
name: TopIssues layout inversion
description: TopIssues is currently rendered below the tab section, burying the most actionable content at the bottom of the page
type: project
---

The result page renders in this order: score gauges → breakdown bars → tabbed IssueList → TopIssues.

This is inverted. TopIssues contains the only action text in the product. A non-expert user forms their mental model from top to bottom, so they hit score numbers they cannot act on, then raw diagnostic rows without fix instructions, and reach actionable guidance last — or not at all.

**Why:** Layout was likely assembled in implementation order (scores first, then details, then summary), not in user-decision order.

**How to apply:** When reviewing result page changes, verify that TopIssues (or any equivalent prioritized-action component) appears before the tabbed detail section, not after. The canonical correct order is: overall health → top priorities with actions → detailed drill-down tabs.
