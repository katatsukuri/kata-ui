## 結論

方針を統合すると、最終アーキテクチャは以下になります。

**ASP.NET Razor Pagesを中心としたサーバー主導型アプリケーション + HTMX + Web Components + template + Component Loader方式**

特に今回の要件では、以下を正式採用します。

- 検索：HTMXフォーム送信
- 一覧：サーバー生成HTMLをHTMX取得
- 行選択：`/facility/F001`形式でURL反映
- 詳細画面：Component単位でlazy load
- 詳細HTML：HTMXレスポンスとしてComponent + データを返却
- 詳細画面：表示切替で保持
- 再検索・行変更：詳細データDOM破棄、template/Component資産は保持
- Component CSS：外部CSSファイル管理（template内styleは禁止）
- Alpine.js：廃止
- UI状態：Web Component / 共通Runtimeで管理

---

# ASP.NET Razor PagesでのHTMX検索パラメータ受取例

## 1. Razor Page

画面：

`Pages/Facility/Index.cshtml`

```html
<form
    hx-get="/Facility?handler=Search"
    hx-target="#facility-list"
    hx-swap="innerHTML">

    <input
        type="text"
        name="name"
        value=""
        placeholder="施設名称">

    <select name="category">
        <option value="">全て</option>
        <option value="culture">文化施設</option>
        <option value="sport">スポーツ施設</option>
    </select>

    <button type="submit">
        検索
    </button>

</form>

<div id="facility-list">
</div>
```

---

## 2. PageModel

`Pages/Facility/Index.cshtml.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class IndexModel : PageModel
{
    private readonly IFacilityService _service;

    public IndexModel(
        IFacilityService service)
    {
        _service = service;
    }


    public void OnGet()
    {
    }


    public IActionResult OnGetSearch(
        string? name,
        string? category)
    {
        var facilities =
            _service.Search(
                name,
                category);


        return Partial(
            "_FacilityList",
            facilities);
    }
}
```

---

## 3. 返却Partial

`Pages/Facility/Shared/_FacilityList.cshtml`

```html
<table>
<thead>
<tr>
<th>番号</th>
<th>施設名</th>
</tr>
</thead>

<tbody>

@foreach(var item in Model)
{
<tr
 hx-get="/facility/@item.Id"
 hx-push-url="true"
 hx-target="#app-state">

<td>
 @item.Id
</td>

<td>
 @item.Name
</td>

</tr>
}

</tbody>
</table>
```

---

# URL設計

今回採用：

```
/facility/F001
```

とする。

役割：

|URL|意味|
|-|-|
|/facility|検索画面|
|/facility/F001|施設選択状態|
|/facility/F001/basic|基本情報|
|/facility/F001/building|建物情報|

---

## 行選択

HTMX：

```html
<tr
 hx-get="/facility/F001"
 hx-push-url="true"
 hx-target="#app-state">
```

↓

ブラウザURL：

```
https://example.com/facility/F001
```

になる。

---

## Razor側

```csharp
public IActionResult OnGet(
    string id)
{
    ViewData["SelectedId"] = id;

    return Partial(
        "_FacilitySelected",
        id);
}
```

---

# 詳細画面取得

例：

「基本情報」ボタン。

```html
<button
 hx-get="/facility/F001/basic"
 hx-target="#detail-container">
基本情報
</button>
```

サーバー返却：

```html
<facility-basic-info
    facility-id="F001">

    <div>
        施設名称
        <span>
          中央市民センター
        </span>
    </div>

</facility-basic-info>
```

HTMX：

```
HTML取得
 ↓
DOM追加
 ↓
Custom Element生成
 ↓
connectedCallback()
```

となります。

---

# 最新アーキテクチャ資料

# 1. 概要

## 名称

**Server Driven Component Architecture**

## 技術構成

```
ASP.NET Razor Pages
        |
        |
      HTMX
        |
        |
Web Components
        |
        |
template
        |
        |
Component CSS
        |
        |
Theme CSS
```

---

# 2. 設計思想

## サーバーを正本とする

管理対象：

- 業務データ
- 権限
- 表示可否
- 入力検証
- 更新結果

ブラウザ：

- UI状態
- Component状態
- 表示状態

のみ管理する。

---

# 3. 画面構造

今回の代表画面：

```
FacilitySearchPage

├ SearchArea
│
├ FacilityList
│    └ HTMX
│
├ FunctionMenu
│
├ TemplateContainer
│
└ DetailContainer

     ├ facility-basic-info
     ├ facility-building-info
     ├ facility-repair-history
     └ ...
```

---

# 4. 検索フロー

```
入力

↓

HTMX GET

↓

Razor Handler

↓

DB検索

↓

Partial HTML

↓

一覧更新
```

---

# 5. 詳細フロー

## 初回

```
詳細ボタン

↓

ComponentLoader

↓

JSロード

↓

CSSロード

↓

templateロード

↓

customElements.define確認

↓

HTMX詳細取得

↓

Component HTML追加

↓

connectedCallback
```

---

## 2回目以降

```
template
保持

Component
必要なら再生成

データ
再取得
```

---

# 6. TemplateContainer

責務：

```
template管理
```

機能：

- template存在確認
- lazy取得
- cache
- clone補助

非責務：

- Component生成
- connectedCallback実行
- render

---

# 7. Component Loader

責務：

```
Component実行環境準備
```

管理：

```
facility-basic-info

├ js
├ css
└ template
```

Manifest例：

```json
{
 "facility-basic-info":{
   "tag":"facility-basic-info",
   "js":
   "/components/facility-basic.js",
   "css":
   "/components/facility-basic.css",
   "template":
   "/components/facility-basic.html"
 }
}
```

---

# 8. Web Component設計

## 基本構造

```
component/

├ component.js
├ component.css
├ component.html
└ component.spec.md
```

---

## Component責務

担当：

- DOM操作
- UI状態
- イベント
- 表示制御

非担当：

- DBアクセス
- 業務判断
- API設計

---

# 9. Lifecycle

ブラウザ標準を利用する。

```
constructor()

↓

connectedCallback()

↓

attributeChangedCallback()

↓

disconnectedCallback()
```

禁止：

```javascript
element.connectedCallback();
```

手動呼出は禁止。

---

# 10. HTMX責務

担当：

- 検索
- 部分HTML取得
- 更新処理
- URL更新
- Component HTML取得

非担当：

- UI状態管理
- DOM内部制御

---

# 11. CSS設計

## 構成

```
pico.css

+

theme.css

+

component.css

+

application.css
```

---

## Component CSS

外部ファイル管理。

例：

```
facility-basic-info.css
```

理由：

- source map
- cache
- 保守性
- テーマ分離

---

## template内style

採用しない。

理由：

- CSS管理分離
- テーマ適用困難
- ビルド管理困難

---

# 12. テーマ

構成：

```
Base CSS

↓

Design Token

↓

Theme

↓

Component CSS
```

例：

```
theme-default.css

theme-winforms.css

theme-public.css
```

---

# 13. キャッシュ戦略

## 保持

|対象|保持|
|-|-|
|Component JS|○|
|Component CSS|○|
|template|○|
|theme CSS|○|

---

## 破棄

|対象|破棄|
|-|-|
|検索結果|再検索時|
|詳細HTML|選択変更時|
|入力途中状態|再検索時|

---

# 14. Component Loaderとtemplateロード

推奨順序：

```
ユーザー操作

↓

ComponentLoader

↓

JS存在確認

↓

CSSロード

↓

templateロード

↓

customElements確認

↓

HTMX詳細取得

↓

DOM追加

```

---

# 15. 自動検証

CI対象：

## Component契約

```
spec.md
 ↓
HTML検証
```

---

## 静的検査

禁止：

- innerHTML乱用
- eval
- connectedCallback手動呼出
- inline script
- template未定義

---

## E2E

確認：

- 検索
- 行選択
- URL変更
- 詳細切替
- 再検索
- Component再生成
- CSSテーマ変更

---

# 16. 最終アーキテクチャ

```
                 ASP.NET Razor Pages

                         |
                         |

                        HTMX

                         |
          +--------------+---------------+
          |                              |

    Search/List                  Detail Area


          |                              |

    Partial HTML              Component HTML


                                         |

                              Component Loader

                                         |

                           +-------------+-------------+
                           |             |             |

                         JS            CSS        Template


                                         |

                              Web Component


                                         |

                                   Browser Lifecycle

                                         |

                               connectedCallback()
```

---

## 最終判断

今回の要件では、React/Vue型SPAではなく、

**「サーバー主導型 + Component Lazy Load + HTMX Partial Rendering + Web Component View保持」**

が最も適しています。

20画面程度の詳細機能を持つ業務システムでは、初期ロード性能・保守性・状態管理のバランスが良い構成です。