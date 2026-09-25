/* ============================================================
   data/2026autumn.js
   ------------------------------------------------------------
   Semester: 2026 Autumn (current)
   写法 A：注册到 window.SEMESTER_DATA[id]
   ============================================================ */

window.SEMESTER_DATA = window.SEMESTER_DATA || {};

window.SEMESTER_DATA["2026autumn"] = {
  id: "2026autumn",
  title: "2026 Autumn",
  summary:
    "Real analysis and functional analysis, partial differential equations, " +
    "finite fields, optimization, and numerical methods — with two books close at hand.",

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
    "Previous semesters are archived on the right and are never removed."
};
