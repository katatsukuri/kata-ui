# Facility／WinFormsテーマ検討記録

## 結論

公共施設検索プロトタイプ風とWinForms風の見た目は、共通コンポーネントを維持したまま選択可能なテーマとして提供できます。ただし、参照画面に含まれる固有レイアウトまでCSSテーマへ押し込まず、次の三層へ分離します。

```text
ページ固有レイアウト
  ↓
kata-ui共通コンポーネント
  ↓
Facility／WinFormsテーマトークン
```

この記録は判断背景と移行指針を残す補足資料です。現在のテーマ契約と利用方法は[テーマ設計](./theming.md)を正本とします。

## 検討した見た目

### Facility

- 青系の背景と境界
- 平面的で情報密度の高いフォーム
- 検索、明細、帳票を中心とする業務画面

### WinForms

- Windowsデスクトップアプリケーションを想起させる配色
- 小さな文字、行高、余白による高密度表示
- ボタン、グループ、表を明確に区切る境界表現

両者は配色だけでなく密度と視覚的階層が異なります。そのため、色トークンだけでなく、フォント、行高、余白、角丸、影もテーマ対象に含めました。

## なぜCSSの差し替えだけでは不十分か

参照元CSSには、見た目と画面構造が混在していました。

```text
見た目
├─ 色
├─ 境界
├─ 余白
├─ 書体
└─ 影

画面構造
├─ title bar
├─ menu bar
├─ search panel
├─ group box
└─ data grid layout
```

前者はテーマトークンへ移せます。後者はページまたはコンポーネントのHTML構造であり、テーマだけでは同じDOMのまま安全に切り替えられません。

## 採用した分離

### 共通コンポーネント

button、input、checkbox、table、dialog、cardなど、意味と操作が共通するUIを`kata-*`コンポーネントとして保持します。

### テーマ

`theme-facility.css`と`theme-winforms.css`は、`--kata-*`トークンの値だけを定義します。コンポーネント内部のclassへ直接依存しません。

### ページレイアウト

検索条件の配置、タイトルバー、メニュー、詳細領域の分割は利用アプリケーションCSSとサーバーHTMLが担当します。

この分離により、同じコンポーネント契約を保ったまま見た目を切り替えられます。一方、参照元画面を完全に再現するには、テーマ以外のページレイアウト実装も必要です。

## トークン化の考え方

直接値を持つCSSを、意味に基づくトークン参照へ置き換えます。

```css
/* 移行前 */
.button {
  color: #111111;
  background: linear-gradient(#fffef2, #f3ebc7);
  border: 1px solid #535b63;
}

/* 移行後 */
.kata-button {
  color: var(--kata-color-text);
  background: var(--kata-button-background, var(--kata-color-primary));
  border: 1px solid var(--kata-button-border-color, var(--kata-color-border));
}
```

テーマ側は値だけを与えます。

```css
:root[data-theme="facility"] {
  --kata-color-background: #dbe6f8;
  --kata-color-surface: #ffffff;
}

:root[data-theme="winforms"] {
  --kata-color-background: #b9c1c8;
  --kata-color-surface: #f0f0f0;
}
```

実際の値とトークン一覧は`src/styles/tokens.css`と`src/styles/themes/`を正本とします。

## Shadow DOMへの適用

通常の外部CSSセレクタはShadow DOM内部へ届きません。テーマは継承可能なCSSカスタムプロパティをhost経由で内部へ伝えます。

```text
html[data-theme]
  → --kata-*トークン
  → kata-* host
  → Shadow DOM内のコンポーネントCSS
```

この方式では、テーマCSSが内部class名を知る必要がありません。外部から個別装飾が必要な箇所だけ、仕様化した`part`を公開します。

## テーマ選択の責務

| 処理 | 担当 |
| --- | --- |
| 初期テーマの決定 | 利用アプリケーション |
| DBやCookieへの保存 | 利用アプリケーション |
| 完全HTMLへの初期反映 | サーバーHTML |
| 実行時の切り替え | `ThemeManager` |
| 見た目の適用 | Theme CSS |

テーマはHTMXの部分HTMLごとに設定しません。完全HTMLの`html[data-theme]`を維持し、部分更新後も同じトークンを継承します。

## 移行手順

1. 参照元CSSを「見た目」と「画面構造」に分類する
2. button、input、tableなど共通部品へ対応付ける
3. 直接値を既存の`--kata-*`セマンティックトークンへ置き換える
4. 共通化できない画面構造を利用アプリケーションCSSへ残す
5. Facility／WinFormsのテーマ値を定義する
6. Component Catalogと実画面で密度、コントラスト、フォーカスを確認する

## トレードオフ

### 利点

- コンポーネントHTMLとJavaScriptを変えずにテーマを切り替えられる
- Shadow DOMのカプセル化を維持できる
- テナントまたはユーザー設定を利用アプリケーション側で追加できる
- 直接値の重複を減らせる

### 制約

- DOM構造が異なる画面をテーマだけで同一化できない
- 高密度テーマは可読性と操作対象サイズの確認が必要になる
- すべてを汎用トークン化すると意味が曖昧になるため、コンポーネント固有トークンが必要な場合がある
- 参照元の完全再現と、共通コンポーネントの保守性は両立しないことがある

## 採用判断

Facility／WinFormsは、同一コンポーネントの選択可能なテーマとして提供します。ページ固有構造はテーマから分離し、利用アプリケーションが所有します。この境界を守ることで、業務画面らしい密度を提供しながら、コンポーネント契約とShadow DOMのカプセル化を維持できます。
