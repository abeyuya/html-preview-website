(function () {
  "use strict";

  const input = document.getElementById("html-input");
  const openTabBtn = document.getElementById("open-tab-btn");
  const clearBtn = document.getElementById("clear-btn");
  const frame = document.getElementById("preview-frame");

  // 入力された HTML を iframe の srcdoc にセットして描画する。
  // srcdoc + sandbox により親ページから隔離した状態でレンダリングする。
  function renderPreview() {
    frame.srcdoc = input.value;
  }

  // 連続入力中に描画が走り続けないよう、入力停止後に少し待ってから描画する。
  let renderTimer = null;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderPreview, 300);
  }

  // 入力 HTML を Blob URL 化して新規タブでフルページ表示する。
  function openInNewTab() {
    const blob = new Blob([input.value], { type: "text/html" });
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

  // 入力のたびに自動でプレビューを更新する。
  input.addEventListener("input", scheduleRender);
  openTabBtn.addEventListener("click", openInNewTab);
  clearBtn.addEventListener("click", clearInput);

  // 初期表示時に、既に入力がある場合は描画しておく。
  if (input.value) {
    renderPreview();
  }
})();
