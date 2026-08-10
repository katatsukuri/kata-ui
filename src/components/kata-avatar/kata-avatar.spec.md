# kata-avatar

`<kata-avatar>`は、画像または短い代替文字を円形のアバターとして表示するopen Shadow DOM Custom Elementです。共通規約は[コンポーネント設計](../../../docs/components.md)を参照してください。

## 利用例

```html
<kata-avatar>
  <img src="/images/user.jpg" alt="山田太郎">
</kata-avatar>

<kata-avatar size="sm" aria-label="山田太郎">YT</kata-avatar>
```

## 必須要件

- 画面内に`id="kata-avatar-template"`の`<template>`が1つある
- template内に`.kata-avatar`を持つ要素とdefault slotがある

## 属性

| 属性 | 値 | 説明 |
| --- | --- | --- |
| `size` | `sm`／`lg` | 省略時は標準サイズ。内部要素の`data-size`へ反映する |
| `src`／`alt` | 文字列 | template内に`img`がある場合、その画像属性へ反映する |
| `template` | template ID | 省略時は`kata-avatar-template` |

旧`kata-avatar-initials-template`、`kata-avatar-sm-template`、`kata-avatar-lg-template`は互換aliasです。

## slot

default slotへ画像または代替文字を渡します。代替文字だけの場合は、利用側が文脈に応じたアクセシブル名を指定してください。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出し、別骨格へフォールバックしません。
