# kata-popover

`<kata-popover>`は、trigger操作で補足領域を開閉し、表示位置を計算するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-popover data-placement="bottom">
  <span slot="trigger">詳細</span>
  <span slot="title">補足情報</span>
  <p>操作に関する説明を表示します。</p>
</kata-popover>
```

## 必須要件

- `kata-popover-template`がある
- template内に`data-popover-trigger`と`data-popover-content`がある

## 属性とslot

| 契約 | 説明 |
| --- | --- |
| `data-placement` | `top`／`bottom`／`left`／`right`。不正値と省略時はbottom |
| `trigger` slot | 開く操作の表示名 |
| `title` slot | contentの見出し |
| default slot | content本文 |

旧`kata-popover-*-template`は対応する配置へ変換する互換aliasです。

## 状態と動作

triggerで開閉し、外側クリックで閉じます。hostの`data-state`、triggerの`aria-expanded`、contentの`hidden`を同期し、triggerの位置からfixed座標を計算します。

## アクセシビリティ

triggerの`aria-controls`はcontentのIDへ自動接続します。contentの用途に応じたroleとアクセシブル名はtemplateで定義します。現在の実装はEscape操作とフォーカストラップを提供しません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
