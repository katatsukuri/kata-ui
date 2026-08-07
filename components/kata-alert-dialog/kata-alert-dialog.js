import { instantiateTemplate } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-alert-dialog-template';

export class KataAlertDialogElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    const fragment = instantiateTemplate(templateId, this.ownerDocument);

    this.replaceChildren(fragment);
    this.dataset.kataUiInitialized = 'true';

    this._dialog = this.querySelector('dialog');

    this.querySelectorAll('[data-alert-dialog-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => this._open());
    });

    this.querySelectorAll('[data-alert-dialog-close]').forEach((btn) => {
      btn.addEventListener('click', () => this._close());
    });

    if (this._dialog) {
      this._dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
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

if (!customElements.get('kata-alert-dialog')) {
  customElements.define('kata-alert-dialog', KataAlertDialogElement);
}
