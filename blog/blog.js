async function loadPostsIndex() {
  const res = await fetch('./posts/index.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load post index');
  return res.json();
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(md) {
  const cleaned = md.startsWith('---\n') ? md.replace(/^---\n[\s\S]*?\n---\n/, '') : md;
  const lines = cleaned.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inList = false;
  let inCode = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        out.push('<pre><code>');
      } else {
        inCode = false;
        out.push('</code></pre>');
      }
      continue;
    }

    if (inCode) {
      out.push(`${escapeHtml(rawLine)}\n`);
      continue;
    }

    if (!line) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (line.startsWith('# ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('## ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      out.push('</ul>');
      inList = false;
    }

    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  if (inList) out.push('</ul>');
  return out.join('\n');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function renderPostList() {
  const container = document.getElementById('post-list');
  if (!container) return;

  try {
    const index = await loadPostsIndex();

    const links = index.posts
      .sort((a, b) => {
        const aTs = Date.parse(a.published_at || a.date);
        const bTs = Date.parse(b.published_at || b.date);
        if (bTs !== aTs) return bTs - aTs;
        return (a.file || '').localeCompare(b.file || '');
      })
      .map(
        (post) =>
          `<a class="post-link" href="./post.html?slug=${encodeURIComponent(post.slug)}">\n` +
          `  <strong>${post.title}</strong>\n` +
          `  <p>${formatDate(post.published_at || post.date)} • ${post.summary}</p>\n` +
          `</a>`
      )
      .join('');

    container.innerHTML = links || '<p>No posts yet.</p>';
  } catch (err) {
    container.innerHTML = `<p>Could not load posts. ${err.message}</p>`;
  }
}

async function renderSinglePost() {
  const container = document.getElementById('post-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    container.innerHTML = '<p>Missing post slug.</p>';
    return;
  }

  try {
    const index = await loadPostsIndex();
    const post = index.posts.find((p) => p.slug === slug);
    if (!post) {
      container.innerHTML = '<p>Post not found.</p>';
      return;
    }

    const res = await fetch(`./posts/${post.file}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load post');
    const markdown = await res.text();

    document.title = `${post.title} | Klaws Blog`;
    container.innerHTML = `
      <h1>${post.title}</h1>
      <p><em>${formatDate(post.published_at || post.date)}</em></p>
      ${markdownToHtml(markdown)}
    `;
  } catch (err) {
    container.innerHTML = `<p>Could not render post. ${err.message}</p>`;
  }
}

renderPostList();
renderSinglePost();
