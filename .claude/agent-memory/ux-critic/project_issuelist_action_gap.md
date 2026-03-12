---
name: IssueList missing action text
description: IssueList rows show detail text (what is wrong) but no action text (what to do) — action text only exists in TopIssues for top 5 items
type: project
---

The IssueList component renders label, status icon, detail text, and score. It does not show action text.

ACTION_GUIDE in app/lib/utils/actions.ts is already keyed by issue.id, which every IssueList row already has. The plumbing is complete — the only missing step is passing the action map into IssueList and conditionally rendering the action string below detail text on fail/warn rows.

There are 25+ issues across four tabs. TopIssues covers only 5. The remaining 20+ fail/warn items are orphaned with no actionable guidance.

**Why:** TopIssues was built as a separate summary component. IssueList was built as a diagnostic table. They were never connected.

**How to apply:** When evaluating IssueList changes, check whether fail/warn rows include action text from ACTION_GUIDE. If not, flag it as the medium-effort follow-up to the TopIssues position fix.
