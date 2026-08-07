import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataCardElement } = await import('./kata-card.js');

test('kata-card clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV', className: 'card' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-card-template' ? template : null;
    },
  };
  const element = new KataCardElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'DIV');
});

test('kata-card throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataCardElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-card-template/);
});
