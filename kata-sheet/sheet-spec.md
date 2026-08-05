# kata-sheet contract

`<kata-sheet>` は、`<template id="kata-sheet-template">` で定義された骨格を Light DOM に展開する Custom Element です。スライドインパネル（シート）を実装します。

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
  <div role="dialog" aria-modal="true" aria-labelledby="sheet-title" data-sheet-panel>
    <div class="sheet-header">
      <h2 id="sheet-title" class="sheet-title">設定</h2>
      <button type="button" data-sheet-close aria-label="閉じる">×</button>
    </div>
    <div class="sheet-content">
      <p>シートのコンテンツ</p>
    </div>
    <div class="sheet-footer">
      <button type="button" data-sheet-close>閉じる</button>
    </div>
  </div>
</template>

<kata-sheet side="right"></kata-sheet>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
