# kata-slider

`<kata-slider>`は、ネイティブ`input[type="range"]`と表示ラベルをまとめるopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-slider name="volume" min="0" max="100" step="10" value="50">
  <span slot="label">音量</span>
</kata-slider>
```

## 必須要件

- 画面内に`id="kata-slider-template"`の`<template>`が1つある
- template内に`input[type="range"]`がある
- `label`とinputを関連付ける

## 属性

`name`、`value`、`min`、`max`、`step`、`disabled`、`required`を初回mount時に内部inputへ反映します。旧`kata-slider-brightness-template`は互換aliasです。

## slot

`label` slotへ入力項目名を渡します。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
