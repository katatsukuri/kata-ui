import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataTooltipElement } = await import('./kata-tooltip.js');

test('kata-tooltip clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON', className: 'kata-tooltip__trigger' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-tooltip-template' ? template : null;
    },
  };
  const element = new KataTooltipElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'BUTTON');
});

test('kata-tooltip throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataTooltipElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-tooltip-template/);
});

test('kata-tooltip does not re-initialize when already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'BUTTON', className: 'kata-tooltip__trigger' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-tooltip-template' ? template : null;
    },
  };
  const element = new KataTooltipElement(ownerDocument);
  element.connectedCallback();
  const firstChildren = element.children;
  element.connectedCallback();
  assert.equal(element.children, firstChildren);
});
