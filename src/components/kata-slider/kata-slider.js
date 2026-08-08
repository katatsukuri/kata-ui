import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-slider-template';

export class KataSliderElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static templateAliases = {
    'kata-slider-brightness-template': {
      templateId: DEFAULT_TEMPLATE_ID,
      attributes: { name: 'brightness', min: '0', max: '100', value: '80', step: '10' },
    },
  };
}

if (!customElements.get('kata-slider')) {
  customElements.define('kata-slider', KataSliderElement);
}
