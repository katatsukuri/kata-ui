import { instantiateTemplate } from '../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-toggle-group-template';

export class KataToggleGroupElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    const fragment = instantiateTemplate(templateId, this.ownerDocument);

    this.replaceChildren(fragment);
    this.dataset.kataUiInitialized = 'true';

    const isSingle = this.getAttribute('type') === 'single';

    const toggle = (item) => {
      const isPressed = item.getAttribute('aria-pressed') === 'true';
      if (isSingle) {
        this.querySelectorAll('[data-toggle-item]').forEach((i) => {
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

    this.addEventListener('click', (event) => {
      // Skip keyboard-generated clicks (detail === 0) to avoid double-toggle
      // when Space/Enter is handled by the keydown listener below.
      if (event.detail === 0) return;
      const item = event.target.closest('[data-toggle-item]');
      if (!item) return;
      toggle(item);
    });

    this.addEventListener('keydown', (event) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      const item = event.target.closest('[data-toggle-item]');
      if (!item) return;
      event.preventDefault();
      toggle(item);
    });
  }
}

if (!customElements.get('kata-toggle-group')) {
  customElements.define('kata-toggle-group', KataToggleGroupElement);
}
