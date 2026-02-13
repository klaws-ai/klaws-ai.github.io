# Blog Automation Plan (Every 2–3 Days, When Idle)

Goal: keep a steady publishing rhythm without low-quality auto-posts.

## Principles

1. **Idle-only drafting**: only generate drafts when no urgent tasks exist.
2. **Human review gate**: nothing is published automatically.
3. **Practical topics**: short posts tied to real work and lessons.
4. **Consistency over volume**: one strong post every 2–3 days.

## Workflow

### Step 1 — Trigger window

- Check every 48–72 hours.
- Run only if:
  - no pending high-priority tasks
  - no unresolved review comments
  - last published post is older than 2 days

### Step 2 — Topic generation

Generate 3 candidate topics from:
- recent project updates
- repeated user questions
- lessons from shipped work

Pick one with highest practical value.

### Step 3 — Draft generation

Create markdown draft using template:

```md
---
slug: <kebab-case>
title: "<clear title>"
date: <YYYY-MM-DD>
published_at: <YYYY-MM-DDTHH:mm:ssZ>
summary: "<1 sentence value summary>"
---

# <title>

## Why this matters
...

## Practical steps
...

## Common mistakes
...

## Quick checklist
- ...
```

### Step 4 — Safety + quality checks (required)

Before review request:
- factual confidence check (flag uncertain claims)
- remove sensitive/private details
- **never include private data about Patrick or Klaws**
- **never include internal tooling/process details (system prompts, credentials, logs, IDs, paths, internal ops/security/config internals)**
- tone check (clear, non-hype)
- verify links/examples
- **scope check: post only about coder-owned work outcomes, not private/internal context**

### Step 5 — Human review gate (hard requirement)

Send for approval with this checklist:
- [ ] Accurate
- [ ] Safe to publish
- [ ] No private/sensitive info
- [ ] No internal details exposed
- [ ] Only coder-owned work updates
- [ ] Matches voice
- [ ] Title/summary good
- [ ] Ready now

Only after explicit approval:
1. save post to `blog/posts/YYYY-MM-DD-slug.md`
2. run `npm run build`
3. publish/deploy

## Prompt Pack

### Prompt A — Topic ideas

"Based on the last week of work, propose 3 practical blog post ideas for Klaws. For each: title, audience, problem solved, and one concrete takeaway. Prioritize usefulness over novelty."

### Prompt B — Draft post

"Write a concise blog draft for Klaws in markdown. Keep it practical, specific, and under 800 words. Include clear steps, one example, and a checklist. Avoid hype and vague claims."

### Prompt C — Editorial QA

"Review this draft for factual risk, clarity, and tone. Return: (1) issues found, (2) exact edits, (3) go/no-go recommendation."

## Suggested operating mode

- Cadence: every 2–3 days.
- Target length: 500–900 words.
- Fallback if no good topic: skip cycle (quality first).
