const OBSERVED_ATTRIBUTES = ['type', 'data', 'options'];

export class KataChartElement extends HTMLElement {
  #chart = null;
  #canvas = null;

  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }

  connectedCallback() {
    if (this.dataset.kataUiInitialized === 'true') {
      return;
    }

    this.#canvas = this.ownerDocument.createElement('canvas');
    this.appendChild(this.#canvas);
    this.dataset.kataUiInitialized = 'true';
    this.#render();
  }

  disconnectedCallback() {
    this.destroy();
  }

  attributeChangedCallback(_name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    if (this.dataset.kataUiInitialized === 'true') {
      this.#render();
    }
  }

  setData(data) {
    if (this.#chart) {
      this.#chart.data = data;
      this.#chart.update();
    }
  }

  setOptions(options) {
    if (this.#chart) {
      this.#chart.options = options;
      this.#chart.update();
    }
  }

  destroy() {
    if (this.#chart) {
      this.#chart.destroy();
      this.#chart = null;
    }
  }

  #resolveChart() {
    if (typeof globalThis.Chart !== 'undefined') {
      return globalThis.Chart;
    }
    return null;
  }

  #render() {
    const ChartConstructor = this.#resolveChart();
    if (!ChartConstructor) {
      console.error('[kata-chart] Chart.js (window.Chart) が見つかりません。');
      return;
    }

    const type = this.getAttribute('type') || 'bar';

    let data;
    try {
      const raw = this.getAttribute('data');
      data = raw ? JSON.parse(raw) : { labels: [], datasets: [] };
    } catch {
      console.error('[kata-chart] "data" 属性の JSON が不正です。');
      return;
    }

    let options;
    try {
      const raw = this.getAttribute('options');
      options = raw ? JSON.parse(raw) : {};
    } catch {
      console.error('[kata-chart] "options" 属性の JSON が不正です。');
      return;
    }

    if (this.#chart) {
      this.#chart.destroy();
      this.#chart = null;
    }

    this.#chart = new ChartConstructor(this.#canvas, { type, data, options });
  }
}

if (!customElements.get('kata-chart')) {
  customElements.define('kata-chart', KataChartElement);
}
