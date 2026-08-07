# kata-radio-group contract

`<kata-radio-group>` は、`<template id="kata-radio-group-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-radio-group-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `<input type="radio">` を1つ以上含むこと
3. アクセシビリティのため `<fieldset>` と `<legend>` で選択肢をグループ化すること

## 例

```html
<template id="kata-radio-group-template">
  <fieldset>
    <legend>性別</legend>
    <label><input type="radio" name="gender" value="male"> 男性</label>
    <label><input type="radio" name="gender" value="female"> 女性</label>
    <label><input type="radio" name="gender" value="other"> その他</label>
  </fieldset>
</template>

<kata-radio-group></kata-radio-group>
```

## `template` 属性

`template` 属性を指定することで、使用するテンプレート ID を変更できます。

```html
<kata-radio-group template="kata-radio-group-template"></kata-radio-group>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- 利用者に見える表示データはslotで渡し、値、URL、フォーム名、状態などの構成値だけを属性で渡す。
- Light DOMの有無にかかわらず正規`template`を必ず複製し、UI構造、CSSおよびARIAをShadow DOM内に保持する。
- 表示データは次のslotへ投影し、未指定時だけtemplateのフォールバック内容を表示する: `legend`、`option-1`、`option-2`、`option-3`
- `name`、`value`、`href`、状態などネイティブ要素の設定値は属性で渡せるが、表示文言を属性から内部DOMへ転記しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
