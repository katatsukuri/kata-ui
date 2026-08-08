import { queryComponent, queryComponentAll } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-dialog-template';

export class KataDialogElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;

  mount() {
    this._dialog = queryComponent(this, 'dialog');

    queryComponentAll(this, '[data-dialog-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => this._open());
    });

    queryComponentAll(this, '[data-dialog-close]').forEach((btn) => {
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
