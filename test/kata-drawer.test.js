import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataDrawerElement } = await import('../kata-drawer/kata-drawer.js');

test('kata-drawer clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIALOG' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-drawer-template' ? template : null;
    },
  };
  const element = new KataDrawerElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-drawer throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataDrawerElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-drawer-template/);
});
