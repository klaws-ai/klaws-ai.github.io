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
- Lightweight tooling (no runtime dependencies)

## Project structure

```text
klaws-site/
├── index.html
├── package.json
├── assets/
│   ├── main.js
│   └── styles.css
├── blog/
│   ├── index.html
│   ├── post.html
│   ├── blog.js
│   └── posts/
│       ├── index.json
│       └── 2026-02-13-how-klaws-works.md
├── scripts/
│   ├── build-blog-index.js
│   └── new-post.js
├── BLOG_AUTOMATION_PLAN.md
├── netlify.toml
└── vercel.json
```

## Local development

### 1) Build blog index

```bash
npm run build
```

### 2) Run local server

```bash
npm run serve
```

Open: <http://localhost:8080>

> Note: use a local server (not `file://`) so `fetch()` for blog files works.

## Blog workflow

### Create a new post draft

```bash
npm run new:post -- my-new-slug "My New Post Title"
```

Edit the generated markdown file in `blog/posts/`.

### Rebuild index after edits

```bash
npm run build
```

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
summary: "One-line summary"
---
```

- Frontmatter is used by the build script for blog index metadata.
