const ADAPTER_STATE = new WeakMap();

export function processHtmxRoot(root) {
  if (!root) return false;
  const process = globalThis.htmx?.process;
  if (typeof process !== 'function') return false;
  process(root);
  return true;
}

export function processComponentRoots(root = document) {
  const candidates = [root, ...(root.querySelectorAll?.('*') ?? [])];
  let count = 0;
  for (const element of candidates) {
    if (element?.shadowRoot && processHtmxRoot(element.shadowRoot)) count += 1;
  }
  return count;
}

export class HtmxAdapter {
  constructor(root = document) {
    this.root = root;
    this.pendingRequests = 0;
    this.cleanups = [];
  }

  initialize() {
    if (ADAPTER_STATE.has(this.root)) return ADAPTER_STATE.get(this.root);

    this.#listen('htmx:beforeRequest', () => this.#setLoading(1));
    this.#listen('htmx:afterRequest', () => this.#setLoading(-1));
    this.#listen('htmx:responseError', (event) => {
      this.root.dispatchEvent?.(new CustomEvent('kata-htmx-error', {
        detail: event.detail,
        bubbles: true,
      }));
    });
    this.#listen('htmx:afterSwap', (event) => {
      const target = event.detail?.target ?? event.target;
      processComponentRoots(target);
      target?.querySelector?.('[data-focus-after-swap]')?.focus?.();
    });

    const dispose = () => this.dispose();
    ADAPTER_STATE.set(this.root, dispose);
    return dispose;
  }

  dispose() {
    for (const cleanup of this.cleanups.splice(0).reverse()) cleanup();
    this.pendingRequests = 0;
    this.#applyLoading();
    ADAPTER_STATE.delete(this.root);
  }

  #listen(type, listener) {
    this.root.addEventListener(type, listener);
    this.cleanups.push(() => this.root.removeEventListener(type, listener));
  }

  #setLoading(delta) {
    this.pendingRequests = Math.max(0, this.pendingRequests + delta);
    this.#applyLoading();
  }

  #applyLoading() {
    const body = this.root.body;
    if (!body) return;
    if (this.pendingRequests > 0) body.dataset.loading = 'true';
    else delete body.dataset.loading;
  }
}
