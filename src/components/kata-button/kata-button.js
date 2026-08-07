import { instantiateTemplate } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-button-template';

export class KataButtonElement extends HTMLElement {
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

if (!customElements.get('kata-button')) {
  customElements.define('kata-button', KataButtonElement);
}
