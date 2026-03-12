---
name: UX copy and label quality patterns
description: Stable copy and presentation patterns that reduce confusion in this repo's result UI
type: project
---

## Patterns that work

- ACTION_GUIDE strings in actions.ts are specific, concrete, and copyable. They name the exact element, tag, or attribute to change. This is the right model for action text anywhere in the UI.
- The TopIssues gap bar visually encodes improvement magnitude well — bar width plus "+N점" label is intuitive.
- Status icons (checkmark / warning / X) combined with color-coded borders on IssueList rows are effective for fast scanning.

## Patterns that create confusion

- Showing currentScore/maxScore AND percentage simultaneously in a TopIssues row is redundant. Use one or the other.
- The gap bar label "+{n}점 개선 가능" is uninterpretable without a denominator anchor. Users do not know if +5 out of 20 is big or small. Add context (e.g. "of 20 pts") or show percentage of total score impact instead.
- Trust breakdown bars truncate issue labels to 8 characters which can produce mid-character cuts and looks like a rendering bug. Trust labels need a longer budget or a different layout.
- Defaulting IssueList to "전체" (all) filter mixes passes and failures with no natural priority order. Fail items should sort to the top or the default filter should be "fail" so the user immediately sees what needs fixing.
- Section headers that describe what a section is ("점수 향상 효과가 가장 큰 항목") are weaker than headers that instruct ("Start here — 5 changes that move your score most").
