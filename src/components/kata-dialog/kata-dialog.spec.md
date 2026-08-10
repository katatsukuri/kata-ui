# kata-dialog

`<kata-dialog>`は、ネイティブ`dialog`を使用するモーダルUIのopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-dialog>
  <span slot="trigger">確認を開く</span>
  <span slot="title">確認</span>
  <span slot="description">入力内容を保存しますか？</span>
  <p>保存後も編集できます。</p>
  <span slot="cancel">キャンセル</span>
  <span slot="confirm">保存</span>
</kata-dialog>
```

## 必須要件

- `kata-dialog-template`がある
- template内に`dialog`がある
- 開く要素に`data-dialog-trigger`、閉じる要素に`data-dialog-close`がある

## slot

`trigger`、`title`、`description`、default、`cancel`、`confirm`を公開します。

## 状態と動作

- triggerで`showModal()`を呼び、hostを`data-state="open"`にする
- close操作、Escape、backdropクリックで閉じ、`data-state="closed"`にする
- template内のconfirmは、利用アプリケーションが処理を結合しない限り自動で閉じない

## アクセシビリティ

`aria-labelledby`と`aria-describedby`はtemplateが所有します。閉じた後のフォーカス復帰を含む実ブラウザ確認を行ってください。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
