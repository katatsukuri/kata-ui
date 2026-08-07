# kata-textarea contract

`<kata-textarea>` は、`<template id="kata-textarea-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-textarea-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<textarea>` を含むこと
3. アクセシビリティのため `<label>` と `<textarea>` を `for`/`id` で関連付けること

## 例

```html
<template id="kata-textarea-template">
  <label for="bio-field">自己紹介</label>
  <textarea id="bio-field" name="bio" rows="4" placeholder="自己紹介を入力してください"></textarea>
</template>

<kata-textarea></kata-textarea>
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
