import { instantiateTemplate } from '../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-switch-template';

export class KataSwitchElement extends HTMLElement {
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

if (!customElements.get('kata-switch')) {
  customElements.define('kata-switch', KataSwitchElement);
}
