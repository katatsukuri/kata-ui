# kata-checkbox contract

`<kata-checkbox>` は、`<template id="kata-checkbox-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-checkbox-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<input type="checkbox">` を含むこと
3. アクセシビリティのため `<label>` と `<input>` を関連付けること（`for`/`id` による明示的な関連付け、または `<label>` で `<input>` を包む暗黙的な関連付けのいずれも可）

## 例

```html
<template id="kata-checkbox-template">
  <label>
    <input type="checkbox" name="agree">
    利用規約に同意する
  </label>
</template>

<kata-checkbox></kata-checkbox>
```

## カスタムテンプレートの指定

`template` 属性で別テンプレートを指定できます。

```html
<kata-checkbox template="kata-checkbox-disabled-template"></kata-checkbox>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
