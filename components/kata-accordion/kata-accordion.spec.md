# kata-accordion contract

`<kata-accordion>` は、`<template id="kata-accordion-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-accordion-template"` を持つ `<template>` が1つ存在すること
2. 各アコーディオン項目は `data-accordion-item` 属性を持つ要素でマークアップすること
3. `data-accordion-trigger` 属性を持つ `<button>` がトリガーとなること
4. `data-accordion-content` 属性を持つ要素がコンテンツエリアとなること

## 属性

| 属性 | 説明 |
|---|---|
| `multiple` | 複数のパネルを同時に開くことを許可する |

## 初期状態

- `data-state="open"` を付与した項目は初期表示で開いた状態になる
- `data-state` が未設定または `"closed"` の場合は閉じた状態になる

## アクセシビリティ

- `data-accordion-trigger` の `<button>` には `aria-expanded` および `aria-controls` を設定すること
- `data-accordion-content` の要素には `id` および `role="region"` を設定すること

## 例

```html
<template id="kata-accordion-template">
  <div data-accordion-item data-state="open">
    <button type="button" data-accordion-trigger
            aria-expanded="true" aria-controls="acc-1">質問1</button>
    <div id="acc-1" data-accordion-content role="region">回答1の内容</div>
  </div>
  <div data-accordion-item data-state="closed">
    <button type="button" data-accordion-trigger
            aria-expanded="false" aria-controls="acc-2">質問2</button>
    <div id="acc-2" data-accordion-content role="region" hidden>回答2の内容</div>
  </div>
</template>

<kata-accordion></kata-accordion>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
