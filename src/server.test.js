import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';

import { createDocsServer } from './server.js';

async function startTestServer(t) {
  const server = createDocsServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

test('docs server serves the repository index and component assets', async (t) => {
  const origin = await startTestServer(t);

  const indexResponse = await fetch(`${origin}/`);
  assert.equal(indexResponse.status, 200);
  assert.match(indexResponse.headers.get('content-type'), /^text\/html/);
  assert.match(await indexResponse.text(), /kata-ui Component Catalog/);

  const docsResponse = await fetch(`${origin}/docs.html?doc=./README.md`);
  assert.equal(docsResponse.status, 200);
  assert.match(await docsResponse.text(), /data-docs-content/);

  const architectureGuideResponse = await fetch(`${origin}/docs/architecture.md`);
  assert.equal(architectureGuideResponse.status, 200);
  assert.match(architectureGuideResponse.headers.get('content-type'), /^text\/markdown/);

  const componentGuideResponse = await fetch(`${origin}/docs/components.md`);
  assert.equal(componentGuideResponse.status, 200);
  assert.match(componentGuideResponse.headers.get('content-type'), /^text\/markdown/);

  const themeGuideResponse = await fetch(`${origin}/docs/theming.md`);
  assert.equal(themeGuideResponse.status, 200);
  assert.match(themeGuideResponse.headers.get('content-type'), /^text\/markdown/);

  const themeResponse = await fetch(`${origin}/src/styles/kata-ui.css`);
  assert.equal(themeResponse.status, 200);
  assert.match(themeResponse.headers.get('content-type'), /^text\/css/);
  const themeCss = await themeResponse.text();
  assert.match(themeCss, /theme-dark\.css/);
  assert.match(themeCss, /theme-facility\.css/);
  assert.match(themeCss, /theme-winforms\.css/);

  const catalogStyleResponse = await fetch(`${origin}/docs.css`);
  assert.equal(catalogStyleResponse.status, 200);
  const catalogCss = await catalogStyleResponse.text();
  assert.match(catalogCss, /var\(--kata-font-family/);
  assert.match(catalogCss, /data-theme="facility"/);
  assert.match(catalogCss, /data-theme="winforms"/);

  const componentResponse = await fetch(`${origin}/src/components/kata-button/kata-button.js`);
  assert.equal(componentResponse.status, 200);
  assert.match(componentResponse.headers.get('content-type'), /^text\/javascript/);
});

test('docs server supports HEAD and blocks files outside the public surface', async (t) => {
  const origin = await startTestServer(t);

  const headResponse = await fetch(`${origin}/docs.css`, { method: 'HEAD' });
  assert.equal(headResponse.status, 200);
  assert.match(headResponse.headers.get('content-type'), /^text\/css/);
  assert.equal(await headResponse.text(), '');

  const missingResponse = await fetch(`${origin}/missing.html`);
  assert.equal(missingResponse.status, 403);

  const repositoryMetadataResponse = await fetch(`${origin}/.git/config`);
  assert.equal(repositoryMetadataResponse.status, 403);

  for (const previousDocumentPath of [
    '/architecture.md',
    '/component_architecture.md',
    '/theming/theming.md',
  ]) {
    const previousDocumentResponse = await fetch(`${origin}${previousDocumentPath}`);
    assert.equal(previousDocumentResponse.status, 403);
  }
});

test('docs server preserves kata-table example APIs', async (t) => {
  const origin = await startTestServer(t);

  const rowsResponse = await fetch(`${origin}/api/rows`);
  assert.equal(rowsResponse.status, 200);
  assert.match(await rowsResponse.text(), /<tr><td>Yoshua Nakashima<\/td>/);

  const tableResponse = await fetch(`${origin}/api/table?view=maintainers`);
  assert.equal(tableResponse.status, 200);
  assert.equal(
    await tableResponse.text(),
    '<kata-table template="kata-table-maintainers-template"><span slot="column-1">Maintainer</span><span slot="column-2">Role</span></kata-table>',
  );
});

test('docs server rejects unsupported methods', async (t) => {
  const origin = await startTestServer(t);
  const response = await fetch(`${origin}/`, { method: 'POST' });

  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
});
