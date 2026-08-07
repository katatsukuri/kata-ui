# kata-drawer contract

`<kata-drawer>` は、`<template id="kata-drawer-template">` で定義された骨格を Light DOM に展開する Custom Element です。`<dialog>` 要素をサイドパネル（ドロワー）として使用します。

## 必須条件

1. 画面内に `id="kata-drawer-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<dialog>` 要素を含むこと
3. ドロワーを開くトリガーは `data-drawer-trigger` 属性を持つ要素であること
4. ドロワーを閉じるボタンは `data-drawer-close` 属性を持つこと

## アクセシビリティ

- `<dialog>` 要素に `aria-labelledby` を設定すること
- `<dialog>` はネイティブ `showModal()` を使用するため、フォーカストラップは自動的に提供される
- `data-side` 属性で表示位置（`left` / `right`）を指定できる（デフォルト: `right`）

## 例

```html
<template id="kata-drawer-template">
  <button type="button" data-drawer-trigger>メニューを開く</button>
  <dialog aria-labelledby="kata-drawer__title">
    <div class="kata-drawer__header">
      <h2 id="kata-drawer__title" class="kata-drawer__title">メニュー</h2>
      <button type="button" data-drawer-close aria-label="閉じる">&times;</button>
    </div>
    <div class="kata-drawer__content">
      <p>ここにコンテンツを配置します。</p>
    </div>
  </dialog>
</template>

<kata-drawer data-side="right"></kata-drawer>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
