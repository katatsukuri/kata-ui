# kata-alert-dialog contract

`<kata-alert-dialog>` は、`<template id="kata-alert-dialog-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。ネイティブの `<dialog>` 要素と `role="alertdialog"` を使用します。

## 必須条件

1. 画面内に `id="kata-alert-dialog-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<dialog role="alertdialog">` 要素を含むこと
3. ダイアログを開くトリガーは `data-alert-dialog-trigger` 属性を持つ要素であること
4. ダイアログを閉じるボタンは `data-alert-dialog-close` 属性を持つこと

## アクセシビリティ

- `<dialog>` 要素に `role="alertdialog"`、`aria-labelledby`、`aria-describedby` を設定すること
- フォーカストラップは`<dialog>`要素のネイティブ`showModal()`によって提供される
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

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- 利用者に見える表示データはslotで渡し、値、URL、フォーム名、状態などの構成値だけを属性で渡す。
- Light DOMの有無にかかわらず正規`template`を必ず複製し、UI構造、CSSおよびARIAをShadow DOM内に保持する。
- 表示データは次のslotへ投影し、未指定時だけtemplateのフォールバック内容を表示する: `trigger`、`title`、`description`、default、`cancel`、`confirm`
- `name`、`value`、`href`、状態などネイティブ要素の設定値は属性で渡せるが、表示文言を属性から内部DOMへ転記しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
