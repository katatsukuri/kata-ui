# kata-switch contract

`<kata-switch>` は、`<template id="kata-switch-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-switch-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `type="checkbox"` の `<input>` を含むこと
3. アクセシビリティのため `<label>` と `<input>` を `for`/`id` で関連付けること

## 例

```html
<template id="kata-switch-template">
  <label for="notify-switch">通知</label>
  <input id="notify-switch" type="checkbox" role="switch" name="notify">
</template>

<kata-switch></kata-switch>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
