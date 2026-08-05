import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataToggleElement } = await import('../kata-toggle/kata-toggle.js');

// Helper to build a minimal toggle DOM inside an element
function makeTrack({ checked = false, disabled = false } = {}) {
  const thumb = { dataset: {} };
  const track = {
    _attrs: new Map([
      ['aria-checked', String(checked)],
      ['tabindex', '0'],
    ]),
    dataset: { state: checked ? 'checked' : 'unchecked' },
    getAttribute(n) { return this._attrs.get(n) ?? null; },
    setAttribute(n, v) { this._attrs.set(n, String(v)); },
    querySelector(sel) {
      if (sel === '[data-toggle-thumb]') return thumb;
      return null;
    },
    closest(sel) {
      if (sel === '[data-toggle-track]') return this;
      return null;
    },
  };
  return track;
}

function makeElement({ checked = false, disabled = false } = {}) {
  const track = makeTrack({ checked });
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-toggle-template' ? template : null;
    },
  };

  const element = new KataToggleElement(ownerDocument);
  if (checked) element.attributes.set('checked', '');
  if (disabled) element.attributes.set('disabled', '');

  // Override querySelector to return the fake track
  element.querySelector = (sel) => {
    if (sel === '[data-toggle-track]') return track;
    return null;
  };

  return { element, track };
}

test('kata-toggle clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-toggle-template' ? template : null;
    },
  };
  const element = new KataToggleElement(ownerDocument);
  element.querySelector = () => null;
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-toggle throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataToggleElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-toggle-template/);
});

test('kata-toggle initializes unchecked state by default', () => {
  const { element, track } = makeElement();
  element.connectedCallback();
  assert.equal(track.dataset.state, 'unchecked');
  assert.equal(track.getAttribute('aria-checked'), 'false');
});

test('kata-toggle initializes checked state when checked attribute is set', () => {
  const { element, track } = makeElement({ checked: true });
  element.connectedCallback();
  assert.equal(track.dataset.state, 'checked');
  assert.equal(track.getAttribute('aria-checked'), 'true');
});

test('kata-toggle toggles to checked on click', () => {
  const { element, track } = makeElement();
  element.dispatchEvent = () => {};
  element.connectedCallback();

  assert.ok(element._handleClick, 'click handler should be registered');
  element._handleClick({ target: { closest: track.closest.bind(track) } });

  assert.equal(track.dataset.state, 'checked');
  assert.equal(track.getAttribute('aria-checked'), 'true');
});

test('kata-toggle toggles to unchecked on second click', () => {
  const { element, track } = makeElement({ checked: true });
  element.dispatchEvent = () => {};
  element.connectedCallback();

  element._handleClick({ target: { closest: track.closest.bind(track) } });

  assert.equal(track.dataset.state, 'unchecked');
  assert.equal(track.getAttribute('aria-checked'), 'false');
});

test('kata-toggle dispatches change event on toggle', () => {
  const { element, track } = makeElement();
  element.connectedCallback();

  let firedEvent = null;
  element.dispatchEvent = (evt) => { firedEvent = evt; };

  element._handleClick({ target: { closest: track.closest.bind(track) } });

  assert.ok(firedEvent, 'change event should be dispatched');
  assert.equal(firedEvent.type, 'change');
  assert.equal(firedEvent.detail.checked, true);
});

test('kata-toggle does not toggle when disabled', () => {
  const { element, track } = makeElement({ disabled: true });
  let eventFired = false;
  element.dispatchEvent = () => { eventFired = true; };
  element.connectedCallback();

  element._handleClick({ target: { closest: track.closest.bind(track) } });

  assert.equal(track.dataset.state, 'unchecked');
  assert.equal(eventFired, false, 'change event should not fire when disabled');
});

test('kata-toggle does not reinitialize if already initialized', () => {
  const { element, track } = makeElement();
  element.connectedCallback();
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});
