# kata-dropdown-menu contract

`<kata-dropdown-menu>` は、`<template id="kata-dropdown-menu-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-dropdown-menu-template"` を持つ `<template>` が1つ存在すること
2. `data-dropdown-trigger` 属性を持つ要素がトリガーとなること
3. `data-dropdown-content` 属性を持つ要素がメニューコンテンツエリアとなること

## 属性

| 属性 | 説明 |
|---|---|
| `template` | 使用するテンプレートの `id`（省略時は `kata-dropdown-menu-template`）|

## 動作

- トリガーをクリックするとメニューが開く
- 開いているときにトリガーを再度クリックするとメニューが閉じる
- メニュー外をクリックするとメニューが閉じる
- `Escape` キーを押すとメニューが閉じる
- 開閉状態はホスト要素の `data-state` 属性（`"open"` / `"closed"`）に反映される

## アクセシビリティ

- `data-dropdown-trigger` には `aria-expanded` および `aria-haspopup="menu"` を設定すること
- `data-dropdown-content` には `role="menu"` を設定すること
- メニュー項目には `role="menuitem"` を設定すること

## 例

```html
<template id="kata-dropdown-menu-template">
  <button type="button" data-dropdown-trigger
          aria-haspopup="menu" aria-expanded="false">メニューを開く</button>
  <div data-dropdown-content role="menu" hidden>
    <button type="button" role="menuitem">プロフィール</button>
    <button type="button" role="menuitem">設定</button>
    <button type="button" role="menuitem">ログアウト</button>
  </div>
</template>

<kata-dropdown-menu></kata-dropdown-menu>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- 利用者に見える表示データはslotで渡し、値、URL、フォーム名、状態などの構成値だけを属性で渡す。
- Light DOMの有無にかかわらず正規`template`を必ず複製し、UI構造、CSSおよびARIAをShadow DOM内に保持する。
- 表示データは次のslotへ投影し、未指定時だけtemplateのフォールバック内容を表示する: `trigger`、`item-1`、`item-2`、`item-3`
- `name`、`value`、`href`、状態などネイティブ要素の設定値は属性で渡せるが、表示文言を属性から内部DOMへ転記しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
