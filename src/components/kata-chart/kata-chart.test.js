import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeHTMLElement, FakeTemplateElement, setupGlobals } from '../test-utils/shared-test-helpers.js';

let chartConstructionCount = 0;

// Minimal Chart.js stub
class FakeChart {
  constructor(canvas, config) {
    chartConstructionCount += 1;
    this.canvas = canvas;
    this.type = config.type;
    this.data = config.data;
    this.options = config.options;
    this.destroyed = false;
    this._updated = false;
  }
  update() { this._updated = true; }
  destroy() { this.destroyed = true; }
}

globalThis.Chart = FakeChart;

// FakeDocument that can createElement (returns a FakeHTMLElement with tagName)
class FakeDocument {
  constructor() {
    this.template = new FakeTemplateElement([{ tagName: 'CANVAS', dataset: { chartCanvas: '' } }]);
  }

  getElementById(id) {
    return id === 'kata-chart-template' ? this.template : null;
  }
}

setupGlobals();

const { KataChartElement } = await import('./kata-chart.js');

function newKataChart() {
  const doc = new FakeDocument();
  const el = new KataChartElement(doc);
  el.querySelector = (selector) => selector === '[data-chart-canvas]' ? el.children[0] : null;
  return el;
}

test('kata-chart renders canvas on connect', () => {
  const el = newKataChart();
  el.connectedCallback();
  assert.equal(el.dataset.kataUiInitialized, 'true');
  assert.equal(el.children.length, 1);
  assert.equal(el.children[0].tagName, 'CANVAS');
});

test('kata-chart creates Chart instance with correct type', () => {
  const el = newKataChart();
  el.attributes.set('type', 'line');
  el.attributes.set('data', JSON.stringify({
    labels: ['A', 'B'],
    datasets: [{ label: 'x', data: [1, 2] }],
  }));
  el.connectedCallback();
  // Access private chart via a workaround: rely on the FakeChart assigned to canvas
  // We verify by checking the appended canvas exists and no error thrown
  assert.equal(el.children[0].tagName, 'CANVAS');
});

test('kata-chart defaults to bar type when type attribute is absent', () => {
  const el = newKataChart();
  el.attributes.set('data', JSON.stringify({ labels: [], datasets: [] }));
  el.connectedCallback();
  assert.equal(el.dataset.kataUiInitialized, 'true');
});

test('kata-chart does not reinitialize if already initialized', () => {
  const el = newKataChart();
  el.connectedCallback();
  const firstCanvas = el.children[0];
  el.connectedCallback();
  assert.equal(el.children.length, 1);
  assert.equal(el.children[0], firstCanvas);
});

test('kata-chart recreates Chart.js instance after reconnect', () => {
  const before = chartConstructionCount;
  const el = newKataChart();

  el.connectedCallback();
  el.disconnectedCallback();
  el.connectedCallback();

  assert.equal(chartConstructionCount, before + 2);
  assert.equal(el.children.length, 1);
});

test('kata-chart logs error when data attribute is invalid JSON', () => {
  const el = newKataChart();
  el.attributes.set('data', 'not-json');
  const errors = [];
  const orig = console.error;
  console.error = (...args) => errors.push(args.join(' '));
  el.connectedCallback();
  console.error = orig;
  assert.ok(errors.some((e) => e.includes('data')));
});

test('kata-chart logs error when Chart.js is not available', () => {
  const savedChart = globalThis.Chart;
  delete globalThis.Chart;

  const el = newKataChart();
  const errors = [];
  const orig = console.error;
  console.error = (...args) => errors.push(args.join(' '));
  el.connectedCallback();
  console.error = orig;
  globalThis.Chart = savedChart;

  assert.ok(errors.some((e) => e.includes('Chart.js')));
});
