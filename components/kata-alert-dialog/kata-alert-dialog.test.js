import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataAlertDialogElement } = await import('./kata-alert-dialog.js');

test('kata-alert-dialog clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIALOG' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-alert-dialog-template' ? template : null;
    },
  };
  const element = new KataAlertDialogElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-alert-dialog throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataAlertDialogElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-alert-dialog-template/);
});

test('kata-alert-dialog does not reinitialize when already initialized', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIALOG' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-alert-dialog-template' ? template : null;
    },
  };
  const element = new KataAlertDialogElement(ownerDocument);
  element.connectedCallback();
  const childrenAfterFirst = element.children;
  element.connectedCallback();
  assert.equal(element.children, childrenAfterFirst);
});
