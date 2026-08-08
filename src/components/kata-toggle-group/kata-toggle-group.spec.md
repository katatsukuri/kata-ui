# kata-toggle-group contract

`<kata-toggle-group>` は、`<template id="kata-toggle-group-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-toggle-group-template"` を持つ `<template>` が1つ存在すること
2. 各トグルボタンは `data-toggle-item` 属性を持つこと
3. 各トグルボタンは `role="button"` と `aria-pressed` 属性を持つこと
4. グループ全体は `role="group"` を持つ要素でマークアップすること

## 動作

- `data-toggle-item` をクリックすると `aria-pressed` が `"true"` / `"false"` でトグルされる
- `type="single"` 属性がグループに付与されている場合、同時に押せる項目は1つのみ（他はすべて解除される）
- `type` 属性が省略された場合は複数選択を許可する（`type="multiple"` と同等）

## アクセシビリティ

- トグルボタンは `role="button"` と `tabindex` を持つこと
- `Space` / `Enter` キーでもトグル操作が可能なこと

## 例

```html
<template id="kata-toggle-group-template">
  <div role="group" aria-label="テキスト整形">
    <button type="button" role="button" data-toggle-item aria-pressed="false">Bold</button>
    <button type="button" role="button" data-toggle-item aria-pressed="false">Italic</button>
    <button type="button" role="button" data-toggle-item aria-pressed="false">Underline</button>
  </div>
</template>

<kata-toggle-group></kata-toggle-group>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- 利用者に見える表示データはslotで渡し、値、URL、フォーム名、状態などの構成値だけを属性で渡す。
- Light DOMの有無にかかわらず正規`template`を必ず複製し、UI構造、CSSおよびARIAをShadow DOM内に保持する。
- 任意件数の`button[data-toggle-item]`をdefault slotへ渡し、選択状態は`aria-pressed`で表す。
- `name`、`value`、`href`、状態などネイティブ要素の設定値は属性で渡せるが、表示文言を属性から内部DOMへ転記しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
