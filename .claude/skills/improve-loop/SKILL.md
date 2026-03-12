---
description: Run the full improvement loop for this repository: plan, challenge assumptions, inspect usability, implement the smallest justified change, and review the result.
disable-model-invocation: true
argument-hint: "[goal, pain point, or area to improve]"
---

Run the repository improvement loop for:

$ARGUMENTS

## Process

1. Use `planner` first.
   - Understand the current implementation.
   - Define the smallest worthwhile change.
   - List the exact files likely to matter.

2. Use `skeptic` second.
   - Challenge whether the proposed change is necessary.
   - Look for redundancy, false positives, score gaming, and complexity creep.
   - Prefer the leaner alternative if one exists.

3. Use `ux-critic` third.
   - Evaluate whether the change improves user understanding, prioritization, or actionability.
   - If the request is really a UX/copy/ranking problem rather than a feature gap, say so.

4. Synthesize.
   - Choose the single highest-leverage smallest change.
   - Reject lower-value extras for now.

5. If a code change is justified, use `implementer`.
   - Make the minimum viable edit.
   - Preserve backward compatibility.
   - Keep issue IDs stable.

6. Always use `reviewer` after implementation.
   - Do not stop after coding.
   - Require a real pass/warn/fail review.

## Final response format

### Problem diagnosed
### Why this change was chosen
### Alternatives rejected
### Files changed
### Verification
### Remaining risks
### Next 2–3 backlog ideas

## Rules

- Do not add features just because they are plausible.
- Prefer one shippable improvement over multiple speculative ones.
- Do not change scoring weights casually.
- Do not invent verification results.
- Keep the final explanation concise and concrete.