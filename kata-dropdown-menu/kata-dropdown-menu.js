import { instantiateTemplate } from '../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-dropdown-menu-template';

export class KataDropdownMenuElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      this._addDocumentListeners();
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    const fragment = instantiateTemplate(templateId, this.ownerDocument);

    this.replaceChildren(fragment);
    this.dataset.kataUiInitialized = 'true';

    this._trigger = this.querySelector('[data-dropdown-trigger]');
    this._content = this.querySelector('[data-dropdown-content]');

    if (this._trigger) {
      this._trigger.addEventListener('click', () => this._toggle());
    }

    this._onOutsideClick = (event) => {
      if (!this.contains(event.target)) {
        this._close();
      }
    };

    this._onKeyDown = (event) => {
      if (event.key === 'Escape') {
        this._close();
      }
    };

    this._addDocumentListeners();
  }

  _addDocumentListeners() {
    this.ownerDocument.addEventListener('click', this._onOutsideClick);
    this.ownerDocument.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    this.ownerDocument.removeEventListener('click', this._onOutsideClick);
    this.ownerDocument.removeEventListener('keydown', this._onKeyDown);
  }

  _toggle() {
    if (this.dataset.state === 'open') {
      this._close();
    } else {
      this._open();
    }
  }

  _open() {
    this.dataset.state = 'open';
    if (this._trigger) this._trigger.setAttribute('aria-expanded', 'true');
    if (this._content) this._content.hidden = false;
  }

  _close() {
    this.dataset.state = 'closed';
    if (this._trigger) this._trigger.setAttribute('aria-expanded', 'false');
    if (this._content) this._content.hidden = true;
  }
}

if (!customElements.get('kata-dropdown-menu')) {
  customElements.define('kata-dropdown-menu', KataDropdownMenuElement);
}
