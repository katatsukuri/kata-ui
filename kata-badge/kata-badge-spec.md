# kata-badge contract

`<kata-badge>` は、`<template id="kata-badge-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-badge-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `.badge` クラスを持つ要素を含むこと

## バリアント

`data-variant` 属性でスタイルを切り替えられます。

| 値 | 説明 |
|---|---|
| （省略） | Primary（デフォルト） |
| `secondary` | セカンダリ |
| `outline` | アウトライン |
| `destructive` | 破壊的操作 |

## 例

```html
<template id="kata-badge-template">
  <span class="badge">新着</span>
</template>

<kata-badge></kata-badge>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
