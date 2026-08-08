import test from 'node:test';
import assert from 'node:assert/strict';
import { setupGlobals } from '../components/test-utils/shared-test-helpers.js';

setupGlobals();

const {
  ensureComponent,
  registerComponentLoader,
  registeredComponentNames,
} = await import('./component-registry.js');

test('component registry loads an unregistered definition without invoking lifecycle callbacks', async () => {
  let callbackCalls = 0;
  registerComponentLoader('kata-lazy-test', async () => {
    class LazyTest extends HTMLElement {
      connectedCallback() { callbackCalls += 1; }
    }
    customElements.define('kata-lazy-test', LazyTest);
  });

  const definition = await ensureComponent('kata-lazy-test');

  assert.equal(typeof definition, 'function');
  assert.equal(callbackCalls, 0);
  assert.deepEqual(registeredComponentNames(), ['kata-lazy-test']);
});
