import { KataComponent } from '../../runtime/component-base.js';
import { queryComponent } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-badge-template';

export class KataBadgeElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static templateAliases = Object.fromEntries(['secondary', 'outline', 'destructive'].map((variant) => [
    `kata-badge-${variant}-template`,
    { templateId: DEFAULT_TEMPLATE_ID, attributes: { variant } },
  ]));

  mount() {
    const badge = queryComponent(this, '.kata-badge');
    const variant = this.getAttribute('variant');
    if (badge && variant) badge.dataset.variant = variant;
  }
}

if (!customElements.get('kata-badge')) {
  customElements.define('kata-badge', KataBadgeElement);
}
