# kata-select

`<kata-select>`は、ネイティブ`select`と表示ラベルをまとめるopen Shadow DOM Custom Elementです。選択肢の骨格は正規templateが所有します。

## 利用例

```html
<kata-select name="color" required>
  <span slot="label">色</span>
</kata-select>
```

## 必須要件

- 画面内に`id="kata-select-template"`の`<template>`が1つある
- template内に`select`と選択肢がある
- `label`とselectを関連付ける

## 属性

`name`、`disabled`、`required`を初回mount時に内部selectへ反映します。`template`属性で別の選択肢を持つtemplate IDを指定できます。

## slot

`label` slotへ入力項目名を渡します。任意件数の`option`をLight DOMから投影する契約ではありません。

## 制約

属性は初回mount時に反映します。接続後の属性変更追従とform-associated custom elementとしての動作は公開契約に含みません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
