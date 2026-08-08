import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-slider-template';

export class KataSliderElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
}

if (!customElements.get('kata-slider')) {
  customElements.define('kata-slider', KataSliderElement);
}
