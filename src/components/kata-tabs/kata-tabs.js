import { findEventTarget, queryProjected, queryProjectedAll } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-tabs-template';

export class KataTabsElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;

  mount() {
    this.shadowRoot.addEventListener('click', (event) => {
      const trigger = findEventTarget(event, '[data-tabs-trigger]');
      if (!trigger) return;

      const targetId = trigger.getAttribute('aria-controls');
      if (!targetId) return;

      queryProjectedAll(this, '[data-tabs-trigger]').forEach((t) => {
        t.setAttribute('aria-selected', 'false');
        t.removeAttribute('data-active');
      });
      queryProjectedAll(this, '[data-tabs-panel]').forEach((p) => {
        p.hidden = true;
      });

      trigger.setAttribute('aria-selected', 'true');
      trigger.dataset.active = '';
      const panel = queryProjected(this, `#${CSS.escape(targetId)}`);
      if (panel) panel.hidden = false;
    });

    this.shadowRoot.addEventListener('keydown', (event) => {
      const trigger = findEventTarget(event, '[data-tabs-trigger]');
      if (!trigger) return;

      const triggers = Array.from(queryProjectedAll(this, '[data-tabs-trigger]'));
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
