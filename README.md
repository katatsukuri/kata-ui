# kata-ui

**ビルドレス・フレームワークレスなWebコンポーネント集。**
HTMX + Alpine.js + Pico.css だけで動く、契約ベースの独自要素（Custom Elements）を提供します。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## これは何か

`kata-ui` は、shadcn/ui・Radix UI が持つ「UIパターンの網羅性」を、React やビルドツールチェーンに依存せずに再現することを目指すコンポーネント集です。

- `<script>` タグを読み込むだけで動作します。npm・Webpack・Vite は不要です。
- バックエンドは問いません。契約（HTML構造の仕様）さえ満たせば、Razor Pages・EJS・Django・Go テンプレートなど、どのサーバーサイド環境からでも利用できます。
- 既存のサーバーサイドレンダリング主体のアプリケーションに、画面全体を書き換えることなく1コンポーネントずつ追加導入できます。

## なぜ作ったか

React 前提のコンポーネント集は、アクセシビリティ配慮や一貫した見た目など実務上の価値が大きい一方、そのままでは非React環境に持ち込めません。`kata-ui` は、ブラウザの標準機能（Custom Elements・`<template>`）と軽量ライブラリ（Alpine.js・HTMX）だけで同等のUIパターンを再現し、以下を実現します。

- **バックエンド非依存**：どのテンプレートエンジンでも同じフロント資産をそのまま使い回せる
- **ビルドレス**：導入・保守のコストを下げる
- **段階的導入**：既存アプリへの部分導入がしやすい

## 設計思想

1. **コンポーネント選択・骨格・データを分離する**：サーバーは外側の交換領域へ必要な Custom Element を返し、コンポーネントの骨格は `<template>`、動的なデータは行などの部分HTMLとして別々に返す。コンポーネント取得とデータ取得の2リクエストを許容し、画面全体を再描画せずにUIを切り替える
2. **Shadow DOM は使わない**：Alpine.js の自動初期化・HTMX のセレクタ探索・CSS のスタイル継承は、いずれも Light DOM を前提に動作するため
3. **契約（Contract）でバックエンドと疎結合にする**：各コンポーネントは `{component}-spec.md` として「サーバーが返すべきHTML構造」を明文化する。この契約さえ満たせば、実装言語やフレームワークは問わない
4. **骨格の記述は利用側の必須作業とする**：デフォルト骨格へのフォールバックは持たない。未定義時は明示的なエラー表示で早期に気づける設計にしている
5. **交換境界を分ける**：`<kata-table>` などのコンポーネント応答は外側の通常コンテナへ、`<tr>` などのデータ応答はコンポーネント内部の対象要素へ挿入する。コンポーネントを `<tbody>` へ挿入するような境界の混在は行わない

```html
<!-- 1. 利用候補の骨格を定義する（交換領域の外側） -->
<template id="users-table-template">
	<table class="kata-table">
		<thead><tr class="header-row"><!-- カラム見出し --></tr></thead>
		<tbody hx-get="/users/rows" hx-trigger="load" hx-target="this" hx-swap="innerHTML"></tbody>
	</table>
</template>

<!-- 2. サーバーが選んだコンポーネントを外側の領域へ取得する -->
<div id="table-host" hx-get="/users/table" hx-trigger="load" hx-target="this" hx-swap="innerHTML"></div>

<!-- 3. /users/table はコンポーネントだけを返す -->
<kata-table template="users-table-template"></kata-table>

<!-- 4. /users/rows は行だけを返す -->
<tr><td>...</td></tr>
```

## Non-Goals（対象外とする範囲）

`kata-ui` は「プレーンなフロントエンド・最小限の学習コスト」を最優先します。以下は意図的にスコープ外としています。

- **複雑なインタラクション**：ドラッグ&ドロップの並び替え、仮想スクロール、Undo/Redo など、高度な状態管理を要するUIは対象としません。必要な場合は専用ライブラリの併用を推奨します
- **リッチなアニメーション・視覚効果**：装飾的なエフェクト（パララックス、パーティクル演出等）は本コンポーネント集の対象外です。CSSまたは個別のライブラリでの実装を推奨します
- **クライアント側の複雑な状態管理**：Redux 相当の集中管理は持ちません。状態はできる限りサーバー（Single Source of Truth）に置き、クライアントは疎結合なイベント伝播（`$dispatch`）または最小限の `Alpine.store()` に留めます

これらを許容することで、学習コストと実装の見通しやすさを優先しています。複雑な要件がある画面では、他のライブラリと部分的に組み合わせる使い方を想定しています。

## 導入方法

```html
<link rel="stylesheet" href="https://cdn.example.com/kata-ui/kata-table/kata-table.css">
<script src="https://cdn.example.com/kata-ui/loader/template-loader.js"></script>
<script src="https://cdn.example.com/kata-ui/kata-table/kata-table.js"></script>
```

各コンポーネントは `{component}/` ディレクトリ配下に、契約（`-spec.md`）・実装（`.js` / `.css`）・利用例（`examples/`）を1セットで持ちます。

```
kata-ui/
├── loader/
│   └── template-loader.js       # 汎用ローダー（複数の独自要素タイプに対応）
├── kata-table/
│   ├── kata-table-spec.md       # HTML契約
│   ├── kata-table.js
│   ├── kata-table.css
│   └── examples/
├── kata-button/
│   ├── kata-button-spec.md
│   ├── kata-button.js
│   ├── kata-button.css
│   └── examples/
├── kata-input/
├── kata-card/
├── kata-accordion/
├── kata-badge/
├── kata-tabs/
├── kata-dialog/
├── kata-breadcrumb/
├── kata-pagination/
└── ...
```

## コンポーネント一覧

### 実装済み（プレーンなHTML構造で完結するもの）

| コンポーネント | ディレクトリ | 状態 |
|---|---|---|
| Button | `kata-button/` | ✅ 実装済み |
| Input / Textarea | `kata-input/` | ✅ 実装済み |
| Card | `kata-card/` | ✅ 実装済み |
| Table | `kata-table/` | ✅ 実装済み |
| Accordion | `kata-accordion/` | ✅ 実装済み |
| Badge | `kata-badge/` | ✅ 実装済み |
| Tabs | `kata-tabs/` | ✅ 実装済み |
| Breadcrumb | `kata-breadcrumb/` | ✅ 実装済み |
| Pagination | `kata-pagination/` | ✅ 実装済み |

### 実装予定（プレーンなHTML構造で完結するもの）

- Toggle / Toggle Group
- Checkbox / Radio Group / Switch / Select / Slider
- Avatar / Dropdown Menu

### アクセシビリティ拡張が必要なもの（Alpine公式プラグイン併用）

- Dialog / Alert Dialog / Sheet / Drawer（`@alpinejs/focus` によるフォーカストラップ）
- Popover / Tooltip / Hover Card（`@alpinejs/anchor` による配置制御）

### 可視化が必要なもの（外部ライブラリ併用、任意導入）

- Charts（Chart.js を標準、複雑な表現が必要な場合は D3 を選択可能）

進捗・詳細は [Issues](../../issues) および各コンポーネントディレクトリの spec を参照してください。

## 既知の制約

正直に書きます。このアーキテクチャは万能ではありません。

- ビルド時の型検証がなく、契約と実装のズレは実行時にしか検知できません
- React エコシステムほどの実績・サンプル数はまだありません
- 大規模な一覧・頻繁な部分更新が発生する画面では、HTMXの通信方式が仮想DOM差分更新に比べて不利になる場合があります

これらのうち、**ドキュメントの充実・実装例の蓄積・エッジケースの洗い出しは、コミュニティからの貢献によって補える**と考えています。Issue・PR を歓迎します。

## Contributing

1. 新しいコンポーネントを追加する場合は、まず `{component}-spec.md`（契約）から書いてください
2. Shadow DOM を使用しない、複雑な状態管理を持ち込まない、という設計原則（上記「設計思想」参照）に沿っているか確認してください
3. 実装例（`examples/`）は最低1つのバックエンド言語分を添えてください

詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください（準備中）。

## License

[MIT](./LICENSE)

## なぜこのアーキテクチャを採用するのか（Why This Architecture?）

本プロジェクトでは、**HTMX + Alpine.js + Web Components (Custom Elements) + サーバーサイド Partial レンダリング** を組み合わせたWebアーキテクチャを採用しています。

### 1. 解決する課題（Context & Business Challenges）

- **過剰なSPA化による開発・保守コストの増大**
  一般的なSPA（React/Vue/Angular等）アーキテクチャでは、フロントエンドとバックエンドの双方で状態管理・型定義・APIインターフェース設計を行う必要があり、初期開発および長期的な維持管理コストが高大化します。
- **フロントエンド技術の急速な陳腐化への対応**
  10年以上の長期運用が前提となるシステムにおいて、変化の激しいJSフレームワークへの依存は将来的なリプレイスやセキュリティ対応の重大なリスクとなります。

### 2. 本アーキテクチャの役割分担と選定理由

| 技術要素 | 主な役割 | 採用理由・メリット |
| :--- | :--- | :--- |
| **HTMX** | サーバー主導の画面部分更新 (Partial Rendering) | API層とクライアント状態管理の二重構造を排除。コンポーネント選択とデータ取得を独立したHTML応答として扱い、信頼できる単一の情報源 (Single Source of Truth) をサーバー側に集約します。 |
| **Alpine.js** | 画面内の軽量なUI状態管理 | モーダルの開閉、タブ切り替え、一時的な表示制御など、サーバー通信を伴わない純粋なUIロジックのみをシンプルに記述できます。 |
| **Web Components** | UIパーツのモジュール化・カプセル化 | 高機能データグリッド (`win-data-grid`) や複合UIパーツ (`facility-summary`) をWeb標準規格でカプセル化。特定のJSフレームワークに依存せず長期間安全に再利用可能です。 |
| **開発モック分離** | フロント・バックエンド並行開発の実現 | `deliverable/` (本番アセット) と `mock-only/` (検証用モック) を明確に分離し、バックエンド未完成時でも画面動作検証を完結させます。 |

### 3. 本アーキテクチャがもたらす価値

- **低コスト・高速度での機能開発**: 既存のサーバーサイドレンダリングの生産性を活かしつつ、SPA同等の操作感を提供します。
- **優れた長期保守性**: Web標準技術（HTML/CSS/Custom Elements）を中心に構成しているため、将来的なライブラリ変更や技術移転のリスクが極めて低い設計です。
