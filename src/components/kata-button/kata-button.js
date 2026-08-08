import { KataComponent } from '../../runtime/component-base.js';
import { queryComponent } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-button-template';

export class KataButtonElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static templateAliases = {
    'kata-button-secondary-template': { templateId: DEFAULT_TEMPLATE_ID, attributes: { variant: 'secondary' } },
    'kata-button-destructive-template': { templateId: DEFAULT_TEMPLATE_ID, attributes: { variant: 'destructive' } },
    'kata-button-disabled-template': { templateId: DEFAULT_TEMPLATE_ID, attributes: { disabled: true } },
  };

  mount() {
    const button = queryComponent(this, 'button');
    const variant = this.getAttribute('variant');
    if (button && variant) button.dataset.variant = variant;
  }
}

if (!customElements.get('kata-button')) {
  customElements.define('kata-button', KataButtonElement);
}
