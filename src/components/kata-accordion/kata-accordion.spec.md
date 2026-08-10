# kata-accordion

`<kata-accordion>`は項目間の排他制御、`<kata-accordion-item>`は一項目分のUI、ARIA、開閉状態を担当するopen Shadow DOM Custom Elementsです。

## 利用例

```html
<kata-accordion>
  <kata-accordion-item data-state="open">
    <span slot="title">kata-uiとは何ですか？</span>
    <p>サーバー主導型MPA向けのWeb Component集です。</p>
  </kata-accordion-item>
  <kata-accordion-item>
    <span slot="title">複数項目を開けますか？</span>
    <p>親にmultipleを指定すると同時展開できます。</p>
  </kata-accordion-item>
</kata-accordion>
```

## 必須要件

- `kata-accordion-template`と`kata-accordion-item-template`が各1つある
- 親の直下に1つ以上の`kata-accordion-item`だけを配置する
- item templateに`data-accordion-trigger`と`data-accordion-content`が各1つある

## 属性とslot

| 対象 | 契約 | 説明 |
| --- | --- | --- |
| 親 | `multiple` | 複数項目の同時展開を許可する |
| 子 | `data-state="open"` | 初期状態を開く |
| 子 | `data-state="closed"`または省略 | 初期状態を閉じる |
| 子 | `title` slot | トリガーの表示タイトル |
| 子 | default slot | 本文HTML |

## 動作とイベント

- `multiple`がない場合、複数の初期open指定は最初の一項目だけを開く
- 子は操作時に`data-state`、`aria-expanded`、本文の`hidden`を同期する
- 子は`kata-accordion-toggle`を`detail: { open: boolean }`付きで通知する
- 親は通知を受け、`multiple`がなければ他の子を閉じる

## アクセシビリティ

triggerのbutton、`aria-expanded`、`aria-controls`、本文の`role="region"`と`aria-labelledby`はitem templateが所有します。内部IDは各itemのShadow Root内に閉じます。

## 初期化エラー

templateがない、項目が0件、直下にitem以外がある場合は初期化時にエラーを送出します。
