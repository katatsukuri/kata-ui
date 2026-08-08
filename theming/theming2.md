## 結論

可能です。
添付いただいた2種類のCSSは、**同じコンポーネント構造を維持したまま、別テーマとして切り替える設計にできます。**

今回のアーキテクチャ方針では、以下のように整理するのが適しています。

```text
Component HTML
      ↓
Design Token（CSS変数）
      ↓
Theme CSS
      ↓
利用者選択
```

つまり、

- 「公共施設検索プロトタイプ風」
- 「WinForms風」

を**テーマ差し替え**として扱えます。

添付ファイルを見る限り、両者は単なる色違いではなく、UI思想が異なります。

- `search-feature-prototype.html`
  - 青系背景
  - 旧来業務システム風
  - 平面的なフォーム
  - 明細・帳票系画面向き

- `winforms-components-sample.html`
  - Windowsデスクトップアプリ風
  - タイトルバー、メニュー、グループボックス
  - DataGridView風コンポーネント
  - 業務クライアント移行向き

したがって「CSSテーマ」というより、**UIスキン（Visual Theme）**として扱う方が適切です。

---

# 推奨アーキテクチャ

## 現状

現在はCSS内に直接値があります。

例：

```css
background: #dbe6f8;
border: 1px solid #535b63;
```

これではテーマ切替が困難です。

---

## 改善後

### Component CSS

役割：

- レイアウト
- 構造
- 状態

だけを書く。

例：

```css
.kata-button {

  height: var(--button-height);

  color: var(--button-text-color);

  background:
    var(--button-background);

  border:
    var(--button-border);

}
```

---

### Theme CSS

見た目だけ定義する。

例：

```css
[data-theme="facility"] {

  --surface-color:#ffffff;

  --background-color:#dbe6f8;

  --button-background:
    linear-gradient(
      #fffef2,
      #f3ebc7
    );

}
```

---

```css
[data-theme="winforms"] {

  --surface-color:#f0f0f0;

  --background-color:#b9c1c8;

  --button-background:
    linear-gradient(
      #f8f8f8,
      #d0d0d0
    );

}
```

---

# テーマ適用方法

## 方法1：HTML属性（推奨）

一番単純です。

```html
<html data-theme="winforms">
```

変更：

```javascript
document.documentElement
  .dataset.theme = "facility";
```

CSS：

```css
[data-theme="facility"] {

}

[data-theme="winforms"] {

}
```

---

# 利用者選択の場合

## 個人設定

DB:

```
UserPreference

UserId
Theme
```

例：

| User | Theme |
|-|-|
| tanaka | winforms |
| yamada | facility |

ログイン後：

ASP.NET Razor:

```cshtml
<html data-theme="@Model.Theme">
```

---

# テナント別

公共施設管理システムならこちらも有効です。

例：

```
自治体A
 ↓
facility-theme

自治体B
 ↓
winforms-theme
```

---

# 2つのCSSをそのままテーマ化する場合の問題

現状のCSSは、テーマだけではなく構造も含んでいます。

例えばWinForms版：

```css
.desktop-window

.title-bar

.menu-bar

.group-box
```



一方、公共施設版：

```css
.app

.search-panel

.fragment-shell
```



これは同じコンポーネントではありません。

つまり、

```text
テーマ差替え
```

だけでは完全には表現できません。

---

# 正しい分離

## 共通コンポーネント層

例：

```
button
textbox
checkbox
table
dialog
card
form-field
```

↓

## テーマ層

```
facility-theme

winforms-theme
```

↓

## 画面構造

```
FacilitySearchPage

UserManagementPage
```

---

イメージ：

```text
                 Page

        ┌───────────────┐
        │               │
 FacilitySearch     UserSearch
        │               │
        └───────┬───────┘
                │
          kata-ui Components
                │
        ┌───────┴────────┐
        │                │
 facility-theme    winforms-theme
```

---

# 添付CSSを移行する場合

## Step1：共通部品抽出

例えば：

### Button

現在：

```css
button {
 background:linear-gradient(...)
}
```

↓

変更：

```css
.kata-button {

 background:
 var(--button-bg);

 border:
 var(--button-border);

}
```

---

### TextBox

現在：

```css
.winforms-textbox
```

↓

共通化：

```css
.kata-input
```

---

### Table

現在：

```css
.winforms-datagrid
```

↓

共通化：

```css
.kata-table
```

---

# Component設計との対応

前回整理したkata-ui型にすると：

```
kata-ui/

button/
 ├ button.js
 ├ button.css
 └ button-spec.md


input/
 ├ input.js
 ├ input.css
 └ input-spec.md


table/
 ├ table.js
 ├ table.css
 └ table-spec.md
```

CSSは：

```
component.css

+

theme.css
```

になります。

---

# さらに発展：テーマ選択UI

Theme Managerで一貫して制御します。

```html
<select id="theme-select">
<option value="facility">
公共施設
</option>

<option value="winforms">
Windows
</option>

</select>

<script type="module">
  import { ThemeManager } from '../src/runtime/index.js';
  const manager = new ThemeManager(document);
  document.querySelector('#theme-select').addEventListener('change', (event) => {
    manager.set(event.target.value);
  });
</script>
```

変更即時反映できます。

---

# HTMXとの関係

テーマ切替はHTMXでは扱いません。

理由：

テーマはサーバーデータではなく、UI設定だからです。

責務：

| 処理 | 技術 |
|-|-|
| テーマ選択 | Theme Manager |
| 保存 | ASP.NET |
| 初期反映 | Razor |
| UI変更 | CSS |

---

# 注意点：Web Component

今回の方針では、利用者の表示データだけをLight DOMのslotとして保持します。

```html
<kata-button>
```

Shadow DOM内部：

```html
<button class="kata-button">
```

CSS：

```css
[data-theme="winforms"]
.kata-button {

}
```

で切替できます。

Shadow DOMの場合はテーマCSS設計が複雑になります。

---

# 提案するテーマ体系

今回なら以下の3階層がよいです。

## 1. Base Theme

Pico CSS＋共通変数

```text
theme-base.css
```

---

## 2. Product Theme

業務システム標準

```text
theme-facility.css
theme-office.css
```

---

## 3. User Preference

個人設定

```text
compact
dark
large-font
```

---

最終形：

```text
CSS Architecture

pico.css
    |
component.css
    |
design-token.css
    |
+----------------+
|                |
facility-theme   winforms-theme
|                |
利用者設定       利用者設定
```

---

## 判断

添付2パターンは、**同一コンポーネントのテーマとして完全変換するには粒度が違います。**

しかし、

- UIコンポーネントを共通化
- CSS変数化
- Theme CSS化
- Razorで利用者別テーマ指定

という形に整理すれば、今回検討しているアーキテクチャへ非常に自然に組み込めます。

特に、公共施設系・行政系業務システムでは、

- 標準Webテーマ
- 既存Windows業務端末移行テーマ
- 高密度帳票テーマ

のような複数テーマを持てる設計は実用性があります。
