# kata-dropdown-menu

`<kata-dropdown-menu>`は、操作項目の一覧を開閉するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-dropdown-menu>
  <span slot="trigger">アカウント</span>
  <button type="button" role="menuitem">プロフィール</button>
  <button type="button" role="menuitem">ログアウト</button>
</kata-dropdown-menu>
```

## 必須要件

- `kata-dropdown-menu-template`がある
- template内に`data-dropdown-trigger`と`data-dropdown-content`がある
- contentに`role="menu"`、各項目に`role="menuitem"`がある

## slot

`trigger` slotへ開く操作の表示名、default slotへ任意件数のmenuitemを渡します。

## 状態と動作

- triggerクリックで開閉する
- 外側クリックまたはEscapeで閉じる
- hostの`data-state`、triggerの`aria-expanded`、contentの`hidden`を同期する
- 外側判定はShadow DOMを越えるイベント経路を考慮する

## アクセシビリティ

triggerには`aria-haspopup="menu"`と`aria-expanded`を設定します。現在の実装は矢印キーによる項目移動とフォーカス管理を提供しないため、必要な利用場面では追加実装と検証が必要です。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
