import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataPaginationElement } = await import('./kata-pagination.js');

test('kata-pagination clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'NAV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-pagination-template' ? template : null;
    },
  };
  const element = new KataPaginationElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});

test('kata-pagination throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataPaginationElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-pagination-template/);
});

test('kata-pagination preserves its horizontal layout before custom element upgrade', () => {
  const componentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const css = fs.readFileSync(path.join(componentDirectory, 'kata-pagination.css'), 'utf8');

  assert.match(css, /kata-pagination:not\(:defined\)\s*\{[^}]*display:\s*flex/s);
  assert.match(css, /kata-pagination:not\(:defined\)\s*\{[^}]*align-items:\s*center/s);
  assert.match(css, /kata-pagination:not\(:defined\)\s*\{[^}]*gap:\s*var\(--kata-space-sm\)/s);
  assert.match(css, /kata-pagination:not\(:defined\)\s*>\s*li\s*\{[^}]*list-style:\s*none/s);
});
