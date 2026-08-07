# kata-button contract

`<kata-button>` は、`<template id="kata-button-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。

## 必須条件

1. 画面内に `id="kata-button-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容は少なくとも1つの `<button>` 要素を含むこと
3. `<button>` には `type` 属性を明示すること（`button` / `submit` / `reset`）

## バリアント

`<button data-variant="...">` でスタイルを切り替えられます。

| 値 | 説明 |
|---|---|
| （省略） | Primary（デフォルト） |
| `secondary` | セカンダリ |
| `outline` | アウトライン |
| `ghost` | ゴースト |
| `destructive` | 破壊的操作 |

## 例

```html
<template id="kata-button-template">
  <button type="button">保存</button>
</template>

<kata-button></kata-button>
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
