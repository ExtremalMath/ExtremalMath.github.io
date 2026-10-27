// sites.js — data source and renderer for study/academic-sites.html.
//
// Add or remove entries in the SITES array below; the page renders them
// grouped by category. No edit to the HTML is needed.
//
// Fields:
//   category  grouping label, English (defines the section order)
//   name      link text — Chinese sites keep their Chinese name
//   url       destination
//   desc      short description — Chinese sites keep Chinese
//   note      non-empty when the site could not be verified; the text is
//             shown in red next to the entry. Leave "" for a clean entry.
const SITES = [
  // ── Literature Download Platform ────────────────────────────────────────
  {
    category: "Literature Download Platform",
    name: "Springer",
    url: "https://link.springer.com/",
    desc: "Books and journals in mathematics and sciences",
    note: ""
  },
  {
    category: "Literature Download Platform",
    name: "arXiv",
    url: "https://arxiv.org/",
    desc: "Open-access preprints for mathematics and physics",
    note: ""
  },
  {
    category: "Literature Download Platform",
    name: "PubScholar 公益学术",
    url: "https://pubscholar.cn/",
    desc: "中科院公益学术平台，提供中外文学术资源免费获取",
    note: ""
  },

  // ── AI Work Platform ────────────────────────────────────────────────────
  {
    category: "AI Work Platform",
    name: "书生·浦语 AI 工作台",
    url: "https://chat.intern-ai.org.cn/",
    desc: "书生国产大模型对话工作台",
    note: ""
  },
  {
    category: "AI Work Platform",
    name: "书生·浦语 Discovery",
    url: "https://discovery.intern-ai.org.cn/chat",
    desc: "书生大模型探索与检索工作台",
    note: ""
  },

  // ── Math Tools Site ─────────────────────────────────────────────────────
  {
    category: "Math Tools Site",
    name: "MathWorld 中文版",
    url: "https://mathworld.net.cn/",
    desc: "中文数学概念查询平台",
    note: ""
  },
  {
    category: "Math Tools Site",
    name: "OEIS",
    url: "https://oeis.org/",
    desc: "On-Line Encyclopedia of Integer Sequences",
    note: ""
  },

  // ── Math Q&A Forum ──────────────────────────────────────────────────────
  // ── Stock Photo Sites ───────────────────────────────────────────────────
  {
    category: "Stock Photo Sites",
    name: "Pexels",
    url: "https://www.pexels.com/zh-cn/",
    desc: "Free high-quality stock photos, open for commercial use",
    note: "Source: Topbook-知乎"
  },
  {
    category: "Stock Photo Sites",
    name: "Unsplash",
    url: "https://unsplash.com/",
    desc: "Free high-resolution photos contributed by a global community",
    note: "Source: Topbook-知乎"
  },
  {
    category: "Math Q&A Forum",
    name: "MathOverflow",
    url: "https://mathoverflow.net/",
    desc: "Research-level mathematics Q&A community",
    note: ""
  }
];

// Stable category order. Categories not listed here keep the order of their
// first appearance in the data, then sort alphabetically.
var SITE_CATEGORY_ORDER = [
  "Literature Download Platform",
  "AI Work Platform",
  "Math Tools Site",
  "Math Q&A Forum",
  "Stock Photo Sites"
];

// Escapes the five HTML metacharacters so names, descriptions and notes can
// never inject markup.
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Renders the site list grouped by category into the element whose id is
// containerId. Safe to call before or after DOMContentLoaded.
function renderSites(containerId) {
  var container = document.getElementById(containerId);
  if (!container) { return; }

  if (typeof SITES === "undefined" || !SITES.length) {
    container.innerHTML = '<p class="sub">No sites recorded yet.</p>';
    return;
  }

  var groups = {};
  var order = [];
  SITES.forEach(function (s) {
    if (!(s.category in groups)) {
      groups[s.category] = [];
      order.push(s.category);
    }
    groups[s.category].push(s);
  });

  order.sort(function (a, b) {
    var ia = SITE_CATEGORY_ORDER.indexOf(a), ib = SITE_CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) { return a < b ? -1 : 1; }
    if (ia === -1) { return 1; }
    if (ib === -1) { return -1; }
    return ia - ib;
  });

  var html = "";
  order.forEach(function (cat) {
    html += '<div class="category">' + esc(cat) + '</div>';
    groups[cat].forEach(function (s) {
      var note = s.note
        ? '<span class="alert" title="' + esc(s.note) + '">' + esc(s.note) + '</span>'
        : '';
      html += '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" class="res-row">' +
        '<span class="name"><span class="text-hover">' + esc(s.name) + '</span></span>' +
        '<span class="sub"><span class="text-hover">' + esc(s.desc) + '</span></span>' +
        (note ? '<span class="alert-wrap">' + note + '</span>' : '') + '</a>';
    });
  });

  container.innerHTML = html;
}

(function () {
  "use strict";
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { renderSites("sites-container"); });
  } else {
    renderSites("sites-container");
  }
})();
