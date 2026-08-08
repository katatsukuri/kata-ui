import { KataComponent } from '../../runtime/component-base.js';
import { processHtmxRoot } from '../../runtime/htmx-adapter.js';

const DEFAULT_TEMPLATE_ID = 'kata-table-template';

export class KataTableElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;

  mount() {
    processHtmxRoot(this.shadowRoot);
  }
}

if (!customElements.get('kata-table')) {
  customElements.define('kata-table', KataTableElement);
}
