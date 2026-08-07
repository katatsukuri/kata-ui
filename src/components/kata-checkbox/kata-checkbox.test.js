import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataCheckboxElement } = await import('./kata-checkbox.js');

test('kata-checkbox clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'LABEL' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-checkbox-template' ? template : null;
    },
  };
  const element = new KataCheckboxElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});

test('kata-checkbox throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataCheckboxElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-checkbox-template/);
});

test('kata-checkbox respects custom template attribute', () => {
  const template = new FakeTemplateElement([{ tagName: 'LABEL' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-checkbox-custom-template' ? template : null;
    },
  };
  const element = new KataCheckboxElement(ownerDocument);
  element.setAttribute('template', 'kata-checkbox-custom-template');
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});

test('kata-checkbox does not re-initialize if already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'LABEL' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-checkbox-template' ? template : null;
    },
  };
  const element = new KataCheckboxElement(ownerDocument);
  element.connectedCallback();
  const firstChildren = element.children;
  element.connectedCallback();
  assert.equal(element.children, firstChildren);
});
