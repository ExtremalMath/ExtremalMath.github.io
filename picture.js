// picture.js
// Aleph placeholders and the picture folder. The rules live in
// style-guide.txt (section PICTURES); this file carries them out.
//
// A slot waits for its picture like this:
//
//   <div class="aleph" data-pic="private/profile" role="img" aria-label="Profile picture">ℵ</div>
//
// data-pic is the path under picture/, without the extension. When a file
// answers at picture/<data-pic>.png (then .jpg, .jpeg, .webp), the ℵ is
// swapped for the picture on the next page load. No page edit is needed.
// If no file answers, the ℵ stays and the reader sees no error.
//
// Pages with a picture slot load this file before </body>.

(function () {
  "use strict";

  var BASE = "picture/";
  var EXTS = ["png", "jpg", "jpeg", "webp"];

  // Base look for a plain slot. :where() keeps the weight at zero, so page
  // CSS always wins: the green About avatar, a custom size, a square frame.
  var css = [
    ":where(.aleph){",
    "display:inline-flex;align-items:center;justify-content:center;",
    "width:var(--aleph-size,96px);height:var(--aleph-size,96px);",
    "border-radius:50%;background:var(--aleph-face,#fff);",
    "border:3px solid var(--aleph-line,#8c2f39);color:var(--aleph-ink,#8c2f39);",
    'font-family:"Times New Roman",serif;font-size:var(--aleph-font,3rem);',
    "line-height:1;user-select:none;flex-shrink:0;",
    "}",
    ":where(.aleph) > img{",
    "width:100%;height:100%;object-fit:cover;display:block;",
    "border-radius:var(--aleph-radius,50%);",
    "}"
  ].join("\n");

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // The files to try, in order. A path that already ends in an extension
  // is tried as given; otherwise the four extensions are tried.
  function candidates(path) {
    path = path.replace(/^\/+/, "");
    if (/\.(png|jpe?g|webp)$/i.test(path)) {
      return [BASE + path];
    }
    return EXTS.map(function (ext) {
      return BASE + path + "." + ext;
    });
  }

  // The frame stays (page CSS on the slot); only the mark gives way.
  function swap(slot, src, alt) {
    var img = document.createElement("img");
    img.src = src;
    img.alt = alt || "";
    slot.textContent = "";
    slot.appendChild(img);
    slot.removeAttribute("role");
    slot.removeAttribute("aria-label");
  }

  function fill(slot) {
    var path = slot.getAttribute("data-pic");
    if (!path) {
      return;
    }
    var alt = slot.getAttribute("aria-label") || "";
    var list = candidates(path);
    var i = 0;

    function tryNext() {
      if (i >= list.length) {
        return; // no file yet: the aleph mark stays
      }
      var src = list[i];
      i += 1;
      var probe = new Image();
      probe.onload = function () {
        swap(slot, src, alt);
      };
      probe.onerror = tryNext;
      probe.src = src;
    }

    tryNext();
  }

  function init() {
    var slots = document.querySelectorAll(".aleph[data-pic]");
    for (var i = 0; i < slots.length; i += 1) {
      fill(slots[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
