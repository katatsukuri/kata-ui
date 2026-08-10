# kata-switch

`<kata-switch>`は、ネイティブcheckboxを`role="switch"`として表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-switch name="notifications" checked>
  <span slot="label">通知を受け取る</span>
</kata-switch>
```

## 必須要件

- 画面内に`id="kata-switch-template"`の`<template>`が1つある
- template内に`input[type="checkbox"][role="switch"]`がある
- `label`とinputを関連付ける

## 属性

`name`、`value`、`checked`、`disabled`、`required`を初回mount時に内部inputへ反映します。旧`kata-switch-checked-template`と`kata-switch-disabled-template`は互換aliasです。

## slot

`label` slotへスイッチの表示ラベルを渡します。

## 制約

接続後のhost属性変更追従とform-associated custom elementとしての動作は公開契約に含みません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
