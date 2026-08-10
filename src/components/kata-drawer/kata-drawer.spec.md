# kata-drawer

`<kata-drawer>`は、ネイティブ`dialog`を左右のサイドパネルとして表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-drawer data-side="right">
  <span slot="trigger">メニューを開く</span>
  <span slot="title">メニュー</span>
  <nav aria-label="主要メニュー">...</nav>
</kata-drawer>
```

## 必須要件

- `kata-drawer-template`がある
- template内に`dialog`がある
- 開く要素に`data-drawer-trigger`、閉じる要素に`data-drawer-close`がある

## 属性とslot

| 契約 | 説明 |
| --- | --- |
| `data-side="left"`／`"right"` | 表示位置。省略時はright |
| `trigger` slot | 開く操作の表示名 |
| `title` slot | パネル見出し |
| default slot | パネル本文 |

## 状態と動作

triggerで開き、close操作、Escape、backdropクリックで閉じます。hostの`data-state`を`open`／`closed`へ更新します。

## アクセシビリティ

`dialog`と`aria-labelledby`はtemplateが所有します。ネイティブ`showModal()`を使用し、閉じた後のフォーカス復帰を実ブラウザで確認します。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
