// test_picture.js — local smoke test for picture.js (never pushed).
// Stubs the DOM and Image, then checks the four cases:
//   A  the file answers      -> the mark is swapped for the picture
//   B  no file yet           -> the mark stays, candidates tried in order
//   C  data-pic with an extension -> only that file is tried
//   D  no data-pic           -> the slot is left alone
"use strict";

const path = require("path");
const PICTURE = path.join(__dirname, "..", "picture.js");

// files that "exist" on the server
const EXISTING = new Set(["picture/private/profile.png", "picture/talks/poster.jpg"]);
let probeLog = [];

function makeStyle() {
  return { set textContent(v) {} };
}

function makeImg(kind) {
  return {
    tag: "img",
    kind: kind, // "probe" (network check) or "dom" (the swapped-in picture)
    alt: "",
    onload: null,
    onerror: null,
    _src: "",
    set src(v) {
      this._src = v;
      if (this.kind === "probe") probeLog.push(v);
      const self = this;
      setImmediate(() => {
        if (EXISTING.has(v)) {
          if (self.onload) self.onload();
        } else if (self.onerror) {
          self.onerror();
        }
      });
    },
    get src() { return this._src; }
  };
}

function makeSlot(attrs) {
  return {
    attrs: Object.assign({}, attrs),
    children: [],
    text: "ℵ",
    getAttribute(k) {
      return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null;
    },
    removeAttribute(k) { delete this.attrs[k]; },
    appendChild(c) { this.children.push(c); return c; },
    set textContent(v) { if (v === "") { this.children = []; this.text = ""; } },
    get textContent() { return this.text; }
  };
}

let slots = [];
global.document = {
  readyState: "complete",
  head: { appendChild() {} },
  createElement(tag) { return tag === "style" ? makeStyle() : makeImg("dom"); },
  querySelectorAll(sel) { return sel === ".aleph[data-pic]" ? slots : []; }
};
global.Image = function () { return makeImg("probe"); };

function fresh() {
  delete require.cache[require.resolve(PICTURE)];
  require(PICTURE);
}

const results = [];
function check(name, ok, extra) {
  results.push((ok ? "PASS" : "FAIL") + "  " + name + (extra ? "  [" + extra + "]" : ""));
}

// ---- Case A: the file is there --------------------------------------------
slots = [makeSlot({ "data-pic": "private/profile", "aria-label": "Yuanbo Li", role: "img" })];
fresh();
setTimeout(() => {
  const s = slots[0];
  const img = s.children[0];
  check("A1 swap happens when the file exists",
    !!img && img.tag === "img" && img.src === "picture/private/profile.png",
    img && img.src);
  check("A2 alt text comes from aria-label", !!img && img.alt === "Yuanbo Li");
  check("A3 placeholder role and aria-label removed",
    s.getAttribute("role") === null && s.getAttribute("aria-label") === null);

  // ---- Case B: no file yet ------------------------------------------------
  probeLog = [];
  slots = [makeSlot({ "data-pic": "private/profile", "aria-label": "Yuanbo Li", role: "img" })];
  EXISTING.clear();
  fresh();
  setTimeout(() => {
    const s = slots[0];
    check("B1 no swap when the file is missing",
      s.children.length === 0 && s.textContent === "ℵ");
    check("B2 candidate order png, jpg, jpeg, webp",
      probeLog.join(",") === [
        "picture/private/profile.png",
        "picture/private/profile.jpg",
        "picture/private/profile.jpeg",
        "picture/private/profile.webp"
      ].join(","),
      probeLog.join(","));

    // ---- Case C: data-pic already ends in an extension ---------------------
    probeLog = [];
    EXISTING.add("picture/talks/poster.jpg");
    slots = [makeSlot({ "data-pic": "talks/poster.jpg", "aria-label": "Poster" })];
    fresh();
    setTimeout(() => {
      const s = slots[0];
      check("C1 explicit extension: only that file is tried",
        probeLog.length === 1 && probeLog[0] === "picture/talks/poster.jpg",
        probeLog.join(","));
      check("C2 explicit extension: swap happens",
        !!s.children[0] && s.children[0].src === "picture/talks/poster.jpg");

      // ---- Case D: no data-pic --------------------------------------------
      slots = [makeSlot({})];
      fresh();
      setTimeout(() => {
        check("D1 slot without data-pic is left alone",
          slots[0].children.length === 0 && slots[0].textContent === "ℵ");

        console.log(results.join("\n"));
        const failed = results.filter(r => r.startsWith("FAIL")).length;
        console.log(failed === 0 ? "\nALL TESTS PASSED" : "\n" + failed + " TEST(S) FAILED");
        process.exit(failed === 0 ? 0 : 1);
      }, 60);
    }, 60);
  }, 120);
}, 60);
