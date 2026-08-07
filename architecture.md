# フロントエンド・アーキテクチャ提案書

## 1. 提案概要

本システムのフロントエンドには、次の構成を採用する。

```text
サーバー主導型MPA
  ＋ HTMXによるページ遷移・部分HTML更新
  ＋ Alpine.jsによる局所的なUI状態管理
  ＋ Light DOM Web Componentsによる再利用UI部品
  ＋ templateによる部品内部構造・通信不要の要素複製
  ＋ Pico CSSを基礎とした統一スタイル
```

本構成は、サーバー側を業務状態・認証・認可・永続データの正本とし、ブラウザ側へ複雑なアプリケーション状態を持たせない。

ページ遷移にはHTMXを使用し、`template`によるページ全体の自作SPAは原則として採用しない。

各技術の自由度はアーキテクチャ規約で制限し、静的解析、統合テスト、E2Eテストによって可能な範囲を自動検証する。

---

## 2. 決定事項

| 項目 | 決定 |
| --- | --- |
| 基本アーキテクチャ | サーバー主導型MPA |
| ページ遷移 | HTMXによる擬似SPA遷移 |
| 部分更新 | HTMXによるサーバー生成HTMLの差し替え |
| ページ全体の`template` SPA | 原則禁止 |
| 局所的なUI状態 | Alpine.js |
| 再利用UI部品 | Web Components |
| Web ComponentのDOM | Light DOMを標準 |
| `template`の用途 | Web Component内部構造、通信不要の要素複製 |
| 基本スタイル | Pico CSS |
| 業務固有スタイル | 独自CSSを追加 |
| 業務状態の正本 | サーバー |
| セキュリティ | CSP、CSRF、XSS対策、履歴キャッシュ制御等を必須化 |
| バージョン | 導入時点の最新安定版を選定し、固定して使用 |
| クライアント | 管理されたGoogle Chromeを標準 |
| 規約検証 | 静的解析、レスポンス検査、Playwright E2EをCIへ組み込む |

---

## 3. 適用対象

本構成は、次の特性を持つ業務Webシステムを対象とする。

- 一覧、検索、登録、編集、詳細、削除を中心とする
- サーバー側に業務ロジックが存在する
- 認証・認可が必要
- Webブラウザが主要クライアント
- 小規模な開発チームで長期保守する
- React、Vue等による大規模SPAを必要としない
- ページ遷移を高速化しつつ、URLとサーバールーティングを維持したい
- 一部の画面にリアクティブな操作が必要

次の要件が主要となった場合は、別アーキテクチャを再検討する。

- オフライン編集
- リアルタイム共同編集
- 大規模なクライアント状態管理
- ブラウザ内での大量データ処理
- Webとモバイルアプリで同じJSON APIを共有
- フロントエンドとバックエンドの完全な独立リリース
- 高度なドラッグ＆ドロップやキャンバス操作

---

## 4. 全体構成

```text
┌───────────────────────────────────────────┐
│ Google Chrome                             │
│                                           │
│ Application Shell                         │
│ ├─ header / navigation                    │
│ ├─ main#app-content                       │
│ ├─ dialog                                 │
│ └─ notification area                      │
│                                           │
│ HTMX                                      │
│ ├─ ページ遷移                             │
│ ├─ フォーム送信                           │
│ ├─ HTML断片取得                           │
│ ├─ DOM差し替え                            │
│ └─ URL・履歴管理                          │
│                                           │
│ Alpine.js                                 │
│ ├─ 開閉状態                               │
│ ├─ 選択状態                               │
│ ├─ 入力連動                               │
│ └─ ローディング表示                       │
│                                           │
│ Web Components                            │
│ ├─ 独立UI部品                             │
│ ├─ ライフサイクル                         │
│ ├─ CustomEvent                            │
│ └─ templateから内部DOM生成                │
│                                           │
│ Pico CSS＋application.css                 │
└────────────────────┬──────────────────────┘
                     │ HTTP / HTML / Form Data
┌────────────────────▼──────────────────────┐
│ サーバー                                  │
│ ├─ URLルーティング                        │
│ ├─ 認証・認可                             │
│ ├─ 業務ロジック                           │
│ ├─ 入力検証                               │
│ ├─ 排他制御                               │
│ ├─ データ永続化                           │
│ ├─ 完全HTML生成                           │
│ └─ 部分HTML生成                           │
└───────────────────────────────────────────┘
```

---

## 5. 技術別の責務

### 5.1 サーバー

サーバーは次の責務を持つ。

- 認証
- 認可
- 業務ルール
- 入力値検証
- 排他制御
- データベース更新
- 画面表示可否の最終判断
- 完全HTMLの生成
- HTMX用部分HTMLの生成
- エラー分類
- 監査ログ
- CSRF検証

ブラウザ側の検証や表示制御だけを、認可・業務判断の根拠としてはならない。

---

### 5.2 HTMX

HTMXは、サーバー通信とHTML差し替えを担当する。

主な用途は次のとおり。

- ページ遷移
- 一覧検索
- ページング
- 並べ替え
- フォーム送信
- 入力エラーの再表示
- モーダル内容の取得
- 一覧行の追加・更新・削除
- サーバー処理後の複数箇所更新

サーバーは、HTMXリクエストに対して原則としてJSONではなくHTMLを返す。HTMX公式も、サーバーがHTMLを返す構成を基本モデルとしている。citeturn110004search2

---

### 5.3 Alpine.js

Alpine.jsは、通信を必要としない局所的なUI状態を担当する。

採用対象は次のとおり。

- 表示・非表示
- ドロップダウンの開閉
- タブ切り替え
- モーダルの開閉
- 選択件数
- 入力値に応じた補助表示
- 確認UI
- ローディング状態
- クライアント側プレビュー

次の状態はAlpine.jsへ持たせない。

- DBデータの正本
- 認可情報
- ワークフロー状態
- 一覧全体の業務データ
- 複数ページをまたぐ編集状態
- 独自のAPIキャッシュ
- 大規模なグローバルストア

Alpine.jsからの直接`fetch()`は原則禁止とし、通信はHTMXへ統一する。HTMLでは成立しない明確な理由がある場合のみ、アーキテクチャ例外として承認する。

---

### 5.4 Web Components

Web Componentsは、独立した振る舞いとライフサイクルを持つ再利用UI部品に使用する。

採用対象の例：

```html
<date-range-input></date-range-input>
<user-autocomplete></user-autocomplete>
<file-uploader></file-uploader>
<money-input></money-input>
```

採用条件は次のとおり。

- 複数画面で再利用される
- 内部状態を持つ
- 初期化・破棄処理がある
- 属性、プロパティ、イベントによる公開APIを定義できる
- 内部構造を呼び出し側から隠す価値がある

単純なボタン、見出し、一覧行、ラベル等はWeb Component化しない。

---

### 5.5 `template`

`template`は次の用途に限定する。

1. Web Componentの内部HTML構造
2. 通信不要の明細行追加
3. 通信不要のウィザード内部ステップ
4. 通知、ダイアログ等の一時生成
5. 同一画面内の単純な反復要素

次の用途は禁止する。

- ページ全体を`template`として保持する
- `history.pushState()`を使用した自作ルーターを作る
- サーバールーティングと別の画面ルーティングを作る
- 全画面の`template`を初期HTMLへ埋め込む
- サーバー生成HTMLとクライアント`template`で同一領域を二重生成する

---

### 5.6 Pico CSS

Pico CSSは、次の基本スタイルを提供する。

- タイポグラフィ
- フォーム
- ボタン
- テーブル
- 基本的な余白
- コンテナ
- 配色
- レスポンシブ対応
- ライト・ダークテーマ

Pico CSSだけで業務画面全体を完成させようとはせず、次の層を追加する。

```text
pico.min.css
  → 標準HTMLの基本スタイル

src/styles/kata-ui.css
  → tokens.cssと選択可能なTheme CSSの入口

src/styles/tokens.css
  → Pico CSSとComponent CSSを分離するセマンティック設計変数

src/styles/themes/*.css
  → data-themeに応じたトークン値

application.css
  → 画面レイアウト、共通業務スタイル

src/components/*/*.css
  → 独自コンポーネント
```

Pico CSS自身も、大規模な画面では追加のCSSまたはSCSS知識が必要な出発点として位置付けられている。citeturn724783view4

---

## 6. ページ遷移

### 6.1 基本方式

各画面は、サーバー上に直接アクセス可能なURLを持つ。

```text
/users
/users/123
/orders
/orders/123
/orders/123/edit
```

直接アクセス時には完全HTMLを返し、HTMXリクエスト時には`main`へ挿入する部分HTMLを返す。

```text
通常リクエスト
  → レイアウトを含む完全HTML

HX-Request
  → #app-contentへ挿入する部分HTML
```

ページ遷移は、HTMXによる`hx-boost`または明示的な`hx-get`、`hx-push-url`を使用する。

URL、履歴、直接アクセス、再読み込み、認証・認可の正本はサーバー側に置く。

---

### 6.2 レスポンス契約

同じURLが完全HTMLと部分HTMLを返し分ける場合、次を必須とする。

```http
Vary: HX-Request
```

キャッシュによって完全HTMLと部分HTMLが混同されないよう、レスポンスのキャッシュキーを分離する。

認証済み業務画面は、原則として次を指定する。

```http
Cache-Control: no-store
```

静的ファイルは、ファイル名へハッシュを付け、長期キャッシュを使用する。

---

### 6.3 HTMX差し替え単位

推奨する差し替え単位：

- ページ本体
- 一覧
- フォーム
- 一覧行
- モーダル内容
- 通知領域
- Web Component全体

避ける差し替え単位：

- Web Component内部の深い要素
- Alpine.jsが一時状態を保持している途中の要素
- ページ全体の`body`
- 入力項目一つだけの過度に細かい差し替え

Web Componentを更新するときは、原則としてCustom Element全体を`outerHTML`で交換する。

---

## 7. DOMと状態の所有権

### 7.1 必須原則

一つのDOM領域を構造的に生成・再生成する主体は一つとする。

| 領域 | 所有者 |
| --- | --- |
| 完全ページ | サーバー |
| ページ本体 | サーバー＋HTMX |
| 一覧・検索結果 | サーバー＋HTMX |
| Web Component内部 | Web Component |
| 局所的な表示状態 | Alpine.js |
| 通信不要の明細行 | `template`またはAlpine.jsのどちらか |
| モーダル内容 | サーバー＋HTMX |
| モーダル開閉 | Alpine.jsまたはWeb Component |

同じ一覧について、HTMXによるHTML差し替えとAlpine.jsの`x-for`による再描画を併用してはならない。

---

### 7.2 状態の所有者

```text
永続的な業務状態
  → サーバー

局所的な画面状態
  → Alpine.js

独立部品内部の状態
  → Web Component
```

Web Componentから外部へ通知するときは、外部DOMを直接更新せず、`CustomEvent`を発行する。

---

## 8. Light DOMとShadow DOM

Web ComponentはLight DOMを標準とする。

理由：

- Pico CSSをそのまま適用できる
- HTMXと統合しやすい
- Alpine.jsから扱いやすい
- フォームへ統合しやすい
- DevToolsで確認しやすい
- 業務画面からCSSを調整しやすい

Shadow DOMは原則禁止とし、次の場合だけADRによる承認を必要とする。

- 外部システムへ配布する部品
- 外部CSSから完全隔離する必要がある
- サードパーティー画面へ埋め込む
- 部品固有の見た目を厳格に保証する必要がある

---

## 9. バージョンおよびクライアント環境

### 9.1 採用バージョン

導入時点の最新安定版を採用する。ただし、本番環境で`latest`やメジャーバージョンだけを指定してはならず、検証済みの完全なバージョン番号へ固定する。

2026年8月7日時点で確認できる安定版は次のとおり。

| ライブラリ | 基準バージョン |
| --- | ---: |
| HTMX | 2.0.10 |
| Alpine.js | 3.15.12 |
| Alpine CSP Build | 3.15.12と同一系列 |
| Pico CSS | 2.1.1 |

HTMX公式ドキュメントは2.0.10を掲載している。citeturn110004search2
Alpine.js公式リポジトリおよびnpmでは3.15.12が最新安定版として確認できる。citeturn725570search3turn293266search1
Pico CSS公式リポジトリでは2.1.1が最新リリースとして示されている。citeturn293266search4

実際のプロジェクト開始時には、上記バージョンを再確認する。

---

### 9.2 バージョン固定

本番では、次のようにバージョン別ディレクトリへ自ホストする。

```text
wwwroot/vendor/
├─ htmx/2.0.10/htmx.min.js
├─ alpine-csp/3.15.12/cdn.min.js
└─ pico/2.1.1/pico.min.css
```

禁止事項：

- CDNの`@latest`
- バージョン番号なしのCDN参照
- `@2`などメジャーバージョンだけの指定
- 複数バージョンの混在
- 検証なしの自動本番更新

CDNを使用する場合は、完全なバージョン固定とSRIを必須とする。ただし、業務システムでは可用性、CSP、サプライチェーン管理を単純にするため、自ホストを標準とする。

---

### 9.3 Google Chrome環境

標準クライアントは、企業管理されたGoogle Chrome StableまたはExtended Stableとする。

2026年8月7日時点で公式サイトから確認できる広域StableはChrome 150系であり、Windows/macOSでは`150.0.7871.186/.187`、Linuxでは`150.0.7871.186`である。Chrome 151系は一部利用者向けEarly Stableとして提供されている段階である。citeturn665159search0turn665159search1

Chrome Stableは通常、メジャー更新が約4週間ごと、マイナー更新が2〜3週間ごとに行われる。Extended Stableは約8週間ごとの機能更新で、セキュリティ修正は継続して提供される。citeturn846163search12

初期の受入試験対象は次とする。

| 対象 | 方針 |
| --- | --- |
| Chrome Stable | 必須対応 |
| Chrome Extended Stable | 必須対応 |
| Chrome Stableの一つ前のメジャー | 移行期間として確認 |
| Chrome Beta | CIまたは事前互換性確認に使用 |
| Chrome Dev／Canary | 本番対象外 |
| ChromeOS Stable | 使用端末に含まれる場合は必須 |
| Android Chrome | モバイル利用が要件にある場合のみ |
| Android WebView | 原則対象外。必要なら別途バージョン管理 |
| Internet Explorer | 対象外 |
| 古い埋め込みChromium | 対象外 |

HTMX 2.xはInternet Explorer対応を終了しており、Alpine.js 3もIE11を公式サポートしていない。citeturn110004search19turn110004search14

Pico CSSは最新安定版のChrome、Firefox、Edge、Safariをテスト対象としているため、古いChromeを長期間固定する運用は保証対象外とする。citeturn724783view4

---

### 9.4 Chrome更新ポリシー

- Chromeの自動更新を有効にする
- StableまたはExtended Stableを使用する
- バージョンを無期限に固定しない
- 新メジャーバージョン公開前にBetaで主要E2Eテストを実行する
- 新バージョン展開後、主要業務フローを再確認する
- ブラウザ起因の障害に備え、直前メジャーでの再現確認手段を残す

---

## 10. セキュリティ設計

### 10.1 基本方針

次をセキュリティ上の必須事項とする。

- サーバー側HTMLエスケープ
- CSRF対策
- Content Security Policy
- 同一オリジン通信
- 認証Cookieの保護
- HTMX履歴キャッシュ制御
- 部分HTML内の`script`禁止
- Alpine.jsの`x-html`禁止
- 独自JavaScriptでの`innerHTML`禁止
- 外部URLへのHTMXリクエスト禁止
- 依存ライブラリの固定と脆弱性監視

---

### 10.2 XSS対策

サーバーテンプレートエンジンの自動エスケープを有効にする。

禁止する実装：

```html
<div x-html="serverValue"></div>
```

```javascript
element.innerHTML = userInput;
```

```javascript
element.insertAdjacentHTML("beforeend", userInput);
```

Ajaxレスポンス内に`script`タグを含めてはならない。

HTMLを許容する業務要件がある場合は、許可タグと許可属性を限定したサーバー側サニタイザーを使用し、個別のセキュリティレビューを行う。

---

### 10.3 Alpine.jsとCSP

標準版Alpine.jsは、HTML属性内の式を処理する仕組みが厳格なCSPの`unsafe-eval`制限と競合する。Alpine.jsは、`unsafe-eval`を必要としない公式CSP対応ビルドを提供している。citeturn110004search0

本システムでは、原則として`@alpinejs/csp`を採用する。

Alpine式は単純な参照と操作に限定し、複雑な処理は`Alpine.data()`へ抽出する。

---

### 10.4 HTMX設定

初期設定は次を基準とする。

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
  }'>
```

`allowEval: false`は、利用するHTMX機能が評価系機能へ依存しないことを確認して採用する。

HTMXには、同一ドメイン通信、動的コンテンツ内の`script`処理、履歴キャッシュ等を制御する設定がある。履歴キャッシュはHTMLをブラウザの`localStorage`へ保存するため、認証済み業務画面では初期段階から無効にする。citeturn846163search15turn110004search1

HTMX内蔵のインジケーターCSSは使用せず、`application.css`に明示的に定義する。

---

### 10.5 Content Security Policy

初期方針は次を基準とし、実際の利用リソースに合わせて調整する。

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

本番適用前に、ステージング環境で`Content-Security-Policy-Report-Only`を使用し、違反を収集する。

`unsafe-eval`は許可しない。`unsafe-inline`も原則として許可せず、必要な場合は利用箇所と理由をADRへ記録する。

---

### 10.6 CSRF

更新系リクエストには、使用するサーバーフレームワークのCSRF対策を適用する。

- CSRFトークンをフォームへ埋め込む
- または共通ヘッダーとして付与する
- サーバーで必ず検証する
- GETで状態を変更しない
- Cookieに`Secure`、`HttpOnly`、適切な`SameSite`を設定する

HTMX経由のフォーム送信も通常フォームと同一のCSRF保護対象とする。

---

### 10.7 セキュリティ関連ヘッダー

最低限、次を設定する。

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: 必要な機能だけ許可
```

クリックジャッキング対策はCSPの`frame-ancestors`を正本とする。

---

### 10.8 認証切れ・権限エラー

部分HTMLリクエスト中に認証が切れた場合、ログイン画面のHTMLを現在の画面へ部分挿入してはならない。

認証切れ時は、共通ハンドラーによって完全ページ遷移させる。

標準エラー分類：

| 状態 | 処理 |
| --- | --- |
| 入力エラー | フォーム部分HTMLを再表示 |
| 未認証 | ログイン画面へ完全遷移 |
| 権限不足 | 403画面または共通通知 |
| 排他競合 | 最新情報と再操作手順を表示 |
| サーバーエラー | 共通エラー領域を表示 |
| 通信エラー | 再試行可能な通知 |
| タイムアウト | 処理結果確認を案内し、安易に再送しない |

---

## 11. アーキテクチャ規約

規約の強度を次の3段階で定義する。

- **MUST**：違反を認めない
- **SHOULD**：原則として従う。例外は理由を記録する
- **MAY**：必要に応じて選択できる

### 11.1 MUST

1. 各画面URLは直接アクセス可能な完全HTMLを返す
2. ページ遷移にはHTMXを使用する
3. ページ全体の`template` SPAを作らない
4. 業務状態の正本はサーバーに置く
5. 一つのDOM領域を複数技術で再生成しない
6. Alpine.jsは局所的なUI状態だけを管理する
7. Web ComponentはLight DOMを標準とする
8. Ajaxレスポンスへ`script`タグを含めない
9. 部分HTMLを返すURLは直接アクセス時に完全HTMLを返せること
10. 完全HTMLと部分HTMLを返し分ける場合は`Vary: HX-Request`を設定する
11. ライブラリのバージョンを完全固定する
12. XSS、CSRF、CSP、認証切れ処理を実装する
13. `x-html`とユーザー入力に対する`innerHTML`を使用しない
14. HTMXリクエストは同一オリジンに限定する
15. 複雑な例外はADRへ記録する

### 11.2 SHOULD

1. Web Componentsは複数画面で再利用する独立UIに限定する
2. 通信はHTMXへ統一する
3. Alpine式は短く保つ
4. 複雑なAlpine処理は`Alpine.data()`へ抽出する
5. Web Componentから外部へは`CustomEvent`で通知する
6. 標準HTML入力要素を優先する
7. Web Componentは内部に通常の`input`を持たせる
8. Pico CSSの変数を`tokens.css`で上書きする
9. HTMX差し替えは業務上意味のある単位とする
10. 静的ファイルを自ホストする

### 11.3 原則禁止

- 自作SPAルーター
- `history.pushState()`、`replaceState()`の直接利用
- Shadow DOMの無承認利用
- Alpine.jsからの無承認`fetch()`
- `x-html`
- インラインイベント属性
- 部分HTML内の`script`
- CDNの浮動バージョン
- 同一領域でのHTMXと`x-for`の二重描画
- Web Component内部の深い要素をHTMXで直接交換
- サーバー側認可を省略した表示制御
- JavaScript文字列によるHTML組み立て

---

## 12. 規約の自動検証

すべての設計意図を完全に自動判定することはできないが、構文上確認できる規約はCIで検証する。

### 12.1 静的解析

| 検査対象 | 検査内容 |
| --- | --- |
| HTML・サーバーテンプレート | `x-html`禁止 |
| HTML・サーバーテンプレート | インラインイベント属性禁止 |
| 部分ビュー | `script`タグ禁止 |
| HTML | 外部オリジンへの`hx-get`、`hx-post`禁止 |
| JavaScript | `innerHTML`、`insertAdjacentHTML`の制限 |
| JavaScript | `fetch()`の利用箇所制限 |
| JavaScript | `pushState()`、`replaceState()`禁止 |
| JavaScript | `attachShadow()`禁止または許可リスト制 |
| JavaScript | `eval()`、`Function()`禁止 |
| Web Components | `customElements.define()`の重複検査 |
| 依存関係 | 完全バージョン固定 |
| CSS | `!important`、過度な詳細度等の検査 |

実装方法は次を組み合わせる。

- ESLint
- Stylelint
- HTMLHintまたはHTML ASTベースの独自検査
- Semgrep等のパターン検査
- サーバーテンプレート向け独自アーキテクチャLint
- lockfile検査

---

### 12.2 独自アーキテクチャLint

プロジェクト固有のCLIを一つ用意し、次を検査する。

```text
architecture-lint
├─ partialにscriptがない
├─ x-htmlがない
├─ 外部URLのhx-*がない
├─ page templateによるSPA構造がない
├─ pushState利用がない
├─ Shadow DOM利用が許可リスト内
├─ Web Component名と定義が対応している
├─ vendorバージョンとmanifestが一致する
└─ 禁止APIの利用がない
```

例外はコード内コメントで抑制せず、次のような中央管理ファイルで承認する。

```yaml
architecture-exceptions:
  - rule: no-shadow-dom
    target: js/components/external-map.js
    adr: ADR-0012
    expires: 2027-03-31
```

例外には、理由、承認者、ADR、期限を必須とする。

---

### 12.3 サーバーレスポンス契約テスト

各画面URLについて、次を自動検証する。

```text
通常GET
  → <!doctype html>を含む完全HTML
  → main#app-contentが存在
  → HTTP 200

HX-Request付きGET
  → 差し替え対象の部分HTML
  → 不要なhtml/head/bodyを含まない
  → scriptタグを含まない
  → Vary: HX-Requestが存在
```

認証切れ、403、404、422、500についても、HTMXリクエスト時のレスポンス契約を検証する。

---

### 12.4 E2Eテスト

Playwrightを使用し、Google Chromeチャネルで次を自動実行する。

1. URL直接アクセス
2. HTMXページ遷移
3. ブラウザの戻る・進む
4. 再読み込み
5. 検索・ページング
6. 登録・編集・削除
7. 入力エラー
8. 認証切れ
9. 排他競合
10. HTMX差し替え後のAlpine.js動作
11. Web Component再接続時のイベント重複
12. CSP違反の有無
13. JavaScript例外の有無
14. キーボード操作
15. フォーカス移動

Chrome Stableを必須ジョブとし、Chrome Betaで定期的な先行互換性試験を実施する。

---

### 12.5 アクセシビリティ検査

自動検査にはaxe-core等を使用し、次を確認する。

- ラベル
- 見出し構造
- 色コントラスト
- ARIA属性
- キーボード操作
- フォーカス可能要素
- 重複ID

ただし、動的更新後の読み上げ、フォーカス復帰、操作の理解可能性は自動検査だけでは保証できないため、主要画面について手動試験を併用する。

---

### 12.6 依存関係検査

- RenovateまたはDependabotで更新候補をPR化する
- 本番へ自動マージしない
- lockfileまたはvendor manifestを検査する
- 既知脆弱性をCIで検査する
- ライセンスを記録する
- 更新前後でE2Eテストを実行する
- HTMX、Alpine.js、Pico CSSを同時にメジャー更新しない

---

## 13. テスト戦略

| レイヤー | 主な検証内容 |
| --- | --- |
| ドメイン・アプリケーション | 業務ルール、認可、排他 |
| サーバーHTML | 完全HTML、部分HTML、エスケープ |
| レスポンス契約 | HX-Request、Vary、エラー |
| Web Component | 初期化、再接続、属性変更、イベント |
| Alpine.js | 局所状態、開閉、入力連動 |
| HTMX | target、swap、履歴、エラー処理 |
| セキュリティ | CSP、CSRF、XSS、Cookie |
| E2E | 主要業務フロー |
| アクセシビリティ | キーボード、フォーカス、通知 |

特に次を回帰テストの必須ケースとする。

- HTMX遷移後もAlpine.jsが動作する
- Web Componentが再挿入されてもイベントが二重登録されない
- 戻る・進むで正しい画面が復元される
- 認証切れ時にログインHTMLが部分挿入されない
- 入力エラー後に入力値が保持される
- Web Component全体の交換後に状態が整合する
- CSP違反が発生しない

---

## 14. アクセシビリティ

HTMXによる画面差し替えでは、次を明示的に実装する。

| 操作 | 対応 |
| --- | --- |
| ページ相当の遷移 | `main`または先頭見出しへフォーカス |
| ページ遷移 | `document.title`更新 |
| 検索結果更新 | 件数を`aria-live`で通知 |
| 保存成功 | 成功通知を読み上げ対象にする |
| 入力エラー | エラー概要と項目を関連付ける |
| モーダル | 初期フォーカス、フォーカストラップ、復帰 |
| 削除 | 次の操作対象へフォーカス |
| 通信中 | `aria-busy`または状態テキスト |

独自入力部品では、可能な限り内部にネイティブな`input`、`select`、`button`を使用する。

---

## 15. 性能設計

- 初期HTMLへ全画面の`template`を埋め込まない
- 共通利用しないWeb Componentを全ページで読み込まない
- ページ固有JavaScriptは必要な画面だけ読み込む
- 静的ファイルへハッシュを付与する
- gzipまたはBrotliを有効にする
- 一覧にはページングを使用する
- 大量DOM生成を避ける
- HTMXの差し替え範囲を適切な大きさにする
- Web Component内部で不要な再描画を行わない
- Alpine.jsの大規模な`x-for`を避ける

---

## 16. ログおよび監視

サーバーログには次を記録する。

```text
request-id
trace-id
user-id
URL
HTTP method
HX-Request
HX-Target
HX-Trigger
response status
response time
business result
exception category
```

ブラウザ側では次を収集する。

- 未処理JavaScript例外
- HTMX通信エラー
- Web Component初期化エラー
- CSP違反
- 想定外のレスポンス
- 現在URL
- サーバーから返された相関ID

個人情報、認証トークン、入力内容全体をログへ記録してはならない。

---

## 17. 依存ライブラリ更新方針

「最新版を採用する」は、常に自動的に最新版へ追従することを意味しない。

次の運用とする。

```text
導入時
  → 最新安定版を調査
  → Chrome環境で検証
  → 完全バージョン固定
  → 本番リリース

運用中
  → 更新候補を自動検出
  → 変更内容を確認
  → CI・E2E実行
  → ステージング確認
  → 本番適用
```

更新周期：

- 重大なセキュリティ更新：優先対応
- パッチ更新：月次確認
- マイナー更新：四半期単位で検討
- メジャー更新：個別計画とADRを作成

---

## 18. 主なリスクと対策

| リスク | 対策 |
| --- | --- |
| HTMX、Alpine、Web Componentsの責務重複 | DOM・状態所有者を規約化 |
| 自由なHTML属性記述による属人化 | アーキテクチャLint |
| Alpine式の肥大化 | `Alpine.data()`へ抽出 |
| Web Componentの乱立 | 採用条件を明示 |
| HTMX履歴への機密情報保存 | 履歴キャッシュを無効化 |
| 部分HTMLと完全HTMLのキャッシュ混同 | `Vary: HX-Request` |
| 認証切れ画面の部分挿入 | 共通エラーハンドラー |
| XSS | 自動エスケープ、`x-html`禁止、CSP |
| CSPとAlpine.jsの競合 | Alpine CSP Build採用 |
| Chrome自動更新による不具合 | Stable＋Betaの継続E2E |
| Pico CSSだけでは不足 | 独自CSS層を正式に許可 |
| 規約だけで形骸化 | CIで自動検査 |
| 自動検査できない設計違反 | コードレビューとADR |

---

## 19. 成功条件

本アーキテクチャの成功条件は、使用技術の数ではなく、各技術の適用範囲を狭く維持できることである。

特に次を継続して守る。

1. サーバーを業務状態の正本とする
2. ページ遷移をHTMXへ統一する
3. Alpine.jsを局所状態に限定する
4. Web Componentsを独立UI部品に限定する
5. `template`をページルーターとして使用しない
6. 一つのDOM領域の所有者を一つにする
7. セキュリティ設定を初期実装に含める
8. 規約違反をCIで検出する
9. ライブラリとブラウザの更新を継続的に検証する
10. 例外はADRと期限付き許可リストで管理する

---

## 20. 導入手順

### フェーズ1：基盤

- Pico CSS
- `tokens.css`
- `application.css`
- HTMX
- Alpine CSP Build
- 共通レイアウト
- CSP
- CSRF
- 共通エラー処理

### フェーズ2：ページ遷移

- 完全HTMLと部分HTMLの返却
- HTMXページ遷移
- `Vary: HX-Request`
- 履歴・戻る・進む
- フォーカス制御

### フェーズ3：局所UI

- Alpine.jsによる開閉・入力連動
- Web Components
- `template`
- CustomEvent

### フェーズ4：自動検証

- ESLint
- Stylelint
- アーキテクチャLint
- レスポンス契約テスト
- Playwright
- axe-core
- 依存関係検査

### フェーズ5：運用

- Chrome Stable／Betaでの定期試験
- CSPレポート監視
- 依存ライブラリ更新
- 例外ADRの棚卸し
- 規約違反状況の確認

---

## 21. 最終提案

本システムの標準アーキテクチャとして、次を採用する。

```text
サーバー主導型MPA
  ＋ HTMXによるページ遷移と部分更新
  ＋ Alpine.js CSP Buildによる局所的なUI状態
  ＋ Light DOM Web Componentsによる再利用UI
  ＋ templateによる部品構造と通信不要の複製
  ＋ Pico CSSおよび業務固有CSS
  ＋ CSP、CSRF、XSS対策
  ＋ アーキテクチャLintとE2Eによる規約検証
```

`template`によるページ全体の自作SPAは採用しない。

設計上の自由度は、アーキテクチャドキュメント、MUST／SHOULD規約、ADR、期限付き例外、CI検査によって制御する。

本構成は、フロントエンド専用の大規模フレームワークを導入せず、URL、HTML、フォーム、サーバールーティングというWeb標準を維持しながら、業務システムに必要な操作性と保守性を確保する案とする。
