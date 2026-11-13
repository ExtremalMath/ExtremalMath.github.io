// reveal.js
// Full-resolution image viewer. The historical filename is kept so that no
// file has to be deleted; the old "Open image" placeholder component was
// retired on 2026-11-13 (see trouble.txt 6.18).
//
// Page markup (styles live in site.css section 4.6):
//
//   <a class="hd-link" href="../cg/PunishingCG_Atlantis.png">
//     <img class="hd-thumb" src="../cg/compress/compress-PunishingCG_Atlantis.jpg"
//          alt="...">
//   </a>
//
// Behaviour:
//   1. The compressed thumbnail renders immediately (small first-screen
//      payload, ~50-170 KB each).
//   2. Clicking the image opens .hd-viewer and fetches the original PNG from
//      the link's href — only then, on demand.
//   3. Click anywhere in the viewer, or press Escape, to close. Focus returns
//      to the image link. Body scrolling is restored.
//   4. Without JS the <a> opens the original PNG natively (progressive
//      enhancement); modified clicks (Ctrl/Cmd/Shift/middle) keep native
//      behaviour too.
//   5. NO buttons are created anywhere.
//
// Reliability notes (trouble.txt 6.16): load state is driven only by
// onload/onerror assigned BEFORE setting src. Never use img.complete as an
// "already decoded" test, and never let a src-less <img> be painted — the
// viewer image starts with an inline display:none and a CSS :not([src])
// guard, and is revealed only after onload.

(function () {
  "use strict";

  var TEXT_LOADING = "Loading full-resolution image...";
  var TEXT_HINT = "Click anywhere or press Esc to close";
  var TEXT_ERROR = "The full-resolution image could not be loaded. Click anywhere to close.";

  var viewer = null;
  var opener = null;
  var prevOverflow = "";

  function onKey(e) {
    if (e.key === "Escape" || e.keyCode === 27) close();
  }

  function close() {
    if (!viewer) return;
    var v = viewer;
    viewer = null;
    document.removeEventListener("keydown", onKey);
    document.body.style.overflow = prevOverflow;
    if (v.parentNode) v.parentNode.removeChild(v);
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  function open(link) {
    var full = link.getAttribute("href");
    if (!full) return;
    if (viewer) close();

    var thumb = link.querySelector("img");
    var alt = thumb ? (thumb.getAttribute("alt") || "") : "";

    var v = document.createElement("div");
    v.className = "hd-viewer";
    v.setAttribute("role", "dialog");
    v.setAttribute("aria-modal", "true");
    v.setAttribute("aria-label", "Full-resolution image");

    var note = document.createElement("p");
    note.className = "hd-note";
    note.textContent = TEXT_LOADING;

    var img = document.createElement("img");
    img.alt = alt;
    img.style.display = "none"; // src-less <img> must never be painted
    // Assignment (not addEventListener) so handlers cannot accumulate.
    img.onload = function () {
      img.style.display = "block";
      note.textContent = TEXT_HINT;
    };
    img.onerror = function () {
      img.style.display = "none";
      note.textContent = TEXT_ERROR;
    };

    v.appendChild(img);
    v.appendChild(note);
    v.addEventListener("click", close);
    document.addEventListener("keydown", onKey);

    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    opener = link;
    viewer = v;
    document.body.appendChild(v);

    img.src = full; // the large original is fetched HERE, on click only
  }

  function init() {
    var links = document.querySelectorAll(".hd-link");
    for (var i = 0; i < links.length; i += 1) {
      // Instance-specific closure: each handler owns its own link
      // (trouble.txt 6.15).
      (function (link) {
        link.addEventListener("click", function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          open(link);
        });
      })(links[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
