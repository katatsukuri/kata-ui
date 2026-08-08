import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-checkbox-template';

export class KataCheckboxElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
}

if (!customElements.get('kata-checkbox')) {
  customElements.define('kata-checkbox', KataCheckboxElement);
}
