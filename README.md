# html-preview-website

HTML を入力して「プレビュー」ボタンを押すと、その HTML をその場でレンダリングして表示するシンプルな Web ツールです。ビルド不要の素の HTML / CSS / JavaScript で動作し、GitHub Pages でホストしています。

## 機能

- 入力欄に貼り付けた HTML を `iframe` 内に自動でレンダリング(入力に応じてリアルタイム更新)
- 「新規タブで開く」ボタンでレンダリング結果を別タブにフルページ表示
- 「クリア」ボタンで入力をリセット

## 公開URL

https://abeyuya.github.io/html-preview-website/

## しくみ

- プレビューは `iframe` の `srcdoc` 属性 + `sandbox` 属性を利用し、親ページから隔離した状態で描画します。
- 新規タブ表示は入力 HTML を `Blob` 化し `window.open` で開きます。

## ローカルでの確認

任意の静的サーバ、または `index.html` をブラウザで直接開くだけで動作します。

```
python3 -m http.server
# http://localhost:8000 を開く
```
