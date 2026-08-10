# kata-toggle

`<kata-toggle>`は、buttonベースの二値switchを提供するopen Shadow DOM Custom Elementです。フォーム入力が必要な場合は、ネイティブcheckboxを使用する`kata-switch`も検討してください。

## 利用例

```html
<kata-toggle checked>
  <span slot="label">通知を受け取る</span>
</kata-toggle>
```

## 必須要件

- `kata-toggle-template`がある
- template内に`button[data-toggle-track][role="switch"]`がある
- track内に`data-toggle-thumb`がある

## 属性とslot

| 契約 | 説明 |
| --- | --- |
| `checked` | 初期状態をonにするBoolean属性 |
| `disabled` | 操作を無効にするBoolean属性 |
| `label` slot | switchの表示ラベル |

## 状態とイベント

click、Space、Enterでtrackの`data-state`を`checked`／`unchecked`へ、`aria-checked`を`true`／`false`へ同期します。

状態変更時に`change` CustomEventを`detail: { checked: boolean }`付きで発火します。イベントはbubbleしますが、現在の実装では`composed: false`のためShadow DOM境界外への通知を公開契約に含みません。

disabled時は`aria-disabled="true"`と`tabindex="-1"`を設定し、操作を無効にします。

## 制約

`checked`と`disabled`は初回mount時に反映します。接続後のhost属性変更追従とフォーム送信値は公開契約に含みません。

## 初期化エラー

対応するtemplateがない場合は初期化時にエラーを送出します。
