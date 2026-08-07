# kata-breadcrumb contract

`<kata-breadcrumb>` は、`<template id="kata-breadcrumb-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-breadcrumb-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容はナビゲーションを示す `<nav aria-label="パンくずリスト">` を含むこと
3. リスト要素（`<ol>` または `<ul>`）で項目を構成すること
4. 現在のページは `aria-current="page"` でマークアップすること

## 例

```html
<template id="kata-breadcrumb-template">
  <nav aria-label="パンくずリスト">
    <ol>
      <li><a href="/">ホーム</a></li>
      <li aria-hidden="true" data-breadcrumb-separator>/</li>
      <li><a href="/products">製品</a></li>
      <li aria-hidden="true" data-breadcrumb-separator>/</li>
      <li aria-current="page">詳細</li>
    </ol>
  </nav>
</template>

<kata-breadcrumb></kata-breadcrumb>
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
