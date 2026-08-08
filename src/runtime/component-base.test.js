import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FakeHTMLElement,
  FakeTemplateElement,
  setupGlobals,
} from '../components/test-utils/shared-test-helpers.js';

setupGlobals();

const {
  KataComponent,
  isComponentActive,
  isComponentMounted,
} = await import('./component-base.js');
const { emitComponentEvent } = await import('./component-event.js');

class TestComponent extends KataComponent {
  static templateId = 'kata-test-template';
  static moduleUrl = import.meta.url;

  constructor(ownerDocument) {
    super(ownerDocument);
    this.mountCount = 0;
    this.connectCount = 0;
    this.disconnectCount = 0;
  }

  mount() { this.mountCount += 1; }
  connect() { this.connectCount += 1; }
  disconnect() { this.disconnectCount += 1; }
}

test('KataComponent mounts once and activates on every reconnect', () => {
  const template = new FakeTemplateElement([{ tagName: 'DIV', children: [{ tagName: 'SLOT' }] }]);
  const element = new TestComponent({
    getElementById() { return template; },
    createElement: document.createElement,
  });

  element.connectedCallback();
  element.disconnectedCallback();
  element.connectedCallback();

  assert.equal(element.mountCount, 1);
  assert.equal(element.connectCount, 2);
  assert.equal(element.disconnectCount, 1);
  assert.equal(isComponentMounted(element), true);
  assert.equal(isComponentActive(element), true);
});

test('KataComponent removes tracked listeners when disconnected', () => {
  const listeners = new Map();
  const target = {
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
  };
  const element = new TestComponent({
    getElementById() { return new FakeTemplateElement([{ tagName: 'SLOT' }]); },
    createElement: document.createElement,
  });

  element.connect = () => element.listen(target, 'change', () => {});
  element.connectedCallback();
  assert.equal(listeners.has('change'), true);
  element.disconnectedCallback();
  assert.equal(listeners.has('change'), false);
});

test('KataComponent maps a removed built-in variant template to canonical attributes', () => {
  const canonical = new FakeTemplateElement([{ tagName: 'BUTTON', children: [{ tagName: 'SLOT' }] }]);
  class AliasedComponent extends KataComponent {
    static templateId = 'kata-test-template';
    static moduleUrl = import.meta.url;
    static templateAliases = {
      'kata-test-disabled-template': {
        templateId: 'kata-test-template',
        attributes: { disabled: true },
      },
    };
  }
  const element = new AliasedComponent({
    getElementById(id) { return id === 'kata-test-template' ? canonical : null; },
    createElement: document.createElement,
  });
  element.setAttribute('template', 'kata-test-disabled-template');

  element.connectedCallback();

  assert.equal(element.hasAttribute('disabled'), true);
  assert.ok(element.shadowRoot.querySelector('button'));
});

test('emitComponentEvent uses the cross-shadow component event contract', () => {
  const element = new FakeHTMLElement();
  let received;
  element.addEventListener('kata-change', (event) => { received = event; });

  emitComponentEvent(element, 'kata-change', { value: 1 });

  assert.deepEqual(received.detail, { value: 1 });
  assert.equal(received.bubbles, true);
  assert.equal(received.composed, true);
});
