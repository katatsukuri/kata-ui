# kata-ui テーマ設計

## 結論

`kata-ui`のテーマは、各Component CSSを差し替えず、`--kata-*`セマンティックトークンの値を`data-theme`で切り替えます。

```text
Pico CSS（任意）
  ↓
src/styles/tokens.css
  ↓
src/styles/themes/theme-*.css
  ↓
src/components/*/*.css
  ↓
利用アプリケーションCSS
```

テーマ選択値の保存先（Cookie、DB、`localStorage`）は利用アプリケーションが決定します。`kata-ui`は保存処理やユーザー設定APIを持ちません。

## 提供ファイル

| ファイル | 役割 |
| --- | --- |
| `src/styles/kata-ui.css` | トークンと提供テーマをまとめて読むビルドレス用エントリ |
| `src/styles/tokens.css` | Pico CSSとの互換フォールバックと既定トークン |
| `src/styles/themes/theme-default.css` | 既定テーマと`color-scheme: light` |
| `src/styles/themes/theme-blue.css` | Blueテーマ |
| `src/styles/themes/theme-dark.css` | Darkテーマと`color-scheme: dark` |

## 読み込み順

Pico CSSを使う場合は、Pico CSS、テーマ入口、Component CSS、アプリケーションCSSの順に読み込みます。

```html
<link rel="stylesheet" href="/lib/pico/2.1.1/pico.min.css">
<link rel="stylesheet" href="/kata-ui/src/styles/kata-ui.css">
<link rel="stylesheet" href="/kata-ui/src/components/kata-button/kata-button.css">
<link rel="stylesheet" href="/css/application.css">
```

Pico CSSを使わない場合も、`tokens.css`に既定値があるため同じComponent CSSを利用できます。

## テーマの指定と切り替え

初期テーマは、サーバーが完全HTMLの`html`要素へ出力します。

```html
<html lang="ja" data-theme="blue">
```

提供値は`default`、`blue`、`dark`です。属性を省略した場合は`default`相当になります。

クライアント側で即時に切り替える場合は、`html`要素の属性だけを変更します。

```js
document.documentElement.dataset.theme = 'dark';
```

HTMXで取得する部分HTMLにはテーマ属性やTheme CSSを重複出力しません。部分更新後も`html`からトークンが継承されます。

## セマンティックトークン

Component CSSが参照する主な公開トークンは次のとおりです。

| 分類 | トークン |
| --- | --- |
| 背景 | `--kata-color-background`、`--kata-color-surface`、`--kata-color-surface-muted` |
| 文字 | `--kata-color-text`、`--kata-color-text-muted` |
| 操作 | `--kata-color-primary`、`--kata-color-on-primary` |
| 補助 | `--kata-color-secondary`、`--kata-color-on-secondary` |
| 危険操作 | `--kata-color-danger`、`--kata-color-on-danger` |
| 境界・フォーカス | `--kata-color-border`、`--kata-color-focus-ring` |
| オーバーレイ | `--kata-color-backdrop`、`--kata-shadow-*` |
| 形状 | `--kata-radius-sm`、`--kata-radius-md`、`--kata-radius-lg`、`--kata-radius-pill` |

Component固有の上書き口が必要な場合は、`--kata-table-border-color`のようなComponentトークンを先に参照し、その既定値をセマンティックトークンへ接続します。

```css
border-color: var(--kata-table-border-color, var(--kata-color-border));
```

## ブランドテーマの追加

テーマCSSはComponentのセレクタを持たず、`data-theme`とトークン値だけを定義します。

```css
:root[data-theme="corporate"] {
  color-scheme: light;
  --kata-color-primary: #005ea8;
  --kata-color-on-primary: #ffffff;
  --kata-color-surface: #ffffff;
  --kata-color-text: #172033;
  --kata-color-border: #c7d2e0;
}
```

追加後は`src/styles/kata-ui.css`から読み込むか、利用アプリケーションがテーマCSSを個別に読み込みます。テナント固有テーマを`kata-ui`へ含める必要はありません。

## Component CSS規約

- 色、境界、フォーカスリング、影、角丸は`--kata-*`を参照する
- Component CSSから`data-theme="dark"`など特定テーマへ分岐しない
- Pico CSS変数を使う場合は`--kata-*`の後方互換フォールバックに限定する
- JavaScriptで個々の要素へ色を直接設定しない
- 利用アプリケーション固有のレイアウトは`application.css`で上書きする

この分離により、テーマ追加時にComponentのHTML、JavaScript、CSS契約を変更せずに済みます。
