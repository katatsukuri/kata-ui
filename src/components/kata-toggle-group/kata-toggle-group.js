import { findEventTarget, initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-toggle-group-template';

export class KataToggleGroupElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    this.dataset.kataUiInitialized = 'true';

    const isSingle = this.getAttribute('type') === 'single';

    const toggle = (item) => {
      const isPressed = item.getAttribute('aria-pressed') === 'true';
      if (isSingle) {
        queryComponentAll(this, '[data-toggle-item]').forEach((i) => {
          i.setAttribute('aria-pressed', 'false');
          delete i.dataset.active;
        });
        if (!isPressed) {
          item.setAttribute('aria-pressed', 'true');
          item.dataset.active = '';
        }
      } else {
        item.setAttribute('aria-pressed', String(!isPressed));
        if (!isPressed) {
          item.dataset.active = '';
        } else {
          delete item.dataset.active;
        }
      }
    };

    this.shadowRoot.addEventListener('click', (event) => {
      // Skip keyboard-generated clicks (detail === 0) to avoid double-toggle
      // when Space/Enter is handled by the keydown listener below.
      if (event.detail === 0) return;
      const item = findEventTarget(event, '[data-toggle-item]');
      if (!item) return;
      toggle(item);
    });

    this.shadowRoot.addEventListener('keydown', (event) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      const item = findEventTarget(event, '[data-toggle-item]');
      if (!item) return;
      event.preventDefault();
      toggle(item);
    });
  }
}

if (!customElements.get('kata-toggle-group')) {
  customElements.define('kata-toggle-group', KataToggleGroupElement);
}
