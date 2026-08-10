# kata-tabs

`<kata-tabs>`は、利用側が渡す任意件数のtabとpanelを関連付けて切り替えるopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-tabs>
  <button slot="tab" type="button" role="tab" data-tabs-trigger
          aria-selected="true" aria-controls="tab-account" data-active>
    アカウント
  </button>
  <button slot="tab" type="button" role="tab" data-tabs-trigger
          aria-selected="false" aria-controls="tab-password">
    パスワード
  </button>

  <div slot="panel" id="tab-account" role="tabpanel" data-tabs-panel>
    アカウント設定
  </div>
  <div slot="panel" id="tab-password" role="tabpanel" data-tabs-panel hidden>
    パスワード設定
  </div>
</kata-tabs>
```

## 必須要件

- `kata-tabs-template`がある
- template内に`role="tablist"`と`tab`／`panel` slotがある
- 各tabが`role="tab"`、`data-tabs-trigger`、`aria-controls`を持つ
- 各panelが`role="tabpanel"`、`data-tabs-panel`、一意なIDを持つ
- `aria-controls`とpanel IDが一致する

## slot

任意件数のtabを同名`tab` slot、対応するpanelを同名`panel` slotへ渡します。

## 状態と動作

クリック時に選択tabの`aria-selected="true"`と`data-active`を設定し、対応panelだけ`hidden`を解除します。他のtabとpanelは非選択状態へ戻します。

ArrowRight／ArrowDownで次、ArrowLeft／ArrowUpで前のtabへfocusを移動します。キー移動だけでは選択panelを変更しません。

## アクセシビリティ

初期選択tabと表示panelを一致させます。利用側データからのイベントは`composedPath()`で識別します。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
