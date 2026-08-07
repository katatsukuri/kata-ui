import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, FakeHTMLElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataAccordionElement } = await import('./kata-accordion.js');

function createTemplate() {
  return new FakeTemplateElement([{
    tagName: 'DIV',
    dataset: { accordionItem: '', state: 'closed' },
    children: [
      { tagName: 'BUTTON', dataset: { accordionTrigger: '' }, textContent: '' },
      {
        tagName: 'DIV',
        dataset: { accordionContent: '' },
        hidden: true,
        children: [{ tagName: 'SLOT', dataset: { accordionContentSlot: '' } }],
      },
    ],
  }]);
}

function createUsageItem(title, state = 'closed') {
  const item = new FakeHTMLElement();
  item.setAttribute('data-accordion-title', title);
  item.dataset.state = state;
  return item;
}

function createAccordion(items, template = createTemplate()) {
  const ownerDocument = {
    getElementById(id) {
      return id === 'kata-accordion-template' ? template : null;
    },
  };
  const element = new KataAccordionElement(ownerDocument);
  element.children.push(...items);
  return element;
}

test('kata-accordion clones one common frame per usage-side item', () => {
  const first = createUsageItem('kata-uiとは何ですか？', 'open');
  const second = createUsageItem('Reactなしで使えますか？');
  const element = createAccordion([first, second]);

  element.connectedCallback();

  const frames = element.shadowRoot.querySelectorAll('[data-accordion-item]');
  const triggers = element.shadowRoot.querySelectorAll('[data-accordion-trigger]');
  const contents = element.shadowRoot.querySelectorAll('[data-accordion-content]');
  const slots = element.shadowRoot.querySelectorAll('[data-accordion-content-slot]');
  assert.equal(frames.length, 2);
  assert.deepEqual(triggers.map(({ textContent }) => textContent), [
    'kata-uiとは何ですか？',
    'Reactなしで使えますか？',
  ]);
  assert.equal(frames[0].dataset.state, 'open');
  assert.equal(contents[0].hidden, false);
  assert.equal(contents[1].hidden, true);
  assert.equal(first.getAttribute('slot'), slots[0].name);
  assert.equal(second.getAttribute('slot'), slots[1].name);
  assert.equal(element.dataset.kataUiProjection, 'attributes-and-slots');
});

test('kata-accordion requires at least one usage-side item', () => {
  const element = createAccordion([]);
  assert.throws(() => element.connectedCallback(), /requires at least one usage-side item/);
});

test('kata-accordion requires a title on every usage-side item', () => {
  const item = new FakeHTMLElement();
  const element = createAccordion([item]);
  assert.throws(() => element.connectedCallback(), /data-accordion-title/);
});

test('kata-accordion throws when template is missing', () => {
  const item = createUsageItem('質問');
  const element = createAccordion([item], null);
  assert.throws(() => element.connectedCallback(), /kata-accordion-template/);
});

test('kata-accordion toggle updates frame and usage-side state', () => {
  const usageItem = createUsageItem('質問');
  const element = createAccordion([usageItem]);
  element.connectedCallback();

  const frame = element.shadowRoot.querySelector('[data-accordion-item]');
  const trigger = element.shadowRoot.querySelector('[data-accordion-trigger]');
  const content = element.shadowRoot.querySelector('[data-accordion-content]');
  trigger.closest = (selector) => (
    selector === '[data-accordion-trigger]' ? trigger : frame
  );

  const [clickHandler] = element._listeners.get('click');
  clickHandler({ target: trigger });

  assert.equal(frame.dataset.state, 'open');
  assert.equal(usageItem.dataset.state, 'open');
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(content.hidden, false);
});

test('kata-accordion normalizes multiple initial open items unless multiple is set', () => {
  const first = createUsageItem('質問1', 'open');
  const second = createUsageItem('質問2', 'open');
  const element = createAccordion([first, second]);

  element.connectedCallback();

  assert.equal(first.dataset.state, 'open');
  assert.equal(second.dataset.state, 'closed');
});

test('kata-accordion keeps multiple initial open items when multiple is set', () => {
  const first = createUsageItem('質問1', 'open');
  const second = createUsageItem('質問2', 'open');
  const element = createAccordion([first, second]);
  element.setAttribute('multiple', '');

  element.connectedCallback();

  assert.equal(first.dataset.state, 'open');
  assert.equal(second.dataset.state, 'open');
  assert.equal(
    element.shadowRoot.querySelectorAll('[data-accordion-item][data-state="open"]').length,
    2,
  );
});
