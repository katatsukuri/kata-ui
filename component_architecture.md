
# 1. コンポーネント設計原則

**「利用側の属性とslotを入力契約とし、open Shadow DOMのWeb Componentとして実装し、templateで既定骨格を保持してHTMX・Alpine.jsと協調する」** 原則を採用します。
コンポーネントは単なるHTML部品ではなく、以下の4点をセットで管理します。

```text
Component
├─ HTML契約（spec）
├─ template（構造）
├─ JavaScript（振る舞い）
└─ CSS（見た目）
```

また、コンポーネントは2種類に分類します。

| 種類 | 目的 | 例 |
| --- | --- | --- |
| 共通UIコンポーネント | UI標準化 | button、dialog、tabs、pagination |
| 業務コンポーネント | 業務固有機能 | user-selector、approval-status |

## 原則1：HTML契約を最初に定義する

実装より先に、サーバーとコンポーネント間の契約を決めます。

例：

`user-card.spec.md`

```markdown
# user-card

## Purpose
ユーザー情報を表示するカード

## Usage

<user-card
  user-id="123"
  name="山田太郎"
  email="yamada@example.com">
</user-card>


## Attributes

| Name | Required | Description |
|---|---|---|
| user-id | Yes | User ID |
| name | Yes | Display name |
| email | No | Mail address |


## Events

user-selected

detail:
{
  userId:string
}


## HTMX Support

Allowed:
- hx-get
- hx-target
- hx-swap

Forbidden:
- script
```

理由：

- バックエンド非依存になる
- テスト可能になる
- 実装変更に強い
- AIや別担当者でも理解できる

---

# 2. ディレクトリ標準

推奨構成：

```text
src/components/

└── user-card/
    |
    ├── user-card.spec.md
    |
    ├── user-card.html
    |
    ├── user-card.js
    |
    ├── user-card.css
    |
    ├── user-card.test.js
    |
    └── examples/
        |
        ├── static.html
        └── htmx.html
```

責務：

| ファイル | 内容 |
| - | - |
| spec.md | 契約 |
| html | template |
| js | Web Component |
| css | component固有CSS |
| test | 動作保証 |
| examples | 利用例 |

---

# 3. HTML設計

## HTML基本形

```html
<template id="user-card-template">
  <article class="user-card">
    <header>
      <h3 class="user-card__name"></h3>
    </header>
    <p class="user-card__email"></p>
    <button type="button" class="user-card__detail">詳細</button>
  </article>
</template>

<user-card name="山田太郎" email="yamada@example.com"></user-card>

<!-- 構造を利用側で決める場合はdefault slotへHTMLを渡す -->
<user-card>
  <article class="user-card">
    <h3>山田太郎</h3>
    <p>yamada@example.com</p>
  </article>
</user-card>
```

## HTML設計ルール

### HTML MUST

- セマンティックHTMLを使う
- classはBEM形式
- idは原則使わない
- data属性は動作対象だけ
- scriptタグ禁止
- inlineイベント禁止

例：

良い：

```html
<button
 class="user-card__detail"
 data-action="detail">
詳細
</button>
```

悪い：

```html
<button
 onclick="showDetail()">
```

---

# 4. Web Component設計

## javascript基本形

```javascript
import { initializeShadowComponent } from "../../loader/template-loader.js";

class UserCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.kataUiInitialized === "true") return;

    initializeShadowComponent(
      this,
      this.getAttribute("template") || "user-card-template",
      import.meta.url,
    );
    this.dataset.kataUiInitialized = "true";
    this.bindEvents();
  }
}

customElements.define("user-card", UserCard);
```

---

# 5. ライフサイクル設計

必ず以下を意識します。

```text
constructor()
    ↓
connectedCallback()
    ↓
attributeChangedCallback()
    ↓
disconnectedCallback()
```

---

## constructor

責務：

- 内部状態の初期化
- 再利用するイベントハンドラの準備

禁止：

- API通信
- DOM外探索
- DOM生成
- 業務処理

---

## connectedCallback

責務：

- 初期表示
- イベント登録
- 初期化

例：

```javascript
connectedCallback(){

  this.render();

  this.bindEvents();

}
```

---

## disconnectedCallback

責務：

- イベント解除
- timer停止
- observer解除

例：

```javascript
disconnectedCallback(){

  clearInterval(
    this.timer
  );

}
```

HTMXではDOM差替えが発生するため、後処理は重要です。

---

# 6. 状態管理ルール

状態は3種類に分けます。

## サーバー状態

例：

- ユーザー情報
- 注文状態
- 権限

所有者：

```txt
Server
```

---

## Component状態

例：

- 開閉状態
- 選択状態
- 入力途中状態

所有者：

```txt
Web Component
```

---

## 画面状態

例：

- モーダル表示
- タブ選択
- ローディング

所有者：

```txt
Alpine.js
```

---

禁止：

```text
サーバーデータ
 ↓
Alpine
 ↓
Web Component
 ↓
別JS
```

同じ状態を複数箇所で保持しない。

---

# 7. HTMX連携標準

## 基本方針

Web ComponentはHTMXの対象になれる。

例：

```html
<user-card
 hx-get="/users/123/card"
 hx-trigger="load"
 hx-swap="outerHTML">
</user-card>
```

---

## 推奨

Component全体を交換する。

良い：

```text
<user-card>
    ↓
新しいuser-card
```

避ける：

```text
user-card内部の
.nameだけ交換
```

理由：

- lifecycleが崩れにくい
- 初期化が明確
- テストしやすい

---

# 8. Alpine.js連携標準

## 原則

Web Component内部でAlpineを大量利用しない。

役割分担：

| 処理 | 担当 |
| - | - |
| Component内部動作 | Web Component |
| ページUI状態 | Alpine |
| サーバー通信 | HTMX |

---

例：

```html
<section
 x-data="{open:false}">

 <button
  @click="open=!open">
  詳細
 </button>


 <user-card
  x-show="open">
 </user-card>

</section>
```

これは良い構成です。

---

# 9. イベント設計

Componentから外部へ通知するときはCustomEvent。

例：

```javascript
this.dispatchEvent(
 new CustomEvent(
  "user-selected",
  {
    bubbles:true,
    detail:{
      userId:this.userId
    }
  }
 )
);
```

利用側：

```javascript
document.addEventListener(
"user-selected",
event=>{
 console.log(
  event.detail.userId
 );
});
```

---

禁止：

```javascript
document.querySelector(
 "#global-area"
).innerHTML = "...";
```

Componentは外部DOMを直接操作しない。

---

# 10. CSS設計

## 基本

Pico CSSを基盤とし、Component CSSは`src/styles/tokens.css`の`--kata-*`セマンティックトークンを参照する。Pico CSS変数はトークン層またはComponent CSSの後方互換フォールバックでのみ参照する。

Component CSS：

```css
kata-user-card .kata-user-card {
  color: var(--kata-color-text, var(--pico-contrast, #0f172a));
  background: var(--kata-color-surface, #ffffff);
}

kata-user-card .kata-user-card__name {
  color: var(--kata-color-text-muted, #6b7280);
}
```

---

## CSSルール

### CSS MUST

- component単位CSS
- グローバル汚染禁止
- 高詳細度セレクタ禁止
- !important禁止
- 色、境界、フォーカス、エレベーションは`--kata-*`トークン経由で指定する
- 特定の`data-theme`をComponent CSS内で分岐しない

悪い：

```css
body main div article.user-card h3 span
```

良い：

```css
.user-card__name
```

---

# 11. Shadow DOM・template・slot方針

全Componentはopen Shadow DOMを標準とする。通常の外部CSSセレクタを内部DOMから遮断し、利用ページと内部実装の偶発的な結合を防ぐ。

入力契約は次の優先順位とする。

1. ラベル、値、状態などの単純データは利用側の属性
2. 見出し、説明、操作領域など意味を持つHTMLはdefault／named `slot`
3. 子HTMLがない場合は正規`template`をShadow DOMへ複製し、属性を既定骨格へ反映

サイトテーマは`--kata-*` CSSカスタムプロパティだけを公開契約としてShadow DOMへ継承する。内部クラス名は公開CSS APIにしない。利用側の装飾が必要な箇所は、必要性を個別仕様へ記載したうえで`part`を限定公開する。

HTMXはComponentホスト全体、またはslotへ渡したLight DOMを更新する。Shadow DOM内部の深い要素は直接交換しない。

繰り返し項目を持つComponentでは、利用側の各子要素をデータ境界とする。Componentは1項目分の共通templateを子要素数だけ複製し、単純値を属性から、項目本文を固有名のslotから受け取る。アコーディオン、タブ、トグルグループのように項目とフレームを分離できる部品へ適用する。

---

# 12. サーバーとの契約

## サーバーが返すもの

推奨：

```html
<user-card
 name="山田太郎"
 email="a@example.com">
</user-card>
```

---

非推奨：

```html
<user-card>

<div class="card">
...
</div>

<script>
...
</script>

</user-card>
```

理由：

Component内部実装をサーバーが知ることになるため。

---

# 13. テスト標準

## Unit Test

対象：

- render()
- attribute変更
- event発火
- lifecycle

---

## Contract Test

specとの一致確認。

例：

```text
spec

要求:
.user-card__name存在

↓

テスト

存在確認
```

---

## E2E

Playwrightで確認：

- HTMX差替え
- 戻る・進む
- Component再生成
- Alpine状態
- フォーム送信
- アクセシビリティ

---

# 14. コンポーネント作成判断基準

## Web Component化する

条件：

- ○ 複数画面利用
- ○ 状態を持つ
- ○ イベントがある
- ○ 初期化処理がある
- ○ 独自HTML構造がある

例：

```txt
date-picker
file-upload
user-selector
approval-dialog
```

---

## Web Component化しない

条件：

- × 単純表示
- × CSSだけ
- × 一画面限定
- × サーバーHTMLだけで十分

例：

```txt
見出し
ラベル
単純なカード
普通のボタン
```

---

# 15. 開発フロー標準

推奨手順：

```text
1. UI目的を定義

2. HTML契約(spec)を書く

3. 利用HTMLを書く

4. template作成

5. Web Component実装

6. CSS作成

7. HTMX連携確認

8. Alpine連携確認

9. Contract Test追加

10. E2E追加
```

---

# 16. 最終標準モデル

```text
              Server

      業務状態・HTML生成
              |
              |
            HTMX
              |
              |
+-------------------------------+
| Browser                       |
|                               |
| Pico CSS                      |
|                               |
| HTMX                          |
|  └ ページ/部分更新            |
|                               |
| Alpine.js                     |
|  └ 画面状態                   |
|                               |
| Web Components                |
|  └ 再利用UI                   |
|       ├ Shadow DOM            |
|       ├ template（既定骨格）  |
|       └ slot（利用側HTML）    |
|                               |
+-------------------------------+
```

## 最終的な設計思想

**「コンポーネントはJavaScriptで画面を作るものではなく、サーバーHTMLと協調する標準化されたUI境界である」** と言えます。
この考え方を守ることで、React/Vue型SPAとは異なる、長期保守向けのWeb標準ベースUIアーキテクチャとして成立します。
