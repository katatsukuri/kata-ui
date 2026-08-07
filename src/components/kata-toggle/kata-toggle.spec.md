# kata-toggle contract

`<kata-toggle>` は、`<template id="kata-toggle-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-toggle-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容に `data-toggle-track` 属性を持つ要素（トラック）が1つ含まれること
3. トラック内に `data-toggle-thumb` 属性を持つ要素（サム）が1つ含まれること
4. トラックには `role="switch"` および `aria-checked` を設定すること

## 属性

| 属性 | 説明 |
|---|---|
| `checked` | 初期状態をオン（checked）にする |
| `disabled` | トグルを無効化する |
| `template` | 使用するテンプレートの ID を指定する（省略時は `kata-toggle-template`） |

## 状態

- `data-state="checked"` のとき ON 状態
- `data-state="unchecked"` のとき OFF 状態
- 状態に応じて `aria-checked` が `"true"` または `"false"` に更新される

## イベント

- トグルがクリックまたは `Space` / `Enter` キーで操作されたとき、`change` カスタムイベントを `detail: { checked: boolean }` 付きで発火する

## アクセシビリティ

- `data-toggle-track` には `role="switch"` および `tabindex="0"` を設定すること
- `disabled` 属性が付いている場合は `aria-disabled="true"` を設定し、操作を無効化すること

## 例

```html
<template id="kata-toggle-template">
  <button type="button" data-toggle-track role="switch"
          aria-checked="false" tabindex="0">
    <span data-toggle-thumb></span>
  </button>
</template>

<kata-toggle></kata-toggle>
<kata-toggle checked></kata-toggle>
<kata-toggle disabled></kata-toggle>
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
