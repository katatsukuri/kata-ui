const CORE_DOCUMENTS = new Set([
  'README.md',
  'architecture.md',
  'component_architecture.md',
  'theming/theming.md',
  'theming/theming2.md',
]);

const statusElement = document.querySelector('[data-docs-status]');
const contentElement = document.querySelector('[data-docs-content]');
const rawLink = document.querySelector('[data-docs-raw-link]');
const toc = document.querySelector('[data-docs-toc]');
const tocLinks = document.querySelector('[data-docs-toc-links]');
const siteRoot = new URL('./', document.baseURI);

function normalizeDocumentPath(value) {
  const normalized = value.replaceAll('\\', '/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || normalized.includes('../')) return null;

  if (CORE_DOCUMENTS.has(normalized)) return normalized;
  if (/^src\/components\/(kata-[a-z0-9-]+)\/\1\.spec\.md$/.test(normalized)) {
    return normalized;
  }
  return null;
}

function requestedDocument() {
  const parameter = new URLSearchParams(location.search).get('doc') ?? 'README.md';
  return normalizeDocumentPath(parameter);
}

function markCurrentDocument(documentPath) {
  for (const link of document.querySelectorAll('.docs-sidebar > nav a')) {
    const target = new URL(link.href).searchParams.get('doc');
    if (target && normalizeDocumentPath(target) === documentPath) {
      link.setAttribute('aria-current', 'page');
    }
  }
}

function siteRelativePath(url) {
  if (url.origin !== siteRoot.origin || !url.pathname.startsWith(siteRoot.pathname)) return null;
  return decodeURIComponent(url.pathname.slice(siteRoot.pathname.length));
}

function slugHeadings() {
  const usedIds = new Map();
  const headings = contentElement.querySelectorAll('h2, h3');

  for (const [index, heading] of headings.entries()) {
    const base = heading.textContent
      .normalize('NFKC')
      .toLocaleLowerCase('ja')
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-|-$/g, '') || `section-${index + 1}`;
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    heading.id = count === 0 ? base : `${base}-${count + 1}`;
  }

  tocLinks.replaceChildren(...Array.from(headings, (heading) => {
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    if (heading.tagName === 'H3') link.className = 'docs-toc__nested';
    return link;
  }));
  toc.hidden = headings.length === 0;
}

function rewriteDocumentReferences(sourceUrl) {
  for (const link of contentElement.querySelectorAll('a[href]')) {
    const original = link.getAttribute('href');
    if (!original || original.startsWith('#')) continue;

    const resolved = new URL(original, sourceUrl);
    const relativePath = siteRelativePath(resolved);
    const markdownPath = relativePath && normalizeDocumentPath(relativePath);

    if (markdownPath) {
      link.href = `./docs.html?doc=${encodeURIComponent(`./${markdownPath}`)}${resolved.hash}`;
    } else {
      link.href = resolved.href;
    }
  }

  for (const image of contentElement.querySelectorAll('img[src]')) {
    image.src = new URL(image.getAttribute('src'), sourceUrl).href;
    image.loading = 'lazy';
  }
}

function showError(message, sourceUrl) {
  statusElement.textContent = message;
  statusElement.classList.add('docs-status--error');
  contentElement.replaceChildren();
  rawLink.href = sourceUrl?.href ?? './README.md';
}

async function renderDocument() {
  const documentPath = requestedDocument();
  if (!documentPath) {
    showError('指定されたドキュメントは公開対象ではありません。');
    return;
  }

  const sourceUrl = new URL(documentPath, siteRoot);
  rawLink.href = sourceUrl.href;
  markCurrentDocument(documentPath);

  if (!globalThis.marked || !globalThis.DOMPurify) {
    showError('表示ライブラリを読み込めませんでした。元のMarkdownを参照してください。', sourceUrl);
    return;
  }

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const markdown = await response.text();
    const rendered = globalThis.marked.parse(markdown, { gfm: true });
    contentElement.innerHTML = globalThis.DOMPurify.sanitize(rendered, {
      USE_PROFILES: { html: true },
    });

    rewriteDocumentReferences(sourceUrl);
    slugHeadings();
    statusElement.hidden = true;

    const heading = contentElement.querySelector('h1');
    document.title = `${heading?.textContent ?? documentPath} | kata-ui`;

    if (location.hash) {
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    }
  } catch (error) {
    showError(`ドキュメントを読み込めませんでした（${error.message}）。`, sourceUrl);
  }
}

renderDocument();
