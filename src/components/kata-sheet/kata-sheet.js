import { instantiateTemplate } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-sheet-template';

export class KataSheetElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      this._addDocumentListeners();
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    const fragment = instantiateTemplate(templateId, this.ownerDocument);

    this.replaceChildren(fragment);
    this.dataset.kataUiInitialized = 'true';

    const side = this.getAttribute('side') || 'right';
    this.dataset.side = side;

    this._panel = this.querySelector('[data-sheet-panel]');
    this._overlay = this.querySelector('[data-sheet-overlay]');

    this.querySelectorAll('[data-sheet-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => this._open());
    });

    this.querySelectorAll('[data-sheet-close]').forEach((btn) => {
      btn.addEventListener('click', () => this._close());
    });

    if (this._overlay) {
      this._overlay.addEventListener('click', () => this._close());
    }

    this._keydownHandler = (event) => {
      if (event.key === 'Escape' && this.dataset.state === 'open') {
        this._close();
      }
    };
    this._addDocumentListeners();
  }

  _addDocumentListeners() {
    if (this._keydownHandler) {
      this.ownerDocument.addEventListener('keydown', this._keydownHandler);
    }
  }

  disconnectedCallback() {
    if (this._keydownHandler) {
      this.ownerDocument.removeEventListener('keydown', this._keydownHandler);
    }
  }

  _open() {
    this.dataset.state = 'open';
    if (this._panel) {
      this._panel.removeAttribute('hidden');
      const focusable = this._panel.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus();
    }
    if (this._overlay) {
      this._overlay.removeAttribute('hidden');
    }
  }

  _close() {
    this.dataset.state = 'closed';
    if (this._panel) {
      this._panel.setAttribute('hidden', '');
    }
    if (this._overlay) {
      this._overlay.setAttribute('hidden', '');
    }
  }
}

if (!customElements.get('kata-sheet')) {
  customElements.define('kata-sheet', KataSheetElement);
}
