import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataAccordionElement } = await import('../kata-accordion/kata-accordion.js');

test('kata-accordion clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-accordion-template' ? template : null;
    },
  };
  const element = new KataAccordionElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-accordion throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataAccordionElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-accordion-template/);
});

test('kata-accordion toggle: opens a closed item on trigger click', () => {
  // Build a minimal in-memory accordion DOM
  const content = { hidden: true };
  const trigger = {
    _attrs: new Map([['aria-expanded', 'false'], ['aria-controls', 'acc-1']]),
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    closest(sel) {
      if (sel === '[data-accordion-trigger]') return trigger;
      if (sel === '[data-accordion-item]') return item;
      return null;
    },
  };
  const item = {
    dataset: { state: 'closed' },
    querySelector(sel) {
      if (sel === '[data-accordion-trigger]') return trigger;
      if (sel === '[data-accordion-content]') return content;
      return null;
    },
  };

  // Provide a real-enough element to exercise the click handler
  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-accordion-template' ? template : null;
    },
  };

  const element = new KataAccordionElement(ownerDocument);
  // Override querySelectorAll to simulate existing open items
  element.querySelectorAll = (sel) => {
    if (sel === '[data-accordion-item][data-state="open"]') return [];
    return [];
  };
  element.connectedCallback();

  // Dispatch a synthetic click event whose target has the right closest() chain
  const clickHandlers = element._listeners.get('click') ?? [];
  assert.ok(clickHandlers.length > 0, 'click listener should be registered');
  clickHandlers[0]({ target: { closest: trigger.closest.bind(trigger) } });

  assert.equal(item.dataset.state, 'open');
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(content.hidden, false);
});

test('kata-accordion toggle: closes an open item on trigger click', () => {
  const content = { hidden: false };
  const trigger = {
    _attrs: new Map([['aria-expanded', 'true'], ['aria-controls', 'acc-1']]),
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    closest(sel) {
      if (sel === '[data-accordion-trigger]') return trigger;
      if (sel === '[data-accordion-item]') return item;
      return null;
    },
  };
  const item = {
    dataset: { state: 'open' },
    querySelector(sel) {
      if (sel === '[data-accordion-trigger]') return trigger;
      if (sel === '[data-accordion-content]') return content;
      return null;
    },
  };

  const template = new FakeTemplateElement([{ tagName: 'DIV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-accordion-template' ? template : null;
    },
  };

  const element = new KataAccordionElement(ownerDocument);
  element.querySelectorAll = () => [];
  element.connectedCallback();

  const clickHandlers = element._listeners.get('click') ?? [];
  clickHandlers[0]({ target: { closest: trigger.closest.bind(trigger) } });

  assert.equal(item.dataset.state, 'closed');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(content.hidden, true);
});
