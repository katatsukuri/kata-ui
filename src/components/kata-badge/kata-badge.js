import { initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-badge-template';

export class KataBadgeElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    this.dataset.kataUiInitialized = 'true';
  }
}

if (!customElements.get('kata-badge')) {
  customElements.define('kata-badge', KataBadgeElement);
}
