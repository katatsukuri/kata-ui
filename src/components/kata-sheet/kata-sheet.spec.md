# kata-sheet contract

`<kata-sheet>` は、`<template id="kata-sheet-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。スライドインパネル（シート）を実装します。

## 必須条件

1. 画面内に `id="kata-sheet-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `data-sheet-panel` 属性を持つ要素（パネル本体）を含むこと
3. シートを開くトリガーは `data-sheet-trigger` 属性を持つ要素であること
4. シートを閉じるボタンは `data-sheet-close` 属性を持つこと
5. オーバーレイは `data-sheet-overlay` 属性を持つ要素であること

## 属性

| 属性 | 値 | 説明 |
|------|----|------|
| `template` | テンプレート ID | デフォルトは `kata-sheet-template` |
| `side` | `left` / `right` (デフォルト: `right`) | パネルが出現する方向 |

## 状態

`data-state` 属性でオープン/クローズを表す:

- `open` — シートが開いている
- `closed` — シートが閉じている（または未設定）

## アクセシビリティ

- パネル要素に `role="dialog"`, `aria-modal="true"`, `aria-labelledby` を設定すること
- シートが開いたとき、パネル内の最初のフォーカス可能な要素にフォーカスを移すこと
- Escape キーでシートを閉じること
- `@alpinejs/focus` などによるフォーカストラップが推奨される

## 例

```html
<template id="kata-sheet-template">
  <button type="button" data-sheet-trigger>シートを開く</button>
  <div data-sheet-overlay></div>
  <div role="dialog" aria-modal="true" aria-labelledby="kata-sheet__title" data-sheet-panel>
    <div class="kata-sheet__header">
      <h2 id="kata-sheet__title" class="kata-sheet__title">設定</h2>
      <button type="button" data-sheet-close aria-label="閉じる">×</button>
    </div>
    <div class="kata-sheet__content">
      <p>シートのコンテンツ</p>
    </div>
    <div class="kata-sheet__footer">
      <button type="button" data-sheet-close>閉じる</button>
    </div>
  </div>
</template>

<kata-sheet side="right"></kata-sheet>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- ラベル、値、状態などの単純データは利用側の属性で渡す。
- 意味または構造を持つHTMLはdefault／named `slot`で渡し、子HTMLがある場合はtemplateの既定内容を重複表示しない。
- 子HTMLがない場合は正規`template`を複製し、利用側の属性を既定骨格へ反映する。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
