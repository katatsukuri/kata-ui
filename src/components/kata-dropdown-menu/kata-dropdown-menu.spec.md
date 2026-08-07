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
- ラベル、値、状態などの単純データは利用側の属性で渡す。
- 意味または構造を持つHTMLはdefault／named `slot`で渡し、子HTMLがある場合はtemplateの既定内容を重複表示しない。
- 子HTMLがない場合は正規`template`を複製し、利用側の属性を既定骨格へ反映する。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
