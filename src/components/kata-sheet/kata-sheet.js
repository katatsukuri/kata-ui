import { queryComponent, queryComponentAll } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-sheet-template';

export class KataSheetElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static templateAliases = {
    'kata-sheet-left-template': {
      templateId: DEFAULT_TEMPLATE_ID,
      attributes: { side: 'left', 'hide-confirm': true },
    },
  };

  mount() {
    const side = this.getAttribute('side') || 'right';
    this.dataset.side = side;

    this._panel = queryComponent(this, '[data-sheet-panel]');
    this._overlay = queryComponent(this, '[data-sheet-overlay]');
    const confirmButton = queryComponent(this, '[data-sheet-confirm]');
    if (confirmButton && this.hasAttribute('hide-confirm')) {
      confirmButton.hidden = true;
    }

    queryComponentAll(this, '[data-sheet-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => this._open());
    });

    queryComponentAll(this, '[data-sheet-close]').forEach((btn) => {
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
  }

  connect() {
    if (this._keydownHandler) {
      this.listen(this.ownerDocument, 'keydown', this._keydownHandler);
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
