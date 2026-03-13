---
name: IssueList action text status
description: IssueList now renders action text from ACTION_GUIDE on fail/warn rows; but visual distinction between evidence and action text is weak
type: project
---

As of the current codebase, IssueList does receive `actionGuide` prop and renders action text (`issue.action`) on fail/warn rows at `text-xs text-blue-300`.

The plumbing is complete. The remaining gap is visual hierarchy:

- `detail` text (evidence — what was found) and `action` text (what to do) are both `text-xs` with only color to distinguish them
- `detail` is `text-slate-400`, `action` is `text-blue-300` — the color difference is the only signal
- There is no label, icon, or structural separator to make the "Fix:" affordance self-explanatory to a first-time user

**Why:** Both strings were added inline in the same `<div>` without visual differentiation. A user scanning quickly can miss that the blue line is an instruction, not more diagnostic context.

**How to apply:** When evaluating IssueList readability, check whether fail/warn rows make it obvious which text tells you what happened vs. what to do. If there is no visual separator (label prefix, left border, icon), flag it.
