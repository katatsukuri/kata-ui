# kata-ui

`kata-ui` は、サーバー主導型MPAへ段階導入できる、ビルドレスなLight DOM Web Component集です。

設計の正本は次の2文書です。

- [architecture.md](./architecture.md)：フロントエンド全体の責務、セキュリティ、検証方針
- [component_architecture.md](./component_architecture.md)：コンポーネントの契約、構造、ライフサイクル

## 基本方針

- 業務状態、認証、認可、永続データの正本はサーバーに置く
- サーバー通信とHTML差し替えはHTMXが担当する
- 通信不要の局所的な画面状態はAlpine.jsが担当する
- 独立UI部品の内部状態とライフサイクルはWeb Componentが担当する
- Web ComponentはLight DOMとし、内部骨格は`template`から生成する
- 一つのDOM領域を複数の技術で再生成しない
- 外部通知には`CustomEvent`を使用し、外部DOMを直接変更しない

## ディレクトリ構成

各コンポーネントの契約、template、実装、スタイル、テスト、利用例を同じディレクトリで管理します。

```text
kata-ui/
├── architecture.md
├── component_architecture.md
├── architecture-manifest.json
├── components/
│   └── kata-example/
│       ├── kata-example.spec.md
│       ├── kata-example.html
│       ├── kata-example.js
│       ├── kata-example.css
│       ├── kata-example.test.js
│       └── examples/
├── loader/
│   └── template-loader.js
└── tools/
    └── architecture-lint.js
```

`*.html`はコンポーネントの正規templateです。利用ページは必要なtemplateだけをサーバーHTMLへ配置してください。全コンポーネントのtemplateを共通レイアウトへ一括配置しないでください。

## 導入例

```html
<link rel="stylesheet" href="/kata-ui/components/kata-button/kata-button.css">

<template id="kata-button-template">
  <button type="button">保存</button>
</template>

<kata-button></kata-button>

<script type="module" src="/kata-ui/components/kata-button/kata-button.js"></script>
```

独自のtemplateを使用する場合は`template`属性でIDを指定します。

```html
<kata-button template="save-button-template"></kata-button>
```

## HTMXとの境界

Web Componentを更新するときは、原則としてCustom Element全体を交換します。

```html
<div id="component-host"
     hx-get="/users/123/card"
     hx-trigger="load"
     hx-target="this"
     hx-swap="innerHTML"></div>
```

サーバーは交換領域へCustom Elementだけを返します。部分HTMLに`script`を含めたり、Web Component内部の深い要素だけをHTMXで交換したりしないでください。

## 実装済みコンポーネント

| 分類 | コンポーネント |
| --- | --- |
| 表示・入力 | avatar、badge、button、card、checkbox、input、radio-group、select、slider、switch、textarea、toggle、toggle-group |
| ナビゲーション・構造 | accordion、breadcrumb、pagination、table、tabs |
| オーバーレイ | alert-dialog、dialog、drawer、dropdown-menu、hover-card、popover、sheet、tooltip |
| 可視化 | chart |

新しいWeb Componentは、複数画面で再利用され、独立した状態・イベント・初期化または破棄処理を持つ場合に限って追加します。単純な見出し、ラベル、一覧行、通常のボタンは標準HTMLとCSSを優先します。

## バージョン

検証基準の完全バージョンは[architecture-manifest.json](./architecture-manifest.json)で管理します。利用例の外部URLも、このmanifestと同じバージョンへ固定します。本番では静的ファイルの自ホストを推奨します。

## 検証

```powershell
npm run check
```

`npm run check`は次を実行します。

1. コンポーネント成果物と命名の整合性
2. Light DOM、禁止API、BEM、CSSスコープ、依存バージョンのアーキテクチャLint
3. 初期化、イベント、属性、切断・再接続を含むNode.jsテスト

kata-tableの静的利用例は次で起動できます。

```powershell
npm run examples
```

## このリポジトリの責任境界

このリポジトリはUIコンポーネント資産を管理します。次は利用側のサーバープロジェクトで実装・検証する必要があります。

- 完全HTMLとHTMX用部分HTMLの返し分け
- `Vary: HX-Request`とキャッシュ制御
- CSP、CSRF、Cookie、認証切れ、権限エラー処理
- HTMX、Alpine.js、ブラウザ履歴を含むPlaywright E2E
- サーバーHTMLのエスケープとレスポンス契約テスト

## 既知の制約

- ビルド時の型検証は行わない
- Node.js単体テストだけではブラウザDOM、HTMX、Alpine.js、フォーカス動作を完全には証明できない
- Chart.jsは任意依存であり、利用側が固定バージョンを読み込む必要がある
- 実ブラウザのアクセシビリティと主要業務フローは利用側E2Eおよび手動試験を併用する

## License

[MIT](./LICENSE)
