import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataSelectElement } = await import('./kata-select.js');

test('kata-select clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'SELECT' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-select-template' ? template : null;
    },
  };
  const element = new KataSelectElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});

test('kata-select throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataSelectElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-select-template/);
});
