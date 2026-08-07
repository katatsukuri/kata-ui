import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FakeHTMLElement,
  FakeTemplateElement,
  setupGlobals,
} from '../components/test-utils/shared-test-helpers.js';

setupGlobals();

const { initializeShadowComponent } = await import('./template-loader.js');

test('initializeShadowComponent creates slots and preserves consumer Light DOM', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById() { return template; },
  };
  const element = new FakeHTMLElement(ownerDocument);
  element.localName = 'kata-card';
  element.children.push({ nodeType: 1, tagName: 'P' });

  initializeShadowComponent(element, 'kata-card-template', import.meta.url);

  assert.equal(element.dataset.kataUiProjection, 'slots');
  assert.equal(element.children[0].tagName, 'P');
  assert.ok(element.shadowRoot);
  assert.equal(element.shadowRoot.querySelectorAll('slot').length, 3);
  const defaultSlot = element.shadowRoot.querySelectorAll('slot').find(({ name }) => !name);
  assert.equal(defaultSlot.children.length, 0);
});

test('initializeShadowComponent exposes host attributes to the template', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON', textContent: '' }]);
  const ownerDocument = { getElementById() { return template; } };
  const element = new FakeHTMLElement(ownerDocument);
  element.localName = 'kata-button';
  element.setAttribute('label', '保存');

  initializeShadowComponent(element, 'kata-button-template', import.meta.url);

  const button = element.shadowRoot.querySelector('button');
  assert.equal(button.textContent, '保存');
  assert.equal(element.dataset.kataUiProjection, 'attributes');
  const defaultSlot = element.shadowRoot.children.find(({ localName }) => localName === 'slot');
  assert.equal(defaultSlot.children.length, 1);
});
