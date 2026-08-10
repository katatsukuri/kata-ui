# kata-sheet

`<kata-sheet>`は、overlay付きのスライドインパネルを表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-sheet side="right">
  <span slot="trigger">設定を開く</span>
  <span slot="title">設定</span>
  <label>表示名 <input name="display-name"></label>
  <span slot="cancel">キャンセル</span>
  <span slot="confirm">保存</span>
</kata-sheet>
```

## 必須要件

- `kata-sheet-template`がある
- template内に`data-sheet-trigger`、`data-sheet-panel`、`data-sheet-overlay`、`data-sheet-close`がある

## 属性とslot

| 契約 | 説明 |
| --- | --- |
| `side` | `left`／`right`。省略時はright |
| `hide-confirm` | confirm操作を非表示にするBoolean属性 |
| `trigger`／`title` | 開く操作と見出し |
| default | 本文HTML |
| `cancel`／`confirm` | フッターの操作名 |

旧`template="kata-sheet-left-template"`は`side="left" hide-confirm`へ変換する互換aliasです。

## 状態と動作

triggerで開き、close操作、overlayクリック、Escapeで閉じます。hostの`data-state`、panelとoverlayの`hidden`を同期し、開いたときpanel内の最初のフォーカス可能要素へfocusします。

## アクセシビリティ

panelは`role="dialog"`、`aria-modal="true"`、`aria-labelledby`を持ちます。現在の実装は完全なフォーカストラップとtriggerへのフォーカス復帰を提供しないため、必要な画面ではPage Runtimeまたは追加実装で補います。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
