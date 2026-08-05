import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataBadgeElement } = await import('../kata-badge/kata-badge.js');

test('kata-badge clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'SPAN', className: 'badge' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-badge-template' ? template : null;
    },
  };
  const element = new KataBadgeElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'SPAN');
});

test('kata-badge throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataBadgeElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-badge-template/);
});
