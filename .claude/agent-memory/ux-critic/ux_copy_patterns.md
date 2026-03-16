---
name: UX copy and label quality patterns
description: Stable copy and presentation patterns that reduce confusion in this repo's result UI
type: project
---

## Patterns that work

- ACTION_GUIDE strings in actions.ts are specific, concrete, and copyable. They name the exact element, tag, or attribute to change. This is the right model for action text anywhere in the UI.
- The TopIssues gap bar visually encodes improvement magnitude well — bar width plus "+N점" label is intuitive.
- Status icons (checkmark / warning / X) combined with color-coded borders on IssueList rows are effective for fast scanning.
- The warn detail pattern "${n}개 더 필요" (e.g. "3개 더 필요") is effective for telling users the exact gap to the next threshold. Used in statistics check; replicate across all multi-threshold checks (definition-sentences, citations, question-headings).
- Concrete example forms in fail/warn copy reduce ambiguity more than abstract pattern notation. "X란 Y를 의미합니다" is more actionable than "'~란 ~이다' 형식".

## Patterns that create confusion

- Copy that names a regex pattern the code does not actually detect destroys trust when the user follows instructions and gets a wrong result. Every example form in detail/action text must be traceable to an actual regex match path. (Discovered in definition-sentences: '~이다' was named in copy but never in the regex.)
- When pass and warn share the same detail branch, the warn signal is invisible. Every check with three status tiers (pass/warn/fail) must have three distinct detail strings.
- ACTION_GUIDE counts (e.g. "1~2개 추가") must match the analyzer pass threshold (e.g. >= 3). Contradictions between guide and analyzer erode trust in the score.
- Showing currentScore/maxScore AND percentage simultaneously in a TopIssues row is redundant. Use one or the other.
- The gap bar label "+{n}점 개선 가능" is uninterpretable without a denominator anchor. Users do not know if +5 out of 20 is big or small. Add context (e.g. "of 20 pts") or show percentage of total score impact instead.
- Trust breakdown bars truncate issue labels to 8 characters which can produce mid-character cuts and looks like a rendering bug. Trust labels need a longer budget or a different layout.
- Defaulting IssueList to "전체" (all) filter mixes passes and failures with no natural priority order. Fail items should sort to the top or the default filter should be "fail" so the user immediately sees what needs fixing.
- Section headers that describe what a section is ("점수 향상 효과가 가장 큰 항목") are weaker than headers that instruct ("Start here — 5 changes that move your score most").
- Action text in TopIssues rows is text-xs (0.75rem) which is too small given it is the most important copy on the page. It should be text-sm at minimum.
- The breakdown bar section (4 cards, 3 bars each) adds 12 raw numbers with no associated action. It belongs behind a disclosure toggle, not in the primary reading flow.
- The IssueList tab bar shows flat buttons with no failure count annotation. Users cannot see which tab has the most failures without clicking through all four.
- English grade words (Excellent/Good/Fair/Poor) mixed with Korean copy everywhere else reads as unfinished. The language of grade labels must be consistent with the surrounding UI language.
- The score card horizontal layout (gauge + 4 sub-gauges + divider + meta + PageSpeed) overloads the verdict moment. The overall score should land before sub-scores compete for attention.

## Recommended section order for results page

1. Compact input bar (always visible)
2. Verdict strip — score number + grade + one plain-language sentence
3. Sub-score row (SEO/AEO/GEO/Trust) — smaller weight than verdict
4. TopIssues panel — "Start here — these 5 changes move your score the most"
5. Detail tabs + IssueList (reference, not decision)
6. Appendix: PageSpeed, site type, markdown preview (collapsible)

## Typography principles

- Font size should map to decision weight: overall score largest, grade second, sub-scores third, issue labels fourth, detail fifth.
- Use font weight (normal/medium/semibold) to communicate hierarchy on the same color; avoid reduced opacity as the primary de-emphasis tool on dark backgrounds.
- 4px base spatial unit applied consistently: card internal padding 24px (p-6), section gaps 24px or 32px, not mixed.
