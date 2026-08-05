import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataAvatarElement } = await import('../kata-avatar/kata-avatar.js');

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
  assert.equal(element.children[0].tagName, 'SPAN');
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
  let replaceChildrenCallCount = 0;
  const original = element.replaceChildren.bind(element);
  element.replaceChildren = (...args) => { replaceChildrenCallCount++; original(...args); };
  element.connectedCallback();
  element.connectedCallback();
  assert.equal(replaceChildrenCallCount, 1);
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
  assert.equal(element.children[0].tagName, 'SPAN');
});
