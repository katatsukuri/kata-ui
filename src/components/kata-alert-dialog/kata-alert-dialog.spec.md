# kata-alert-dialog

`<kata-alert-dialog>`は、破壊的操作や重要な確認に使うネイティブ`dialog`ベースのopen Shadow DOM Custom Elementです。利用者が明示的に選択するまでEscapeでは閉じません。

## 利用例

```html
<kata-alert-dialog>
  <span slot="trigger">削除する</span>
  <span slot="title">本当に削除しますか？</span>
  <span slot="description">この操作は元に戻せません。</span>
  <p>関連データも削除されます。</p>
  <span slot="cancel">キャンセル</span>
  <span slot="confirm">削除する</span>
</kata-alert-dialog>
```

## 必須要件

- `kata-alert-dialog-template`がある
- template内に`dialog[role="alertdialog"]`がある
- 開く要素に`data-alert-dialog-trigger`、閉じる要素に`data-alert-dialog-close`がある

## slot

`trigger`、`title`、`description`、default、`cancel`、`confirm`を公開します。省略時はtemplateのフォールバックを表示します。

## 状態と動作

開閉時にhostの`data-state`を`open`／`closed`へ更新します。`cancel`イベントは`preventDefault()`し、Escapeによる閉じる操作を無効にします。

## アクセシビリティ

`role="alertdialog"`、`aria-labelledby`、`aria-describedby`をtemplateで設定します。通常の情報表示には`kata-dialog`を使用し、明示選択が必要な場面だけ本コンポーネントを使用します。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
