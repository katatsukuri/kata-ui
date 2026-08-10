# kata-pagination

`<kata-pagination>`は、サーバー主導のページ移動リンクをナビゲーションとして表示するopen Shadow DOM Custom Elementです。

## 利用例

```html
<kata-pagination>
  <li><a href="?page=1" aria-label="前のページへ">前</a></li>
  <li><a href="?page=1">1</a></li>
  <li><a href="?page=2" aria-current="page">2</a></li>
  <li><a href="?page=3">3</a></li>
  <li><a href="?page=3" aria-label="次のページへ">次</a></li>
</kata-pagination>
```

## 必須要件

- `kata-pagination-template`がある
- template内に`nav[aria-label]`とリストがある
- 現在ページを`aria-current="page"`で示す
- 無効な操作は`aria-disabled="true"`で示し、実際にも操作不能にする

## slot

任意件数の`li`をdefault slotへ渡します。遷移先は`a[href]`を正本とし、HTMXを併用しても直接アクセス可能にします。

## 責任境界

ページ数、現在ページ、URL、検索条件の保持はサーバーが担当します。本コンポーネントはページ番号の計算や通信を行いません。

## アクセシビリティ

`nav`のアクセシブル名はtemplateが所有します。前後操作には表示文言または`aria-label`を用意してください。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
