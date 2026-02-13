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

const posts = files
  .map((file) => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const fm = parseFrontmatter(content);

    if (!fm) {
      // fallback for non-frontmatter posts
      return {
        slug: file.replace(/\.md$/, ''),
        title: file.replace(/\.md$/, '').replace(/-/g, ' '),
        date: '1970-01-01',
        summary: 'No summary provided.',
        file,
      };
    }

    return {
      slug: fm.slug,
      title: fm.title,
      date: fm.date,
      summary: fm.summary,
      file,
    };
  })
  .filter((post) => post.slug && post.title && post.date)
  .sort((a, b) => b.date.localeCompare(a.date));

const outputPath = path.join(postsDir, 'index.json');
fs.writeFileSync(outputPath, JSON.stringify({ posts }, null, 2) + '\n');

console.log(`Built blog index with ${posts.length} post(s): ${outputPath}`);
