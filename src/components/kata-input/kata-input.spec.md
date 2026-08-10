# kata-input

`<kata-input>`は、単行テキスト入力と表示ラベルをまとめるopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-input name="name" placeholder="山田太郎" required>
  <span slot="label">名前</span>
</kata-input>
```

## 必須要件

- 画面内に`id="kata-input-template"`の`<template>`が1つある
- template内に`input`がある
- `label`とinputを関連付ける

## 属性

`name`、`value`、`placeholder`、`type`、`min`、`max`、`step`、`checked`、`disabled`、`required`、`readonly`を初回mount時に内部inputへ反映します。`template`省略時は`kata-input-template`です。

## slot

`label` slotへ入力項目名を渡します。

## 制約

属性は初回mount時に反映します。接続後の属性変更追従とform-associated custom elementとしての動作は公開契約に含みません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
