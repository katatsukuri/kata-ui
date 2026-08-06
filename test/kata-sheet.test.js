import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataSheetElement } = await import('../kata-sheet/kata-sheet.js');

test('kata-sheet clones its template on connect', () => {
  const panel = { tagName: 'DIV', dataset: {}, attributes: new Map(), getAttribute() { return null; }, setAttribute() {}, removeAttribute() {}, querySelector() { return null; } };
  panel.attributes.set('data-sheet-panel', '');
  const template = new FakeTemplateElement([panel]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-sheet-template' ? template : null;
    },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataSheetElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-sheet throws when template is missing', () => {
  const ownerDocument = {
    getElementById() { return null; },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataSheetElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-sheet-template/);
});

test('kata-sheet sets data-side from attribute', () => {
  const panel = { tagName: 'DIV', dataset: {}, attributes: new Map(), getAttribute() { return null; }, setAttribute() {}, removeAttribute() {}, querySelector() { return null; } };
  panel.attributes.set('data-sheet-panel', '');
  const template = new FakeTemplateElement([panel]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-sheet-template' ? template : null;
    },
    addEventListener() {},
    removeEventListener() {},
  };
  const element = new KataSheetElement(ownerDocument);
  element.attributes.set('side', 'left');
  element.connectedCallback();
  assert.equal(element.dataset.side, 'left');
});
