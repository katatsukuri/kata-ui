function resolve(target, root) {
  return typeof target === 'string' ? root.querySelector(target) : target;
}

export class LayoutController {
  static setHidden(target, hidden, root = globalThis.document) {
    const element = resolve(target, root);
    if (!element) return false;
    element.hidden = Boolean(hidden);
    return true;
  }

  static show(target, root = globalThis.document) {
    return this.setHidden(target, false, root);
  }

  static hide(target, root = globalThis.document) {
    return this.setHidden(target, true, root);
  }

  static toggle(target, root = globalThis.document) {
    const element = resolve(target, root);
    if (!element) return false;
    element.hidden = !element.hidden;
    return true;
  }

  static setMode(target, mode, root = globalThis.document) {
    const element = resolve(target, root);
    if (!element) return false;
    if (mode == null) delete element.dataset.mode;
    else element.dataset.mode = String(mode);
    return true;
  }
}
