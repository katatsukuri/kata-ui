import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataAvatarElement } = await import('./kata-avatar.js');

test('kata-avatar clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'SPAN', className: 'avatar' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-avatar-template' ? template : null;
    },
  };
  const element = new KataAvatarElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});

test('kata-avatar throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataAvatarElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-avatar-template/);
});

test('kata-avatar does not reinitialize when already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'SPAN', className: 'avatar' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-avatar-template' ? template : null;
    },
  };
  const element = new KataAvatarElement(ownerDocument);
  let cloneCount = 0;
  const original = template.content.cloneNode;
  template.content.cloneNode = (...args) => { cloneCount++; return original(...args); };
  element.connectedCallback();
  element.connectedCallback();
  assert.equal(cloneCount, 1);
});

test('kata-avatar uses custom template when template attribute is set', () => {
  const customTemplate = new FakeTemplateElement([{ tagName: 'SPAN', className: 'avatar', dataset: { size: 'lg' } }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-avatar-lg-template' ? customTemplate : null;
    },
  };
  const element = new KataAvatarElement(ownerDocument);
  element.setAttribute('template', 'kata-avatar-lg-template');
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});
