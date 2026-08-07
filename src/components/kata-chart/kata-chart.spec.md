# kata-chart contract

`<kata-chart>` は Chart.js を使用したグラフ描画 Custom Element です。  
`data` 属性（JSON）または `setData()` メソッドでデータを渡すと、template内の `<canvas>` へグラフを描画します。

## 必須条件

1. 画面内に `id="kata-chart-template"` を持つ `<template>` が存在すること
2. template内に `data-chart-canvas` 属性を持つ `<canvas>` が存在すること
3. `type` 属性でグラフ種別を指定すること（未指定時は `bar`）
4. `data` 属性に Chart.js の `data` オブジェクト（JSON 文字列）を渡すこと
5. ページに Chart.js が読み込まれていること（`window.Chart` で解決）

## 属性

| 属性 | 型 | デフォルト | 説明 |
|---|---|---|---|
| `type` | string | `bar` | Chart.js のグラフ種別（`bar`, `line`, `pie`, `doughnut`, `radar`, `polarArea`, `bubble`, `scatter`） |
| `data` | string (JSON) | — | Chart.js `data` オブジェクトの JSON 文字列 |
| `options` | string (JSON) | `{}` | Chart.js `options` オブジェクトの JSON 文字列 |
| `template` | string | `kata-chart-template` | 使用するtemplateのID |

## メソッド

| メソッド | 説明 |
|---|---|
| `setData(data)` | グラフデータを更新して再描画する |
| `setOptions(options)` | グラフオプションを更新して再描画する |
| `destroy()` | Chart.js インスタンスを破棄する |

## observedAttributes

`type`, `data`, `options` 属性の変更は `attributeChangedCallback` で検知され、グラフが自動的に更新されます。

## 例

```html
<template id="kata-chart-template">
  <canvas data-chart-canvas></canvas>
</template>

<kata-chart
  type="bar"
  data='{
    "labels": ["1月", "2月", "3月"],
    "datasets": [{
      "label": "売上",
      "data": [100, 200, 150]
    }]
  }'
></kata-chart>

<script type="module" src="/kata-ui/src/components/kata-chart/kata-chart.js"></script>
```

## エラー条件

- `data` 属性に不正な JSON が渡された場合、コンソールにエラーを出力してグラフを描画しない
- Chart.js（`window.Chart`）が見つからない場合、コンソールにエラーを出力する
- 対応するtemplateまたは`data-chart-canvas`が見つからない場合、初期化時にエラーを送出する
