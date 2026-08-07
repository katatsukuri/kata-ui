# kata-accordion contract

`<kata-accordion>`は項目間の排他制御を担当し、`<kata-accordion-item>`は1項目分のUI構造、ARIA、状態と開閉操作を担当するopen Shadow DOM Custom Elementです。利用者はLight DOMへタイトルと本文データだけを配置します。

## 必須条件

1. 画面内に`id="kata-accordion-template"`と`id="kata-accordion-item-template"`を持つ`<template>`が各1つ存在すること
2. item templateは`data-accordion-trigger`と`data-accordion-content`を各1つ持つこと
3. `<kata-accordion>`の直下に1つ以上の`<kata-accordion-item>`を配置すること

## 利用側の属性

| 対象 | 属性 | 説明 |
|---|---|---|
| `<kata-accordion>` | `multiple` | 複数パネルの同時展開を許可する |
| `<kata-accordion-item>` | `data-state="open"` | 初期表示を開いた状態にする |
| `<kata-accordion-item>` | `data-state="closed"`または省略 | 初期表示を閉じた状態にする |
| タイトル要素 | `slot="title"` | トリガーボタンへタイトルを投影する。省略時はtemplateのデフォルトタイトルを表示する |

タイトルは名前付きslot、本文HTMLはデフォルトslotへブラウザの標準slot機構で投影されます。項目別slot名のJS生成は行いません。

## 初期状態と開閉

- `multiple`がない場合、複数項目が`open`を指定しても最初の1項目だけを開く
- `multiple`がある場合、`open`を指定した全項目を開く
- 子は自身の操作で`data-state`、`aria-expanded`、本文の`hidden`を同期する
- 親は子が開いた通知を受け、`multiple`がなければ他の子を閉じる

## アクセシビリティ

- トリガーの`button`、`aria-expanded`、`aria-controls`はitem templateで一元管理する
- 本文の`role="region"`と`aria-labelledby`もitem templateで一元管理する
- `trigger`と`content`のIDは各itemのShadow DOM内に閉じるため、利用者によるID管理は不要とする
- 開閉アイコンは`aria-hidden="true"`とする

## 例

```html
<template id="kata-accordion-template">
  <slot></slot>
</template>

<template id="kata-accordion-item-template">
  <div class="kata-accordion__item">
    <button id="trigger" type="button" class="kata-accordion__trigger"
            data-accordion-trigger aria-expanded="false" aria-controls="content">
      <slot name="title">デフォルトタイトル</slot>
      <span class="kata-accordion__icon" aria-hidden="true">▼</span>
    </button>
    <div id="content" class="kata-accordion__content" data-accordion-content
         role="region" aria-labelledby="trigger" hidden>
      <slot></slot>
    </div>
  </div>
</template>

<kata-accordion>
  <kata-accordion-item data-state="open">
    <span slot="title">kata-uiとは何ですか？</span>
    <p>ビルドレス・フレームワークレスなWebコンポーネント集です。</p>
  </kata-accordion-item>
  <kata-accordion-item data-state="closed">
    <span slot="title">Reactなしで使えますか？</span>
    <p>はい。scriptタグを読み込むだけで利用できます。</p>
  </kata-accordion-item>
</kata-accordion>
```

## エラー条件

- item templateが見つからない場合、子の初期化時にエラーを送出する
- 利用側項目が1つもない場合、親の初期化時にエラーを送出する
- `<kata-accordion>`直下に`<kata-accordion-item>`以外の要素がある場合、初期化時にエラーを送出する

## Shadow DOM・slot・属性契約

- 親のShadow DOMは子要素をデフォルトslotへ投影する。
- 各項目の共通UIフレームは子のShadow DOMで所有する。
- タイトルと本文だけをLight DOMからslotへ投影し、HTML文字列を属性へ格納しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
