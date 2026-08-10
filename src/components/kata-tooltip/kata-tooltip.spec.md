# kata-tooltip

`<kata-tooltip>`は、triggerへのhoverまたはfocus中に短い補足文を表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-tooltip side="top">
  <span slot="trigger">保存</span>
  入力内容を保存します
</kata-tooltip>
```

## 必須要件

- `kata-tooltip-template`がある
- template内に`.kata-tooltip__trigger`と`.kata-tooltip__content[role="tooltip"]`がある
- triggerの`aria-describedby`がcontentのIDを参照する

## 属性とslot

| 契約 | 説明 |
| --- | --- |
| `side` | `top`／`bottom`／`left`／`right`。省略時はtop |
| `trigger` slot | triggerの表示内容 |
| default slot | tooltip本文 |

旧`kata-tooltip-*-template`は対応する`side`へ変換する互換aliasです。

## 状態と動作

`mouseenter`／`focusin`で開き、`mouseleave`／`focusout`で閉じます。hostとcontentの`data-state`を同期し、contentの`data-side`へ配置を反映します。

## アクセシビリティ

tooltipは補助説明に限定し、操作要素を入れません。trigger自体の意味が伝わる表示またはアクセシブル名を用意してください。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
