import { findEventTarget, queryComponent } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-toggle-template';

export class KataToggleElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;

  mount() {
    this._track = queryComponent(this, '[data-toggle-track]');
    if (!this._track) return;

    const isChecked = this.hasAttribute('checked');
    const isDisabled = this.hasAttribute('disabled');

    this._setChecked(this._track, isChecked);

    if (isDisabled) {
      this._track.setAttribute('aria-disabled', 'true');
      this._track.setAttribute('tabindex', '-1');
    }
  }

  connect() {
    this._handleClick = (event) => {
      if (this.hasAttribute('disabled')) return;
      const track = findEventTarget(event, '[data-toggle-track]');
      if (!track) return;
      this._toggle(track);
    };

    this._handleKeydown = (event) => {
      if (this.hasAttribute('disabled')) return;
      if (event.key !== ' ' && event.key !== 'Enter') return;
      const track = findEventTarget(event, '[data-toggle-track]');
      if (!track) return;
      event.preventDefault();
      this._toggle(track);
    };

    this.listen(this.shadowRoot, 'click', this._handleClick);
    this.listen(this.shadowRoot, 'keydown', this._handleKeydown);
  }

  disconnect() {
    this._handleClick = null;
    this._handleKeydown = null;
  }

  _setChecked(track, checked) {
    track.dataset.state = checked ? 'checked' : 'unchecked';
    track.setAttribute('aria-checked', String(checked));
  }

  _toggle(track) {
    const checked = track.dataset.state !== 'checked';
    this._setChecked(track, checked);
    this.emit('change', { checked }, { composed: false });
  }
}

if (!customElements.get('kata-toggle')) {
  customElements.define('kata-toggle', KataToggleElement);
}
