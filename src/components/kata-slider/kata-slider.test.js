import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataSliderElement } = await import('./kata-slider.js');

test('kata-slider clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'INPUT' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-slider-template' ? template : null;
    },
  };
  const element = new KataSliderElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'INPUT');
});

test('kata-slider throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataSliderElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-slider-template/);
});

test('kata-slider does not reinitialize if already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'INPUT' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-slider-template' ? template : null;
    },
  };
  const element = new KataSliderElement(ownerDocument);
  element.connectedCallback();
  const firstChildren = element.children;
  element.connectedCallback();
  assert.equal(element.children, firstChildren);
});

test('kata-slider uses custom template id from attribute', () => {
  const template = new FakeTemplateElement([{ tagName: 'INPUT' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'my-slider-template' ? template : null;
    },
  };
  const element = new KataSliderElement(ownerDocument);
  element.attributes.set('template', 'my-slider-template');
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});
