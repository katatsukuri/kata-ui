# kata-accordion contract

`<kata-accordion>` は、1項目分の共通templateを利用側の子要素数だけ複製し、見出しと初期状態を属性、本文HTMLを項目別slotから受け取るopen Shadow DOM Custom Elementです。

## 必須条件

1. 画面内に`id="kata-accordion-template"`を持つ`<template>`が1つ存在すること
2. templateは`data-accordion-item`、`data-accordion-trigger`、`data-accordion-content`、`data-accordion-content-slot`を各1つ持つこと
3. `<kata-accordion>`の直下に1つ以上の項目要素を配置すること
4. 各項目要素は`data-accordion-title`属性を持つこと

## 利用側の属性

| 対象 | 属性 | 説明 |
|---|---|---|
| `<kata-accordion>` | `multiple` | 複数パネルの同時展開を許可する |
| 各子要素 | `data-accordion-title` | トリガーボタンへ表示する見出し |
| 各子要素 | `data-state="open"` | 初期表示を開いた状態にする |
| 各子要素 | `data-state="closed"`または省略 | 初期表示を閉じた状態にする |

利用側の子要素に含まれるHTMLは、生成された項目に固有のslotへ投影されます。開閉操作後は、利用側子要素の`data-state`も現在状態へ同期します。

## 初期状態

- `multiple`がない場合、複数項目が`open`を指定しても最初の1項目だけを開く
- `multiple`がある場合、`open`を指定した全項目を開く
- その他の項目は`closed`へ正規化する

## アクセシビリティ

- Componentは項目ごとに一意なトリガーIDとコンテンツIDを生成する
- トリガーへ`aria-expanded`と`aria-controls`を設定する
- コンテンツへ`role="region"`と`aria-labelledby`を設定する

## 例

```html
<template id="kata-accordion-template">
  <div data-accordion-item data-state="closed">
    <button type="button" data-accordion-trigger aria-expanded="false"></button>
    <div data-accordion-content role="region" hidden>
      <slot data-accordion-content-slot></slot>
    </div>
  </div>
</template>

<kata-accordion>
  <section data-accordion-title="kata-uiとは何ですか？" data-state="open">
    ビルドレス・フレームワークレスなWebコンポーネント集です。
  </section>
  <section data-accordion-title="Reactなしで使えますか？">
    はい。scriptタグを読み込むだけで利用できます。
  </section>
</kata-accordion>
```

## エラー条件

- 対応するtemplateが見つからない場合、初期化時にエラーを送出する
- 利用側項目が1つもない場合、初期化時にエラーを送出する
- `data-accordion-title`がない項目を含む場合、初期化時にエラーを送出する

## Shadow DOM・slot・属性契約

- 項目のフレームはComponentのShadow DOMで所有する。
- 見出しと初期状態は利用側属性で渡す。
- 本文は利用側HTMLを項目別slotへ投影し、HTML文字列を属性へ格納しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
