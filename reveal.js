// reveal.js
// 大图片的 "点开再加载" 控制（节省首屏带宽）
//
// 页面标记长这样：
//
//   <figure class="reveal-block">
//     <div class="reveal-placeholder">
//       <p class="reveal-notice">... 说明 ...</p>
//       <button class="reveal-btn" type="button"
//               data-src="../..."
//               data-alt="...">打开图片</button>
//     </div>
//     <img class="reveal-img" alt="...">
//   </figure>
//
// 规则：
//   1. 页面加载时只出占位（奶油底 + 提示 + "打开图片"按钮），图片不进请求；
//   2. 点一次按钮：只显示该图的值，同时 fetch data-src；关闭页面再打开不用再点
//   3. 再点一次：收回图片，返回占位；
//   4. 样式见 site.css 第 4.6 节（共享层），JS 无需每页重复。

(function () {
  "use strict";

  function show(block) {
    var btn = block.querySelector(".reveal-btn");
    var placeholder = block.querySelector(".reveal-placeholder");
    var img = block.querySelector(".reveal-img");
    var notice = block.querySelector(".reveal-notice");
    var src = btn ? btn.getAttribute("data-src") : null;

    if (!src || !placeholder || !img) return;

    // 已经加载过：直接显示
    if (img.complete) {
      block.classList.add("is-open");
      img.classList.add("loaded");
      if (btn) btn.textContent = "收起图片";
      return;
    }

    // 展开：先 fetch，图片加载到后再打开开关
    img.src = src;
    if (btn) btn.textContent = "加载中...";
    img.setAttribute("alt", btn ? (btn.getAttribute("data-alt") || "") : "");

    img.addEventListener("load", function () {
      block.classList.add("is-open");
      img.classList.add("loaded");
      if (btn) btn.textContent = "收起图片";
    });
  }

  function hide(block) {
    var btn = block.querySelector(".reveal-btn");
    var placeholder = block.querySelector(".reveal-placeholder");
    var img = block.querySelector(".reveal-img");

    block.classList.remove("is-open");
    img.classList.remove("loaded");
    if (btn) btn.textContent = "打开图片";
  }

  function init() {
    var blocks = document.querySelectorAll(".reveal-block");
    for (var i = 0; i < blocks.length; i += 1) {
      var block = blocks[i];
      var btn = block.querySelector(".reveal-btn");
      if (!btn) continue;
      var target = block;
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (target.classList.contains("is-open")) {
          hide(target);
        } else {
          show(target);
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
