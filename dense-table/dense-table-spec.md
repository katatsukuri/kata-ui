# dense-table contract

`<dense-table>` は、`<template id="dense-table-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="dense-table-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は、少なくとも1つの `<tbody>` を含む `<table>` 構造であること
3. サーバーは `<dense-table>` の展開後に生成される `<tbody>` へ行HTML（`<tr>...</tr>`）を返すこと

## 例

```html
<template id="dense-table-template">
  <table class="dense-table">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Role</th>
      </tr>
    </thead>
    <tbody hx-target="this" hx-swap="innerHTML"></tbody>
  </table>
</template>

<dense-table></dense-table>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
