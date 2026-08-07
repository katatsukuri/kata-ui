import { initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-select-template';

export class KataSelectElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    this.dataset.kataUiInitialized = 'true';
  }
}

if (!customElements.get('kata-select')) {
  customElements.define('kata-select', KataSelectElement);
}
