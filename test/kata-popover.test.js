import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

// Extend FakeHTMLElement with getBoundingClientRect for position tests
class FakeHTMLElementWithRect extends FakeHTMLElement {
  getBoundingClientRect() {
    return { left: 100, top: 50, right: 200, bottom: 70, width: 100, height: 20 };
  }
}

const registry = new Map();
globalThis.customElements = {
  define(name, ctor) { registry.set(name, ctor); },
  get(name) { return registry.get(name); },
};

// Minimal document mock that tracks event listeners
const docListeners = new Map();
globalThis.document = {
  getElementById() { return null; },
  addEventListener(event, handler) {
    if (!docListeners.has(event)) docListeners.set(event, []);
    docListeners.get(event).push(handler);
  },
  removeEventListener(event, handler) {
    const list = docListeners.get(event) || [];
    docListeners.set(event, list.filter((h) => h !== handler));
  },
};

const { KataPopoverElement } = await import('../kata-popover/kata-popover.js');

function makeElement(templateChildren = []) {
  const template = new FakeTemplateElement(templateChildren);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-popover-template' ? template : null;
    },
    addEventListener: globalThis.document.addEventListener.bind(globalThis.document),
    removeEventListener: globalThis.document.removeEventListener.bind(globalThis.document),
  };
  const element = new KataPopoverElement(ownerDocument);

  // Override querySelector/querySelectorAll to search cloned children
  let trigger = null;
  let content = null;
  element.querySelector = (sel) => {
    if (sel === '[data-popover-trigger]') return trigger;
    if (sel === '[data-popover-content]') return content;
    return null;
  };
  element._setFakeNodes = (t, c) => { trigger = t; content = c; };

  return element;
}

test('kata-popover clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-popover-template' ? template : null;
    },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataPopoverElement(ownerDocument);
  element.querySelector = () => null;
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.dataset.state, 'closed');
});

test('kata-popover throws when template is missing', () => {
  const ownerDocument = {
    getElementById() { return null; },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataPopoverElement(ownerDocument);
  element.querySelector = () => null;
  assert.throws(() => element.connectedCallback(), /kata-popover-template/);
});

test('kata-popover does not reinitialize when already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-popover-template' ? template : null;
    },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataPopoverElement(ownerDocument);
  element.querySelector = () => null;
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');

  // Second call should be a no-op
  let cloneCount = 0;
  const original = template.content.cloneNode;
  template.content.cloneNode = (...args) => { cloneCount++; return original(...args); };
  element.connectedCallback();
  assert.equal(cloneCount, 0);
});

test('kata-popover _open sets data-state to open and aria-expanded', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-popover-template' ? template : null;
    },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataPopoverElement(ownerDocument);

  const triggerEl = new FakeHTMLElementWithRect(ownerDocument);
  triggerEl.attributes = new Map([['aria-expanded', 'false']]);
  triggerEl.getAttribute = (n) => triggerEl.attributes.get(n) ?? null;
  triggerEl.setAttribute = (n, v) => triggerEl.attributes.set(n, v);

  const contentEl = new FakeHTMLElementWithRect(ownerDocument);
  contentEl.attributes = new Map([['hidden', '']]);
  contentEl.getAttribute = (n) => contentEl.attributes.get(n) ?? null;
  contentEl.setAttribute = (n, v) => contentEl.attributes.set(n, v);
  contentEl.removeAttribute = (n) => contentEl.attributes.delete(n);
  contentEl.style = {};

  element.querySelector = (sel) => {
    if (sel === '[data-popover-trigger]') return triggerEl;
    if (sel === '[data-popover-content]') return contentEl;
    return null;
  };

  element.connectedCallback();
  element._open();

  assert.equal(element.dataset.state, 'open');
  assert.equal(triggerEl.getAttribute('aria-expanded'), 'true');
  assert.equal(contentEl.attributes.has('hidden'), false);
});

test('kata-popover _close sets data-state to closed and aria-expanded', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-popover-template' ? template : null;
    },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataPopoverElement(ownerDocument);

  const triggerEl = new FakeHTMLElementWithRect(ownerDocument);
  triggerEl.attributes = new Map([['aria-expanded', 'true']]);
  triggerEl.getAttribute = (n) => triggerEl.attributes.get(n) ?? null;
  triggerEl.setAttribute = (n, v) => triggerEl.attributes.set(n, v);

  const contentEl = new FakeHTMLElementWithRect(ownerDocument);
  contentEl.attributes = new Map();
  contentEl.getAttribute = (n) => contentEl.attributes.get(n) ?? null;
  contentEl.setAttribute = (n, v) => contentEl.attributes.set(n, v);
  contentEl.removeAttribute = (n) => contentEl.attributes.delete(n);
  contentEl.style = {};

  element.querySelector = (sel) => {
    if (sel === '[data-popover-trigger]') return triggerEl;
    if (sel === '[data-popover-content]') return contentEl;
    return null;
  };

  element.connectedCallback();
  element.dataset.state = 'open';
  element._close();

  assert.equal(element.dataset.state, 'closed');
  assert.equal(triggerEl.getAttribute('aria-expanded'), 'false');
  assert.equal(contentEl.attributes.get('hidden'), '');
});
