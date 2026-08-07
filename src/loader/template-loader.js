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

const COMPONENT_SLOTS = Object.freeze({
  'kata-card': ['header', '', 'footer'],
});

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

function setText(root, selector, value) {
  if (value == null) return;
  const target = root.querySelector(selector);
  if (target) target.textContent = value;
}

function setAttribute(root, selector, name, value) {
  if (value == null) return;
  const target = root.querySelector(selector);
  if (target) target.setAttribute(name, value);
}

function applyHostAttributes(element, root) {
  const values = Object.fromEntries([
    'label', 'title', 'description', 'value', 'name', 'placeholder', 'type',
    'src', 'alt', 'href', 'min', 'max', 'step',
  ].map((name) => [name, element.getAttribute(name)]));

  setText(root, 'button', values.label);
  setText(root, '.kata-badge', values.label);
  setText(root, '.kata-card__title', values.title);
  setText(root, '.kata-card__description', values.description);
  setText(root, '.kata-dialog__title, .kata-drawer__title, .kata-sheet__title', values.title);
  const label = root.querySelector('label');
  if (values.label != null && label && !label.querySelector('input, textarea, select')) {
    label.textContent = values.label;
  }

  for (const selector of ['input', 'textarea', 'select']) {
    for (const name of ['name', 'placeholder', 'type', 'min', 'max', 'step']) {
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

/** Creates an open Shadow Root from the canonical template and exposes slots. */
export function initializeShadowComponent(element, templateId, moduleUrl) {
  if (element.shadowRoot) return 'initialized';

  const shadowRoot = element.attachShadow({ mode: 'open' });
  const stylesheet = createElement(element.ownerDocument, 'link');
  stylesheet.setAttribute('rel', 'stylesheet');
  stylesheet.setAttribute('href', new URL(`./${element.localName}.css`, moduleUrl).href);
  shadowRoot.append(stylesheet);

  const slotNames = COMPONENT_SLOTS[element.localName] ?? [''];
  const hasConsumerContent = [...(element.childNodes ?? [])].some((node) => (
    node.nodeType !== 3 || node.textContent?.trim()
  ));

  if (element.localName === 'kata-card' && hasConsumerContent) {
    const card = createElement(element.ownerDocument, 'div');
    card.className = 'kata-card';
    for (const [name, className] of [
      ['header', 'kata-card__header'],
      ['', 'kata-card__content'],
      ['footer', 'kata-card__footer'],
    ]) {
      const region = createElement(element.ownerDocument, 'div');
      region.className = className;
      const slot = createElement(element.ownerDocument, 'slot');
      if (name) slot.name = name;
      region.append(slot);
      card.append(region);
    }
    shadowRoot.append(card);
  } else {
    for (const name of slotNames) {
      const slot = createElement(element.ownerDocument, 'slot');
      if (name) slot.name = name;
      if (!name && !hasConsumerContent) {
        slot.append(instantiateTemplate(templateId, element.ownerDocument));
      }
      shadowRoot.append(slot);
    }
  }

  applyHostAttributes(element, shadowRoot);
  element.dataset.kataUiProjection = hasConsumerContent ? 'slots' : 'attributes';
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
