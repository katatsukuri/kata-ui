import { queryComponent } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-popover-template';
const PLACEMENTS = ['bottom', 'top', 'left', 'right'];

export class KataPopoverElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static templateAliases = Object.fromEntries(PLACEMENTS.map((placement) => [
    `kata-popover-${placement}-template`,
    { templateId: DEFAULT_TEMPLATE_ID, attributes: { 'data-placement': placement } },
  ]));

  mount() {
    this.dataset.state = 'closed';

    this._trigger = queryComponent(this, '[data-popover-trigger]');
    this._content = queryComponent(this, '[data-popover-content]');

    if (this._trigger) {
      this._trigger.setAttribute('aria-expanded', 'false');
      if (this._content) {
        if (!this._content.id) {
          this._content.id = `kata-popover-content-${Math.random().toString(36).slice(2)}`;
        }
        this._trigger.setAttribute('aria-controls', this._content.id);
      }
      this._trigger.addEventListener('click', () => this._toggle());
    }

    this._onOutsideClick = (event) => {
      if (this.dataset.state === 'open' && !(event.composedPath?.().includes(this) || this.contains?.(event.target))) {
        this._close();
      }
    };

  }

  connect() {
    if (this._onOutsideClick) {
      this.listen(this.ownerDocument, 'click', this._onOutsideClick);
    }
  }

  _placement() {
    const p = this.dataset.placement || this.getAttribute('data-placement') || 'bottom';
    return PLACEMENTS.includes(p) ? p : 'bottom';
  }

  _updatePosition() {
    if (!this._trigger || !this._content) return;

    const triggerRect = this._trigger.getBoundingClientRect();
    const placement = this._placement();

    this._content.style.position = 'fixed';

    const GAP = 8;

    switch (placement) {
      case 'top':
        this._content.style.left = `${triggerRect.left + triggerRect.width / 2}px`;
        this._content.style.top = `${triggerRect.top - GAP}px`;
        this._content.style.transform = 'translate(-50%, -100%)';
        break;
      case 'left':
        this._content.style.left = `${triggerRect.left - GAP}px`;
        this._content.style.top = `${triggerRect.top + triggerRect.height / 2}px`;
        this._content.style.transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        this._content.style.left = `${triggerRect.right + GAP}px`;
        this._content.style.top = `${triggerRect.top + triggerRect.height / 2}px`;
        this._content.style.transform = 'translate(0, -50%)';
        break;
      case 'bottom':
      default:
        this._content.style.left = `${triggerRect.left + triggerRect.width / 2}px`;
        this._content.style.top = `${triggerRect.bottom + GAP}px`;
        this._content.style.transform = 'translate(-50%, 0)';
        break;
    }
  }

  _toggle() {
    if (this.dataset.state === 'open') {
      this._close();
    } else {
      this._open();
    }
  }

  _open() {
    if (!this._content) return;
    this._updatePosition();
    this._content.removeAttribute('hidden');
    this.dataset.state = 'open';
    if (this._trigger) {
      this._trigger.setAttribute('aria-expanded', 'true');
    }
  }

  _close() {
    if (!this._content) return;
    this._content.setAttribute('hidden', '');
    this.dataset.state = 'closed';
    if (this._trigger) {
      this._trigger.setAttribute('aria-expanded', 'false');
    }
  }
}

if (!customElements.get('kata-popover')) {
  customElements.define('kata-popover', KataPopoverElement);
}
