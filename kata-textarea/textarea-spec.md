# kata-textarea contract

`<kata-textarea>` は、`<template id="kata-textarea-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-textarea-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<textarea>` を含むこと
3. アクセシビリティのため `<label>` と `<textarea>` を `for`/`id` で関連付けること

## 例

```html
<template id="kata-textarea-template">
  <label for="bio-field">自己紹介</label>
  <textarea id="bio-field" name="bio" rows="4" placeholder="自己紹介を入力してください"></textarea>
</template>

<kata-textarea></kata-textarea>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
