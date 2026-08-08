import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-pagination-template';

export class KataPaginationElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
}

if (!customElements.get('kata-pagination')) {
  customElements.define('kata-pagination', KataPaginationElement);
}
