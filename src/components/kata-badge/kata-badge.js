import { instantiateTemplate } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-badge-template';

export class KataBadgeElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    const fragment = instantiateTemplate(templateId, this.ownerDocument);

    this.replaceChildren(fragment);
    this.dataset.kataUiInitialized = 'true';
  }
}

if (!customElements.get('kata-badge')) {
  customElements.define('kata-badge', KataBadgeElement);
}
