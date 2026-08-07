# kata-dropdown-menu contract

`<kata-dropdown-menu>` は、`<template id="kata-dropdown-menu-template">` で定義された骨格を Light DOM に展開する Custom Element です。

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
