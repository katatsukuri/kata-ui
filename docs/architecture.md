# Katatsukuri UI 全体アーキテクチャ

## 目的

Katatsukuri UI（技術識別子: `kata-ui`）は、server-driven applicationに再利用UIを追加するためのframework-agnosticなコンポーネント境界です。ブラウザへ業務状態の正本や独自ルーターを移さず、HTML更新手段、Page Runtime、Web Componentsの責務を狭く保つことを設計目標とします。

```text
Server-driven Application
  + Server-rendered HTML
  + Optional HTML update mechanism
      + HTMX integration
  + Optional Page Runtime
  + Katatsukuri UI
      + Shadow DOM Web Components
      + Pico CSS（任意）と--kata-*トークンによるテーマ
```

Katatsukuri UI本体はHTMXを必須依存としません。HTMX固有の処理は任意のintegration境界に閉じ込め、コンポーネントの基本契約はCustom Elements、Shadow DOM、属性、slot、イベントで定義します。

この文書はリポジトリ全体の責務、境界、セキュリティ、検証方針を定義します。個別コンポーネントの実装規約は[コンポーネント設計](./components.md)、公開契約は各`*.spec.md`を参照してください。

## 業務システムの前提

Katatsukuri UIが主に想定するのは、次の性質を持つ業務Webシステムです。静的HTMLや、HTMX以外のHTML更新手段を採用するserver-driven applicationにも、同じコンポーネント契約を適用できます。

- 検索、一覧、登録、編集、詳細、承認など、定型的な画面が多数ある
- 業務ルール、認証、認可、入力検証、排他制御、永続化がサーバーに実装されている
- 稼働期間が長く、制度変更、組織変更、ブラウザ更新へ継続的に対応する
- 画面や機能を段階的に追加・改修し、一括刷新しにくい
- 開発担当、保守担当、委託先が変わっても仕様と品質を維持する必要がある
- 操作効率、アクセシビリティ、セキュリティ、監査可能性を同時に求められる

この環境では、最新技術の採用自体よりも、責務と変更範囲を明確にし、既存業務を止めずに改善できることが重要です。

## 構造的な課題

### UIの複製が仕様の分岐になる

画面単位でHTML、CSS、JavaScriptをコピーすると、同じ意味のUIでもDOM構造、ARIA、キーボード操作、エラー表示が分岐します。見た目を揃えるだけでは内部構造と振る舞いの差は残り、変更のたびに複数画面を個別確認する必要があります。

### 部分更新と局所JavaScriptが衝突する

HTMXなどでDOMを差し替える画面では、初回ロード時だけを想定したJavaScriptが再接続後に動かない、イベントが重複する、timerやobserverが残る、といったライフサイクル問題が発生します。画面ごとの慣習だけで対処すると、同じ不具合を各機能で繰り返します。

### SPA化が状態の二重管理を生むことがある

サーバーに既にある業務状態、認可、入力検証、ルーティングをクライアント側へ複製すると、API、状態ストア、画面遷移、エラー処理の保守範囲が増えます。高度なクライアント機能が必要な画面では妥当ですが、定型的な業務画面すべてに同じ複雑さが必要とは限りません。

### UIライブラリが導入単位を大きくする

特定フレームワーク、コンパイラ、bundlerを前提とするUI資産は、その基盤がない既存MPAへ一部だけ導入しにくい場合があります。依存更新やビルド設定も長期保守の対象になります。

### 設計意図が担当者の知識に閉じる

UIの利用契約、状態の所有者、破棄方法、アクセシビリティ要件が明文化されていないと、担当交代時に実装から推測し直す必要があります。コードが動くことと、変更してよい境界が分かることは別の問題です。

## OSSとしてのKatatsukuri UIが提供する価値

Katatsukuri UIは、これらの課題を一つの大規模フレームワークで覆うのではなく、共通化すべきUI境界をWeb標準で揃えます。

| 課題 | 採用する仕組み | 意図 |
| --- | --- | --- |
| UI構造と操作の分岐 | Shadow DOM内の正規`template` | HTML、CSS、ARIA、内部操作を一か所で保守する |
| 利用画面との密結合 | 属性とdefault／named slot | 表示データと構成値だけを小さな公開契約にする |
| 再接続時の不具合 | `mount()`、`connect()`、`disconnect()` | 初回構築と接続中の資源管理を分離する |
| 状態とDOMの二重所有 | Server、HTML更新手段、Page Runtime、Web Componentの責務分離 | 一つの状態・領域の所有者を一つにする |
| 既存画面へ導入しにくい | ビルドレスなCustom Elements | 利用する画面とコンポーネントから段階導入する |
| 仕様が暗黙になる | co-locatedなspec、template、実装、CSS、テスト、example | 契約、実装、検証を同じ変更単位で追跡する |

OSSとしてソース、仕様、テスト、制約を同じ場所で公開することには、次の意味があります。

- 利用側が内部実装と制約を監査し、採用可否を判断できる
- 特定ベンダーや一つの業務システムだけに閉じないUI契約を議論できる
- 複数案件で発見したライフサイクル、アクセシビリティ、テーマの改善を共通資産へ還元できる
- プロジェクト固有の都合と、再利用可能な設計判断を分離できる

ただし、共通化の対象はUI境界だけです。業務ルールや画面固有の情報設計まで共通部品へ取り込むと、別の密結合を生むためです。

## なぜサーバー主導にするのか

検索、一覧、登録、編集、詳細表示を中心とする画面では、URLとサーバールーティングを維持したまま、必要な部分だけHTMLを更新できれば、多くの操作要件を満たせます。

クライアント側に同じ業務状態、APIキャッシュ、ルーティングを重ねると、状態の正本とDOMの所有者が分散します。Katatsukuri UIはこの重複を避け、ブラウザ側の責務をUIに限定します。

次が主要要件になる場合は、別のアーキテクチャを再検討します。

- オフライン編集やリアルタイム共同編集
- 大規模なクライアント状態管理
- ブラウザ内での大量データ処理
- Webとモバイルアプリで共有するJSON API
- フロントエンドとバックエンドの完全な独立リリース
- 高度なキャンバス操作やドラッグ＆ドロップ

## 適用による効果と限界

適切に適用すると、UI変更の対象をコンポーネントへ集約し、既存MPAへ画面単位で導入できます。サーバー側の業務ロジックとURLを維持するため、全面移行を前提にせず改善を始められます。

一方、次のコストと限界があります。

- Shadow DOM、slot、Custom Elementsのライフサイクルを理解する必要がある
- サーバーHTML、HTMX、Shadow DOMをまたぐブラウザテストが必要になる
- Web Component化する価値がない単純要素まで抽象化すると、資産数と学習コストが増える
- 業務固有の画面構造、認可、入力検証、エラー処理は利用アプリケーションに残る
- 高度なSPA要件を無理にこの構成へ押し込むべきではない

したがって、Katatsukuri UIの有用性は「すべてをコンポーネント化できること」ではなく、「複数画面で繰り返すUIだけを、責務と契約が明確な形で共有できること」にあります。

## アーキテクチャの全体像

```text
┌──────────────────────────────────────────────┐
│ Browser                                      │
│                                              │
│ Application shell                            │
│ ├─ HTML update mechanism（任意）              │
│ │  └─ HTMX integration: 通信、HTML差し替え    │
│ ├─ Page Runtime（任意）: 通信不要の画面状態   │
│ └─ Katatsukuri UI                             │
│    ├─ Web Components: 独立UIの状態と操作      │
│    │  └─ Shadow DOM: template、slot、ARIA、CSS│
│    └─ Theme: 継承可能な--kata-*トークン       │
└───────────────────┬──────────────────────────┘
                    │ HTTP / HTML / Form Data
┌───────────────────▼──────────────────────────┐
│ Server                                       │
│ ├─ URL、認証、認可、業務ルール、入力検証     │
│ ├─ 排他制御、永続化、監査ログ                 │
│ └─ 完全HTMLと必要に応じた部分HTMLの生成       │
└──────────────────────────────────────────────┘
```

## 責務と非責務

### サーバー

サーバーは業務上の判断と永続状態の正本です。

- 認証、認可、業務ルール、入力検証、排他制御
- データベース更新と監査ログ
- 完全HTMLと部分HTMLの生成
- エラー分類とCSRF検証

ブラウザ側の表示状態や入力制御だけを、認可や業務判断の根拠にしてはいけません。

### HTML更新手段

HTML更新は利用アプリケーションの責務です。Katatsukuri UIは、Custom Element全体またはslotへ渡すLight DOMを更新境界とし、特定の通信ライブラリを必須にしません。

### HTMX integration

HTMXを採用する利用アプリケーションでは、HTMXがサーバー通信とHTML差し替えを担当します。

- ページ遷移、検索、ページング、並べ替え
- フォーム送信と入力エラーの再表示
- 一覧、モーダル内容、通知領域の更新
- URLとブラウザ履歴の更新

HTMXはWeb Component内部のUI状態やShadow DOM内部の深いDOM操作を担当しません。応答は原則としてサーバー生成HTMLとし、部分HTMLへ`script`を含めません。

### Page Runtime

Page Runtimeは、通信を必要としない画面単位の一時状態を担当します。

| 機能 | 担当 |
| --- | --- |
| 状態の保持と購読 | `PageState` |
| `hidden`など表示属性の反映 | `LayoutController` |
| 画面単位の購読解除 | `PageController` |

対象は開閉、選択件数、入力連動、ローディング表示などです。DBデータ、認可情報、ワークフロー状態、独自APIキャッシュ、大規模なグローバルストアは持ちません。通信は利用アプリケーションが選択したHTML更新手段へ統一し、Page Runtimeからの直接`fetch()`はアーキテクチャ例外とします。

`PageState.snapshot()`はトップレベルだけを凍結する浅いsnapshotです。ネスト値は直接変更せず、新しい値へ置き換えて`set()`または`update()`します。

### Web Components

Web Componentsは、複数画面で再利用し、独立した状態、イベント、初期化または破棄処理を持つUIに使用します。

各コンポーネントは次を所有します。

- open Shadow DOM
- 正規`template`から生成する内部骨格
- 内部ARIAとイベント処理
- 接続、切断、再接続可能なライフサイクル
- `--kata-*`トークンを参照するコンポーネントCSS

単純な見出し、ラベル、一覧行、通常のボタンは、標準HTMLとCSSを優先します。

### `template`とslot

`template`はWeb Componentの内部骨格と、通信不要の限定的な要素複製に使用します。ページ全体を保持する自作SPA、独自ルーター、サーバーとクライアントによる同一領域の二重生成には使用しません。

利用側との契約は次のとおりです。

1. タイトル、ラベル、説明、本文、操作名などの表示データはdefaultまたはnamed `slot`へ渡す
2. 値、URL、フォーム名、状態、外部ライブラリ設定はCustom Elementの属性へ渡す
3. 正規`template`はLight DOMの有無にかかわらずShadow DOMへ複製する
4. slot未指定時だけtemplate内のフォールバック内容を表示する

Light DOMはUI構造の正本ではなく、slotへ投影する利用者データです。外部CSSの通常セレクタをShadow DOM内部へ結合させず、必要な装飾点だけ`part`として公開します。

## DOMと状態の所有権

一つのDOM領域を構造的に生成・再生成する主体は一つにします。

| 領域 | 所有者 |
| --- | --- |
| 完全ページ | サーバー |
| ページ本体、一覧、検索結果 | サーバーと利用アプリケーションのHTML更新手段 |
| Web Component内部 | Web Component |
| slotへ渡す利用者データ | 利用側HTML |
| 通信不要の画面状態 | Page Runtime |
| 独立部品の内部状態 | Web Component |

同じ一覧をHTML更新手段とPage Runtimeの両方で再描画したり、外部からShadow DOM内部だけを交換したりしません。Web Componentから外部へ通知するときは`CustomEvent`を発行し、外部DOMを直接変更しません。

## ライフサイクルとRuntime

共通Runtimeの公開入口は`src/runtime/index.js`です。

`KataComponent`は初回だけ実行する`mount()`と、再接続可能な`connect()`／`disconnect()`を分離します。Registryはコンポーネントの読込と登録を担当し、`connectedCallback()`を手動実行しません。

```text
初回接続: connectedCallback → mount → connect
切断:     disconnectedCallback → disconnect
再接続:   connectedCallback → connect
```

イベントリスナー、timer、observer、外部購読は`disconnect()`で解除できる構造にします。slot由来イベントの対象判定には`event.composedPath()`を使用します。内部制御要素の検索はShadow Rootへ限定し、利用者データを内部要素として誤認しないようにします。

## HTMX integration

この節はHTMXを採用する場合だけ適用します。各画面URLは直接アクセス可能な完全HTMLを返し、HTMXリクエストには交換対象の部分HTMLを返します。

```text
通常リクエスト  → レイアウトを含む完全HTML
HX-Request      → 交換対象の部分HTML
```

同じURLで返し分ける場合は`Vary: HX-Request`を設定し、完全HTMLと部分HTMLのキャッシュ混同を防ぎます。認証済み業務画面は、要件に応じて`Cache-Control: no-store`を適用します。

推奨する交換単位は、ページ本体、一覧、フォーム、一覧行、モーダル内容、通知領域、Custom Element全体です。Web Componentを更新するときは、原則としてCustom Element全体を交換します。

Shadow Root内に`hx-*`があるコンポーネントは、初期化後に`htmx.process(shadowRoot)`を実行します。`HtmxAdapter`はHTMXイベントとRuntimeの境界を担当します。

## テーマとCSS

CSSは次の順で責務を分離します。

```text
Pico CSS（任意）
  → src/styles/tokens.css
  → src/styles/themes/theme-*.css
  → src/components/*/*.css
  → 利用アプリケーションCSS
```

コンポーネントCSSは色、境界、フォーカス、影、角丸を`--kata-*`セマンティックトークン経由で参照します。特定の`data-theme`へ分岐せず、内部クラス名を外部CSS APIにしません。テーマの追加方法は[テーマ設計](./theming.md)を参照してください。

## セキュリティ境界

このリポジトリはUI資産を提供します。利用アプリケーションは次を実装・検証する必要があります。

- サーバーテンプレートのHTMLエスケープ
- CSRF対策と更新系リクエストの検証
- Content Security Policy
- 同一オリジン通信
- 認証Cookieの`Secure`、`HttpOnly`、適切な`SameSite`
- 認証切れ、権限不足、排他競合、通信失敗の共通処理
- HTMX履歴キャッシュと認証済みHTMLの扱い

禁止事項は次のとおりです。

- ユーザー入力を使う`innerHTML`や`insertAdjacentHTML()`
- `eval()`、`new Function()`、インラインイベント属性
- 部分HTML内の`script`
- 外部オリジンへの無承認`hx-*`リクエスト
- ブラウザ表示だけに依存する認可
- CDNの浮動バージョン

認証切れ時にログイン画面のHTMLを現在領域へ部分挿入せず、完全ページ遷移へ切り替えます。

### HTMXの初期設定

利用アプリケーションでは、必要なHTMX機能との互換性を確認したうえで、次を初期基準とします。

```html
<meta
  name="htmx-config"
  content='{
    "selfRequestsOnly": true,
    "allowScriptTags": false,
    "allowEval": false,
    "historyCacheSize": 0,
    "historyRestoreAsHxRequest": false,
    "reportValidityOfForms": true,
    "includeIndicatorStyles": false
  }'
>
```

認証済みHTMLをブラウザストレージへ残さないため、履歴キャッシュは初期状態で無効にします。必要に応じて有効化する場合は、保存されるHTMLと機密情報の境界を個別に評価します。

### CSPとHTTPヘッダー

初期CSPは同一オリジンを基本とし、実際の利用リソースに合わせて狭く調整します。

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{request-random}';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```

本番適用前にReport-Onlyで違反を収集します。`unsafe-eval`は許可せず、`unsafe-inline`が必要な場合は利用箇所、理由、代替不能性をADRへ記録します。

最低限、HSTS、`X-Content-Type-Options: nosniff`、`Referrer-Policy`、必要機能だけを許可する`Permissions-Policy`を検討します。具体値は利用アプリケーションの公開範囲と運用基準で確定します。

### エラー応答

| 状態 | 処理 |
| --- | --- |
| 入力エラー | フォーム部分HTMLを再表示し、入力値とエラー関係を保つ |
| 未認証 | ログイン画面へ完全遷移する |
| 権限不足 | 403画面または共通通知を返す |
| 排他競合 | 最新情報と再操作手順を表示する |
| サーバーエラー | 共通エラー領域へ安全な情報だけを表示する |
| 通信エラー | 再試行可能性を明示する |
| タイムアウト | 処理結果の確認を案内し、安易な再送を避ける |

通常GETと`HX-Request`付きGETの双方について、完全HTML／部分HTML、HTTP status、`Vary`、`script`不在、認証切れ応答を契約テストします。

## アクセシビリティ

コンポーネントの正規`template`が、ネイティブ要素、role、ARIA関係、初期フォーカスを所有します。利用アプリケーションはHTMXによる画面更新時に次を補います。

| 操作 | 必要な対応 |
| --- | --- |
| ページ相当の遷移 | `document.title`更新と`main`または見出しへのフォーカス |
| 検索結果更新 | 件数を`aria-live`で通知 |
| 保存成功 | 成功通知を読み上げ対象にする |
| 入力エラー | エラー概要と項目を関連付ける |
| モーダル | 初期フォーカス、フォーカストラップ、復帰 |

自動検査だけでは動的更新後の読み上げや操作の理解可能性を証明できないため、主要画面はキーボードと支援技術を含む手動試験を併用します。

## 依存関係とブラウザ

検証済み依存バージョンと対象ブラウザは[architecture-manifest.json](../architecture-manifest.json)を正本とします。実装や文書へ時点依存のバージョンを重複記載しません。

- 本番は完全バージョンへ固定する
- CDNの`latest`やメジャーバージョンだけの指定を使わない
- 更新候補はテスト後に取り込む
- 複数の主要依存を一度に大規模更新しない
- 静的ファイルの自ホストを基本とする

## 検証戦略

```powershell
npm run check
```

リポジトリ内の`npm run check`は、アーキテクチャLintとNode.jsテストを実行します。

| レイヤー | 主な検証 |
| --- | --- |
| アーキテクチャLint | 成果物、命名、template／slot、禁止API、CSSスコープ、依存バージョン |
| コンポーネントテスト | 初期化、属性反映、イベント、切断、再接続 |
| サーバー契約テスト | 完全HTML、部分HTML、`Vary`、エラー応答、エスケープ |
| ブラウザE2E | HTMX差し替え、履歴、Shadow DOM、フォーカス、主要業務フロー |
| アクセシビリティ | 自動検査、キーボード、読み上げ、フォーカス復帰 |

Node.jsテストだけでブラウザDOM、HTMX、フォーカス、アクセシビリティを完全には証明しません。特にShadow DOM内HTMX、slot由来イベント、切断後の再接続は実ブラウザでも確認します。

## 性能、ログ、運用

### 性能

- 初期HTMLへ全画面のtemplateを埋め込まない
- 利用しないコンポーネント資産を全ページで読み込まない
- 静的ファイルを圧縮し、適切なキャッシュを設定する
- 大量一覧はページングし、過剰なDOM生成を避ける
- HTMXの交換範囲を業務上意味のある単位にする
- Page RuntimeとWeb Componentで不要な再描画を行わない

lazy loadは初期転送量を減らす一方、Loader、失敗処理、テスト対象を増やします。対象資産が小さい場合は静的読込を優先します。

### ログ

サーバーログは、秘密情報や入力内容全体を記録せず、必要に応じて次を関連付けます。

```text
request-id / trace-id / user-id
URL / HTTP method / response status / response time
HX-Request / HX-Target / HX-Trigger
business result / exception category
```

ブラウザ側では、未処理例外、HTMX通信エラー、コンポーネント初期化エラー、CSP違反、想定外応答を、サーバーの相関IDと結び付けられるようにします。

### 依存更新

更新候補はRenovateやDependabotなどで可視化できますが、本番へ自動マージしません。

- 重大なセキュリティ更新は優先して評価する
- パッチ更新は定期確認する
- マイナー／メジャー更新は変更点と移行影響を確認する
- 更新前後でアーキテクチャLint、単体テスト、ブラウザE2Eを実行する
- 既知脆弱性とライセンスを確認する

利用アプリケーションの標準ブラウザは、組織管理されたChrome Stableを基準とします。更新を無期限に固定せず、必要に応じてBetaで主要フローを先行確認します。

## 設計規約

### MUST

1. 業務状態の正本をサーバーに置く
2. 一つのDOM領域を複数技術で再生成しない
3. Web Componentはopen Shadow DOMと正規`template`を使用する
4. 表示データはslot、構成値は属性へ渡す
5. Custom Elementのライフサイクルを手動実行しない
6. 外部通知には`CustomEvent`を使用する
7. 部分HTMLへ`script`を含めない
8. 完全HTMLと部分HTMLを返し分ける場合はキャッシュキーを分離する
9. 依存バージョンを完全固定する
10. XSS、CSRF、CSP、認証切れを利用アプリケーションで扱う

### SHOULD

1. Web Componentsは独立した再利用UIに限定する
2. 通信は利用アプリケーションが選択した一つのHTML更新手段へ統一する
3. Page Runtimeは画面単位の一時状態に限定する
4. 内部制御要素はShadow Rootから検索する
5. HTML更新手段は業務上意味のある単位で差し替える
6. 標準HTML入力要素を優先する
7. 静的ファイルを自ホストする

例外が必要な場合は、理由、影響、承認、期限をADRまたは中央管理された例外記録へ残します。

## 成功条件

本アーキテクチャの成功条件は、技術の数ではなく、それぞれの適用範囲を狭く維持できることです。

1. サーバーが業務状態の正本である
2. 利用アプリケーションが選択したHTML更新手段が通信とHTML更新を所有する
3. Page Runtimeが通信不要の画面状態だけを持つ
4. Web Componentsが独立UIの内部だけを所有する
5. templateとslotの契約が実装・仕様・テストで一致する
6. セキュリティ境界を利用アプリケーションが補完する
7. 規約違反をCIとレビューで継続的に検出する

## 導入順序

1. Pico CSS、トークン、共通レイアウト、CSP、CSRF、エラー処理を整える
2. 完全HTMLと部分HTMLの応答契約、採用したHTML更新手段の遷移、履歴、フォーカスを確立する
3. Page Runtimeと必要最小限のWeb Componentsを導入する
4. アーキテクチャLint、レスポンス契約テスト、ブラウザE2E、アクセシビリティ検査をCIへ追加する
5. ブラウザ更新、CSP違反、依存更新、例外ADRを継続的に棚卸しする
