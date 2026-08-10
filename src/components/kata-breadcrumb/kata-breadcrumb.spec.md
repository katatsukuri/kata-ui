# kata-breadcrumb

`<kata-breadcrumb>`は、現在位置までの階層をナビゲーションとして表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-breadcrumb>
  <li><a href="/">ホーム</a></li>
  <li aria-hidden="true" data-breadcrumb-separator>/</li>
  <li><a href="/products">製品</a></li>
  <li aria-hidden="true" data-breadcrumb-separator>/</li>
  <li aria-current="page">詳細</li>
</kata-breadcrumb>
```

## 必須要件

- 画面内に`id="kata-breadcrumb-template"`の`<template>`が1つある
- template内に`nav[aria-label]`とリストがある
- 現在地を`aria-current="page"`で示す

## slot

任意件数の`li`をdefault slotへ渡します。URLは`a[href]`、区切りは`aria-hidden="true"`、現在地は`aria-current="page"`で表します。

## アクセシビリティ

リンクでない現在地を末尾に置き、視覚的な区切り文字は支援技術から隠します。`nav`のアクセシブル名は正規templateが所有します。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
