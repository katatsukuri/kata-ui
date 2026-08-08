import test from 'node:test';
import assert from 'node:assert/strict';

const { HtmxAdapter, processComponentRoots, processHtmxRoot } = await import('./htmx-adapter.js');

function fakeRoot() {
  const listeners = new Map();
  return {
    body: { dataset: {} },
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
    dispatch(type, detail = {}) { listeners.get(type)?.({ type, detail, target: detail.target }); },
    dispatchEvent() {},
    querySelectorAll() { return []; },
  };
}

test('processHtmxRoot delegates only when HTMX is available', () => {
  const original = globalThis.htmx;
  const roots = [];
  globalThis.htmx = { process(root) { roots.push(root); } };
  try {
    const root = {};
    assert.equal(processHtmxRoot(root), true);
    assert.deepEqual(roots, [root]);
  } finally {
    globalThis.htmx = original;
  }
});

test('processComponentRoots processes shadow roots without invoking lifecycle callbacks', () => {
  const original = globalThis.htmx;
  let callbacks = 0;
  let processed = 0;
  const element = { shadowRoot: {}, connectedCallback() { callbacks += 1; } };
  globalThis.htmx = { process() { processed += 1; } };
  try {
    const root = { querySelectorAll() { return [element]; } };
    assert.equal(processComponentRoots(root), 1);
    assert.equal(processed, 1);
    assert.equal(callbacks, 0);
  } finally {
    globalThis.htmx = original;
  }
});

test('HtmxAdapter tracks loading state and removes listeners on dispose', () => {
  const root = fakeRoot();
  const adapter = new HtmxAdapter(root);
  const dispose = adapter.initialize();

  root.dispatch('htmx:beforeRequest');
  assert.equal(root.body.dataset.loading, 'true');
  root.dispatch('htmx:afterRequest');
  assert.equal(root.body.dataset.loading, undefined);

  dispose();
  root.dispatch('htmx:beforeRequest');
  assert.equal(root.body.dataset.loading, undefined);
});
