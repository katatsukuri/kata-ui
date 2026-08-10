# kata-ui コンポーネント設計

## 目的

`kata-ui`のコンポーネントは、サーバー生成HTMLと協調する標準化されたUI境界です。JavaScriptでページ全体を構築するのではなく、UIの骨格、ARIA、内部状態、イベント、ライフサイクルを再利用可能な単位へ閉じ込めます。

利用側の入力契約は、属性とslotです。

- 表示データ: default／named `slot`
- 値、URL、フォーム名、状態、外部設定: Custom Elementの属性
- UI骨格、CSS、ARIA: open Shadow DOMへ複製する正規`template`

この文書は共通の実装規約を定義します。各コンポーネント固有の属性、slot、イベント、エラー条件は、同じディレクトリにある`*.spec.md`を正本とします。

## 成果物の単位

コンポーネントは契約、構造、振る舞い、見た目、検証、利用例を一つのディレクトリで管理します。

```text
src/components/kata-example/
├── kata-example.spec.md
├── kata-example.html
├── kata-example.js
├── kata-example.css
├── kata-example.test.js
└── examples/
    └── index.html
```

| ファイル | 責務 |
| --- | --- |
| `*.spec.md` | 利用側から見える公開契約 |
| `*.html` | Shadow DOMへ複製する正規`template` |
| `*.js` | ライフサイクル、状態、イベント |
| `*.css` | コンポーネント固有のレイアウトと見た目 |
| `*.test.js` | 契約とライフサイクルの回帰検証 |
| `examples/` | 実際の利用例とブラウザ確認入口 |

仕様を先に定義すると、利用側HTML、template、実装、テストを同じ契約に揃えられます。

## Web Component化の判断

次の複数を満たすUIはWeb Component化の候補です。

- 複数画面で再利用する
- 独立した内部状態を持つ
- 外部へイベントを通知する
- 初期化または破棄処理がある
- 内部構造を利用側から隠す価値がある

単純な見出し、ラベル、一覧行、通常のボタンなど、標準HTMLとCSSだけで十分な要素はWeb Component化しません。抽象化の便益より、資産、ライフサイクル、テストの保守コストが上回るためです。

## HTML契約

### 正規template

各コンポーネントは、画面内にある`<template id="kata-*-template">`をShadow DOMへ複製します。

```html
<template id="kata-user-card-template">
  <article class="kata-user-card">
    <header>
      <h2><slot name="name">名前</slot></h2>
    </header>
    <p><slot name="email">メールアドレス</slot></p>
    <button type="button"><slot name="action">詳細</slot></button>
  </article>
</template>
```

templateは次を所有します。

- セマンティックな内部HTML
- レイアウト用要素と内部class
- ネイティブ操作要素
- role、ARIA関係、初期状態
- slotとフォールバック表示

利用側の子HTMLがある場合もtemplateを置き換えません。

### 利用側HTML

```html
<kata-user-card user-id="123">
  <span slot="name">山田太郎</span>
  <span slot="email">yamada@example.com</span>
  <span slot="action">詳細を見る</span>
</kata-user-card>
```

`user-id`は動作上の構成値なので属性、名前、メールアドレス、操作名は表示データなのでslotです。表示用HTMLをJSONや文字列として属性へ格納しません。

### HTML規約

- セマンティックHTMLとネイティブ操作要素を優先する
- classは既存のBEM命名へ合わせる
- 内部IDはShadow Root内のARIA関係に限定する
- `data-*`はJavaScriptが参照する動作対象または状態に限定する
- `script`、インラインイベント、JavaScript URLをtemplateへ含めない
- 利用側が内部DOM構造を再記述する契約にしない

## slot設計

### 固定件数の表示領域

タイトル、説明、本文、操作名など、役割と件数が固定された領域はnamed slotまたはdefault slotを使用します。

```html
<kata-card>
  <span slot="title">アカウント</span>
  <span slot="description">登録内容を確認します。</span>
  <dl>...</dl>
  <span slot="action">編集</span>
</kata-card>
```

### 任意件数の項目

任意件数の反復項目は、利用側の意味ある子HTMLをdefault slotへ投影します。各項目が独立した状態やARIAを持つ場合は、`<kata-*-item>`のような子Custom Elementをデータ境界にします。

`kata-accordion`では、親が排他制御、子が一項目分のtemplate、状態、ARIAを担当します。項目数に応じて`slot="item-1"`のような名前をJavaScriptで生成しません。

### 投影要素の検索

内部制御要素はShadow Rootだけから検索します。利用者がslotへ渡した要素に内部classや`data-*`と同じ名前があっても、内部イベント対象として扱いません。

投影項目を扱う必要がある場合だけ、`queryProjected()`、`queryProjectedAll()`など専用helperを使用します。slot由来イベントの対象判定は`event.composedPath()`を使います。

## 属性設計

属性は、ネイティブ要素またはコンポーネント動作の構成値を表します。

- `name`、`value`、`href`
- `checked`、`disabled`、`required`
- `side`、`type`、`variant`
- 外部ライブラリへ渡す設定値

Boolean属性は、値の文字列ではなく属性の有無で判定します。属性変更へ追従する場合は`observedAttributes`と`attributeChangedCallback()`を使用し、初期化前の呼び出しも安全に扱います。

後方互換aliasを設ける場合は、正規属性へ変換する境界と廃止条件を仕様へ記載します。

## 共通Runtimeとライフサイクル

共通機能は`src/runtime/index.js`を公開入口とします。

### `KataComponent`

コンポーネントは初回構築と接続中の処理を分離します。

```text
constructor
  └─ 内部フィールドと再利用するhandlerを準備

connectedCallback
  ├─ 初回だけmount
  └─ 接続ごとにconnect

disconnectedCallback
  └─ disconnect
```

| フェーズ | 主な責務 |
| --- | --- |
| `constructor()` | 内部状態とhandlerの準備 |
| `mount()` | Shadow Rootと一度だけ作る内部参照 |
| `connect()` | listener、observer、外部購読の登録 |
| `disconnect()` | 接続時に登録した資源の解除 |

`constructor()`でAPI通信、外部DOM探索、業務処理を行いません。Registryや利用側コードから`connectedCallback()`を手動実行しません。

### template初期化

通常のコンポーネントは`initializeShadowComponent()`、反復フレームを生成するコンポーネントは必要に応じて`initializeShadowCollection()`を使用します。

```js
import { initializeShadowComponent } from '../../loader/template-loader.js';
import { KataComponent } from '../../runtime/index.js';

export class KataExample extends KataComponent {
  mount() {
    initializeShadowComponent(
      this,
      this.getAttribute('template') || 'kata-example-template',
      import.meta.url,
    );
  }
}
```

templateの解決に失敗した場合は、暗黙の別骨格へフォールバックせず初期化エラーとします。

## 状態管理

状態の所有者を一つにします。

| 状態 | 所有者 | 例 |
| --- | --- | --- |
| サーバー状態 | サーバー | ユーザー、注文、権限、ワークフロー |
| 画面状態 | Page Runtime | サイドバー、選択件数、ローディング |
| コンポーネント状態 | Web Component | 開閉、選択、内部入力状態 |

同じ値をサーバー、Page Runtime、Web Component、別のJavaScriptへ重複保持しません。外部から観測が必要な状態は、属性、ARIA、イベントのどれを契約にするか仕様で定義します。

## イベント設計

コンポーネントから外部へは`CustomEvent`で通知します。

```js
this.dispatchEvent(new CustomEvent('user-selected', {
  bubbles: true,
  composed: true,
  detail: { userId: this.userId },
}));
```

イベント名、発火条件、`bubbles`、`composed`、`detail`の形を`*.spec.md`へ記載します。外部の`#global-area`などをコンポーネントから直接変更しません。

入力に近いコンポーネントは、標準イベントとの互換性を優先します。独自イベントを追加する場合も、標準`change`や`input`との関係を明示します。

## HTMX連携

HTMXはCustom Element全体、またはslotへ渡したLight DOMを更新します。Shadow DOM内部の深い要素を外部から交換しません。

```html
<div
  id="user-card-host"
  hx-get="/users/123/card"
  hx-target="this"
  hx-swap="innerHTML"
></div>
```

Shadow Root内に`hx-*`がある場合は、構築後にそのShadow Rootを`htmx.process()`へ渡します。切断・再接続時にHTMX処理やイベントが重複しないことをテストします。

## CSSとテーマ

コンポーネントCSSはShadow DOM内部のレイアウトと状態表現を担当します。

```css
:host {
  display: block;
}

.kata-user-card {
  color: var(--kata-color-text);
  background: var(--kata-color-surface);
  border: 1px solid var(--kata-color-border);
  border-radius: var(--kata-radius-md);
}
```

規約は次のとおりです。

- `:host`でhostの基本表示を定義する
- 内部classはBEM形式に揃える
- 色、境界、フォーカス、影、角丸は`--kata-*`を参照する
- 特定の`data-theme`へコンポーネントCSSから分岐しない
- `!important`と過度に詳細なセレクタを使わない
- 外部へ装飾を許す箇所だけ`part`を公開する

Pico CSS変数を使う場合は、`--kata-*`の後方互換フォールバックに限定します。

## アクセシビリティ

ARIAを利用側へ丸投げせず、正規templateで一元管理します。

- ネイティブの`button`、`input`、`select`、`dialog`を優先する
- labelと入力要素を関連付ける
- role、`aria-expanded`、`aria-selected`、`aria-controls`を状態と同期する
- キーボード操作とフォーカス移動を仕様化する
- 装飾アイコンは支援技術から隠す
- slotのフォールバックでも操作可能な構造を保つ

Shadow Root内のIDは別のShadow Rootと衝突しませんが、同じShadow Root内のARIA参照は一意に保ちます。

## 仕様書の標準構成

各`*.spec.md`は、該当する項目だけを次の順で記載します。

1. コンポーネントの目的
2. 利用例
3. 必須条件
4. 属性
5. slot
6. 状態と動作
7. イベントまたはメソッド
8. アクセシビリティ
9. エラー条件
10. 制約またはHTMX連携

実装に存在しない属性、イベント、互換性、保証を文書だけで追加しません。

## テスト標準

### 契約テスト

- 必要なtemplate、slot、内部要素が存在する
- 属性が内部要素と状態へ正しく反映される
- 仕様にないLight DOM構造を内部要素として扱わない
- エラー条件で明示的に失敗する

### ライフサイクルテスト

- 初回接続で一度だけmountする
- 切断時にlistener、timer、observerを解除する
- 再接続後に操作できる
- イベントが二重発火しない

### ブラウザテスト

- HTMX差し替え後に再初期化される
- Shadow DOM内の`hx-*`が処理される
- slot由来イベントを`composedPath()`で識別できる
- キーボード操作とフォーカス移動が仕様どおりである
- テーマトークンがShadow DOMへ継承される

Node.jsのfake DOMだけでブラウザ挙動を証明したことにはしません。

## 開発フロー

1. UIの目的とWeb Component化の必要性を確認する
2. `*.spec.md`へ利用側契約を書く
3. 利用HTMLと正規templateを作る
4. `KataComponent`のライフサイクルへ実装する
5. `--kata-*`を使うコンポーネントCSSを作る
6. 契約とライフサイクルのテストを追加する
7. exampleでHTMX、slot、テーマ、キーボードを確認する
8. `npm run check`を実行する

## レビュー用チェックリスト

- [ ] 表示データはslot、構成値は属性になっている
- [ ] 正規templateがUI骨格、ARIA、フォールバックを所有している
- [ ] Light DOMを内部構造の代替として扱っていない
- [ ] 内部制御要素の検索がShadow Rootに限定されている
- [ ] slot由来イベントで`composedPath()`を考慮している
- [ ] `mount()`と`connect()`／`disconnect()`が分離されている
- [ ] `connectedCallback()`を手動実行していない
- [ ] 外部通知が契約化されたイベントになっている
- [ ] HTMXとWeb Componentが同じ領域を再生成していない
- [ ] CSSが`--kata-*`トークンを参照している
- [ ] 仕様、template、実装、テスト、exampleが一致している
