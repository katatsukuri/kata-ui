# kata-slider contract

`<kata-slider>` は、`<template id="kata-slider-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-slider-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<input type="range">` を含むこと
3. アクセシビリティのため `<label>` と `<input>` を `for`/`id` で関連付けること

## 例

```html
<template id="kata-slider-template">
  <label for="volume-slider">音量</label>
  <input id="volume-slider" type="range" name="volume" min="0" max="100" value="50">
</template>

<kata-slider></kata-slider>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- 利用者に見える表示データはslotで渡し、値、URL、フォーム名、状態などの構成値だけを属性で渡す。
- Light DOMの有無にかかわらず正規`template`を必ず複製し、UI構造、CSSおよびARIAをShadow DOM内に保持する。
- 表示データは次のslotへ投影し、未指定時だけtemplateのフォールバック内容を表示する: `label`
- `name`、`value`、`href`、状態などネイティブ要素の設定値は属性で渡せるが、表示文言を属性から内部DOMへ転記しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
