# kata-ui テーマ設計

## 目的

`kata-ui`のテーマは、コンポーネントのHTMLやCSSファイルを差し替えず、`--kata-*`セマンティックトークンの値を`data-theme`で切り替えます。

```text
Pico CSS（任意）
  → src/styles/tokens.css
  → src/styles/themes/theme-*.css
  → src/components/*/*.css
  → 利用アプリケーションCSS
```

テーマは見た目の契約です。業務データ、認可、画面構造、コンポーネント動作は変更しません。

## 提供テーマ

| 値 | 用途 |
| --- | --- |
| `default` | 中立的な既定テーマ |
| `blue` | 青を主色にしたWebテーマ |
| `dark` | 暗色背景のテーマ |
| `facility` | 公共施設検索画面を基にした高密度テーマ |
| `winforms` | デスクトップ業務画面を基にした高密度テーマ |

`facility`と`winforms`は単なる配色違いではなく、文字サイズ、行高、余白も調整します。ただし、ページ固有のタイトルバーや検索領域などの画面構造はテーマへ含めません。

## 提供ファイル

| ファイル | 役割 |
| --- | --- |
| `src/styles/kata-ui.css` | トークンと提供テーマをまとめて読む入口 |
| `src/styles/tokens.css` | 既定トークンとPico CSS互換フォールバック |
| `src/styles/themes/theme-default.css` | 既定のlightテーマ |
| `src/styles/themes/theme-blue.css` | Blueテーマ |
| `src/styles/themes/theme-dark.css` | Darkテーマ |
| `src/styles/themes/theme-facility.css` | Facility高密度テーマ |
| `src/styles/themes/theme-winforms.css` | WinForms高密度テーマ |

## 読み込み順

Pico CSSを使う場合は、Pico CSS、`kata-ui.css`、コンポーネントCSS、アプリケーションCSSの順に読み込みます。

```html
<link rel="stylesheet" href="/lib/pico/2.1.1/pico.min.css">
<link rel="stylesheet" href="/kata-ui/src/styles/kata-ui.css">
<link rel="stylesheet" href="/kata-ui/src/components/kata-button/kata-button.css">
<link rel="stylesheet" href="/css/application.css">
```

実際に使用する依存バージョンは、[architecture-manifest.json](../architecture-manifest.json)を正本とします。Pico CSSを使わない場合も、`tokens.css`の既定値で同じコンポーネントCSSを利用できます。

## テーマの指定

初期テーマは、完全HTMLの`html`要素へ設定します。

```html
<html lang="ja" data-theme="blue">
```

属性を省略した場合は`default`相当です。HTMXの部分HTMLにはTheme CSSや`data-theme`を重複出力しません。継承可能なCSSカスタムプロパティが、`html`から各コンポーネントのShadow DOMへ伝わります。

## 実行時の切り替え

共通Runtimeの`ThemeManager`を使用します。

```js
import { ThemeManager } from '/kata-ui/src/runtime/index.js';

const manager = new ThemeManager(document);
manager.load();
manager.set('dark');
```

既定では`localStorage`からテーマを読み書きします。CookieやDBを正本にする場合は、利用アプリケーションが完全HTMLへ初期値を出力し、保存処理を実装します。`kata-ui`はユーザー設定APIを提供しません。

## セマンティックトークン

コンポーネントCSSは、具体的な色名やテーマ名ではなく、UI上の役割を表すトークンを参照します。

| 分類 | 主なトークン |
| --- | --- |
| 書体 | `--kata-font-family`、`--kata-font-size-*`、`--kata-line-height-*` |
| 余白 | `--kata-space-xs`〜`--kata-space-3xl` |
| 背景 | `--kata-color-background`、`--kata-color-surface`、`--kata-color-surface-muted` |
| 文字 | `--kata-color-text`、`--kata-color-text-muted` |
| 操作 | `--kata-color-primary`、`--kata-color-on-primary` |
| 補助 | `--kata-color-secondary`、`--kata-color-on-secondary` |
| 危険操作 | `--kata-color-danger`、`--kata-color-on-danger` |
| 境界・フォーカス | `--kata-color-border`、`--kata-color-focus-ring` |
| オーバーレイ | `--kata-color-backdrop`、`--kata-shadow-*` |
| 形状 | `--kata-radius-sm`、`--kata-radius-md`、`--kata-radius-lg`、`--kata-radius-pill` |

コンポーネント固有の上書き口が必要な場合は、固有トークンの既定値をセマンティックトークンへ接続します。

```css
.kata-table td {
  border-color: var(--kata-table-border-color, var(--kata-color-border));
}
```

## ブランドテーマの追加

テーマCSSは`data-theme`とトークン値だけを定義し、コンポーネントの内部セレクタを持ちません。

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

追加手順は次のとおりです。

1. `src/styles/themes/`へテーマCSSを追加する
2. 既存トークンだけで表現できるか確認する
3. 必要な場合だけ汎用的なセマンティックトークンを追加する
4. `src/styles/kata-ui.css`から読み込む、または利用アプリケーションが個別に読み込む
5. Component Catalogと各iframeへテーマ選択を伝播する
6. light／dark、通常密度／高密度で主要コンポーネントを確認する

テナント固有テーマを共通リポジトリへ含める必要はありません。利用アプリケーションが同じトークン契約で追加できます。

## コンポーネントCSS規約

- 色、境界、フォーカスリング、影、角丸は`--kata-*`を参照する
- `data-theme="dark"`など特定テーマへ分岐しない
- Pico CSS変数は`--kata-*`の後方互換フォールバックに限定する
- JavaScriptで個々の要素へ色を直接設定しない
- ページ固有レイアウトは利用アプリケーションCSSで扱う
- Shadow DOM内部のclassを外部テーマの契約にしない

この分離により、テーマ追加時にコンポーネントのHTML、JavaScript、公開slot契約を変更せずに済みます。

## テーマで扱わないもの

次はテーマではなく、コンポーネントまたはページレイアウトの責務です。

- タイトルバー、メニューバー、検索パネルなどの画面構造
- 表示項目の増減や並び順
- 業務状態と権限による表示可否
- コンポーネントのイベントと通信
- DOM構造が異なる別UIパターン

見た目の参照元に固有構造が含まれる場合は、共通コンポーネント、ページレイアウト、テーマトークンへ分解します。参照元を保管し続けるのではなく、再利用可能な判断と値を本書およびテーマCSSへ反映します。

## 検証

- 全提供テーマで文字と背景のコントラストを確認する
- キーボードフォーカスが明確に見えることを確認する
- `facility`と`winforms`で表、フォーム、ダイアログが過密にならないことを確認する
- HTMX部分更新後も選択テーマが維持されることを確認する
- Component Catalog本体とiframe内のテーマが一致することを確認する
- `npm run check`でテーマファイルとCSS規約を検証する
