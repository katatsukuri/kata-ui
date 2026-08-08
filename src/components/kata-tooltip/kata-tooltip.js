import { queryComponent } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-tooltip-template';

export class KataTooltipElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;

  mount() {
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
