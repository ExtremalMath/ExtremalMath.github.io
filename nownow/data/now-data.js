/* ============================================================
   data/now-data.js
   ------------------------------------------------------------
   「Now（近况）」模块的唯一数据源。

   nownow/now.html 在运行时读取本文件并实时渲染，不需要改动任何 HTML。
   新增学期、新增模块、修改文案，都只改这一个文件。

   结构：
     NOW_ORDER        五个模块的固定顺序（id 列表），页面按此顺序渲染
     NOW_TITLES       每个模块的图标与标题（只此一处，页面不硬编码）
     SEMESTER_NOW[id] 每个学期的近况：
                         updated   时间戳，格式 "Oct 2026"（页面页脚 "Last updated" 的来源）
                         modules   { id => { content, sub, link, linkText } }

   模块字段：
     content   string[]   正文，每段一个元素，渲染为独立 <p>
     sub       string     模块副标题（一行灰色小字，可空）
     link      string     超链接，可空；以 http(s) 开头则新开标签
     linkText  string     链接文案，缺省时用 link 本身

   校验（实时编译检查）：node .workbuddy/check-now-data.js
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 五个模块，顺序固定 ---------- */

  var NOW_ORDER = ["learning", "tinkering", "thoughts", "events", "status"];

  var NOW_TITLES = {
    learning: { icon: "🎓", title: "Learning & Grinding" },
    tinkering:  { icon: "🛠️", title: "Tinkering" },
    thoughts:   { icon: "💡", title: "Random Thoughts" },
    events:     { icon: "📍", title: "Recent Events" },
    status:     { icon: "🤝", title: "Current Status" }
  };

  /* ---------- 各学期的近况内容 ---------- */

  var SEMESTER_NOW = {
    "2026autumn": {
      updated: "Oct 2026",

      modules: {
        learning: {
          content: [
            "Mornings begin with English words for the postgraduate entrance exam. I keep the red book open every day, a few dozen at a time, and review the ones I keep forgetting.",
            "Alongside it I work through real analysis, partial differential equations, and finite fields — one theorem and one exercise at a time. The pace is slow, but each step is mine."
          ],
          sub: "Postgraduate English · Real analysis · PDEs · Finite fields"
        },

        tinkering: {
          content: [
            "I build this site by hand, page by page. Lately I have been moving every block of text into a single data file — change the data, and the page updates on its own, with no HTML to touch.",
            "I also write small C++ programs to keep my hands sharp: a Huffman coder, a ticket system, a tour map."
          ],
          sub: "Data-driven pages · C++ exercises · Site upkeep"
        },

        thoughts: {
          content: [
            "I keep turning over one question: can mathematics meet a real problem? One thought that will not let me go is Tuza's conjecture from graph theory, and the collection and transport of kitchen waste. They seem to have nothing to do with each other, yet both ask how to cover a graph with the fewest pieces.",
            "I write these thoughts down instead of letting them pass. Most will lead nowhere. One might not."
          ],
          sub: "Graph theory × real problems · Notes on reading"
        },

        events: {
          content: [
            "On Oct 10 I gave a talk on the thought above — graph theory and kitchen waste — and wrote it up in the Talks section.",
            "The semester has found its rhythm. Classes, notes, and small code exercises fill most of the days."
          ],
          sub: "Oct 10 talk · Semester in rhythm",
          link: "../talks/talks.html",
          linkText: "Read the talk"
        },

        status: {
          content: [
            "I am in a quiet stretch right now — reading, writing, and grinding. I reply to email more slowly than I would like. Please be patient with me.",
            "Sleep and health are still things I am learning to look after. The pressure is there, but I am getting used to carrying it."
          ],
          sub: "Quiet stretch · Replies may be slow"
        }
      }
    }
  };

  /* ---------- 公共接口 ---------- */

  /*
   * 按 NOW_ORDER 的顺序返回一份只读拷贝。
   * 缺失的模块静默跳过，不抛错（旧学期可能只有部分模块）。
   */
  function get(id) {
    var src = SEMESTER_NOW[id];
    if (!src) return null;

    var out = {
      updated: src.updated,
      modules: []
    };

    NOW_ORDER.forEach(function (moduleId) {
      var m = src.modules[moduleId];
      if (!m) return;
      var t = NOW_TITLES[moduleId];
      out.modules.push({
        id: moduleId,
        icon: t ? t.icon : "",
        title: t ? t.title : "",
        content: (m.content || []).slice(),
        sub: m.sub || "",
        link: m.link || "",
        linkText: m.linkText || ""
      });
    });

    return Object.freeze(out);
  }

  function order() {
    return NOW_ORDER.slice();
  }

  function titles(moduleId) {
    var t = NOW_TITLES[moduleId];
    return t ? { icon: t.icon, title: t.title } : null;
  }

  function allIds() {
    return Object.keys(SEMESTER_NOW);
  }

  if (typeof window !== "undefined") {
    window.NowData = { get: get, order: order, titles: titles, allIds: allIds };
  }
})();
