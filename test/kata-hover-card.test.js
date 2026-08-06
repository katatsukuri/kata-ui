import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataHoverCardElement } = await import('../kata-hover-card/kata-hover-card.js');

function makeOwnerDocument(templateChildren) {
  const template = new FakeTemplateElement(templateChildren);
  return {
    getElementById(id) {
      return id === 'kata-hover-card-template' ? template : null;
    },
  };
}

test('kata-hover-card clones its template on connect', () => {
  const ownerDocument = makeOwnerDocument([{ tagName: 'BUTTON' }, { tagName: 'DIV' }]);
  const element = new KataHoverCardElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.dataset.state, 'closed');
  assert.equal(element.children.length, 2);
});

test('kata-hover-card throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataHoverCardElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-hover-card-template/);
});

test('kata-hover-card does not re-initialize if already initialized', () => {
  const ownerDocument = makeOwnerDocument([{ tagName: 'BUTTON' }]);
  const element = new KataHoverCardElement(ownerDocument);
  element.connectedCallback();
  const firstChildren = element.children;
  element.connectedCallback();
  assert.equal(element.children, firstChildren);
});
