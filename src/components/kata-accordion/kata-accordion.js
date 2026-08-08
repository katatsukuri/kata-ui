import { KataComponent } from '../../runtime/component-base.js';

const ITEM_TEMPLATE_ID = 'kata-accordion-item-template';
const ACCORDION_TEMPLATE_ID = 'kata-accordion-template';
const TOGGLE_EVENT = 'kata-accordion-toggle';

export class KataAccordionElement extends KataComponent {
  static templateId = ACCORDION_TEMPLATE_ID;
  static moduleUrl = import.meta.url;

  constructor(ownerDocument) {
    super(ownerDocument);
    this.handleToggle = this.handleToggle.bind(this);
  }

  connect() {
    const items = [...this.children];
    if (items.length === 0) {
      throw new Error('kata-accordion requires at least one kata-accordion-item.');
    }
    if (items.some((item) => item.localName !== 'kata-accordion-item')) {
      throw new Error('kata-accordion only accepts kata-accordion-item children.');
    }

    let hasOpenItem = false;
    for (const item of items) {
      const isOpen = item.dataset.state === 'open' && (this.hasAttribute('multiple') || !hasOpenItem);
      if ('open' in item) item.open = isOpen;
      else item.dataset.state = isOpen ? 'open' : 'closed';
      hasOpenItem ||= isOpen;
    }

    this.listen(this, TOGGLE_EVENT, this.handleToggle);
  }

  handleToggle(event) {
    if (this.hasAttribute('multiple') || !event.detail.open) return;

    for (const item of this.children) {
      if (item !== event.target) item.open = false;
    }
  }
}

export class KataAccordionItemElement extends KataComponent {
  static templateId = ITEM_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static stylesheetName = 'kata-accordion';

  mount() {
    this.shadowRoot.querySelector('[data-accordion-trigger]').addEventListener('click', () => {
      this.open = !this.open;
      this.emit(TOGGLE_EVENT, { open: this.open });
    });
  }

  connect() {
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
