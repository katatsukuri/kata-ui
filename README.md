[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

# kata-ui

`kata-ui`は、サーバー主導型MPAへ段階的に導入できる、ビルドレスなWeb Component集です。UIの内部構造をopen Shadow DOMに閉じ、利用側は属性とslotだけでコンポーネントへデータを渡します。

ReactやVueのようなクライアント側アプリケーション基盤を置き換えることは目的としていません。サーバーを業務状態の正本に保ち、HTMXによるHTML更新と、Web標準に基づく再利用UIを組み合わせるための境界を提供します。

## kata-uiが解決すること

サーバー生成HTMLを中心にした画面でも、コンポーネントごとにDOM構造、ARIA、イベント、スタイル、ライフサイクルを統一したいことがあります。一方、UI部品がページ状態や通信まで引き受けると、責務が重なり、HTMXによる差し替えや再接続が不安定になります。

`kata-ui`は次の分担を採用します。

| 状態・処理 | 所有者 |
| --- | --- |
| 業務状態、認証、認可、永続データ | サーバー |
| サーバー通信とHTML差し替え | HTMX |
| 通信不要の画面内一時状態 | Page Runtime |
| 独立UI部品の内部状態とライフサイクル | Web Component |
| UIの骨格、CSS、ARIA | Shadow DOM内の正規`template` |
| タイトル、ラベル、本文などの表示データ | 利用側Light DOMから投影する`slot` |

この分担により、一つのDOM領域を複数の技術が再生成することを避けます。

## まず試す

Node.jsをインストール済みであれば、依存パッケージの追加なしでComponent Catalogを起動できます。

```powershell
npm run docs
```

ブラウザで[http://127.0.0.1:3000/](http://127.0.0.1:3000/)を開いてください。終了するときはターミナルで`Ctrl+C`を押します。

ポートを変更する場合は、起動前に`PORT`を設定します。

```powershell
$env:PORT=4173
npm run docs
```

`HOST`を省略した場合は`127.0.0.1`だけで待ち受けます。LANやコンテナ外から接続する必要がある場合に限り、`HOST`を明示してください。

```powershell
$env:HOST = '0.0.0.0'
$env:PORT = 4173
npm run docs
```

互換コマンドの`npm run examples`も同じDocsサーバーを起動します。GitHub PagesではNode.jsサーバーを使用せず、静的ファイルを直接配信します。

## 最小構成

ページには、利用するコンポーネントの正規`template`、コンポーネントCSS、JavaScriptを配置します。

```html
<link rel="stylesheet" href="/kata-ui/src/styles/kata-ui.css">
<link rel="stylesheet" href="/kata-ui/src/components/kata-button/kata-button.css">

<template id="kata-button-template">
  <button type="button"><slot>保存</slot></button>
</template>

<kata-button variant="secondary">キャンセル</kata-button>

<script type="module" src="/kata-ui/src/components/kata-button/kata-button.js"></script>
```

正規`template`はLight DOMの内容にかかわらずShadow DOMへ複製されます。利用側の子HTMLはUI骨格の代替ではなく、`slot`へ投影する表示データです。

```html
<kata-card>
  <strong slot="title">警告</strong>
  <span slot="description">入力内容を確認してください。</span>
  <p>未入力の必須項目があります。</p>
  <span slot="action">確認する</span>
</kata-card>
```

表示文言はslotへ、値、URL、フォーム名、状態などネイティブ要素やコンポーネント動作の設定値は属性へ渡します。利用側がtemplate内部のボタン、ARIA、レイアウト要素を再記述する必要はありません。

## 共通Runtime

公開入口は`src/runtime/index.js`です。個別ファイルへの直接依存を避け、必要な機能をここからimportします。

```js
import {
  HtmxAdapter,
  PageState,
  ThemeManager,
} from '/kata-ui/src/runtime/index.js';

const disposeHtmx = new HtmxAdapter(document).initialize();
const pageState = new PageState({ sidebarOpen: false });
const themeManager = new ThemeManager(document);

themeManager.load();
```

画面を破棄するときは`disposeHtmx()`を呼びます。Custom Elementの`connectedCallback()`を利用側やRegistryから手動実行せず、ブラウザ標準の接続・切断ライフサイクルへ委ねてください。

`PageState.snapshot()`と購読通知はトップレベルを凍結した浅いsnapshotです。ネストした配列やオブジェクトを直接変更せず、新しい値へ置き換えて`set()`または`update()`してください。

## HTMXとの境界

Web Componentをサーバー応答で更新するときは、原則としてCustom Element全体を交換します。

```html
<div
  id="component-host"
  hx-get="/users/123/card"
  hx-trigger="load"
  hx-target="this"
  hx-swap="innerHTML"
></div>
```

サーバーは交換領域へCustom Elementを返します。部分HTMLに`script`を含めたり、Shadow DOM内部の深い要素だけをHTMXで交換したりしないでください。

`hx-*`を含むShadow Rootは、コンポーネント初期化時に`htmx.process()`の対象になります。slotへ渡したLight DOMから発生するイベントを扱う場合は、通常の`event.target`だけでなく`event.composedPath()`を考慮します。

## テーマ

`html`要素の`data-theme`で、提供テーマを全コンポーネントへ継承します。

```html
<html lang="ja" data-theme="dark">
```

提供値は`default`、`blue`、`dark`、`facility`、`winforms`です。`facility`と`winforms`は配色だけでなく、文字サイズ、行高、余白も調整する高密度テーマです。

実行時の切り替えには`ThemeManager`を使用できます。

```js
import { ThemeManager } from '/kata-ui/src/runtime/index.js';

new ThemeManager(document).set('blue');
```

テーマは`--kata-*`セマンティックトークンを上書きします。通常の外部CSSセレクタはShadow DOM内部へ届かないため、公開する装飾点が必要な場合だけ`part`を個別契約として追加します。詳細は[テーマ設計](./theming/theming.md)を参照してください。

## ドキュメント案内

| 目的 | 文書 |
| --- | --- |
| コンポーネントを比較・試用する | [Component Catalog](./index.html) |
| 全体の責務と技術境界を理解する | [全体アーキテクチャ](./architecture.md) |
| コンポーネントを実装・レビューする | [コンポーネント設計](./component_architecture.md) |
| ASP.NET Razor Pagesへの適用例を確認する | リポジトリ内の補足資料`architecture.v2.md` |
| テーマを追加・調整する | [テーマ設計](./theming/theming.md) |
| Facility／WinFormsテーマの判断背景を確認する | [テーマ検討記録](./theming/theming2.md) |
| 個別コンポーネントの公開契約を確認する | `src/components/kata-*/kata-*.spec.md` |

READMEは導入、アーキテクチャ文書は設計判断、`*.spec.md`は個別の公開契約に責務を限定しています。

## 実装済みコンポーネント

| 分類 | コンポーネント |
| --- | --- |
| 入力・操作 | button、checkbox、input、radio-group、select、slider、switch、textarea、toggle、toggle-group |
| 表示 | avatar、badge、card、chart |
| ナビゲーション・構造 | accordion、breadcrumb、pagination、table、tabs |
| オーバーレイ | alert-dialog、dialog、drawer、dropdown-menu、hover-card、popover、sheet、tooltip |

新しいWeb Componentは、複数画面で再利用され、独立した状態、イベント、初期化または破棄処理を持つ場合に追加します。単純な見出し、ラベル、一覧行、通常のボタンは標準HTMLとCSSを優先します。

## リポジトリ構成

```text
kata-ui/
├── README.md
├── architecture.md
├── architecture.v2.md
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
│   ├── loader/
│   │   └── template-loader.js
│   ├── runtime/
│   │   └── index.js
│   └── styles/
│       ├── kata-ui.css
│       ├── tokens.css
│       └── themes/
└── tools/
    └── architecture-lint.js
```

各コンポーネントの契約、template、実装、スタイル、テスト、利用例は同じディレクトリで管理します。

## 検証

```powershell
npm run check
```

`npm run check`は、成果物と命名の整合性、Shadow DOM／template／slot契約、禁止API、CSSスコープ、依存バージョンのアーキテクチャLintと、Node.jsテストを実行します。

Node.jsテストだけでは、実ブラウザ上のHTMX、Shadow DOM、フォーカス、キーボード操作を完全には証明できません。主要フローはブラウザE2Eまたは手動試験を併用してください。

## 責任境界と制約

このリポジトリはUIコンポーネント資産を管理します。次は利用側のサーバープロジェクトで実装・検証します。

- 完全HTMLとHTMX用部分HTMLの返し分け
- `Vary: HX-Request`とキャッシュ制御
- CSP、CSRF、Cookie、認証切れ、権限エラー処理
- サーバーHTMLのエスケープとレスポンス契約テスト
- HTMX、Page Runtime、ブラウザ履歴を含むE2E

このリポジトリには次の制約があります。

- ビルド時の型検証は行わない
- Chart.jsは任意依存で、利用側が`architecture-manifest.json`と同じ固定バージョンを読み込む
- ブラウザのアクセシビリティと主要業務フローは自動テストだけで完結しない
- 依存ライブラリの検証基準は[architecture-manifest.json](./architecture-manifest.json)を正本とする

## License

[MIT](./LICENSE)
