import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-switch-template';

export class KataSwitchElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static templateAliases = {
    'kata-switch-checked-template': {
      templateId: DEFAULT_TEMPLATE_ID,
      attributes: { checked: true, name: 'dark' },
    },
    'kata-switch-disabled-template': {
      templateId: DEFAULT_TEMPLATE_ID,
      attributes: { disabled: true, name: 'disabled' },
    },
  };
}

if (!customElements.get('kata-switch')) {
  customElements.define('kata-switch', KataSwitchElement);
}
