import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeTemplateElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

setupGlobals();

const { KataAccordionElement, KataAccordionItemElement } = await import('./kata-accordion.js');

function createTemplate() {
  return new FakeTemplateElement([{
    tagName: 'DIV',
    className: 'kata-accordion__item',
    children: [
      {
        tagName: 'BUTTON',
        dataset: { accordionTrigger: '' },
        children: [
          { tagName: 'SLOT', name: 'title' },
          { tagName: 'SPAN', className: 'kata-accordion__icon' },
        ],
      },
      {
        tagName: 'DIV',
        dataset: { accordionContent: '' },
        hidden: true,
        children: [{ tagName: 'SLOT' }],
      },
    ],
  }]);
}

function createOwnerDocument(template = createTemplate()) {
  const parentTemplate = new FakeTemplateElement([{ tagName: 'SLOT' }]);
  return {
    getElementById(id) {
      if (id === 'kata-accordion-template') return parentTemplate;
      return id === 'kata-accordion-item-template' ? template : null;
    },
    createElement: document.createElement,
  };
}

function createItem(state = 'closed', ownerDocument = createOwnerDocument()) {
  const item = new KataAccordionItemElement(ownerDocument);
  item.dataset.state = state;
  return item;
}

function createAccordion(items) {
  const element = new KataAccordionElement(createOwnerDocument());
  element.children.push(...items);
  return element;
}

test('kata-accordion-item clones one common frame with title and content slots', () => {
  const item = createItem('open');

  item.connectedCallback();

  const trigger = item.shadowRoot.querySelector('[data-accordion-trigger]');
  const content = item.shadowRoot.querySelector('[data-accordion-content]');
  assert.equal(item.shadowRoot.querySelector('slot').name, 'title');
  assert.equal(item.shadowRoot.querySelectorAll('slot').length, 2);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(content.hidden, false);
});

test('kata-accordion-item updates its own state, aria-expanded, and hidden state', () => {
  const item = createItem();
  item.connectedCallback();

  item.open = true;

  assert.equal(item.dataset.state, 'open');
  assert.equal(
    item.shadowRoot.querySelector('[data-accordion-trigger]').getAttribute('aria-expanded'),
    'true',
  );
  assert.equal(item.shadowRoot.querySelector('[data-accordion-content]').hidden, false);
});

test('kata-accordion-item toggles itself and emits its state from the trigger', () => {
  const item = createItem();
  item.connectedCallback();
  let toggleEvent;
  item.addEventListener('kata-accordion-toggle', (event) => { toggleEvent = event; });

  item.shadowRoot.querySelector('[data-accordion-trigger]').dispatchEvent({ type: 'click' });

  assert.equal(item.open, true);
  assert.equal(toggleEvent.detail.open, true);
});

test('kata-accordion normalizes multiple initial open items unless multiple is set', () => {
  const first = createItem('open');
  const second = createItem('open');
  const element = createAccordion([first, second]);
  first.connectedCallback();
  second.connectedCallback();

  element.connectedCallback();

  assert.equal(first.dataset.state, 'open');
  assert.equal(second.dataset.state, 'closed');
  assert.equal(second.shadowRoot?.querySelector('[data-accordion-content]')?.hidden, true);
  assert.equal(element.dataset.kataUiProjection, 'template-and-slots');
  assert.ok(element.shadowRoot.querySelector('slot'));
});

test('kata-accordion keeps multiple initial open items when multiple is set', () => {
  const first = createItem('open');
  const second = createItem('open');
  const element = createAccordion([first, second]);
  element.setAttribute('multiple', '');

  element.connectedCallback();

  assert.equal(first.dataset.state, 'open');
  assert.equal(second.dataset.state, 'open');
});

test('kata-accordion closes sibling items when an item opens', () => {
  const first = createItem('open');
  const second = createItem();
  const element = createAccordion([first, second]);
  first.connectedCallback();
  second.connectedCallback();
  element.connectedCallback();

  second.open = true;
  element.handleToggle({ target: second, detail: { open: true } });

  assert.equal(first.open, false);
  assert.equal(second.open, true);
});

test('kata-accordion requires at least one item and rejects other children', () => {
  assert.throws(
    () => createAccordion([]).connectedCallback(),
    /requires at least one kata-accordion-item/,
  );

  const invalidChild = createItem();
  invalidChild.localName = 'section';
  assert.throws(
    () => createAccordion([invalidChild]).connectedCallback(),
    /only accepts kata-accordion-item children/,
  );
});

test('kata-accordion-item throws when its template is missing', () => {
  const item = createItem('closed', createOwnerDocument(null));
  assert.throws(() => item.connectedCallback(), /kata-accordion-item-template/);
});
