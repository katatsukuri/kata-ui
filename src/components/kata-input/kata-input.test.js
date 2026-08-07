import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataInputElement } = await import('./kata-input.js');

test('kata-input clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'INPUT' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-input-template' ? template : null;
    },
  };
  const element = new KataInputElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});

test('kata-input throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataInputElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-input-template/);
});
