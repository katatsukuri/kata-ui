# kata-badge

`<kata-badge>`は、状態や分類を短いラベルで表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-badge>新着</kata-badge>
<kata-badge variant="secondary">下書き</kata-badge>
<kata-badge variant="destructive">期限超過</kata-badge>
```

## 必須要件

- 画面内に`id="kata-badge-template"`の`<template>`が1つある
- template内に`.kata-badge`を持つ要素とdefault slotがある

## 属性

| 属性 | 値 | 説明 |
| --- | --- | --- |
| `variant` | `secondary`／`outline`／`destructive` | 省略時はprimary。内部要素の`data-variant`へ反映する |
| `template` | template ID | 省略時は`kata-badge-template` |

旧`kata-badge-*-template`は対応する`variant`へ変換する互換aliasです。

## slot

default slotへ表示ラベルを渡します。badgeだけで伝わらない状態は、周辺テキストまたはアクセシブル名で補足してください。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
