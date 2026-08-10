# kata-checkbox

`<kata-checkbox>`は、ネイティブ`input[type="checkbox"]`と表示ラベルをまとめるopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-checkbox name="agree" required>
  <span slot="label">利用規約に同意する</span>
</kata-checkbox>
```

## 必須要件

- 画面内に`id="kata-checkbox-template"`の`<template>`が1つある
- template内に`input[type="checkbox"]`がある
- `label`とinputを明示的または暗黙的に関連付ける

## 属性

`name`、`value`、`checked`、`disabled`、`required`、`readonly`を初回mount時に内部inputへ反映します。`template`省略時は`kata-checkbox-template`を使用します。

旧`kata-checkbox-disabled-template`は`disabled`付きの正規templateへ変換する互換aliasです。

## slot

`label` slotへ利用者に見えるラベルを渡します。

## 制約

フォーム関連のhost属性は初回mount時に反映します。接続後の属性変更追従とform-associated custom elementとしての動作は公開契約に含みません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
