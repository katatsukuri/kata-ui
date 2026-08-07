[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

# kata-ui

`kata-ui` は、サーバー主導型MPAへ段階導入できる、ビルドレスなLight DOM Web Component集です。

全コンポーネントの説明と動作例は、[Component Catalog](./index.html)で確認できます。カタログ内のMarkdown文書は、スタイル付きのドキュメントビューアでそのまま閲覧できます。GitHub Pages公開後は `https://katatsukuri.github.io/kata-ui/` が入口になります。

## 読み手別の入口

| 読み手・目的 | 最初に読む場所 | 次に確認する場所 |
| --- | --- | --- |
| コンポーネントを探す | [Component Catalog](./index.html) | 各カードの動作例と契約 |
| アプリへ導入する | 本READMEの「導入例」 | [全体アーキテクチャ](./architecture.md) |
| コンポーネントを実装・レビューする | [コンポーネント設計](./component_architecture.md) | 各`*.spec.md`とテスト |
| テーマを追加・調整する | [テーマ設計](./theming/theming.md) | `src/styles/themes/`とサンプル |

公開サイトでは、入口を「概要と導入」「コンポーネントを探す」「設計を理解する」「テーマを作る」の4経路に分けます。READMEは概要と最短導入、カタログは比較と動作確認、アーキテクチャ文書は設計判断、`*.spec.md`は個別契約に責務を限定します。

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
- 色・境界・フォーカス・エレベーションは`--kata-*`セマンティックトークンを介してテーマから設定する

## ディレクトリ構成

各コンポーネントの契約、template、実装、スタイル、テスト、利用例を同じディレクトリで管理します。

```text
kata-ui/
├── architecture.md
├── component_architecture.md
├── architecture-manifest.json
├── src/
│   ├── components/
│   │   └── kata-example/
│   │       ├── kata-example.spec.md
│   │       ├── kata-example.html
│   │       ├── kata-example.js
│   │       ├── kata-example.css
│   │       ├── kata-example.test.js
│   │       └── examples/
│   ├── styles/
│   │   ├── kata-ui.css
│   │   ├── tokens.css
│   │   └── themes/
│   │       ├── theme-default.css
│   │       ├── theme-blue.css
│   │       ├── theme-dark.css
│   │       ├── theme-facility.css
│   │       └── theme-winforms.css
│   └── loader/
│       └── template-loader.js
└── tools/
    └── architecture-lint.js
```

`*.html`はコンポーネントの正規templateです。利用ページは必要なtemplateだけをサーバーHTMLへ配置してください。全コンポーネントのtemplateを共通レイアウトへ一括配置しないでください。

## 導入例

```html
<link rel="stylesheet" href="/kata-ui/src/styles/kata-ui.css">
<link rel="stylesheet" href="/kata-ui/src/components/kata-button/kata-button.css">

<template id="kata-button-template">
  <button type="button">保存</button>
</template>

<kata-button></kata-button>

<script type="module" src="/kata-ui/src/components/kata-button/kata-button.js"></script>
```

`kata-ui.css`はPico CSSの後、コンポーネントCSSの前に読み込みます。Pico CSSを使わないページでも、同じ既定値で利用できます。

## テーマ設定

`html`要素の`data-theme`を`default`、`blue`、`dark`、`facility`、`winforms`のいずれかにすると、全コンポーネントへ同じテーマが継承されます。

`facility`と`winforms`は、参照元の業務画面に合わせて配色だけでなく文字サイズ、行高、余白もコンパクトにした高密度テーマです。

```html
<html lang="ja" data-theme="dark">
```

実行時の切り替えは属性値の変更だけで行います。選択値をCookie、DB、`localStorage`のどこへ保存するかは利用アプリケーションの責務です。

```js
document.documentElement.dataset.theme = 'blue';
```

ブランドテーマを追加するときは`src/styles/themes/`へテーマCSSを追加し、コンポーネントセレクタではなく`--kata-*`トークンだけを上書きします。詳細は[theming.md](./theming/theming.md)を参照してください。

## Markdownドキュメントの表示

公開サイトでは`docs.html?doc=...`がリポジトリ内のMarkdownを取得し、目次付きHTMLとして表示します。変換にはバージョン固定した[Marked](https://marked.js.org/)を使い、生成HTMLは[DOMPurify](https://github.com/cure53/DOMPurify)でサニタイズします。

- 表示対象はREADME、設計文書、テーマ文書、各コンポーネントの`*.spec.md`に限定する
- Markdown内の相対リンクと画像URLは元文書を基準に解決する
- 変換ライブラリを取得できない場合は、元のMarkdownへのリンクを案内する
- GitHub上では従来どおりMarkdownを直接閲覧でき、同じ文書を二重管理しない

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

## Component Catalogの起動

前提としてNode.jsをインストールし、リポジトリのルートで次を実行します。依存パッケージのインストールは不要です。

```powershell
npm run docs
```

npm scriptを使わず直接起動する場合は、同じくリポジトリのルートで`node src/server.js`を実行します。

起動後、ブラウザで次を開きます。

```text
http://127.0.0.1:3000/
```

ルートの`index.html`、設計文書、`docs.css`、`assets/`、`src/`以下の全exampleが同じオリジンから配信されます。`.git/`などDocsに不要なリポジトリ内部ファイルは配信しません。終了するときはターミナルで`Ctrl+C`を押してください。

ポートを変更する場合は、起動前に`PORT`を指定します。

```powershell
$env:PORT=4173
npm run docs
```

LANやコンテナの外部から接続する必要がある場合だけ、待受ホストも明示します。

```powershell
$env:HOST='0.0.0.0'
$env:PORT=4173
npm run docs
```

`HOST`未指定時は安全のため`127.0.0.1`だけで待ち受けます。GitHub Pagesでは静的ファイルが直接配信されるため、このNode.jsサーバーは使用しません。

従来のコマンド名も互換性のため利用できます。

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
