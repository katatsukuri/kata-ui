/**
 * Shared test helpers for kata-ui component tests.
 * Sets up fake DOM globals needed to run Custom Element code in Node.js.
 */

export class FakeFragment {
  constructor(children) {
    this.nodeType = 11;
    this.children = children;
  }
}

export class FakeTemplateElement {
  constructor(children) {
    this.isConnected = true;
    this.content = {
      cloneNode: () => new FakeFragment(children.map((child) => ({ ...child }))),
    };
  }
}

export class FakeHTMLElement {
  constructor(ownerDocument) {
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.dataset = {};
    this.children = [];
    this._listeners = new Map();
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  replaceChildren(fragment) {
    this.children = fragment.children;
  }

  querySelectorAll() { return []; }
  querySelector() { return null; }

  addEventListener(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(handler);
  }
}

const registry = new Map();

export function setupGlobals() {
  globalThis.HTMLElement = FakeHTMLElement;
  globalThis.HTMLTemplateElement = FakeTemplateElement;
  globalThis.customElements = {
    define(name, ctor) { registry.set(name, ctor); },
    get(name) { return registry.get(name); },
  };
  globalThis.document = { getElementById() { return null; } };
}
