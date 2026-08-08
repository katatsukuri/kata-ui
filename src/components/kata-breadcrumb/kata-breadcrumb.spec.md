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
- 利用者に見える表示データはslotで渡し、値、URL、フォーム名、状態などの構成値だけを属性で渡す。
- Light DOMの有無にかかわらず正規`template`を必ず複製し、UI構造、CSSおよびARIAをShadow DOM内に保持する。
- 任意件数の`li`をdefault slotへ渡す。リンク先は各`a[href]`、現在地は`li[aria-current="page"]`で表す。
- `name`、`value`、`href`、状態などネイティブ要素の設定値は属性で渡せるが、表示文言を属性から内部DOMへ転記しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
