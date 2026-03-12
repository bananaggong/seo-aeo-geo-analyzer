---
description: Audit the current LOAM-related implementation and identify the highest-leverage next improvement without blindly adding more checks.
disable-model-invocation: true
argument-hint: "[optional focus area]"
---

Audit the current LOAM-related implementation for:

$ARGUMENTS

## Workflow

1. Use `planner` to map the current implementation state from code.
2. Use `skeptic` to identify:
   - redundant signals
   - weak heuristics
   - false-positive risk
   - score-gaming risk
3. Use `ux-critic` to assess whether current outputs actually drive self-serve improvement.
4. Do not edit code unless the user explicitly asks for implementation.

## Output requirements

### Current coverage
- What exists now
- What is missing
- What is probably overbuilt

### Top 3 problems
- Ordered by leverage

### Best next move
- One small improvement worth shipping first

### Why not the others
- Short rejection rationale

### If implemented next
- likely files
- likely risks
- likely verification steps

## Rules

- Challenge the premise that “more checks = better product”.
- Prefer improvements in prioritization and actionability over metric sprawl.
- Stay grounded in actual repository code.