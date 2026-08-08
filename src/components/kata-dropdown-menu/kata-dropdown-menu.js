import { queryComponent } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-dropdown-menu-template';

export class KataDropdownMenuElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;

  mount() {
    this._trigger = queryComponent(this, '[data-dropdown-trigger]');
    this._content = queryComponent(this, '[data-dropdown-content]');

    if (this._trigger) {
      this._trigger.addEventListener('click', () => this._toggle());
    }

    this._onOutsideClick = (event) => {
      if (!(event.composedPath?.().includes(this) || this.contains?.(event.target))) {
        this._close();
      }
    };

    this._onKeyDown = (event) => {
      if (event.key === 'Escape') {
        this._close();
      }
    };

  }

  connect() {
    this.listen(this.ownerDocument, 'click', this._onOutsideClick);
    this.listen(this.ownerDocument, 'keydown', this._onKeyDown);
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
