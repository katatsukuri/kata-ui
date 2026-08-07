import { instantiateTemplate } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-dialog-template';

export class KataDialogElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    const fragment = instantiateTemplate(templateId, this.ownerDocument);

    this.replaceChildren(fragment);
    this.dataset.kataUiInitialized = 'true';

    this._dialog = this.querySelector('dialog');

    this.querySelectorAll('[data-dialog-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => this._open());
    });

    this.querySelectorAll('[data-dialog-close]').forEach((btn) => {
      btn.addEventListener('click', () => this._close());
    });

    if (this._dialog) {
      this._dialog.addEventListener('click', (event) => {
        if (event.target === this._dialog) this._close();
      });
      this._dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        this._close();
      });
    }
  }

  _open() {
    if (this._dialog) {
      this._dialog.showModal();
      this.dataset.state = 'open';
    }
  }

  _close() {
    if (this._dialog) {
      this._dialog.close();
      this.dataset.state = 'closed';
    }
  }
}

if (!customElements.get('kata-dialog')) {
  customElements.define('kata-dialog', KataDialogElement);
}
