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
- ラベル、値、状態などの単純データは利用側の属性で渡す。
- 意味または構造を持つHTMLはdefault／named `slot`で渡し、子HTMLがある場合はtemplateの既定内容を重複表示しない。
- 子HTMLがない場合は正規`template`を複製し、利用側の属性を既定骨格へ反映する。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
