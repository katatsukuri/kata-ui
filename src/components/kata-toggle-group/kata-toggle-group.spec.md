# kata-toggle-group

`<kata-toggle-group>`は、利用側が渡す任意件数のtoggle buttonを単一選択または複数選択として管理するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-toggle-group type="single">
  <button type="button" data-toggle-item aria-pressed="true" data-active>左揃え</button>
  <button type="button" data-toggle-item aria-pressed="false">中央揃え</button>
  <button type="button" data-toggle-item aria-pressed="false">右揃え</button>
</kata-toggle-group>
```

## 必須要件

- `kata-toggle-group-template`がある
- template内に`role="group"`とdefault slotがある
- 各項目が`button[data-toggle-item]`と`aria-pressed`を持つ

## 属性

| `type` | 動作 |
| --- | --- |
| `single` | 同時に一項目だけ選択。選択済み項目の再操作で未選択にもできる |
| `multiple`または省略 | 複数項目を独立して切り替える |

旧`kata-toggle-group-align-template`は正規templateへの互換aliasです。

## 状態と動作

click、Space、Enterで対象項目の`aria-pressed`と`data-active`を同期します。キーボード操作から生成されるclickによる二重反転を防止します。

## アクセシビリティ

グループに目的を表すアクセシブル名を付け、各項目はネイティブbuttonを使用します。利用側項目のイベント対象は`composedPath()`で識別します。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
