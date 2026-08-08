export class PageController {
  #disposers = [];

  constructor(state) {
    this.state = state;
  }

  subscribe(callback, options) {
    const dispose = this.state.subscribe(callback, options);
    this.#disposers.push(dispose);
    return dispose;
  }

  listen(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    const dispose = () => target.removeEventListener(type, listener, options);
    this.#disposers.push(dispose);
    return dispose;
  }

  dispose() {
    for (const dispose of this.#disposers.splice(0).reverse()) dispose();
  }
}
