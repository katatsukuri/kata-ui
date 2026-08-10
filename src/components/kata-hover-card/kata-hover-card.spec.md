# kata-hover-card

`<kata-hover-card>`は、triggerへのhoverまたはfocus中に補足情報を表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-hover-card>
  <span slot="trigger">山田太郎</span>
  <span slot="title">山田太郎</span>
  <span slot="description">2023年1月から利用中</span>
</kata-hover-card>
```

## 必須要件

- `kata-hover-card-template`がある
- template内に`data-hover-card-trigger`と`data-kata-hover-card__content`がある

## slot

`trigger`、`title`、`description`を公開します。

## 状態と動作

triggerの`mouseenter`／`focus`で開き、`mouseleave`／`blur`後に短い猶予を置いて閉じます。contentへpointerが移動した場合は閉じるtimerを取り消します。hostの`data-state`を`open`／`closed`へ更新し、切断時にtimerを解除します。

## アクセシビリティ

hoverだけに依存せずfocusでも表示します。カード内に複雑な操作を置く場合は、focus移動と閉じる条件を別途設計してください。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
