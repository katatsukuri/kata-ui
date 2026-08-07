# kata-card contract

`<kata-card>` は、`<template id="kata-card-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-card-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `.kata-card` クラスを持つ要素を含むこと

## 推奨構造

| クラス | 役割 |
|---|---|
| `.kata-card` | カード外枠 |
| `.kata-card__header` | タイトル・説明文エリア |
| `.kata-card__title` | カードタイトル |
| `.kata-card__description` | サブテキスト |
| `.kata-card__content` | 本文エリア |
| `.kata-card__footer` | フッターエリア |

## 例

```html
<template id="kata-card-template">
  <div class="kata-card">
    <div class="kata-card__header">
      <h2 class="kata-card__title">タイトル</h2>
      <p class="kata-card__description">説明文</p>
    </div>
    <div class="kata-card__content">
      <p>カードの本文</p>
    </div>
  </div>
</template>

<kata-card></kata-card>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- 利用者に見える表示データはslotで渡し、値、URL、フォーム名、状態などの構成値だけを属性で渡す。
- Light DOMの有無にかかわらず正規`template`を必ず複製し、UI構造、CSSおよびARIAをShadow DOM内に保持する。
- 表示データは次のslotへ投影し、未指定時だけtemplateのフォールバック内容を表示する: `title`、`description`、default、`action`
- `name`、`value`、`href`、状態などネイティブ要素の設定値は属性で渡せるが、表示文言を属性から内部DOMへ転記しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
