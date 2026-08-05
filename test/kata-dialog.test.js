import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from './shared-test-helpers.js';

setupGlobals();

const { KataDialogElement } = await import('../kata-dialog/kata-dialog.js');

test('kata-dialog clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIALOG' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-dialog-template' ? template : null;
    },
  };
  const element = new KataDialogElement(ownerDocument);
  element.connectedCallback();
  assert.equal(element.dataset.kataUiInitialized, 'true');
});

test('kata-dialog throws when template is missing', () => {
  const ownerDocument = { getElementById() { return null; } };
  const element = new KataDialogElement(ownerDocument);
  assert.throws(() => element.connectedCallback(), /kata-dialog-template/);
});
