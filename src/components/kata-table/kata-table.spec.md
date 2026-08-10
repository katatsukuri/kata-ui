# kata-table

`<kata-table>`は、表の骨格と列見出しを正規templateから生成し、必要に応じてShadow DOM内のtbodyをHTMXで更新するopen Shadow DOM Custom Elementです。

## 基本利用例

```html
<template id="users-table-template">
  <table class="kata-table">
    <thead>
      <tr>
        <th scope="col"><slot name="column-1">Name</slot></th>
        <th scope="col"><slot name="column-2">Role</slot></th>
      </tr>
    </thead>
    <tbody
      hx-get="/api/users/rows"
      hx-trigger="load"
      hx-target="this"
      hx-swap="innerHTML"
    ></tbody>
  </table>
</template>

<kata-table template="users-table-template">
  <span slot="column-1">氏名</span>
  <span slot="column-2">役割</span>
</kata-table>
```

## 必須要件

- 指定したIDのtemplateが1つある。省略時は`kata-table-template`
- template内に`table`と`tbody`がある
- 行取得応答は`tbody`へ挿入できる`tr`だけを返す
- Custom Element自体を返す応答は、templateを含まない通常の外側コンテナへ挿入する

## 属性とslot

| 契約 | 説明 |
| --- | --- |
| `template` | 表の骨格を選ぶtemplate ID |
| `column-1` | 一列目の表示見出し |
| `column-2` | 二列目の表示見出し |

列数とslotは選択したtemplateの契約に従います。現在の標準templateは二列です。

## 二段階取得

表の種類をサーバーで切り替える場合は、コンポーネント取得と行取得を分けます。

```text
外側containerが<kata-table template="...">を取得
  → Shadow DOMへ選択した表骨格を生成
  → tbodyのhx-getが<tr>を取得
```

コンポーネント取得応答へ行を直接含めず、行取得応答から返します。利用候補のtemplateは交換領域の外側に置き、Custom Elementを交換しても定義が残るようにします。

```html
<button hx-get="/api/table?view=users" hx-target="#table-host">利用者</button>
<div id="table-host"></div>
```

コンポーネント取得応答:

```html
<kata-table template="users-table-template"></kata-table>
```

行取得応答:

```html
<tr><td>Alice</td><td>Developer</td></tr>
<tr><td>Bob</td><td>Designer</td></tr>
```

## HTMX連携

mount時にShadow Rootを`htmx.process()`へ渡します。行取得URL、target、swapはtemplate内のtbodyが所有します。利用アプリケーションは応答のエスケープ、空状態、エラー状態、ページングを扱います。

## アクセシビリティ

列見出しは`th[scope="col"]`、必要な行見出しは`th[scope="row"]`を使用します。表の目的が周辺文脈で明確でない場合はcaptionをtemplateへ追加してください。

## CSSトークン

`--kata-table-border-color`、`--kata-table-header-bg`、`--kata-table-hover-bg`を上書きできます。既定値は共通の`--kata-*`セマンティックトークンへ接続されます。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
