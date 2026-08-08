import test from 'node:test';
import assert from 'node:assert/strict';
import { setupGlobals } from '../components/test-utils/shared-test-helpers.js';

setupGlobals();

test('runtime index exposes the supported public entry points', async () => {
  const runtime = await import('./index.js');

  assert.equal(typeof runtime.KataComponent, 'function');
  assert.equal(typeof runtime.HtmxAdapter, 'function');
  assert.equal(typeof runtime.PageState, 'function');
  assert.equal(typeof runtime.ThemeManager, 'function');
  assert.equal(typeof runtime.emitComponentEvent, 'function');
  assert.equal(typeof runtime.ensureComponent, 'function');
});
