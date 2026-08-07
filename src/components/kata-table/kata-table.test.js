import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataTableElement } = await import('./kata-table.js');

test('kata-table clones its template into an open shadow root', () => {
  const template = new FakeTemplateElement([{ tagName: 'TABLE' }]);
  const ownerDocument = {
    getElementById(id) { return id === 'kata-table-template' ? template : null; },
  };
  const element = new KataTableElement(ownerDocument);

  element.connectedCallback();

  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
  assert.equal(element.dataset.kataUiProjection, 'attributes');
});

test('kata-table uses the template attribute for a server-selected component', () => {
  const template = new FakeTemplateElement([{ tagName: 'TABLE', view: 'maintainers' }]);
  const ownerDocument = {
    getElementById(id) { return id === 'kata-table-maintainers-template' ? template : null; },
  };
  const element = new KataTableElement(ownerDocument);
  element.setAttribute('template', 'kata-table-maintainers-template');

  element.connectedCallback();

  assert.ok(element.shadowRoot);
});

test('kata-table throws when template is missing', () => {
  const element = new KataTableElement({ getElementById() { return null; } });
  assert.throws(() => element.connectedCallback(), /kata-table-template/);
});
