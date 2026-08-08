import { KataComponent } from '../../runtime/component-base.js';
import { queryComponent } from '../../loader/template-loader.js';

const DEFAULT_TEMPLATE_ID = 'kata-avatar-template';

export class KataAvatarElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static templateAliases = {
    'kata-avatar-initials-template': DEFAULT_TEMPLATE_ID,
    'kata-avatar-sm-template': { templateId: DEFAULT_TEMPLATE_ID, attributes: { size: 'sm' } },
    'kata-avatar-lg-template': { templateId: DEFAULT_TEMPLATE_ID, attributes: { size: 'lg' } },
  };

  mount() {
    const avatar = queryComponent(this, '.kata-avatar');
    const size = this.getAttribute('size');
    if (avatar && size) avatar.dataset.size = size;
  }
}

if (!customElements.get('kata-avatar')) {
  customElements.define('kata-avatar', KataAvatarElement);
}
