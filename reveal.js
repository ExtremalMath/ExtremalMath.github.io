// reveal.js
// "Click to open" control for large images (saves first-screen bandwidth).
//
// Page markup:
//
//   <div class="reveal-block">
//     <div class="reveal-placeholder">
//       <p class="reveal-notice">The image is large. Please click to open it.</p>
//       <button class="reveal-btn" type="button"
//               data-src="../...">Open image</button>
//     </div>
//     <img class="reveal-img" alt="...">
//   </div>
//
// Rules:
//   1. On page load: placeholder only (cream block + notice + button).
//   2. First click: fetch data-src, show image + "Close image" (is-open + loaded).
//   3. Second click: collapse image, return to placeholder.
//   4. CSS lives in site.css section 4.6 (@.reveal-* and .is-open/.loaded).
//   5. No per-page scripts needed.

(function () {
  "use strict";

  function show(block) {
    var btn = block.querySelector(".reveal-btn");
    var placeholder = block.querySelector(".reveal-placeholder");
    var img = block.querySelector(".reveal-img");
    var src = btn ? btn.getAttribute("data-src") : null;

    if (!src || !placeholder || !img) return;

    // Already loaded: open immediately.
    if (img.complete) {
      block.classList.add("is-open");
      img.classList.add("loaded");
      if (btn) btn.textContent = "Close image";
      return;
    }

    // Open: set src first (fetch), switch classes on load.
    img.src = src;
    if (btn) btn.textContent = "Loading...";

    img.addEventListener("load", function () {
      block.classList.add("is-open");
      img.classList.add("loaded");
      if (btn) btn.textContent = "Close image";
    });

    // Unload if the image cannot be fetched.
    img.addEventListener("error", function () {
      if (btn) btn.textContent = "Open image";
      img.src = "";
    });
  }

  function hide(block) {
    var btn = block.querySelector(".reveal-btn");
    var img = block.querySelector(".reveal-img");

    block.classList.remove("is-open");
    img.classList.remove("loaded");
    if (btn) btn.textContent = "Open image";
  }

  function init() {
    var blocks = document.querySelectorAll(".reveal-block");
    for (var i = 0; i < blocks.length; i += 1) {
      var block = blocks[i];
      var btn = block.querySelector(".reveal-btn");
      if (!btn) continue;
      (function (b) {
        // Instance-specific closure: each button handler closes over its
        // own block, not the last one in the loop.
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (b.classList.contains("is-open")) {
            hide(b);
          } else {
            show(b);
          }
        });
      })(block);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
