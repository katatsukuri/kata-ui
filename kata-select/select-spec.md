# kata-select contract

`<kata-select>` は、`<template id="kata-select-template">` で定義された骨格を Light DOM に展開する Custom Element です。

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
