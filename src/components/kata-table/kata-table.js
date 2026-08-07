import { initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-table-template';

export class KataTableElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    globalThis.htmx?.process?.(this.shadowRoot);
    this.dataset.kataUiInitialized = 'true';
  }
}

if (!customElements.get('kata-table')) {
  customElements.define('kata-table', KataTableElement);
}
