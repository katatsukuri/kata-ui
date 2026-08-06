# kata-tooltip contract

`<kata-tooltip>` は、`<template id="kata-tooltip-template">` で定義された骨格を Light DOM に展開する Custom Element です。ホスト要素へのホバー／フォーカスでツールチップを表示します。

## 必須条件

1. 画面内に `id="kata-tooltip-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `.tooltip-trigger` クラスを持つトリガー要素と `.tooltip-content` クラスを持つコンテンツ要素を含むこと
3. トリガー要素は `aria-describedby` でコンテンツ要素を参照すること
4. コンテンツ要素は `role="tooltip"` を持つこと

## 動作

- トリガーへの `mouseenter` / `focusin` でツールチップを表示する（`data-state="open"`）
- トリガーからの `mouseleave` / `focusout` でツールチップを非表示にする（`data-state="closed"`）
- `@alpinejs/anchor` など外部ライブラリによる配置制御は `<template>` 内の属性で宣言する

## 配置

`data-side` 属性でツールチップの表示方向を制御できます（CSS アニメーションのヒントとして使用）。

| 値 | 説明 |
|---|---|
| `top`（省略時） | トリガーの上に表示 |
| `bottom` | トリガーの下に表示 |
| `left` | トリガーの左に表示 |
| `right` | トリガーの右に表示 |

## 例

```html
<template id="kata-tooltip-template">
  <span class="tooltip-trigger" aria-describedby="tooltip-content">
    ホバーしてください
  </span>
  <div class="tooltip-content" id="tooltip-content" role="tooltip" data-side="top">
    ツールチップのテキスト
  </div>
</template>

<kata-tooltip></kata-tooltip>
```

## Alpine.js + @alpinejs/anchor の利用例

```html
<template id="kata-tooltip-template">
  <span class="tooltip-trigger" aria-describedby="my-tip"
        x-ref="trigger">
    ホバーしてください
  </span>
  <div class="tooltip-content" id="my-tip" role="tooltip"
       x-anchor.top.offset.4="$refs.trigger">
    ツールチップのテキスト
  </div>
</template>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
