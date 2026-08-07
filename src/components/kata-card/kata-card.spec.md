# kata-card contract

`<kata-card>` は、`<template id="kata-card-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-card-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `.kata-card` クラスを持つ要素を含むこと

## 推奨構造

| クラス | 役割 |
|---|---|
| `.kata-card` | カード外枠 |
| `.kata-card__header` | タイトル・説明文エリア |
| `.kata-card__title` | カードタイトル |
| `.kata-card__description` | サブテキスト |
| `.kata-card__content` | 本文エリア |
| `.kata-card__footer` | フッターエリア |

## 例

```html
<template id="kata-card-template">
  <div class="kata-card">
    <div class="kata-card__header">
      <h2 class="kata-card__title">タイトル</h2>
      <p class="kata-card__description">説明文</p>
    </div>
    <div class="kata-card__content">
      <p>カードの本文</p>
    </div>
  </div>
</template>

<kata-card></kata-card>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
