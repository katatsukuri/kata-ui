# kata-avatar contract

`<kata-avatar>` は、`<template id="kata-avatar-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-avatar-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `.kata-avatar` クラスを持つ要素を含むこと

## サイズ

hostの `size` 属性でサイズを切り替えられます。Runtimeが内部 `.kata-avatar` の `data-size` へ反映します。

| 値 | 説明 |
|---|---|
| （省略） | 標準（2.5rem） |
| `sm` | 小（2rem） |
| `lg` | 大（3.5rem） |

## 例

### 画像アバター

```html
<kata-avatar><img src="/path/to/photo.jpg" alt="ユーザー名"></kata-avatar>
```

### イニシャルアバター

```html
<kata-avatar>AB</kata-avatar>
<kata-avatar size="sm">SM</kata-avatar>
```

## エラー条件

- 対応する `<template>` が見つからない場合、初期化時にエラーを送出する
- デフォルト骨格へのフォールバックは提供しない
## Shadow DOM・slot・属性契約

- Componentはopen Shadow DOMを生成し、内部スタイルとDOM構造を利用ページから隔離する。
- 利用者に見える表示データはslotで渡し、値、URL、フォーム名、状態などの構成値だけを属性で渡す。
- Light DOMの有無にかかわらず正規`template`を必ず複製し、UI構造、CSSおよびARIAをShadow DOM内に保持する。
- 表示データは次のslotへ投影し、未指定時だけtemplateのフォールバック内容を表示する: default
- `name`、`value`、`href`、状態などネイティブ要素の設定値は属性で渡せるが、表示文言を属性から内部DOMへ転記しない。
- サイトテーマは継承可能な`--kata-*` CSSカスタムプロパティで渡す。内部クラス名は外部CSS APIとしない。
