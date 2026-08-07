# kata-tabs contract

`<kata-tabs>` は、`<template id="kata-tabs-template">` で定義された骨格を Light DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-tabs-template"` を持つ `<template>` が1つ存在すること
2. タブリストは `role="tablist"` を持つ要素でマークアップすること
3. 各タブトリガーは `data-tabs-trigger` 属性を持ち、`aria-controls` で対応するパネルIDを指定すること
4. 各タブパネルは `data-tabs-panel` 属性と `role="tabpanel"` を持つこと
5. 初期アクティブタブのトリガーには `aria-selected="true"` および `data-active` を付与し、他のパネルには `hidden` を付与すること

## アクセシビリティ

- タブトリガーは `role="tab"` を持つこと
- `ArrowRight` / `ArrowLeft` キーでタブ間をフォーカス移動できること

## 例

```html
<template id="kata-tabs-template">
  <div role="tablist" aria-label="設定">
    <button type="button" role="tab" data-tabs-trigger
            aria-selected="true" aria-controls="tab-account" data-active>アカウント</button>
    <button type="button" role="tab" data-tabs-trigger
            aria-selected="false" aria-controls="tab-password">パスワード</button>
  </div>
  <div id="tab-account" role="tabpanel" data-tabs-panel>アカウント設定の内容</div>
  <div id="tab-password" role="tabpanel" data-tabs-panel hidden>パスワード設定の内容</div>
</template>

<kata-tabs></kata-tabs>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
