# kata-textarea

`<kata-textarea>`は、ネイティブ`textarea`と表示ラベルをまとめるopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-textarea name="bio" rows="4" placeholder="自己紹介を入力してください">
  <span slot="label">自己紹介</span>
</kata-textarea>
```

## 必須要件

- 画面内に`id="kata-textarea-template"`の`<template>`が1つある
- template内に`textarea`がある
- `label`とtextareaを関連付ける

## 属性

`name`、`value`、`placeholder`、`rows`、`disabled`、`required`、`readonly`を初回mount時に内部textareaへ反映します。旧`kata-textarea-disabled-template`は互換aliasです。

## slot

`label` slotへ入力項目名を渡します。

## 制約

接続後のhost属性変更追従とform-associated custom elementとしての動作は公開契約に含みません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
