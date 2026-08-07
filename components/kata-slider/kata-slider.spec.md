# kata-slider contract

`<kata-slider>` は、`<template id="kata-slider-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-slider-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<input type="range">` を含むこと
3. アクセシビリティのため `<label>` と `<input>` を `for`/`id` で関連付けること

## 例

```html
<template id="kata-slider-template">
  <label for="volume-slider">音量</label>
  <input id="volume-slider" type="range" name="volume" min="0" max="100" value="50">
</template>

<kata-slider></kata-slider>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
