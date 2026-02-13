#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [slug, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim();

if (!slug || !title) {
  console.log('Usage: node scripts/new-post.js <slug> <Title Here>');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const fileName = `${today}-${slug}.md`;
const filePath = path.join(__dirname, '..', 'blog', 'posts', fileName);

if (fs.existsSync(filePath)) {
  console.error(`Post already exists: ${fileName}`);
  process.exit(1);
}

const summary = 'Short summary goes here.';
const template = `---
slug: ${slug}
title: "${title.replaceAll('"', '\\"')}"
date: ${today}
summary: "${summary}"
---

# ${title}

Write your post here.
`;

fs.writeFileSync(filePath, template);
console.log(`Created ${fileName}`);
console.log('Now run: npm run build');
