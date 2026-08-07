import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataSwitchElement } = await import('./kata-switch.js');

test('kata-switch clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'INPUT', type: 'checkbox' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-switch-template' ? template : null;
    },
  };
  const element = new KataSwitchElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'INPUT');
});

test('kata-switch throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataSwitchElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-switch-template/);
});

test('kata-switch does not reinitialize when already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'INPUT', type: 'checkbox' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-switch-template' ? template : null;
    },
  };
  const element = new KataSwitchElement(ownerDocument);
  element.connectedCallback();
  const firstChildren = element.children;
  element.connectedCallback();
  assert.equal(element.children, firstChildren);
});

test('kata-switch uses custom template when template attribute is set', () => {
  const customTemplate = new FakeTemplateElement([{ tagName: 'INPUT', type: 'checkbox' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-custom-switch-template' ? customTemplate : null;
    },
  };
  const element = new KataSwitchElement(ownerDocument);
  element.setAttribute('template', 'kata-custom-switch-template');
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'INPUT');
});
