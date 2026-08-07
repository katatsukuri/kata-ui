import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataTabsElement } = await import('./kata-tabs.js');

test('kata-tabs clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-tabs-template' ? template : null;
    },
  };
  const element = new KataTabsElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-tabs throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataTabsElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-tabs-template/);
});
