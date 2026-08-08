import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-breadcrumb-template';

export class KataBreadcrumbElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
}

if (!customElements.get('kata-breadcrumb')) {
  customElements.define('kata-breadcrumb', KataBreadcrumbElement);
}
