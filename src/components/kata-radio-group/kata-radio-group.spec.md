# kata-radio-group

`<kata-radio-group>`は、関連するradio入力をfieldsetとlegendでまとめるopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-radio-group>
  <span slot="legend">色</span>
  <label><input type="radio" name="color" value="red">赤</label>
  <label><input type="radio" name="color" value="blue">青</label>
</kata-radio-group>
```

## 必須要件

- `kata-radio-group-template`がある
- template内に`fieldset`、`legend`、default slotがある
- 利用側は同じ`name`を持つ一つ以上の`input[type="radio"]`を渡す

## slot

| slot | 内容 |
| --- | --- |
| `legend` | 選択肢グループの名前 |
| default | 任意件数のlabelとradio input |

旧`kata-radio-group-color-template`は正規templateへの互換aliasです。

## 責任境界

選択値、disabled、requiredなどは利用側のネイティブinputが所有します。本コンポーネントは選択状態を複製しません。

## アクセシビリティ

各radioはlabelと関連付け、legendだけで選択基準が伝わる文言にします。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
