/* ============================================================
   data/2026autumn.js
   ------------------------------------------------------------
   Semester: 2026 Autumn (current)
   写法 A：注册到 window.SEMESTER_DATA[id]
   ------------------------------------------------------------
   Now 模块（近况卡片）说明：
   本文件是「What I am doing now」页面的唯一数据源。
   所有模块（5 个）的标题、图标、正文、超链接都在 data 中。
   修改近况时只需改这个 JS 文件，HTML 不需要动。
   ============================================================ */

window.SEMESTER_DATA = window.SEMESTER_DATA || {};

window.SEMESTER_DATA["2026autumn"] = {
  id: "2026autumn",
  title: "2026 Autumn",
  summary:
    "Autumn 2026 — Exploring the terrain before committing: " +
    "real and functional analysis, PDEs, finite fields, and graph theory. " +
    "Working through Brezis, Lovász, and one small code exercise at a time.",

  courses: [
    { title: "实变函数与泛函分析", sub: "Real Analysis and Functional Analysis" },
    { title: "数学物理方程",       sub: "Equations of Mathematical Physics" },
    { title: "有限域及其应用",     sub: "Finite Fields and Their Applications" },
    { title: "最优化理论与方法",   sub: "Optimization Theory and Methods" },
    { title: "数值分析",           sub: "Numerical Analysis" },
    { title: "等等",               sub: "…and others" }
  ],

  reading: [
    { title: "László Lovász", sub: "Large Networks and Graph Limits" },
    { title: "Haim Brezis",   sub: "Functional Analysis, Sobolev Spaces and Partial Differential Equations" }
  ],

  notes:
    "This page is updated as the semester progresses. " +
    "Previous semesters are archived on the right and are never removed.",

  now: {
    lastUpdated: "Oct 2026",

    modules: [
      {
        icon: "🎓",
        title: "Study & Grind",
        content:
          "I am now on a daily routine of English vocabulary for the postgraduate entrance exam. " +
          "At the same time I am preparing for math modeling contests and the final exams. " +
          "The pace is hard, but I keep going every day without giving up."
      },
      {
        icon: "🛠️",
        title: "Tinkering with Tools",
        content:
          "I am using WorkBuddy to optimize my own academic website. " +
          "I find it very useful for research and for finishing daily work. " +
          "It is an open AI tool that many students may find helpful."
        ,
        link: "https://www.workbuddy.cn/",
        linkText: "Visit WorkBuddy ↗"
      },
      {
        icon: "💡",
        title: "Random Thoughts",
        content:
          "I am thinking about the relationship between math and AI. " +
          "A recent idea is to connect Tuza's conjecture in graph theory " +
          "with the collection and transport of kitchen waste. " +
          "It is a wild thought, but it might be a way to study real problems."
      },
      {
        icon: "📍",
        title: "Recent Events",
        content:
          "On Oct 10, 2026, I gave a report on how the Tuza conjecture and " +
          "kitchen waste transport might be combined to model a real system. " +
          "If you want to see it, click [Report & Talk] below."
        ,
        link: "../talks/talks.html",
        linkText: "Report & Talk"
      },
      {
        icon: "🤝",
        title: "Current Status",
        content:
          "I am taking a closed study period right now, and I may reply to emails slowly. " +
          "I am trying hard to adjust my sleep habits to stay healthy. " +
          "There is big pressure, but I am getting used to the fast pace of studying."
      }
    ]
  }
};
