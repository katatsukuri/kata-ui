import test from 'node:test';
import assert from 'node:assert/strict';
import { LayoutController } from './layout-controller.js';
import { PageController } from './page-controller.js';
import { PageState } from './state-manager.js';
import { ThemeManager } from './theme-manager.js';

test('PageState publishes read-only top-level snapshots only for changes', () => {
  const state = new PageState({ mode: 'list' });
  const snapshots = [];
  state.subscribe((value) => snapshots.push(value), { immediate: true });

  state.set('mode', 'list');
  state.update({ mode: 'detail', selectedId: 'S001' });

  assert.deepEqual(snapshots, [
    { mode: 'list' },
    { mode: 'detail', selectedId: 'S001' },
  ]);
  assert.notEqual(snapshots[1], state.snapshot());
  assert.equal(Object.isFrozen(snapshots[1]), true);
  assert.throws(() => { snapshots[1].mode = 'mutated'; }, TypeError);
  assert.equal(state.get('mode'), 'detail');
});

test('PageController releases state subscriptions', () => {
  const state = new PageState({ open: false });
  const controller = new PageController(state);
  let notifications = 0;
  controller.subscribe(() => { notifications += 1; });
  state.set('open', true);
  controller.dispose();
  state.set('open', false);
  assert.equal(notifications, 1);
});

test('LayoutController changes only explicit element state', () => {
  const element = { hidden: false, dataset: {} };
  LayoutController.hide(element);
  LayoutController.setMode(element, 'detail');
  assert.equal(element.hidden, true);
  assert.equal(element.dataset.mode, 'detail');
  LayoutController.show(element);
  assert.equal(element.hidden, false);
});

test('ThemeManager persists and propagates the selected theme', () => {
  const values = new Map();
  const storage = {
    getItem(key) { return values.get(key); },
    setItem(key, value) { values.set(key, value); },
  };
  const root = { documentElement: { dataset: {} } };
  const manager = new ThemeManager(root, { storage });
  manager.set('dark');
  const frame = { contentDocument: { documentElement: { dataset: {} } } };
  manager.applyToFrame(frame);

  assert.equal(root.documentElement.dataset.theme, 'dark');
  assert.equal(frame.contentDocument.documentElement.dataset.theme, 'dark');
  assert.equal(values.get('kata-ui-theme'), 'dark');
});
