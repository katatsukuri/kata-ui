import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataPaginationElement } = await import('./kata-pagination.js');

test('kata-pagination clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'NAV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-pagination-template' ? template : null;
    },
  };
  const element = new KataPaginationElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.ok(element.shadowRoot);
});

test('kata-pagination throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataPaginationElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-pagination-template/);
});
