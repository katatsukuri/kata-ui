# kata-popover contract

`<kata-popover>` は、`<template id="kata-popover-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。ネイティブの Popover API (`popover` 属性 / `showPopover()` / `hidePopover()`) を使用します。

## 必須条件

1. 画面内に `id="kata-popover-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容はポップオーバー本体として機能する要素 (`data-popover-content`) と、それを開くトリガー要素 (`data-popover-trigger`) を含むこと
3. ポップオーバーを開閉するトリガーは `data-popover-trigger` 属性を持つ要素であること
4. ポップオーバー本体は `data-popover-content` 属性を持つ要素であること

## 動作

- トリガーをクリックするとポップオーバーが表示される
- ポップオーバーが表示されているとき、再度トリガーをクリックすると閉じる（トグル動作）
- ポップオーバーが表示されているとき、ポップオーバー外をクリックすると閉じる
- `data-placement` 属性で表示位置を指定できる（`bottom`・`top`・`left`・`right`、デフォルト: `bottom`）

## アクセシビリティ

- トリガーボタンに `aria-expanded` を設定すること（open 時は `"true"`、closed 時は `"false"`）
- トリガーボタンに `aria-controls` を設定し、ポップオーバー本体の `id` を参照すること
- ポップオーバー本体に `role="dialog"` または `role="tooltip"` を設定すること

## 属性

| 属性 | デフォルト | 説明 |
|------|-----------|------|
| `template` | `"kata-popover-template"` | 使用する `<template>` の `id` |
| `data-placement` | `"bottom"` | ポップオーバーの表示位置 (`top` / `bottom` / `left` / `right`) |

## data-state

`<kata-popover>` 要素の `data-state` 属性が状態を反映します。

| 値 | 説明 |
|----|------|
| `"open"` | ポップオーバーが表示されている |
| `"closed"` | ポップオーバーが非表示 |

## 例

```html
<template id="kata-popover-template">
  <button type="button" data-popover-trigger aria-expanded="false">
    情報を表示
  </button>
  <div data-popover-content role="dialog" aria-label="詳細情報">
    <p>ここにポップオーバーの内容が入ります。</p>
  </div>
</template>

<kata-popover data-placement="bottom"></kata-popover>
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
