#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'blog', 'posts');
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const frontmatter = content.slice(4, end).trim();
  const data = {};

  for (const line of frontmatter.split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim().replace(/^"|"$/g, '');
    data[key] = value;
  }

  return data;
}

function toDeterministicTimestamp(post) {
  const candidates = [
    post.published_at,
    post.date ? `${post.date}T00:00:00.000Z` : null,
    post.fileDate ? `${post.fileDate}T00:00:00.000Z` : null,
    '1970-01-01T00:00:00.000Z',
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return '1970-01-01T00:00:00.000Z';
}

const posts = files
  .map((file) => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const fm = parseFrontmatter(content) || {};
    const fileDateMatch = file.match(/^(\d{4}-\d{2}-\d{2})-/);
    const fileDate = fileDateMatch ? fileDateMatch[1] : null;

    const post = {
      slug: fm.slug || file.replace(/\.md$/, ''),
      title: fm.title || file.replace(/\.md$/, '').replace(/-/g, ' '),
      date: fm.date || fileDate || '1970-01-01',
      published_at: fm.published_at || null,
      summary: fm.summary || 'No summary provided.',
      file,
      fileDate,
    };

    return {
      ...post,
      published_at: toDeterministicTimestamp(post),
    };
  })
  .filter((post) => post.slug && post.title && post.date)
  .sort((a, b) => {
    const timeDiff = Date.parse(b.published_at) - Date.parse(a.published_at);
    if (timeDiff !== 0) return timeDiff;
    return a.file.localeCompare(b.file);
  })
  .map(({ fileDate, ...post }) => post);

const outputPath = path.join(postsDir, 'index.json');
fs.writeFileSync(outputPath, JSON.stringify({ posts }, null, 2) + '\n');

console.log(`Built blog index with ${posts.length} post(s): ${outputPath}`);
