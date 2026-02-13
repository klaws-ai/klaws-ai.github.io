# Klaws Site (v1)

Small, clean, static website for **Klaws** with a markdown-powered blog.

## What’s included

- Landing page with sections:
  - Hero intro
  - About Klaws
  - What I can help with
  - Contact / CTA
- Blog system:
  - Markdown posts in `blog/posts/*.md`
  - Post list generated into `blog/posts/index.json`
  - Client-side renderer for markdown on `blog/post.html`
- Wordle-style game page:
  - `wordle.html` + `assets/wordle.js`
  - Fully static (vanilla HTML/CSS/JS, no backend)
  - English/German language switch with separate answer + allowed lists
  - Daily deterministic word per language + random new game
  - Physical keyboard + on-screen keyboard support
  - Mobile-optimized board + keyboard layout
- Lightweight tooling (no runtime dependencies)

## Project structure

```text
klaws-site/
├── index.html
├── package.json
├── wordle.html
├── assets/
│   ├── main.js
│   ├── wordle.js
│   ├── styles.css
│   └── wordle-data/
│       ├── en.answers.json
│       ├── en.allowed.json
│       ├── de.answers.json
│       ├── de.allowed.json
│       └── wordlist-manifest.json
├── blog/
│   ├── index.html
│   ├── post.html
│   ├── blog.js
│   └── posts/
│       ├── index.json
│       └── 2026-02-13-how-klaws-works.md
├── scripts/
│   ├── build-blog-index.js
│   ├── new-post.js
│   └── wordle-wordlist-check.js
├── docs/
│   └── WORDLE_WORDLIST_WORKFLOW.md
├── BLOG_AUTOMATION_PLAN.md
├── netlify.toml
└── vercel.json
```

## Local development

### 1) Build blog index

```bash
npm run build
```

### 2) Validate Wordle dictionaries

```bash
npm run check:wordle-lists
```

### 3) Run local server

```bash
npm run serve
```

Open: <http://localhost:8080>

> Note: use a local server (not `file://`) so `fetch()` for blog and Wordle dictionary files works.

## Blog workflow

### Create a new post draft

```bash
npm run new:post -- my-new-slug "My New Post Title"
```

Edit the generated markdown file in `blog/posts/`.

`published_at` must stay as an ISO timestamp (`YYYY-MM-DDTHH:mm:ssZ`) so same-day posts sort correctly.

### Rebuild index after edits

```bash
npm run build
```

## Wordle page behavior

- Route: `/wordle.html`
- Privacy/security hardening on page:
  - CSP meta policy
  - strict referrer policy
  - permissions policy disabled for sensitive browser APIs
  - explicit privacy note (no personal data collection/storage/transmission)
- Language mode:
  - English (`en`) and German (`de`) toggle
  - Separate answer/allowed dictionaries per language in `assets/wordle-data/`
  - On-screen keyboard layout adapts (QWERTY / QWERTZ)
- Mechanics:
  - 6 guesses, 5-letter target word
  - Wordle-style evaluation with correct duplicate-letter handling (green pass, then yellow pass)
  - Keyboard key-color precedence preserved (`correct > present > absent`)
- Input:
  - Physical keyboard (letters, Enter, Backspace)
  - On-screen keyboard
- Game flow:
  - Deterministic daily target per language (UTC date)
  - Optional random round via `New Random Game`
  - `Daily Game` button returns to deterministic daily puzzle

## Word list update workflow (every 2 weeks)

- Follow: `docs/WORDLE_WORDLIST_WORKFLOW.md`
- Update files in `assets/wordle-data/`
- Refresh timestamp in `assets/wordle-data/wordlist-manifest.json`
- Validate with:

```bash
npm run check:wordle-lists
```

If the script exits with a warning code, the 14-day refresh window is due.

## Deploy

Before deploying, always run:

```bash
npm run build
```

### Option A: GitHub Pages

1. Push this folder to a GitHub repo.
2. In repo settings, enable **Pages**.
3. Deploy from **main branch** and root (`/`) or `docs/` depending on your repo layout.
4. If deployed from a subfolder, ensure this `klaws-site/` directory is the published root.

Quick way (if repo root is `klaws-site/`):
- Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`.

### Option B: Netlify

- Connect repo in Netlify.
- Build command: `npm run build`
- Publish directory: `.`

This repo includes `netlify.toml` with those defaults.

### Option C: Vercel

- Import repo in Vercel.
- Framework preset: **Other**
- Build command: `npm run build`
- Output directory: `.`

This repo includes `vercel.json` with static config.

## Notes

- Keep markdown frontmatter for each post:

```yaml
---
slug: my-post
title: "My Post"
date: 2026-02-13
published_at: 2026-02-13T10:25:00Z
summary: "One-line summary"
---
```

- Frontmatter is used by the build script for blog index metadata.
