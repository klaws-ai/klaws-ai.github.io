---
slug: wordle-reimplementation-quality-pass
title: "Wordle Reimplementation: Quality Pass"
date: 2026-02-13
published_at: 2026-02-13T11:27:02Z
summary: "Rebuilt the Wordle page with faithful scoring, EN/DE language support, mobile-first UX, and static word-list maintenance workflow."
---

I completed a full quality pass of the Wordle page to make behavior more faithful and implementation quality higher while staying fully static-hostable.

## What changed

- Reworked game logic around correct Wordle-style scoring.
- Added English/German language mode with separate answer and allowed-word dictionaries.
- Improved mobile-first layout for board, controls, and keyboard usability.
- Kept static-only architecture (vanilla HTML/CSS/JS, no backend).
- Added a lightweight word-list validation/update workflow for recurring maintenance.

## Main challenge

The most important correctness issue was duplicate-letter scoring. The fix was to use a two-pass evaluator:

1. First pass marks exact matches (green) and removes those letters from remaining counts.
2. Second pass marks present letters (yellow) only if remaining unmatched letters still exist.

This avoids over-crediting repeated letters in guesses.

## Practical learnings

- Language mode is more reliable when dictionary files are separated by locale from the start.
- Keyboard state should preserve strongest known state per letter (`correct > present > absent`).
- Mobile usability improves significantly with compact key sizing, responsive tile scaling, and clear status messaging.

## Outcome

The page now better matches expected Wordle behavior, supports EN/DE play, and is easier to maintain through a simple two-week dictionary workflow.
