import { initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-toggle-template';

export class KataToggleElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      // Re-attach listeners if element was moved in the DOM
      this._attachListeners();
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    this.dataset.kataUiInitialized = 'true';

    const track = queryComponent(this, '[data-toggle-track]');
    if (!track) return;

    const isChecked = this.hasAttribute('checked');
    const isDisabled = this.hasAttribute('disabled');

    this._setChecked(track, isChecked);

    if (isDisabled) {
      track.setAttribute('aria-disabled', 'true');
      track.setAttribute('tabindex', '-1');
    }

    this._attachListeners();
  }

  disconnectedCallback() {
    this._detachListeners();
  }

  _attachListeners() {
    if (this._handleClick) return; // already attached

    this._handleClick = (event) => {
      if (this.hasAttribute('disabled')) return;
      const track = event.target.closest('[data-toggle-track]');
      if (!track) return;
      this._toggle(track);
    };

    this._handleKeydown = (event) => {
      if (this.hasAttribute('disabled')) return;
      if (event.key !== ' ' && event.key !== 'Enter') return;
      const track = event.target.closest('[data-toggle-track]');
      if (!track) return;
      event.preventDefault();
      this._toggle(track);
    };

    this.shadowRoot.addEventListener('click', this._handleClick);
    this.shadowRoot.addEventListener('keydown', this._handleKeydown);
  }

  _detachListeners() {
    if (this._handleClick) {
      this.shadowRoot.removeEventListener('click', this._handleClick);
      this.shadowRoot.removeEventListener('keydown', this._handleKeydown);
      this._handleClick = null;
      this._handleKeydown = null;
    }
  }

  _setChecked(track, checked) {
    track.dataset.state = checked ? 'checked' : 'unchecked';
    track.setAttribute('aria-checked', String(checked));
  }

  _toggle(track) {
    const checked = track.dataset.state !== 'checked';
    this._setChecked(track, checked);
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { checked } }));
  }
}

if (!customElements.get('kata-toggle')) {
  customElements.define('kata-toggle', KataToggleElement);
}
