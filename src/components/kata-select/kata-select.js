import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-select-template';

export class KataSelectElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
}

if (!customElements.get('kata-select')) {
  customElements.define('kata-select', KataSelectElement);
}
