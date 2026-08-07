import { initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-accordion-template';

export class KataAccordionElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    this.dataset.kataUiInitialized = 'true';

    this.shadowRoot.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-accordion-trigger]');
      if (!trigger) return;

      const item = trigger.closest('[data-accordion-item]');
      if (!item) return;

      const content = item.querySelector('[data-accordion-content]');
      if (!content) return;

      const isOpen = item.dataset.state === 'open';
      const allowMultiple = this.hasAttribute('multiple');

      if (!allowMultiple) {
        queryComponentAll(this, '[data-accordion-item][data-state="open"]').forEach((openItem) => {
          if (openItem !== item) {
            openItem.dataset.state = 'closed';
            const openTrigger = openItem.querySelector('[data-accordion-trigger]');
            if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
            const openContent = openItem.querySelector('[data-accordion-content]');
            if (openContent) openContent.hidden = true;
          }
        });
      }

      const nextState = isOpen ? 'closed' : 'open';
      item.dataset.state = nextState;
      trigger.setAttribute('aria-expanded', String(!isOpen));
      content.hidden = isOpen;
    });
  }
}

if (!customElements.get('kata-accordion')) {
  customElements.define('kata-accordion', KataAccordionElement);
}
