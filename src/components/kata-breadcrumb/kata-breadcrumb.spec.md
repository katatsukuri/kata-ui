# kata-breadcrumb contract

`<kata-breadcrumb>` は、`<template id="kata-breadcrumb-template">` で定義された骨格を Light DOM に展開する Custom Element です。

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
