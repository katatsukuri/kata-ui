# kata-dialog contract

`<kata-dialog>` は、`<template id="kata-dialog-template">` で定義された骨格を Light DOM に展開する Custom Element です。ネイティブの `<dialog>` 要素を使用します。

## 必須条件

1. 画面内に `id="kata-dialog-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<dialog>` 要素を含むこと
3. ダイアログを開くトリガーは `data-dialog-trigger` 属性を持つ要素であること
4. ダイアログを閉じるボタンは `data-dialog-close` 属性を持つこと

## アクセシビリティ

- `<dialog>` 要素に `aria-labelledby` および `aria-describedby` を設定すること
- `<dialog>` はネイティブ `showModal()` を使用するため、フォーカストラップは自動的に提供される

## 例

```html
<template id="kata-dialog-template">
  <button type="button" data-dialog-trigger>ダイアログを開く</button>
  <dialog aria-labelledby="kata-dialog__title" aria-describedby="dialog-desc">
    <div class="kata-dialog__header">
      <h2 id="kata-dialog__title" class="kata-dialog__title">確認</h2>
      <p id="dialog-desc" class="kata-dialog__description">本当に削除しますか？</p>
    </div>
    <div class="kata-dialog__footer">
      <button type="button" data-dialog-close>キャンセル</button>
      <button type="button">削除</button>
    </div>
  </dialog>
</template>

<kata-dialog></kata-dialog>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
