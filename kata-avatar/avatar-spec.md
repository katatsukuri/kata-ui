# kata-avatar contract

`<kata-avatar>` は、`<template id="kata-avatar-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-avatar-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `.avatar` クラスを持つ要素を含むこと

## サイズ

`.avatar` 要素の `data-size` 属性でサイズを切り替えられます。

| 値 | 説明 |
|---|---|
| （省略） | 標準（2.5rem） |
| `sm` | 小（2rem） |
| `lg` | 大（3.5rem） |

## 例

### 画像アバター

```html
<template id="kata-avatar-template">
  <span class="avatar">
    <img src="/path/to/photo.jpg" alt="ユーザー名">
  </span>
</template>

<kata-avatar></kata-avatar>
```

### イニシャルアバター

```html
<template id="kata-avatar-initials-template">
  <span class="avatar">AB</span>
</template>

<kata-avatar template="kata-avatar-initials-template"></kata-avatar>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
