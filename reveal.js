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
//     <img class="reveal-img" alt="...">   <!-- NO src: fetched on click -->
//   </div>
//
// Rules:
//   1. On page load: placeholder only (cream block + notice + button).
//   2. First click: fetch data-src, then show the image and "Close image".
//   3. Second click: collapse back to the placeholder (src stays cached).
//   4. CSS lives in site.css section 4.6 (.reveal-*, .is-open, .loaded).
//   5. No per-page scripts needed.
//
// IMPORTANT — see trouble.txt 6.16:
//   Never use `img.complete` to mean "already loaded". Per the HTML spec,
//   an <img> whose src is omitted (or empty) reports complete === true.
//   The old `if (img.complete) { open; return; }` short-circuited on the
//   very first click, so `img.src = src` was NEVER reached: the browser
//   painted a visible, empty <img> — the "broken placeholder" symptom.
//   The only reliable "decoded" test is `img.naturalWidth > 0`.

(function () {
  "use strict";

  var LABEL_OPEN = "Open image";
  var LABEL_LOADING = "Loading...";
  var LABEL_CLOSE = "Close image";
  var LABEL_RETRY = "Open image (retry)";

  function display(block) {
    block.classList.add("is-open");
  }

  function collapse(block, label) {
    block.classList.remove("is-open");
    var btn = block.querySelector(".reveal-btn");
    if (btn) btn.textContent = label || LABEL_OPEN;
  }

  function show(block) {
    var btn = block.querySelector(".reveal-btn");
    var img = block.querySelector(".reveal-img");
    if (!btn || !img) return;
    var src = btn.getAttribute("data-src");
    if (!src) return;

    // Reliable "already decoded" test: a real src AND a positive intrinsic
    // width. `img.complete` alone is NOT valid here (see header note).
    if (img.getAttribute("src") === src && img.naturalWidth > 0) {
      img.classList.add("loaded");
      display(block);
      btn.textContent = LABEL_CLOSE;
      return;
    }

    // Assignment instead of addEventListener: handlers never accumulate
    // across repeated open/close cycles.
    img.onload = function () {
      img.classList.add("loaded");
      display(block);
      btn.textContent = LABEL_CLOSE;
    };
    img.onerror = function () {
      // Drop the broken state so the next click can retry cleanly.
      img.onload = null;
      img.onerror = null;
      img.classList.remove("loaded");
      img.removeAttribute("src");
      collapse(block, LABEL_RETRY);
    };

    btn.textContent = LABEL_LOADING;
    img.src = src; // the fetch happens HERE, on click
  }

  function hide(block) {
    // Keep img.src and .loaded: a second open reuses the decoded picture.
    collapse(block, LABEL_OPEN);
  }

  function init() {
    var blocks = document.querySelectorAll(".reveal-block");
    for (var i = 0; i < blocks.length; i += 1) {
      var block = blocks[i];
      var btn = block.querySelector(".reveal-btn");
      if (!btn) continue;
      (function (b) {
        // Instance-specific closure: each handler owns its own block,
        // not the last one in the loop (trouble.txt 6.15).
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (b.classList.contains("is-open")) hide(b);
          else show(b);
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
