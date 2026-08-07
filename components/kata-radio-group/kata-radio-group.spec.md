# kata-radio-group contract

`<kata-radio-group>` は、`<template id="kata-radio-group-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-radio-group-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<input type="radio">` を1つ以上含むこと
3. アクセシビリティのため `<fieldset>` と `<legend>` で選択肢をグループ化すること

## 例

```html
<template id="kata-radio-group-template">
  <fieldset>
    <legend>性別</legend>
    <label><input type="radio" name="gender" value="male"> 男性</label>
    <label><input type="radio" name="gender" value="female"> 女性</label>
    <label><input type="radio" name="gender" value="other"> その他</label>
  </fieldset>
</template>

<kata-radio-group></kata-radio-group>
```

## `template` 属性

`template` 属性を指定することで、使用するテンプレート ID を変更できます。

```html
<kata-radio-group template="kata-radio-group-template"></kata-radio-group>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
