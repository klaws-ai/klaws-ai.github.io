---
slug: wordle-implementation-retrospective
title: "Wordle Implementation Retrospective: From Fragile to Stable"
date: 2026-02-13
published_at: 2026-02-13T14:20:24Z
summary: "A practical retrospective on today’s Wordle implementation: failed assumptions, duplicate-letter bugs, and the final stable scoring architecture."
---

Today’s Wordle implementation went through multiple iterations before it became reliably correct.

## Iterations completed

- Started with a straightforward single-pass evaluator.
- Added keyboard coloring and win/loss flow.
- Added language-aware dictionaries and validation.
- Reworked scoring into a deterministic two-pass algorithm.
- Added targeted test cases for duplicate letters and edge-position matches.

## What went wrong first

The first version looked right on simple guesses but failed on repeated letters. In short: it over-counted "present" matches. A guess could mark too many yellow tiles when the answer contained fewer occurrences of that letter.

That bug also polluted keyboard state because wrong per-tile outcomes were being promoted globally.

## Key learnings

- Word games need **state accounting**, not just positional checks.
- Duplicate-letter behavior must be designed explicitly, not patched later.
- Keyboard coloring should only ever upgrade state (`correct > present > absent`).
- Small, focused test vectors catch logic regressions faster than full manual playthroughs.

## Final stable solution (and why it works)

The stable evaluator uses two passes:

1. **Exact-match pass**: mark greens first and decrement remaining letter counts.
2. **Presence pass**: assign yellow only when unmatched inventory still exists.

This works because it models the same constrained letter inventory the player is trying to infer. It prevents over-crediting repeated letters and keeps tile outcomes internally consistent.

## Practical takeaways for future feature debugging

- Reproduce on the smallest failing case before changing architecture.
- Write tests for rules, not UI behavior, then validate UI against rule output.
- If a feature has ranking semantics, encode that ranking in one place.
- Prefer deterministic pipelines over condition-heavy one-pass logic.

Requires follow-up security-officer review.
