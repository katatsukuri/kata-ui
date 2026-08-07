import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataRadioGroupElement } = await import('./kata-radio-group.js');

test('kata-radio-group clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'FIELDSET' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-radio-group-template' ? template : null;
    },
  };
  const element = new KataRadioGroupElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'FIELDSET');
});

test('kata-radio-group throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataRadioGroupElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-radio-group-template/);
});

test('kata-radio-group does not reinitialize when already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'FIELDSET' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-radio-group-template' ? template : null;
    },
  };
  const element = new KataRadioGroupElement(ownerDocument);
  element.connectedCallback();
  const firstChildren = element.children;
  element.connectedCallback();
  assert.equal(element.children, firstChildren);
});

test('kata-radio-group uses custom template attribute', () => {
  const template = new FakeTemplateElement([{ tagName: 'FIELDSET' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'custom-radio-template' ? template : null;
    },
  };
  const element = new KataRadioGroupElement(ownerDocument);
  element.setAttribute('template', 'custom-radio-template');
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'FIELDSET');
});
