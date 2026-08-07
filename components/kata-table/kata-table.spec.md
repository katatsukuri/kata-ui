# kata-table contract

`<kata-table>` は、`<template id="kata-table-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に、`template` 属性で指定したID（省略時は `kata-table-template`）を持つ `<template>` が1つ存在すること
2. `<template>` の内容は、少なくとも1つの `<tbody>` を含む `<table>` 構造であること
3. サーバーは `<kata-table>` の展開後に生成される `<tbody>` へ行 HTML（`<tr>...</tr>`）を返すこと
4. サーバーが `<kata-table>` 自体を返す場合は、`<tbody>` ではなく、templateを含まない外側の通常コンテナへ挿入すること

## 属性

| 属性名     | 必須 | デフォルト値             | 説明                                   |
| ---------- | ---- | ------------------------ | -------------------------------------- |
| `template` | 任意 | `kata-table-template`    | 使用する `<template>` 要素の `id` 値   |

## 基本的な使い方

```html
<template id="kata-table-template">
  <table class="kata-table">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Role</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</template>

<kata-table></kata-table>
```

## コンポーネントと行の二段階取得

コンポーネントを必要に応じて切り替える場合、次の2リクエストに分けます。

1. コンポーネント取得APIは、外側の交換領域へ `<kata-table template="...">` を返す
2. 選択されたtemplate内の `<tbody>` が、行取得APIから `<tr>` を取得する

利用候補のtemplateは交換領域の外側に置きます。これにより、コンポーネントを交換しても骨格定義はページ内に残ります。

```html
<template id="users-table-template">
  <table class="kata-table">
    <thead><tr><th scope="col">Name</th><th scope="col">Role</th></tr></thead>
    <tbody hx-get="/api/users/rows" hx-trigger="load" hx-target="this" hx-swap="innerHTML"></tbody>
  </table>
</template>

<template id="kata-table-maintainers-template">
  <table class="kata-table">
    <thead><tr><th scope="col">Maintainer</th><th scope="col">Role</th></tr></thead>
    <tbody hx-get="/api/maintainers/rows" hx-trigger="load" hx-target="this" hx-swap="innerHTML"></tbody>
  </table>
</template>

<button hx-get="/api/table?view=users" hx-target="#table-host" hx-swap="innerHTML">All users</button>
<button hx-get="/api/table?view=maintainers" hx-target="#table-host" hx-swap="innerHTML">Maintainers</button>

<div id="table-host"
     hx-get="/api/table?view=users"
     hx-trigger="load"
     hx-target="this"
     hx-swap="innerHTML"></div>
```

コンポーネント取得APIの応答例:

```html
<kata-table template="users-table-template"></kata-table>
```

行取得APIの応答例:

```html
<tr><td>Alice</td><td>Developer</td></tr>
<tr><td>Bob</td><td>Designer</td></tr>
```

`<kata-table>` の子要素は初期化時にtemplateの内容へ置き換えられます。コンポーネント取得APIの応答へ行を直接含めず、行取得APIから返してください。

## HTMX との組み合わせ

`hx-get` / `hx-target` / `hx-swap` を `<tbody>` に付与することで、ページロード時に行データを自動取得できます。

```html
<template id="kata-table-template">
  <table class="kata-table">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Role</th>
      </tr>
    </thead>
    <tbody hx-get="/api/rows" hx-target="this" hx-swap="innerHTML" hx-trigger="load"></tbody>
  </table>
</template>

<kata-table></kata-table>
```

## 複数テーブルを同一ページで使う

`template` 属性で別の `<template>` を指定することで、1 ページに複数の独立したテーブルを配置できます。

```html
<template id="users-table-template"> … </template>
<template id="orders-table-template"> … </template>

<kata-table template="users-table-template"></kata-table>
<kata-table template="orders-table-template"></kata-table>
```

## サーバーサイドテンプレートの利用例

各フレームワークのテンプレートエンジンで `<template>` と `<kata-table>` を出力する例を
`examples/` フォルダーに用意しています。

| フォルダー          | フレームワーク              |
| ------------------- | --------------------------- |
| `examples/static/`  | 静的 HTML（バニラ JS）      |
| `examples/razor/`   | ASP.NET Core Razor Pages    |
| `examples/ejs/`     | Express + EJS               |
| `examples/django/`  | Django テンプレート          |

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない

## CSS カスタマイズ

`kata-table.css` が提供するスタイルは CSS カスタムプロパティで上書きできます。

| カスタムプロパティ                 | デフォルト値  | 説明                         |
| ---------------------------------- | ------------- | ---------------------------- |
| `--kata-table-border-color`        | `#dfe3e6`     | セル下境界線の色             |
| `--kata-table-header-bg`           | `transparent` | ヘッダー行の背景色           |
| `--kata-table-hover-bg`            | `#f5f5f5`     | 行ホバー時の背景色           |
