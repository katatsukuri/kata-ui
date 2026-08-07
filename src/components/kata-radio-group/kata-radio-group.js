import { initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-radio-group-template';

export class KataRadioGroupElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    this.dataset.kataUiInitialized = 'true';
  }
}

if (!customElements.get('kata-radio-group')) {
  customElements.define('kata-radio-group', KataRadioGroupElement);
}
