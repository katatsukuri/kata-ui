# kata-chart

`<kata-chart>`は、利用側が読み込んだChart.jsを使ってShadow DOM内のcanvasへグラフを描画するCustom Elementです。Chart.jsは本コンポーネントへ同梱しません。

## 利用例

```html
<kata-chart
  type="bar"
  data='{
    "labels": ["1月", "2月", "3月"],
    "datasets": [{ "label": "売上", "data": [100, 200, 150] }]
  }'
>
  <span slot="fallback">グラフを表示できません。</span>
</kata-chart>
```

## 必須要件

- `kata-chart-template`がある
- template内に`canvas[data-chart-canvas]`がある
- `globalThis.Chart`としてChart.jsを解決できる
- 利用側が[architecture-manifest.json](../../../architecture-manifest.json)と同じ検証済みバージョンを固定して読み込む

## 属性

| 属性 | 既定値 | 説明 |
| --- | --- | --- |
| `type` | `bar` | Chart.jsへ渡すグラフ種別 |
| `data` | 空のlabels／datasets | Chart.jsのdataを表すJSON文字列 |
| `options` | `{}` | Chart.jsのoptionsを表すJSON文字列 |
| `template` | `kata-chart-template` | 使用するtemplate ID |

`type`、`data`、`options`の変更は`attributeChangedCallback()`で検知し、接続済みであれば再描画します。

## slot

`fallback` slotはcanvasの代替内容です。グラフが伝える要点や同じデータの表を周辺にも提供し、視覚的なグラフだけを情報の唯一の手段にしないでください。

## メソッド

| メソッド | 動作 |
| --- | --- |
| `setData(data)` | 既存Chartインスタンスのdataを更新する |
| `setOptions(options)` | 既存Chartインスタンスのoptionsを更新する |
| `destroy()` | Chartインスタンスを破棄する |

切断時は`destroy()`を呼び、再接続時に現在属性から描画し直します。

## エラー

- templateまたはcanvasがない場合は初期化エラーを送出する
- Chart.jsがない場合はconsole errorを出力し、描画しない
- `data`または`options`が不正なJSONの場合はconsole errorを出力し、描画しない
