# kata-alert-dialog contract

`<kata-alert-dialog>` は、`<template id="kata-alert-dialog-template">` で定義された骨格を Light DOM に展開する Custom Element です。ネイティブの `<dialog>` 要素と `role="alertdialog"` を使用し、`@alpinejs/focus` によるフォーカストラップを提供します。

## 必須条件

1. 画面内に `id="kata-alert-dialog-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<dialog role="alertdialog">` 要素を含むこと
3. ダイアログを開くトリガーは `data-alert-dialog-trigger` 属性を持つ要素であること
4. ダイアログを閉じるボタンは `data-alert-dialog-close` 属性を持つこと

## アクセシビリティ

- `<dialog>` 要素に `role="alertdialog"`、`aria-labelledby`、`aria-describedby` を設定すること
- フォーカストラップは `@alpinejs/focus` プラグインの `x-trap` ディレクティブ、または `<dialog>` 要素のネイティブ `showModal()` によって提供される
- アラートダイアログは破壊的操作や重要な確認に使用し、ユーザーが必ずアクションを選択できるようにすること
- Escape キーによる閉じる操作は無効化する（ユーザーに明示的な選択を強制する）

## テンプレート属性

| 属性 | 対象要素 | 説明 |
|---|---|---|
| `data-alert-dialog-trigger` | 任意の要素 | クリックでダイアログを開く |
| `data-alert-dialog-close` | 任意の要素 | クリックでダイアログを閉じる |

## 例

```html
<template id="kata-alert-dialog-template">
  <button type="button" data-alert-dialog-trigger>削除する</button>
  <dialog
    role="alertdialog"
    aria-labelledby="kata-alert-dialog__title"
    aria-describedby="alert-dialog-desc"
  >
    <div class="kata-alert-dialog__header">
      <h2 id="kata-alert-dialog__title" class="kata-alert-dialog__title">本当に削除しますか？</h2>
      <p id="alert-dialog-desc" class="kata-alert-dialog__description">
        この操作は元に戻せません。続けますか？
      </p>
    </div>
    <div class="kata-alert-dialog__footer">
      <button type="button" data-alert-dialog-close>キャンセル</button>
      <button type="button" data-alert-dialog-close>削除する</button>
    </div>
  </dialog>
</template>

<kata-alert-dialog></kata-alert-dialog>
```

## Alpine.js + @alpinejs/focus を使う場合

`x-trap` ディレクティブを使用することで、ダイアログが開いている間のフォーカストラップを Alpine.js が管理します。

```html
<template id="kata-alert-dialog-template">
  <button type="button" data-alert-dialog-trigger>削除する</button>
  <dialog
    role="alertdialog"
    aria-labelledby="kata-alert-dialog__title"
    aria-describedby="alert-dialog-desc"
    x-data="{ open: false }"
    x-trap="open"
  >
    ...
  </dialog>
</template>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
