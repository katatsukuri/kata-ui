import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataDropdownMenuElement } = await import('./kata-dropdown-menu.js');

function makeOwnerDocument(template) {
  return {
    getElementById(id) {
      return id === 'kata-dropdown-menu-template' ? template : null;
    },
    addEventListener() {},
    removeEventListener() {},
  };
}

test('kata-dropdown-menu clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const element = new KataDropdownMenuElement(makeOwnerDocument(template));
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-dropdown-menu throws when template is missing', () => {
  const ownerDocument = {
    getElementById() { return null; },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataDropdownMenuElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-dropdown-menu-template/);
});

test('kata-dropdown-menu opens on trigger click', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const element = new KataDropdownMenuElement(makeOwnerDocument(template));

  const trigger = {
    _attrs: new Map([['aria-expanded', 'false'], ['aria-haspopup', 'menu']]),
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    _listeners: new Map(),
    addEventListener(ev, fn) {
      if (!this._listeners.has(ev)) this._listeners.set(ev, []);
      this._listeners.get(ev).push(fn);
    },
  };
  const content = { hidden: true };

  element.querySelector = (sel) => {
    if (sel === '[data-dropdown-trigger]') return trigger;
    if (sel === '[data-dropdown-content]') return content;
    return null;
  };

  element.connectedCallback();

  // simulate trigger click
  const clickHandlers = trigger._listeners.get('click') ?? [];
  assert.ok(clickHandlers.length > 0, 'click listener should be registered on trigger');
  clickHandlers[0]();

  assert.equal(element.dataset.state, 'open');
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(content.hidden, false);
});

test('kata-dropdown-menu closes on second trigger click', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const element = new KataDropdownMenuElement(makeOwnerDocument(template));

  const trigger = {
    _attrs: new Map([['aria-expanded', 'false']]),
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    _listeners: new Map(),
    addEventListener(ev, fn) {
      if (!this._listeners.has(ev)) this._listeners.set(ev, []);
      this._listeners.get(ev).push(fn);
    },
  };
  const content = { hidden: true };

  element.querySelector = (sel) => {
    if (sel === '[data-dropdown-trigger]') return trigger;
    if (sel === '[data-dropdown-content]') return content;
    return null;
  };

  element.connectedCallback();
  const clickHandlers = trigger._listeners.get('click') ?? [];

  clickHandlers[0](); // open
  clickHandlers[0](); // close

  assert.equal(element.dataset.state, 'closed');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(content.hidden, true);
});

test('kata-dropdown-menu closes on Escape key', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const docListeners = new Map();
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-dropdown-menu-template' ? template : null;
    },
    addEventListener(ev, fn) {
      if (!docListeners.has(ev)) docListeners.set(ev, []);
      docListeners.get(ev).push(fn);
    },
    removeEventListener() {},
  };
  const element = new KataDropdownMenuElement(ownerDocument);

  const trigger = {
    _attrs: new Map([['aria-expanded', 'false']]),
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    _listeners: new Map(),
    addEventListener(ev, fn) {
      if (!this._listeners.has(ev)) this._listeners.set(ev, []);
      this._listeners.get(ev).push(fn);
    },
  };
  const content = { hidden: true };

  element.querySelector = (sel) => {
    if (sel === '[data-dropdown-trigger]') return trigger;
    if (sel === '[data-dropdown-content]') return content;
    return null;
  };

  element.connectedCallback();
  element._open(); // open it first

  assert.equal(element.dataset.state, 'open');
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');

  const keyHandlers = docListeners.get('keydown') ?? [];
  assert.ok(keyHandlers.length > 0, 'keydown listener should be registered on document');
  keyHandlers[0]({ key: 'Escape' });

  assert.equal(element.dataset.state, 'closed');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(content.hidden, true);
});
