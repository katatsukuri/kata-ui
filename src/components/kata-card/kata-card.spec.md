# kata-card

`<kata-card>`は、タイトル、説明、本文、操作を一つの情報単位として表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-card>
  <span slot="title">アカウント情報</span>
  <span slot="description">登録内容を確認します。</span>
  <dl>
    <dt>名前</dt><dd>山田太郎</dd>
  </dl>
  <span slot="action">編集</span>
</kata-card>
```

## 必須要件

- 画面内に`id="kata-card-template"`の`<template>`が1つある
- template内に`.kata-card`と、公開する各slotがある

## slot

| slot | 内容 |
| --- | --- |
| `title` | カードの見出し |
| `description` | 見出しを補足する説明 |
| default | 本文HTML |
| `action` | 操作名 |

slotを省略した場合はtemplateのフォールバックを表示します。利用側はカード外枠や内部classを再記述しません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
