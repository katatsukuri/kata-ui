import { instantiateTemplate } from '../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-hover-card-template';

export class KataHoverCardElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    const fragment = instantiateTemplate(templateId, this.ownerDocument);

    this.replaceChildren(fragment);
    this.dataset.kataUiInitialized = 'true';
    this.dataset.state = 'closed';

    this._content = this.querySelector('[data-hover-card-content]');

    this.querySelectorAll('[data-hover-card-trigger]').forEach((trigger) => {
      trigger.addEventListener('mouseenter', () => this._open());
      trigger.addEventListener('mouseleave', () => this._scheduleClose());
      trigger.addEventListener('focus', () => this._open());
      trigger.addEventListener('blur', () => this._scheduleClose());
    });

    if (this._content) {
      this._content.addEventListener('mouseenter', () => this._cancelClose());
      this._content.addEventListener('mouseleave', () => this._scheduleClose());
    }
  }

  _open() {
    this._cancelClose();
    if (this._content) {
      this._content.hidden = false;
    }
    this.dataset.state = 'open';
  }

  _scheduleClose() {
    this._closeTimer = setTimeout(() => this._close(), 100);
  }

  _cancelClose() {
    clearTimeout(this._closeTimer);
  }

  _close() {
    if (this._content) {
      this._content.hidden = true;
    }
    this.dataset.state = 'closed';
  }
}

if (!customElements.get('kata-hover-card')) {
  customElements.define('kata-hover-card', KataHoverCardElement);
}
