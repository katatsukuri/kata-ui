# kata-select contract

`<kata-select>` は、`<template id="kata-select-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-select-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<select>` 要素を含むこと
3. アクセシビリティのため `<label>` と `<select>` を `for`/`id` で関連付けること

## 例

```html
<template id="kata-select-template">
  <label for="color-field">色</label>
  <select id="color-field" name="color">
    <option value="">選択してください</option>
    <option value="red">赤</option>
    <option value="green">緑</option>
    <option value="blue">青</option>
  </select>
</template>

<kata-select></kata-select>
```

## カスタムテンプレート

`template` 属性で別のテンプレート ID を指定できます。

```html
<kata-select template="my-select-template"></kata-select>
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
