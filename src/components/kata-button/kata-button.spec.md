# kata-button contract

`<kata-button>` は、`<template id="kata-button-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-button-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は少なくとも1つの `<button>` 要素を含むこと
3. `<button>` には `type` 属性を明示すること（`button` / `submit` / `reset`）

## バリアント

`<button data-variant="...">` でスタイルを切り替えられます。

| 値 | 説明 |
|---|---|
| （省略） | Primary（デフォルト） |
| `secondary` | セカンダリ |
| `outline` | アウトライン |
| `ghost` | ゴースト |
| `destructive` | 破壊的操作 |

## 例

```html
<template id="kata-button-template">
  <button type="button">保存</button>
</template>

<kata-button></kata-button>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
