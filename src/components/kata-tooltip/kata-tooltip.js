import { initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-tooltip-template';

export class KataTooltipElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    this.dataset.kataUiInitialized = 'true';

    this._trigger = queryComponent(this, '.kata-tooltip__trigger');
    this._content = queryComponent(this, '.kata-tooltip__content');

    if (this._trigger) {
      this._trigger.addEventListener('mouseenter', () => this._show());
      this._trigger.addEventListener('mouseleave', () => this._hide());
      this._trigger.addEventListener('focusin', () => this._show());
      this._trigger.addEventListener('focusout', () => this._hide());
    }
  }

  _show() {
    this.dataset.state = 'open';
    if (this._content) {
      this._content.dataset.state = 'open';
    }
  }

  _hide() {
    this.dataset.state = 'closed';
    if (this._content) {
      this._content.dataset.state = 'closed';
    }
  }
}

if (!customElements.get('kata-tooltip')) {
  customElements.define('kata-tooltip', KataTooltipElement);
}
