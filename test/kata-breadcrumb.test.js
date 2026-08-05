import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataBreadcrumbElement } = await import('../kata-breadcrumb/kata-breadcrumb.js');

test('kata-breadcrumb clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'NAV' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-breadcrumb-template' ? template : null;
    },
  };
  const element = new KataBreadcrumbElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children[0].tagName, 'NAV');
});

test('kata-breadcrumb throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataBreadcrumbElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-breadcrumb-template/);
});
