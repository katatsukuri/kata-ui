# kata-pagination contract

`<kata-pagination>` は、`<template id="kata-pagination-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-pagination-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容はナビゲーションを示す `<nav aria-label="ページネーション">` を含むこと
3. 現在のページは `aria-current="page"` でマークアップすること
4. 無効なページボタン（前へ/次へ等）は `aria-disabled="true"` でマークアップすること

## 例

```html
<template id="kata-pagination-template">
  <nav aria-label="ページネーション">
    <ol>
      <li><a href="?page=1" aria-label="前のページ">&laquo;</a></li>
      <li><a href="?page=1">1</a></li>
      <li><a href="?page=2" aria-current="page">2</a></li>
      <li><a href="?page=3">3</a></li>
      <li><a href="?page=3" aria-label="次のページ">&raquo;</a></li>
    </ol>
  </nav>
</template>

<kata-pagination></kata-pagination>
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
