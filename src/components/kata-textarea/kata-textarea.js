import { KataComponent } from '../../runtime/component-base.js';

const DEFAULT_TEMPLATE_ID = 'kata-textarea-template';

export class KataTextareaElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  static templateAliases = {
    'kata-textarea-disabled-template': {
      templateId: DEFAULT_TEMPLATE_ID,
      attributes: { disabled: true, name: 'note', rows: '3', value: '編集不可のテキスト' },
    },
  };
}

if (!customElements.get('kata-textarea')) {
  customElements.define('kata-textarea', KataTextareaElement);
}
