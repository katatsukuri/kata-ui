import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FakeHTMLElement,
  FakeTemplateElement,
  setupGlobals,
} from '../components/test-utils/shared-test-helpers.js';

setupGlobals();

const { findEventTarget, initializeShadowComponent } = await import('./template-loader.js');

test('findEventTarget crosses a slot boundary through the composed path', () => {
  const trigger = { matches(selector) { return selector === '[data-trigger]'; } };
  const slottedLabel = { matches() { return false; } };

  assert.equal(findEventTarget({
    composedPath() { return [slottedLabel, trigger]; },
    target: slottedLabel,
  }, '[data-trigger]'), trigger);
});

test('initializeShadowComponent keeps the template frame and preserves consumer Light DOM', () => {
  const template = new FakeTemplateElement([{
    tagName: 'DIV',
    children: [{ tagName: 'SLOT', name: 'title' }, { tagName: 'SLOT' }],
  }]);
  const ownerDocument = {
    getElementById() { return template; },
  };
  const element = new FakeHTMLElement(ownerDocument);
  element.localName = 'kata-card';
  element.children.push({ nodeType: 1, tagName: 'P' });

  initializeShadowComponent(element, 'kata-card-template', import.meta.url);

  assert.equal(element.dataset.kataUiProjection, 'template-and-slots');
  assert.equal(element.children[0].tagName, 'P');
  assert.ok(element.shadowRoot);
  assert.equal(element.shadowRoot.querySelectorAll('slot').length, 2);
  assert.ok(element.shadowRoot.querySelector('div'));
});

test('initializeShadowComponent exposes configuration attributes without replacing slot data', () => {
  const template = new FakeTemplateElement([{
    tagName: 'LABEL',
    children: [
      { tagName: 'SLOT', name: 'label', textContent: '名前' },
      { tagName: 'INPUT' },
    ],
  }]);
  const ownerDocument = { getElementById() { return template; } };
  const element = new FakeHTMLElement(ownerDocument);
  element.localName = 'kata-input';
  element.setAttribute('name', 'displayName');
  element.setAttribute('placeholder', '山田太郎');

  initializeShadowComponent(element, 'kata-input-template', import.meta.url);

  const input = element.shadowRoot.querySelector('input');
  assert.equal(input.getAttribute('name'), 'displayName');
  assert.equal(input.getAttribute('placeholder'), '山田太郎');
  assert.equal(element.dataset.kataUiProjection, 'template');
  assert.equal(element.shadowRoot.querySelector('slot').name, 'label');
});
