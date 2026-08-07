import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataToggleGroupElement } = await import('./kata-toggle-group.js');

test('kata-toggle-group clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-toggle-group-template' ? template : null;
    },
  };
  const element = new KataToggleGroupElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-toggle-group throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataToggleGroupElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-toggle-group-template/);
});

test('kata-toggle-group toggles aria-pressed on click (multiple mode)', () => {
  const item = {
    _attrs: new Map([['aria-pressed', 'false']]),
    dataset: {},
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    closest(sel) {
      return sel === '[data-toggle-item]' ? item : null;
    },
  };

  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-toggle-group-template' ? template : null;
    },
  };

  const element = new KataToggleGroupElement(ownerDocument);
  element.querySelectorAll = () => [item];
  element.connectedCallback();

  const clickHandlers = element._listeners.get('click') ?? [];
  assert.ok(clickHandlers.length > 0, 'click listener should be registered');
  clickHandlers[0]({ target: { closest: item.closest.bind(item) } });

  assert.equal(item.getAttribute('aria-pressed'), 'true');

  // click again to toggle off
  clickHandlers[0]({ target: { closest: item.closest.bind(item) } });
  assert.equal(item.getAttribute('aria-pressed'), 'false');
});

test('kata-toggle-group single mode deactivates others on click', () => {
  const item1 = {
    _attrs: new Map([['aria-pressed', 'true']]),
    dataset: { active: '' },
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    closest(sel) { return sel === '[data-toggle-item]' ? item1 : null; },
  };
  const item2 = {
    _attrs: new Map([['aria-pressed', 'false']]),
    dataset: {},
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    closest(sel) { return sel === '[data-toggle-item]' ? item2 : null; },
  };

  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-toggle-group-template' ? template : null;
    },
  };

  const element = new KataToggleGroupElement(ownerDocument);
  element.attributes.set('type', 'single');
  element.querySelectorAll = (sel) => {
    if (sel === '[data-toggle-item]') return [item1, item2];
    return [];
  };
  element.connectedCallback();

  const clickHandlers = element._listeners.get('click') ?? [];
  // click item2 — item1 should become inactive
  clickHandlers[0]({ target: { closest: item2.closest.bind(item2) } });

  assert.equal(item1.getAttribute('aria-pressed'), 'false');
  assert.equal(item2.getAttribute('aria-pressed'), 'true');
});
