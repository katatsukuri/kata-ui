import {
  applyHostAttributes,
  initializeShadowComponent,
} from '../loader/template-loader.js';
import { emitComponentEvent } from './component-event.js';

const COMPONENT_STATE = new WeakMap();

function stateFor(component) {
  let state = COMPONENT_STATE.get(component);
  if (!state) {
    state = { mounted: false, active: false, cleanups: [] };
    COMPONENT_STATE.set(component, state);
  }
  return state;
}

export class KataComponent extends HTMLElement {
  static templateId = null;

  connectedCallback() {
    const state = stateFor(this);
    if (!state.mounted) {
      const requestedTemplateId = this.getAttribute('template') || this.constructor.templateId;
      const templateExists = this.ownerDocument?.getElementById?.(requestedTemplateId);
      const alias = templateExists ? null : this.constructor.templateAliases?.[requestedTemplateId];
      const templateId = typeof alias === 'string' ? alias : alias?.templateId || requestedTemplateId;
      for (const [name, value] of Object.entries(alias?.attributes ?? {})) {
        if (this.hasAttribute(name)) continue;
        if (value === true) this.setAttribute(name, '');
        else if (value !== false && value != null) this.setAttribute(name, value);
      }
      if (!templateId) throw new Error(`${this.localName} requires a templateId.`);
      initializeShadowComponent(this, templateId, this.constructor.moduleUrl, {
        stylesheetName: this.constructor.stylesheetName,
      });
      state.mounted = true;
      this.dataset.kataUiInitialized = 'true';
      this.mount?.();
    }

    if (state.active) return;
    state.active = true;
    this.connect?.();
  }

  disconnectedCallback() {
    const state = stateFor(this);
    if (!state.active) {
      this.disconnect?.();
      return;
    }
    this.disconnect?.();
    for (const cleanup of state.cleanups.splice(0).reverse()) cleanup();
    state.active = false;
  }

  listen(target, type, listener, options) {
    if (!target?.addEventListener) return () => {};
    target.addEventListener(type, listener, options);
    const cleanup = () => target.removeEventListener(type, listener, options);
    stateFor(this).cleanups.push(cleanup);
    return cleanup;
  }

  reflectHostAttributes() {
    if (this.shadowRoot) applyHostAttributes(this, this.shadowRoot);
  }

  emit(name, detail = {}, options = {}) {
    return emitComponentEvent(this, name, detail, options);
  }
}

export function isComponentMounted(component) {
  return stateFor(component).mounted;
}

export function isComponentActive(component) {
  return stateFor(component).active;
}
