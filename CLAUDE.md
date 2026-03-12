# CLAUDE.md

## Mission

This repository analyzes a target page and returns actionable SEO / AEO / GEO / Trust insights.
The product goal is not just “more checks”, but “better decisions”:
users should immediately understand what is weak, why it matters, and what single next action improves visibility the most.

## Repository truth

- Framework: Next.js + TypeScript
- Parsing approach: cheerio only
- TypeScript strict mode must remain enabled
- No external NLP libraries unless explicitly approved
- Existing issue IDs must remain stable
- API response must remain backward compatible unless the user explicitly asks for a breaking change

## Current scoring model

Visibility Score is currently:

- SEO × 0.35
- AEO × 0.25
- GEO × 0.25
- Trust × 0.15

Trust is a first-class axis and must remain visible in product reasoning.

## Current LOAM-related scope already implemented

Implemented or in progress conceptually:
- trust signals
- topic concentration
- definition sentences
- comparison structure
- step structure
- topIssues output
- action guide mapping
- TopIssues UI

Do not re-invent these features under new names unless there is a strong reason.

## Non-negotiables

1. Do not rename or silently break existing issue IDs.
2. Do not add features that cannot be explained as user value.
3. Prefer the smallest reversible diff that improves clarity, trust, actionability, or scoring accuracy.
4. Preserve additive API evolution.
5. If a feature increases false positives or score gaming risk, call that out explicitly.
6. If a request sounds reasonable but is probably unnecessary, challenge it first.
7. Do not use visual complexity to hide weak product logic.
8. Do not claim improvements without verification or a stated verification gap.

## What “good product improvement” means here

A good improvement should satisfy at least one of these:

- make the score more trustworthy
- make the output more actionable
- reduce user confusion
- improve prioritization of fixes
- reduce noisy or redundant checks
- improve consistency between analyzer logic and UI explanation

## What “bad product improvement” looks like

Avoid:
- duplicating existing checks under slightly different labels
- adding speculative metrics with weak signal quality
- adding UI without improving decision-making
- changing weights casually
- changing API shape without clear gain
- adding complexity that future contributors cannot reason about quickly

## Default working loop

When the user asks for a feature, refactor, improvement, or “make it better”, follow this order:

1. Read the relevant files and summarize current behavior.
2. Identify what user problem is actually being solved.
3. Challenge the request:
   - Is this redundant?
   - Is it measurable?
   - Can it be derived from existing signals?
   - Will it create false positives?
   - Does it produce a clear next action?
4. Prefer one high-leverage improvement over several speculative ones.
5. Implement only after scope is minimal and justified.
6. Review after implementation from both engineering and product perspectives.
7. End with:
   - what changed
   - why it was chosen
   - how it was verified
   - what remains uncertain

## Delegation policy

Use these subagents proactively:

- `planner` for scoping and acceptance criteria
- `skeptic` for challenging assumptions and redundancy
- `ux-critic` for usability, clarity, actionability, and product framing
- `implementer` for minimal code changes
- `reviewer` for final verification and risk review

Default sequence for non-trivial work:

1. planner
2. skeptic
3. ux-critic
4. implementer
5. reviewer

If the task is analysis-only, skip implementer.
If the task is code-only but affects user-visible behavior, still run ux-critic before implementer.

## Analyzer-specific reasoning rules

When analyzing or modifying checks:

- prefer deterministic HTML-based heuristics over speculative inference
- if a signal is weak, downgrade confidence rather than inflating score impact
- keep scoring logic explainable to a non-technical user
- every new issue should be mappable to a concrete user action
- each issue should answer:
  - what was found
  - why it matters
  - how to improve it

## Output contract for your final response

Use this structure unless the user asks otherwise:

### Summary
### Why this change
### Files changed
### Verification
### Remaining risks or assumptions
### Suggested next improvement

## Repo-specific guidance

For this repository, default to these principles:

- additive response fields are preferred over response shape changes
- trust-related improvements should not require external crawling unless explicitly requested
- topIssues logic should remain understandable and deterministic
- user-facing copy should be concrete and non-generic
- if a better improvement exists than the one requested, say so directly

## When the user asks for “autonomous improvement”

Interpret that as:

- inspect the current code first
- identify the highest-leverage product or usability issue
- challenge whether the obvious next feature is actually the best one
- implement only the smallest justified change
- leave a short backlog of 2–3 next options instead of trying to do everything