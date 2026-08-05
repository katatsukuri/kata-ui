import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeFragment, FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataButtonElement } = await import('../kata-button/kata-button.js');

test('kata-button clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-button-template' ? template : null;
    },
  };

  const element = new KataButtonElement(ownerDocument);
  element.connectedCallback();

  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children.length, 1);
  assert.equal(element.children[0].tagName, 'BUTTON');
});

test('kata-button throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataButtonElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-button-template/);
});

test('kata-button does not reinitialize if already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-button-template' ? template : null;
    },
  };

  const element = new KataButtonElement(ownerDocument);
  element.connectedCallback();
  const firstChildren = element.children;
  element.connectedCallback();
  assert.equal(element.children, firstChildren);
});

test('kata-button uses custom template id from attribute', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'my-button-template' ? template : null;
    },
  };

  const element = new KataButtonElement(ownerDocument);
  element.attributes.set('template', 'my-button-template');
  element.connectedCallback();

  assert.equal(element.dataset.kataUiInitialized, 'true');
});
