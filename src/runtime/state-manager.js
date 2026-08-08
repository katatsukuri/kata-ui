export class PageState {
  #state;
  #listeners = new Set();

  constructor(initial = {}) {
    this.#state = { ...initial };
  }

  get(key) {
    return this.#state[key];
  }

  snapshot() {
    return { ...this.#state };
  }

  set(key, value) {
    if (Object.is(this.#state[key], value)) return false;
    this.#state[key] = value;
    this.#notify();
    return true;
  }

  update(values) {
    const changed = Object.entries(values).some(([key, value]) => !Object.is(this.#state[key], value));
    if (!changed) return false;
    Object.assign(this.#state, values);
    this.#notify();
    return true;
  }

  subscribe(callback, { immediate = false } = {}) {
    this.#listeners.add(callback);
    if (immediate) callback(this.snapshot());
    return () => this.#listeners.delete(callback);
  }

  #notify() {
    const snapshot = this.snapshot();
    for (const listener of this.#listeners) listener(snapshot);
  }
}
