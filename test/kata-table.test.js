import test from 'node:test';
import assert from 'node:assert/strict';

class FakeFragment {
  constructor(children) {
    this.nodeType = 11;
    this.children = children;
  }
}

class FakeTemplateElement {
  constructor(children) {
    this.isConnected = true;
    this.content = {
      cloneNode: () => new FakeFragment(children.map((child) => ({ ...child }))),
    };
  }
}

class FakeHTMLElement {
  constructor(ownerDocument) {
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.dataset = {};
    this.children = [];
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  replaceChildren(fragment) {
    this.children = fragment.children;
  }
}

const registry = new Map();
globalThis.HTMLElement = FakeHTMLElement;
globalThis.HTMLTemplateElement = FakeTemplateElement;
globalThis.customElements = {
  define(name, ctor) {
    registry.set(name, ctor);
  },
  get(name) {
    return registry.get(name);
  },
};

globalThis.document = { getElementById() { return null; } };

const { KataTableElement } = await import('../kata-table/kata-table.js');

test('kata-table clones its template on connect', () => {
  const template = new FakeTemplateElement([{ tagName: 'TABLE' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-table-template' ? template : null;
    },
  };

  const element = new KataTableElement(ownerDocument);
  element.connectedCallback();

  assert.equal(element.dataset.kataUiInitialized, 'true');
  assert.equal(element.children.length, 1);
  assert.equal(element.children[0].tagName, 'TABLE');
});

test('kata-table uses the template attribute for a server-selected component', () => {
  const template = new FakeTemplateElement([{ tagName: 'TABLE', view: 'maintainers' }]);
  const ownerDocument = {
    getElementById(id) {
      return id === 'maintainers-table-template' ? template : null;
    },
  };

  const element = new KataTableElement(ownerDocument);
  element.setAttribute('template', 'maintainers-table-template');
  element.connectedCallback();

  assert.equal(element.children.length, 1);
  assert.equal(element.children[0].view, 'maintainers');
});

test('kata-table throws when template is missing', () => {
  const ownerDocument = {
    getElementById() {
      return null;
    },
  };

  const element = new KataTableElement(ownerDocument);

  assert.throws(() => element.connectedCallback(), /kata-table-template/);
});
