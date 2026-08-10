# サーバー主導画面への適用例

## この文書の位置付け

この文書は、[kata-ui全体アーキテクチャ](./architecture.md)をASP.NET Core Razor Pagesの検索・詳細画面へ適用する例です。リポジトリ共通の正本ではなく、次の要件を持つ利用アプリケーション向けの設計例として扱います。

- 検索条件をサーバーへ送信する
- 一覧を部分HTMLとして取得する
- 選択行をURLへ反映する
- 詳細領域を必要時に取得する
- 再検索または選択変更時に古い詳細データを破棄する

アプリケーション固有のURL、Handler、認可、キャッシュ、エラー処理は、利用プロジェクトの要件に合わせて確定してください。

## 採用する構成

```text
ASP.NET Core Razor Pages
  └─ 業務状態、検索、入力検証、HTML生成
       ↓
HTMX
  └─ 検索送信、一覧・詳細HTMLの取得、URL更新
       ↓
kata-ui Web Components
  └─ 詳細UIの骨格、状態、イベント、ライフサイクル
```

この例ではAlpine.jsを使用しません。通信不要の画面状態は`PageState`などの共通Runtime、独立UIの状態は各Web Componentが担当します。

## 画面とURL

施設検索画面を例にします。

| URL | 意味 |
| --- | --- |
| `/facility` | 検索画面 |
| `/facility/F001` | 施設`F001`の選択状態 |
| `/facility/F001/basic` | 基本情報の部分HTML |
| `/facility/F001/building` | 建物情報の部分HTML |

各URLは直接アクセス時に意味のある完全HTMLを返せる構成にします。HTMXリクエストへ部分HTMLを返し分ける場合は、`Vary: HX-Request`と適切なキャッシュ制御を設定します。

## 画面構造

```text
FacilitySearchPage
├─ SearchArea
├─ FacilityList
│  └─ HTMXが検索結果を交換
├─ FunctionMenu
└─ DetailContainer
   ├─ facility-basic-info
   ├─ facility-building-info
   └─ その他の詳細コンポーネント
```

検索結果と詳細領域はサーバーとHTMXが所有します。詳細コンポーネントのShadow DOM内部はWeb Componentが所有します。

## 検索フロー

```text
検索条件入力
  → HTMX GET
  → Razor Page Handler
  → サービスで検索
  → 一覧の部分HTML
  → #facility-listを交換
```

### Razor Page

```html
<form
  hx-get="/Facility?handler=Search"
  hx-target="#facility-list"
  hx-swap="innerHTML"
>
  <label>
    施設名称
    <input type="text" name="name">
  </label>

  <label>
    分類
    <select name="category">
      <option value="">すべて</option>
      <option value="culture">文化施設</option>
      <option value="sport">スポーツ施設</option>
    </select>
  </label>

  <button type="submit">検索</button>
</form>

<div id="facility-list" aria-live="polite"></div>
```

### PageModel

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class IndexModel : PageModel
{
    private readonly IFacilityService _service;

    public IndexModel(IFacilityService service)
    {
        _service = service;
    }

    public IActionResult OnGetSearch(string? name, string? category)
    {
        var facilities = _service.Search(name, category);
        return Partial("_FacilityList", facilities);
    }
}
```

例では説明を簡潔にするため、認可、入力検証、例外処理を省略しています。実装時はサーバー側で必ず補ってください。

### 一覧Partial

```html
<table>
  <thead>
    <tr>
      <th scope="col">番号</th>
      <th scope="col">施設名</th>
    </tr>
  </thead>
  <tbody>
    @foreach (var item in Model)
    {
      <tr>
        <td>
          <a
            href="/facility/@item.Id"
            hx-get="/facility/@item.Id"
            hx-push-url="true"
            hx-target="#app-state"
          >@item.Id</a>
        </td>
        <td>@item.Name</td>
      </tr>
    }
  </tbody>
</table>
```

操作可能な行全体へクリック処理を持たせる場合も、キーボード操作とリンク先を失わない設計にします。上の例では直接アクセス可能な`a[href]`を使用しています。

## 詳細フロー

```text
詳細操作
  → 必要なコンポーネント資産を確認
  → HTMXで詳細HTMLを取得
  → DetailContainerへCustom Elementを挿入
  → ブラウザがconnectedCallbackを実行
```

```html
<button
  type="button"
  hx-get="/facility/F001/basic"
  hx-target="#detail-container"
  hx-swap="innerHTML"
>
  基本情報
</button>

<div id="detail-container"></div>
```

サーバーはコンポーネント内部の骨格ではなく、Custom Elementとslotへ投影する表示データを返します。

```html
<facility-basic-info facility-id="F001">
  <span slot="name">中央市民センター</span>
  <span slot="category">文化施設</span>
</facility-basic-info>
```

`facility-id`は動作上の構成値なので属性、施設名称と分類は利用者に見える表示データなのでslotです。

## コンポーネント資産の読込

利用アプリケーションがlazy loadを必要とする場合、Loaderの責務を次に限定します。

- JavaScript、CSS、正規`template`の存在確認と読込
- Custom Elementの登録確認
- 同一資産の重複読込防止

Loaderは次を行いません。

- `connectedCallback()`の手動実行
- コンポーネント内部のrender
- 業務データ取得
- Page Runtime状態の所有

資産を事前に読み込める画面では、lazy loadを導入せず静的な`link`と`script type="module"`を優先します。読込機構の複雑さは、初期転送量とのトレードオフです。

## 再検索と選択変更

| 対象 | 方針 |
| --- | --- |
| Component JavaScript | ブラウザのmodule cacheを利用 |
| Component CSS | 一度読み込んだものを保持 |
| 正規`template` | ページ内またはLoader cacheに保持 |
| 検索結果HTML | 再検索時に交換 |
| 詳細HTML | 選択変更時に交換 |
| 入力途中の詳細状態 | 破棄前に確認が必要ならアプリケーション側で制御 |

コンポーネントが除去されると`disconnectedCallback()`が実行されます。再挿入時にイベントが重複しないよう、`mount()`と`connect()`／`disconnect()`を分離します。

## テーマ

テーマはHTMX応答ごとに差し替えません。完全HTMLの`html[data-theme]`と`--kata-*`トークンを正本にし、Shadow DOMへ継承します。

```html
<html lang="ja" data-theme="facility">
```

ユーザー設定をDBに保存する場合は、サーバーが完全HTMLへ初期テーマを出力します。即時切り替えには`ThemeManager`を使用します。

## エラーとセキュリティ

利用アプリケーションは少なくとも次を扱います。

- 検索条件のサーバー側検証
- 認証切れ時の完全ページ遷移
- 権限不足、排他競合、通信失敗の共通表示
- CSRF対策
- サーバー生成HTMLのエスケープ
- 部分HTMLへの`script`混入防止
- `Vary: HX-Request`と認証済みHTMLのキャッシュ制御

## 検証観点

1. 検索条件がHandlerへ正しく渡る
2. 通常アクセスとHTMXアクセスで応答契約が一致する
3. 一覧更新後もリンクとキーボード操作が機能する
4. 選択URLを直接開いて同じ状態を復元できる
5. 詳細切り替え時に古いコンポーネントが切断される
6. 再挿入後にイベントが重複しない
7. テーマが部分更新後も維持される
8. 認証切れ画面が部分領域へ挿入されない
9. フォーカスと`aria-live`通知が更新内容を伝える

## 適用判断

この方式は、サーバー側に業務ロジックがあり、検索・一覧・詳細をHTML中心に組み立てる画面に適します。画面全体をクライアント状態へ複製せず、必要な詳細だけを遅延取得できることが利点です。

一方、コンポーネント資産のlazy loadはLoader、エラー処理、テスト対象を増やします。対象画面数や初期転送量が小さい場合は、静的読込の方が保守しやすい選択です。
