import { initializeShadowCollection } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-accordion-template';
const USAGE_ITEM_BY_FRAME = new WeakMap();
let accordionSequence = 0;

export class KataAccordionElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const items = [...this.children];
    for (const item of items) {
      if (!item.hasAttribute('data-accordion-title')) {
        throw new Error('Each kata-accordion item requires data-accordion-title.');
      }
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    const accordionId = this.id || `kata-accordion-${++accordionSequence}`;
    const allowMultiple = this.hasAttribute('multiple');
    let hasOpenItem = false;

    initializeShadowCollection(this, templateId, import.meta.url, items, (fragment, usageItem, index) => {
      const frame = fragment.querySelector('[data-accordion-item]');
      const trigger = fragment.querySelector('[data-accordion-trigger]');
      const content = fragment.querySelector('[data-accordion-content]');
      const contentSlot = fragment.querySelector('[data-accordion-content-slot]');
      const requestedOpen = usageItem.dataset.state === 'open';
      const isOpen = requestedOpen && (allowMultiple || !hasOpenItem);
      const itemId = `${accordionId}-item-${index + 1}`;
      const slotName = `${itemId}-content`;

      if (isOpen) hasOpenItem = true;
      usageItem.dataset.state = isOpen ? 'open' : 'closed';
      usageItem.setAttribute('slot', slotName);
      frame.dataset.state = usageItem.dataset.state;
      USAGE_ITEM_BY_FRAME.set(frame, usageItem);
      trigger.textContent = usageItem.getAttribute('data-accordion-title');
      trigger.id = `${itemId}-trigger`;
      trigger.setAttribute('aria-expanded', String(isOpen));
      trigger.setAttribute('aria-controls', `${itemId}-content`);
      content.id = `${itemId}-content`;
      content.setAttribute('aria-labelledby', trigger.id);
      content.hidden = !isOpen;
      contentSlot.name = slotName;
    });
    this.dataset.kataUiInitialized = 'true';

    this.shadowRoot.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-accordion-trigger]');
      if (!trigger) return;

      const item = trigger.closest('[data-accordion-item]');
      if (!item) return;

      const content = item.querySelector('[data-accordion-content]');
      if (!content) return;

      const isOpen = item.dataset.state === 'open';
      if (!allowMultiple) {
        this.shadowRoot.querySelectorAll('[data-accordion-item][data-state="open"]').forEach((openItem) => {
          if (openItem !== item) {
            openItem.dataset.state = 'closed';
            const openUsageItem = USAGE_ITEM_BY_FRAME.get(openItem);
            if (openUsageItem) openUsageItem.dataset.state = 'closed';
            const openTrigger = openItem.querySelector('[data-accordion-trigger]');
            if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
            const openContent = openItem.querySelector('[data-accordion-content]');
            if (openContent) openContent.hidden = true;
          }
        });
      }

      const nextState = isOpen ? 'closed' : 'open';
      item.dataset.state = nextState;
      const usageItem = USAGE_ITEM_BY_FRAME.get(item);
      if (usageItem) usageItem.dataset.state = nextState;
      trigger.setAttribute('aria-expanded', String(!isOpen));
      content.hidden = isOpen;
    });
  }
}

if (!customElements.get('kata-accordion')) {
  customElements.define('kata-accordion', KataAccordionElement);
}
