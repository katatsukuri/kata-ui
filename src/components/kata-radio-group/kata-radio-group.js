import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-radio-group-template';

export class KataRadioGroupElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
}

if (!customElements.get('kata-radio-group')) {
  customElements.define('kata-radio-group', KataRadioGroupElement);
}
