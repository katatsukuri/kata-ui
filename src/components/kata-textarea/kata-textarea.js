import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-textarea-template';

export class KataTextareaElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
}

if (!customElements.get('kata-textarea')) {
  customElements.define('kata-textarea', KataTextareaElement);
}
