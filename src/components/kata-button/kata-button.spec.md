# kata-button

`<kata-button>`は、表示ラベルと外観を統一するopen Shadow DOM Custom Elementです。内部にはネイティブ`button`を保持します。

## 利用例

```html
<kata-button>保存</kata-button>
<kata-button variant="secondary">キャンセル</kata-button>
<kata-button variant="destructive" disabled>削除</kata-button>
```

## 必須要件

- 画面内に`id="kata-button-template"`の`<template>`が1つある
- template内に`type`を明示した`button`とdefault slotがある

## 属性

| 属性 | 値 | 説明 |
| --- | --- | --- |
| `variant` | `secondary`／`outline`／`ghost`／`destructive` | 省略時はprimary。内部buttonの`data-variant`へ反映する |
| `disabled` | Boolean属性 | 内部buttonを無効にする |
| `template` | template ID | 省略時は`kata-button-template` |

旧`kata-button-secondary-template`、`kata-button-destructive-template`、`kata-button-disabled-template`は互換aliasです。

## slot

default slotへ操作名を渡します。アイコンだけの操作にする場合は、利用側がアクセシブル名を指定してください。

## 制約

内部buttonの`type`は正規templateが所有します。現在のRuntimeは`disabled`と`variant`を初回mount時に反映します。hostの`type`、`name`、`value`、接続後の属性変更追従、form-associated custom elementとしての動作は公開契約に含みません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
