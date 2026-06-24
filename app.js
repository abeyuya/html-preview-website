(function () {
  "use strict";

  const input = document.getElementById("html-input");
  const openTabBtn = document.getElementById("open-tab-btn");
  const clearBtn = document.getElementById("clear-btn");
  const frame = document.getElementById("preview-frame");
  const modeRadios = document.querySelectorAll('input[name="mode"]');

  // 現在の入力モード("html" | "markdown")。トグルで切り替える。
  let mode = "html";

  // Markdown 内のフェンスコードブロックのうち、言語が mermaid のものは
  // mermaid が拾える <pre class="mermaid"> として出力する。それ以外は通常表示。
  // marked のバージョン差異(positional 引数 / トークンオブジェクト)の両方に対応する。
  const renderer = {
    code(code, infostring) {
      let text = code;
      let info = infostring;
      // marked v13+ はトークンオブジェクトを渡す。
      if (code && typeof code === "object") {
        text = code.text;
        info = code.lang;
      }
      const lang = (info || "").trim().split(/\s+/)[0];
      if (lang === "mermaid") {
        return '<pre class="mermaid">' + escapeHtml(text) + "</pre>";
      }
      return (
        '<pre><code class="language-' +
        escapeHtml(lang) +
        '">' +
        escapeHtml(text) +
        "</code></pre>"
      );
    },
  };

  if (window.marked && typeof window.marked.use === "function") {
    window.marked.use({ renderer: renderer });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Markdown を変換した HTML を、Markdown 用スタイルと mermaid 描画スクリプトを
  // 含んだ完全な HTML ドキュメント文字列に組み込む。
  // この文字列を iframe の srcdoc / 新規タブの Blob 内容として共通利用する。
  function buildMarkdownDoc(bodyHtml) {
    return [
      "<!DOCTYPE html>",
      '<html lang="ja"><head><meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      "<style>" + MARKDOWN_CSS + "</style>",
      "</head><body>",
      '<div class="markdown-body">',
      bodyHtml,
      "</div>",
      '<script type="module">',
      'import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs";',
      'mermaid.initialize({ startOnLoad: true, securityLevel: "strict" });',
      "<\/script>",
      "</body></html>",
    ].join("\n");
  }

  // Markdown 本文の見た目を整える最小限の CSS。iframe ドキュメント内に持たせる。
  const MARKDOWN_CSS = [
    "body { margin: 0; }",
    ".markdown-body {",
    "  max-width: 900px; margin: 0 auto; padding: 24px;",
    "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;",
    "  font-size: 16px; line-height: 1.7; color: #1f2329; word-wrap: break-word;",
    "}",
    ".markdown-body h1, .markdown-body h2 { border-bottom: 1px solid #d7dbe0; padding-bottom: .3em; }",
    ".markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { margin-top: 1.5em; margin-bottom: .6em; line-height: 1.3; }",
    ".markdown-body code { background: #f0f1f3; padding: .2em .4em; border-radius: 4px; font-size: 85%; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }",
    ".markdown-body pre { background: #f6f8fa; padding: 12px 16px; border-radius: 6px; overflow: auto; }",
    ".markdown-body pre code { background: transparent; padding: 0; font-size: 90%; }",
    ".markdown-body pre.mermaid { background: transparent; padding: 0; text-align: center; }",
    ".markdown-body blockquote { margin: 0; padding: 0 1em; color: #6b7280; border-left: .25em solid #d7dbe0; }",
    ".markdown-body table { border-collapse: collapse; display: block; overflow: auto; }",
    ".markdown-body th, .markdown-body td { border: 1px solid #d7dbe0; padding: 6px 13px; }",
    ".markdown-body th { background: #f6f8fa; }",
    ".markdown-body img { max-width: 100%; }",
    ".markdown-body a { color: #2563eb; }",
    ".markdown-body hr { border: 0; border-top: 1px solid #d7dbe0; margin: 1.5em 0; }",
  ].join("\n");

  // 入力モードに応じて iframe に描画する内容を組み立てる。
  // HTML モードは入力をそのまま、Markdown モードは変換後の完全ドキュメントを返す。
  function buildPreviewSource() {
    if (mode === "markdown") {
      const bodyHtml = window.marked ? window.marked.parse(input.value) : "";
      return buildMarkdownDoc(bodyHtml);
    }
    return input.value;
  }

  // 組み立てた内容を iframe の srcdoc にセットして描画する。
  // srcdoc + sandbox により親ページから隔離した状態でレンダリングする。
  function renderPreview() {
    frame.srcdoc = buildPreviewSource();
  }

  // 連続入力中に描画が走り続けないよう、入力停止後に少し待ってから描画する。
  let renderTimer = null;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderPreview, 300);
  }

  // 描画対象の内容を Blob URL 化して新規タブでフルページ表示する。
  function openInNewTab() {
    const blob = new Blob([buildPreviewSource()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");

    // ポップアップブロック時は通知し、URL を解放する。
    if (!win) {
      URL.revokeObjectURL(url);
      alert("ポップアップがブロックされました。ブラウザの設定で許可してください。");
      return;
    }

    // 新規タブが読み込んだ後にメモリリークを防ぐため URL を解放する。
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 10000);
  }

  function clearInput() {
    clearTimeout(renderTimer);
    input.value = "";
    frame.srcdoc = "";
    input.focus();
  }

  // モード切替時は、同じ入力をそのモードで即座に再描画する。
  function onModeChange(event) {
    mode = event.target.value;
    clearTimeout(renderTimer);
    renderPreview();
  }

  // 入力のたびに自動でプレビューを更新する。
  input.addEventListener("input", scheduleRender);
  openTabBtn.addEventListener("click", openInNewTab);
  clearBtn.addEventListener("click", clearInput);
  modeRadios.forEach(function (radio) {
    radio.addEventListener("change", onModeChange);
  });

  // 初期表示時に、既に入力がある場合は描画しておく。
  if (input.value) {
    renderPreview();
  }
})();
