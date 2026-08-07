import { initializeShadowComponent, queryComponent, queryComponentAll } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-tabs-template';

export class KataTabsElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    const templateId = this.getAttribute('template') || DEFAULT_TEMPLATE_ID;
    initializeShadowComponent(this, templateId, import.meta.url);
    this.dataset.kataUiInitialized = 'true';

    this.shadowRoot.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-tabs-trigger]');
      if (!trigger) return;

      const targetId = trigger.getAttribute('aria-controls');
      if (!targetId) return;

      queryComponentAll(this, '[data-tabs-trigger]').forEach((t) => {
        t.setAttribute('aria-selected', 'false');
        t.removeAttribute('data-active');
      });
      queryComponentAll(this, '[data-tabs-panel]').forEach((p) => {
        p.hidden = true;
      });

      trigger.setAttribute('aria-selected', 'true');
      trigger.dataset.active = '';
      const panel = queryComponent(this, `#${CSS.escape(targetId)}`);
      if (panel) panel.hidden = false;
    });

    this.shadowRoot.addEventListener('keydown', (event) => {
      const trigger = event.target.closest('[data-tabs-trigger]');
      if (!trigger) return;

      const triggers = Array.from(queryComponentAll(this, '[data-tabs-trigger]'));
      const index = triggers.indexOf(trigger);

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        triggers[(index + 1) % triggers.length].focus();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        triggers[(index - 1 + triggers.length) % triggers.length].focus();
      }
    });
  }
}

if (!customElements.get('kata-tabs')) {
  customElements.define('kata-tabs', KataTabsElement);
}
