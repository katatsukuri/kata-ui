import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataTextareaElement } = await import('./kata-textarea.js');

test('kata-textarea clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'TEXTAREA' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-textarea-template' ? template : null;
    },
  };
  const element = new KataTextareaElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});

test('kata-textarea throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataTextareaElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-textarea-template/);
});
