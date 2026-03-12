---
name: action_guide_redundancy_pattern
description: Recurring proposal to surface ACTION_GUIDE text in IssueList, which creates redundancy with TopIssues and degrades prioritization signal
type: feedback
---

Proposals to add action text to every fail/warn item in IssueList should be challenged immediately as redundant with TopIssues.

**Why:** TopIssues already shows ranked action guidance for the top 5 score-gap items. Adding action text to all IssueList items removes the ordering signal, competes with TopIssues, and introduces API shape changes or client-side duplication of ACTION_GUIDE. A URL with 12 failing items would show 12 parallel action strings with no priority signal — the opposite of what TopIssues was built to provide.

**How to apply:** When this proposal surfaces again, ask first whether the real problem is discoverability of TopIssues (scroll depth, label clarity) rather than absence of action text in IssueList.
