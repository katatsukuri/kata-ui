/** Shared fake DOM helpers for component unit tests. */

export class FakeFragment {
  constructor(children) {
    this.nodeType = 11;
    this.children = children;
  }

  querySelector(selector) {
    return fakeDescendants(this.children).find((node) => fakeMatches(node, selector)) ?? null;
  }

  querySelectorAll(selector) {
    return fakeDescendants(this.children).filter((node) => fakeMatches(node, selector));
  }
}

function cloneFakeNode(node) {
  const attributes = new Map();
  const clone = {
    ...node,
    dataset: { ...(node.dataset ?? {}) },
    children: (node.children ?? []).map(cloneFakeNode),
    addEventListener() {},
    removeEventListener() {},
    getAttribute(name) { return attributes.get(name) ?? null; },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    removeAttribute(name) { attributes.delete(name); },
    querySelector(selector) {
      return fakeDescendants(this.children).find((child) => fakeMatches(child, selector)) ?? null;
    },
    querySelectorAll(selector) {
      return fakeDescendants(this.children).filter((child) => fakeMatches(child, selector));
    },
  };
  return clone;
}

export class FakeTemplateElement {
  constructor(children) {
    this.isConnected = true;
    this.content = {
      cloneNode: () => new FakeFragment(children.map(cloneFakeNode)),
    };
  }
}

function fakeDescendants(nodes) {
  return nodes.flatMap((node) => [node, ...fakeDescendants(node?.children ?? [])]);
}

function fakeMatches(node, selector) {
  if (!node) return false;
  const dataAttributes = [...selector.matchAll(/\[data-([a-z0-9-]+)(?:="([^"]*)")?\]/g)];
  if (dataAttributes.length > 0 && dataAttributes.map(({ 0: value }) => value).join('') === selector) {
    return dataAttributes.every(([, attribute, expected]) => {
      const key = attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      return node.dataset && key in node.dataset && (expected === undefined || node.dataset[key] === expected);
    });
  }
  if (selector.startsWith('.')) {
    return String(node.className ?? '').split(/\s+/).includes(selector.slice(1));
  }
  return (node.tagName ?? node.localName)?.toLowerCase() === selector.toLowerCase();
}

export class FakeHTMLElement {
  constructor(ownerDocument) {
    this.ownerDocument = ownerDocument;
    this.localName = this.constructor.name
      .replace(/^Kata|Element$/g, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/^/, 'kata-');
    this.attributes = new Map();
    this.dataset = {};
    this.children = [];
    this._listeners = new Map();
  }

  get childNodes() { return this.children; }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  hasAttribute(name) { return this.attributes.has(name); }
  replaceChildren(fragment) { this.children = fragment.children; }

  append(node) {
    if (node?.nodeType === 11) this.children.push(...node.children);
    else this.children.push(node);
  }

  attachShadow() {
    const host = this;
    this.shadowRoot = {
      children: [],
      append(node) { this.children.push(node); },
      querySelector(selector) {
        return host.querySelector(selector)
          || fakeDescendants(this.children).find((node) => fakeMatches(node, selector))
          || null;
      },
      querySelectorAll(selector) {
        return [
          ...host.querySelectorAll(selector),
          ...fakeDescendants(this.children).filter((node) => fakeMatches(node, selector)),
        ];
      },
      addEventListener: (...args) => this.addEventListener(...args),
      removeEventListener() {},
    };
    return this.shadowRoot;
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
  globalThis.document = {
    getElementById() { return null; },
    createElement(name) {
      return {
        localName: name,
        name: '',
        nodeType: 1,
        children: [],
        append(node) { this.children.push(node); },
        setAttribute(attribute, value) { this[attribute] = String(value); },
      };
    },
  };
}
