import { queryComponent } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/component-base.js';

const OBSERVED_ATTRIBUTES = ['type', 'data', 'options'];
const DEFAULT_TEMPLATE_ID = 'kata-chart-template';

export class KataChartElement extends KataComponent {
  static templateId = DEFAULT_TEMPLATE_ID;
  static moduleUrl = import.meta.url;
  #chart = null;
  #canvas = null;

  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }

  mount() {
    this.#canvas = queryComponent(this, '[data-chart-canvas]');
    if (!this.#canvas) {
      throw new Error('[kata-chart] Template requires [data-chart-canvas].');
    }
  }

  connect() {
    this.#render();
  }

  disconnect() {
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
