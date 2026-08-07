# kata-hover-card contract

`<kata-hover-card>` は、`<template id="kata-hover-card-template">` を既定骨格として open Shadow DOM に展開する Custom Element です。トリガー要素にホバーまたはフォーカスすることでポップアップカードを表示します。

## 必須条件

1. 画面内に `id="kata-hover-card-template"` を持つ `<template>` が1つ存在すること
2. `<template>` の内容はトリガー要素（`data-hover-card-trigger` 属性を持つ要素）とコンテンツ要素（`data-kata-hover-card__content` 属性を持つ要素）を含むこと
3. トリガー要素にホバーまたはフォーカスするとコンテンツが表示され、外れると非表示になること

## 推奨構造

| 属性 / クラス | 役割 |
|---|---|
| `data-hover-card-trigger` | ホバーカードを開くトリガー要素 |
| `data-kata-hover-card__content` | ホバーカードのコンテンツ領域 |
| `.kata-hover-card__content` | コンテンツのスタイル用クラス |

## 状態

| `data-state` | 意味 |
|---|---|
| `open` | ホバーカードが表示中 |
| `closed` | ホバーカードが非表示 |

## 例

```html
<template id="kata-hover-card-template">
  <button type="button" data-hover-card-trigger>ユーザー情報</button>
  <div data-kata-hover-card__content class="kata-hover-card__content">
    <p class="kata-hover-card__title">山田太郎</p>
    <p class="kata-hover-card__description">2023年1月から利用中</p>
  </div>
</template>

<kata-hover-card></kata-hover-card>
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
