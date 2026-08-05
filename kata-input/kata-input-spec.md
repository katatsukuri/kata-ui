# kata-input contract

`<kata-input>` は、`<template id="kata-input-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-input-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<input>` / `<textarea>` / `<select>` のいずれかを含むこと
3. アクセシビリティのため `<label>` と `<input>` を `for`/`id` で関連付けること

## 例

```html
<template id="kata-input-template">
  <label for="name-field">名前</label>
  <input id="name-field" type="text" name="name" placeholder="山田太郎">
</template>

<kata-input></kata-input>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
