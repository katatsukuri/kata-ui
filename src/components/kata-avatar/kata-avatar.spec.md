# kata-avatar contract

`<kata-avatar>` は、`<template id="kata-avatar-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-avatar-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は `.kata-avatar` クラスを持つ要素を含むこと

## サイズ

`.kata-avatar` 要素の `data-size` 属性でサイズを切り替えられます。

| 値 | 説明 |
|---|---|
| （省略） | 標準（2.5rem） |
| `sm` | 小（2rem） |
| `lg` | 大（3.5rem） |

## 例

### 画像アバター

```html
<template id="kata-avatar-template">
  <span class="kata-avatar">
    <img src="/path/to/photo.jpg" alt="ユーザー名">
  </span>
</template>

<kata-avatar></kata-avatar>
```

### イニシャルアバター

```html
<template id="kata-avatar-initials-template">
  <span class="kata-avatar">AB</span>
</template>

<kata-avatar template="kata-avatar-initials-template"></kata-avatar>
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
