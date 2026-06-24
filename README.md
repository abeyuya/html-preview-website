# html-preview-website

入力欄に貼り付けた HTML / Markdown をその場でレンダリングして表示するシンプルな Web ツールです。ビルド不要の素の HTML / CSS / JavaScript で動作し、GitHub Pages でホストしています。

## 機能

- 入力欄に貼り付けた HTML を `iframe` 内に自動でレンダリング(入力に応じてリアルタイム更新)
- 「HTML / Markdown」トグルで入力モードを切り替え可能
- Markdown プレビューに対応(`marked` で HTML 化)
- Markdown 内の ```` ```mermaid ```` フェンスコードブロックを Mermaid 図として描画
- 「新規タブで開く」ボタンでレンダリング結果を別タブにフルページ表示
- 「クリア」ボタンで入力をリセット

## 公開URL

https://abeyuya.github.io/html-preview-website/

## しくみ

- プレビューは `iframe` の `srcdoc` 属性 + `sandbox` 属性を利用し、親ページから隔離した状態で描画します。
- Markdown モードでは `marked`(CDN)で HTML 化し、Markdown 用スタイルと `mermaid`(CDN)の描画スクリプトを含む完全な HTML ドキュメントを生成して `iframe` に描画します。Mermaid は `securityLevel: "strict"` で実行します。
- 新規タブ表示は描画対象の内容を `Blob` 化し `window.open` で開きます(Markdown モードでは生成済みのドキュメントを表示)。

## ローカルでの確認

任意の静的サーバ、または `index.html` をブラウザで直接開くだけで動作します。

```
python3 -m http.server
# http://localhost:8000 を開く
```
