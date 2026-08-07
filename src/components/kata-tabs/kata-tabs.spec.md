# kata-tabs contract

`<kata-tabs>` は、`<template id="kata-tabs-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

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
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- ラベル、値、状態などの単純データは利用側の属性で渡す。
- 意味または構造を持つHTMLはdefault／named `slot`で渡し、子HTMLがある場合はtemplateの既定内容を重複表示しない。
- 子HTMLがない場合は正規`template`を複製し、利用側の属性を既定骨格へ反映する。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
