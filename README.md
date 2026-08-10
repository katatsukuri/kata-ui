[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

# kata-ui

`kata-ui`は、サーバー主導型MPAへ段階的に導入できる、ビルドレスなWeb Component集です。UIの内部構造をopen Shadow DOMに閉じ、利用側は属性とslotだけでコンポーネントへデータを渡します。

ReactやVueのようなクライアント側アプリケーション基盤を置き換えることは目的としていません。サーバーを業務状態の正本に保ち、HTMXによるHTML更新と、Web標準に基づく再利用UIを組み合わせるための境界を提供します。

## 業務システムで起きる課題

業務システムは、検索、一覧、入力、承認、帳票といった似た画面を多数持ち、制度変更や業務改善へ対応しながら長期間保守されます。業務ルール、認証、認可、入力検証、排他制御はサーバー側に既に存在することが多く、画面だけを全面的なSPAへ置き換える判断は単純ではありません。

この環境では、次の問題が起きやすくなります。

| 課題 | 起きること |
| --- | --- |
| 画面ごとのHTMLとCSSの複製 | 同じボタンやダイアログでも構造、見た目、ARIA、操作が少しずつ異なる |
| 局所JavaScriptの増加 | DOM差し替え後の再初期化、イベントの二重登録、破棄漏れが画面ごとの実装になる |
| サーバーとブラウザの責務重複 | 同じ業務状態、入力検証、表示可否を両方で管理し、どちらが正本か分かりにくくなる |
| フレームワーク前提のUI資産 | 既存MPAの一画面だけへ導入しにくく、ビルド環境や更新手順も保守対象になる |
| 暗黙のUI仕様 | 担当者や委託先が変わるたびに、利用方法と設計意図をコードから読み直す必要がある |
| 一括刷新の難しさ | 稼働中の画面を止めずに、改善対象だけを小さく置き換える手段が不足する |

必要なのは、業務ロジックをブラウザへ移すことではなく、サーバー中心の構成を保ったままUIの重複と実装差を減らせる境界です。

## kata-uiが有用な理由

`kata-ui`は、業務システム全体のアプリケーション基盤ではなく、再利用する価値があるUIだけをWeb Componentとして切り出します。

| kata-uiの方針 | 業務システムにもたらす効果 |
| --- | --- |
| Web標準のCustom ElementsとShadow DOM | 特定のSPAフレームワークへ画面全体を移行せず、既存HTMLへ段階導入できる |
| 正規`template`がUI構造、CSS、ARIAを所有 | 画面ごとのコピーから生じる構造・アクセシビリティ・見た目の差を抑える |
| 属性とslotによる小さな利用契約 | サーバーは業務データを意味のあるHTMLとして出力し、内部DOMの詳細を知らずに済む |
| HTMX、Page Runtime、Web Componentの責務分離 | 通信、画面状態、部品状態の所有者を分け、二重描画と状態の二重管理を避ける |
| 仕様、template、実装、CSS、テスト、exampleの同居 | 担当者が変わっても、公開契約と設計意図をリポジトリ内で追跡できる |
| ビルドレスな配布 | 小規模チームや既存サーバープロジェクトでも、導入・更新手順を小さく保てる |

OSSとして仕様と実装を公開することで、利用側は内部動作、制約、アクセシビリティ、更新差分を確認したうえで採用できます。また、複数の業務システムで共通するUI改善を一つのコンポーネントへ還元できます。

一方、`kata-ui`は業務ルール、認証・認可、サーバー側入力検証、画面固有レイアウト、主要業務フローのE2Eを代替しません。これらを利用アプリケーションの責務として残すことが、再利用可能なUI境界を小さく保つための条件です。

## kata-uiの解き方

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

GitHub PagesではNode.jsサーバーを使用せず、静的ファイルを直接配信します。

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

テーマは`--kata-*`セマンティックトークンを上書きします。通常の外部CSSセレクタはShadow DOM内部へ届かないため、公開する装飾点が必要な場合だけ`part`を個別契約として追加します。詳細は[テーマ設計](./docs/theming.md)を参照してください。

## ドキュメント案内

| 目的 | 文書 |
| --- | --- |
| コンポーネントを比較・試用する | [Component Catalog](./index.html) |
| 全体の責務と技術境界を理解する | [全体アーキテクチャ](./docs/architecture.md) |
| コンポーネントを実装・レビューする | [コンポーネント設計](./docs/components.md) |
| テーマを追加・調整する | [テーマ設計](./docs/theming.md) |
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
├── docs/
│   ├── architecture.md
│   ├── components.md
│   └── theming.md
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

## 公開前監査

公開前には、Git Bash、WSL、macOS、LinuxなどのBash環境から次を実行します。

```bash
bash public-audit.sh
```

監査は、実行環境、gitleaksによる現行ファイルとGit履歴の秘密情報、危険ファイル、READMEとLICENSE、`docs/`の設計文書、`package.json`のname／version／license／`scripts.check`、各`kata-*`コンポーネントのspec／template／JavaScript／CSS／test／examplesを確認します。Node.jsプロジェクトでは、lockfileを使った`npm ci`と正式な検証入口である`npm run check`も実行します。

結果は`public-audit-report.txt`へ保存されます。`FAIL`は公開を停止する条件です。`WARN`は検査ツール不足や任意成果物の不足を表すため、理由を確認して手動レビューで判断します。特にgitleaksがない環境では秘密情報検査が省略されるため、公開可否を確定してはいけません。

## License

[MIT](./LICENSE)

### MITライセンス日本語参考訳

以下は理解を助けるための非公式な参考訳です。法的な条件は、英語で記載された[LICENSE](./LICENSE)を正本とします。

MIT License

Copyright (c) 2026 JYN

本ソフトウェアおよび関連文書ファイル（以下「本ソフトウェア」）の複製を取得するすべての者に対し、本ソフトウェアを無制限に取り扱うことを無償で許可します。これには、本ソフトウェアを使用、複製、変更、結合、公開、頒布、サブライセンス、および販売する権利、ならびに本ソフトウェアを提供された者に同様の行為を許可する権利を含みますが、これらに限定されません。ただし、次の条件に従うものとします。

上記の著作権表示および本許諾表示を、本ソフトウェアのすべての複製または重要な部分に記載するものとします。

本ソフトウェアは「現状のまま」で提供され、明示または黙示を問わず、商品性、特定目的への適合性、および権利非侵害についての保証を含むがこれらに限定されない、いかなる種類の保証もありません。著作者または著作権者は、契約、不法行為、その他の法的根拠を問わず、本ソフトウェアまたはその使用その他の取扱いに起因または関連して生じる、いかなる請求、損害、その他の責任についても責任を負いません。
