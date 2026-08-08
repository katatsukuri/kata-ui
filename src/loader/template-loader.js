const TEMPLATE_REGISTRY = new WeakMap();

function getTemplateRegistry(root) {
  let registry = TEMPLATE_REGISTRY.get(root);
  if (!registry) {
    registry = new Map();
    TEMPLATE_REGISTRY.set(root, registry);
  }

  return registry;
}

export function resolveTemplate(templateId, root = document) {
  if (!templateId) {
    throw new Error('templateId is required.');
  }

  const registry = getTemplateRegistry(root);
  const cached = registry.get(templateId);
  if (cached && cached.isConnected) {
    return cached;
  }

  const template = root.getElementById(templateId);
  if (!(template instanceof HTMLTemplateElement)) {
    throw new Error(`Template \"${templateId}\" was not found.`);
  }

  registry.set(templateId, template);
  return template;
}

export function instantiateTemplate(templateId, root = document) {
  return resolveTemplate(templateId, root).content.cloneNode(true);
}

function createElement(root, name) {
  const documentRoot = typeof root.createElement === 'function' ? root : document;
  if (typeof documentRoot.createElement === 'function') return documentRoot.createElement(name);
  return {
    localName: name,
    name: '',
    children: [],
    append(node) { this.children.push(node); },
    setAttribute() {},
  };
}

function createComponentShadowRoot(element, moduleUrl, stylesheetName = element.localName) {
  const shadowRoot = element.attachShadow({ mode: 'open' });
  const stylesheet = createElement(element.ownerDocument, 'link');
  stylesheet.setAttribute('rel', 'stylesheet');
  stylesheet.setAttribute('href', new URL(`./${stylesheetName}.css`, moduleUrl).href);
  shadowRoot.append(stylesheet);
  return shadowRoot;
}

function setAttribute(root, selector, name, value) {
  if (value == null) return;
  const target = root.querySelector(selector);
  if (target) target.setAttribute(name, value);
}

export function applyHostAttributes(element, root) {
  const values = Object.fromEntries([
    'value', 'name', 'placeholder', 'type',
    'src', 'alt', 'href', 'min', 'max', 'step', 'rows',
  ].map((name) => [name, element.getAttribute(name)]));

  for (const selector of ['input', 'textarea', 'select']) {
    for (const name of ['name', 'placeholder', 'type', 'min', 'max', 'step', 'rows']) {
      setAttribute(root, selector, name, values[name]);
    }
  }
  setAttribute(root, 'input', 'value', values.value);
  setAttribute(root, 'img', 'src', values.src);
  setAttribute(root, 'img', 'alt', values.alt);
  setAttribute(root, 'a', 'href', values.href);

  if (values.value != null) {
    const textarea = root.querySelector('textarea');
    if (textarea) textarea.textContent = values.value;
  }
  for (const name of ['checked', 'disabled', 'required', 'readonly']) {
    if (!element.hasAttribute(name)) continue;
    const control = root.querySelector('input, textarea, select, button');
    if (control) control.setAttribute(name, '');
  }
}

/** Creates an open Shadow Root from the canonical template and projects Light DOM through its slots. */
export function initializeShadowComponent(element, templateId, moduleUrl, options = {}) {
  if (element.shadowRoot) return 'initialized';

  const shadowRoot = createComponentShadowRoot(element, moduleUrl, options.stylesheetName);
  const hasConsumerContent = [...(element.childNodes ?? [])].some((node) => (
    node.nodeType !== 3 || node.textContent?.trim()
  ));

  shadowRoot.append(instantiateTemplate(templateId, element.ownerDocument));

  applyHostAttributes(element, shadowRoot);
  element.dataset.kataUiProjection = hasConsumerContent ? 'template-and-slots' : 'template';
  return element.dataset.kataUiProjection;
}

/** Clones one canonical frame per usage-side item and lets the caller bind attributes and slots. */
export function initializeShadowCollection(element, templateId, moduleUrl, items, configureItem) {
  if (element.shadowRoot) return 'initialized';
  if (items.length === 0) throw new Error(`${element.localName} requires at least one usage-side item.`);

  const shadowRoot = createComponentShadowRoot(element, moduleUrl);
  for (const [index, item] of items.entries()) {
    const fragment = instantiateTemplate(templateId, element.ownerDocument);
    configureItem(fragment, item, index);
    shadowRoot.append(fragment);
  }

  element.dataset.kataUiProjection = 'attributes-and-slots';
  return element.dataset.kataUiProjection;
}

export function queryComponent(element, selector) {
  return element.querySelector(selector) || element.shadowRoot?.querySelector(selector) || null;
}

export function queryComponentAll(element, selector) {
  return [
    ...element.querySelectorAll(selector),
    ...(element.shadowRoot?.querySelectorAll(selector) ?? []),
  ];
}

export function findEventTarget(event, selector) {
  return event.composedPath?.().find((node) => node?.matches?.(selector))
    ?? event.target?.closest?.(selector)
    ?? null;
}
