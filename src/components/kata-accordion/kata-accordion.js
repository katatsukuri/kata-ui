import { initializeShadowComponent, instantiateTemplate } from '../../loader/template-loader.js';

const ITEM_TEMPLATE_ID = 'kata-accordion-item-template';
const ACCORDION_TEMPLATE_ID = 'kata-accordion-template';
const TOGGLE_EVENT = 'kata-accordion-toggle';

export class KataAccordionElement extends HTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument);
    this.handleToggle = this.handleToggle.bind(this);
  }

  connectedCallback() {
    const items = [...this.children];
    if (items.length === 0) {
      throw new Error('kata-accordion requires at least one kata-accordion-item.');
    }
    if (items.some((item) => item.localName !== 'kata-accordion-item')) {
      throw new Error('kata-accordion only accepts kata-accordion-item children.');
    }

    initializeShadowComponent(this, ACCORDION_TEMPLATE_ID, import.meta.url);

    let hasOpenItem = false;
    for (const item of items) {
      const isOpen = item.dataset.state === 'open' && (this.hasAttribute('multiple') || !hasOpenItem);
      if ('open' in item) item.open = isOpen;
      else item.dataset.state = isOpen ? 'open' : 'closed';
      hasOpenItem ||= isOpen;
    }

    this.removeEventListener(TOGGLE_EVENT, this.handleToggle);
    this.addEventListener(TOGGLE_EVENT, this.handleToggle);
  }

  disconnectedCallback() {
    this.removeEventListener(TOGGLE_EVENT, this.handleToggle);
  }

  handleToggle(event) {
    if (this.hasAttribute('multiple') || !event.detail.open) return;

    for (const item of this.children) {
      if (item !== event.target) item.open = false;
    }
  }
}

export class KataAccordionItemElement extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const shadowRoot = this.attachShadow({ mode: 'open' });
      const stylesheet = this.ownerDocument.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = new URL('./kata-accordion.css', import.meta.url).href;
      shadowRoot.append(stylesheet);
      shadowRoot.append(instantiateTemplate(ITEM_TEMPLATE_ID, this.ownerDocument));
      shadowRoot.querySelector('[data-accordion-trigger]').addEventListener('click', () => {
        this.open = !this.open;
        this.dispatchEvent(new CustomEvent(TOGGLE_EVENT, {
          bubbles: true,
          composed: true,
          detail: { open: this.open },
        }));
      });
    }

    this.open = this.dataset.state === 'open';
  }

  get open() {
    return this.dataset.state === 'open';
  }

  set open(value) {
    const isOpen = Boolean(value);
    this.dataset.state = isOpen ? 'open' : 'closed';
    const trigger = this.shadowRoot?.querySelector('[data-accordion-trigger]');
    const content = this.shadowRoot?.querySelector('[data-accordion-content]');
    if (trigger) trigger.setAttribute('aria-expanded', String(isOpen));
    if (content) content.hidden = !isOpen;
  }
}

if (!customElements.get('kata-accordion')) {
  customElements.define('kata-accordion', KataAccordionElement);
}

if (!customElements.get('kata-accordion-item')) {
  customElements.define('kata-accordion-item', KataAccordionItemElement);
}
