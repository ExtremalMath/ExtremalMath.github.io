// about-data.js
// ============================================================================
// 研究兴趣（Research Interests）与获奖荣誉（Awards & Honors）的内容数据。
//
// 本文件是这两块内容的【唯一数据源】：
//   - about.html 通过内联渲染脚本读取 aboutData，动态生成对应板块的 DOM；
//   - cv-pdf-generator/cv-generator.js 在抓取「生成 CV」时同样读取 aboutData，
//     以保证 About 页面与 CV 的展示内容始终一致。
//
// 因此：日后只需修改本文件（researchInterests / awards 两个数组）即可更新
// 两处展示，无需改动 about.html 的结构或 cv-generator.js 的抽取逻辑。
//
// 字段约定（刻意对齐 about.html 的渲染类与 cv-generator.js 的抽取规则）：
//   researchInterests[].status 为空  => CV 归入 “Research Interests” 板块；
//   researchInterests[].status 非空  => CV 归入 “Selected Works”（研究笔记/项目）。
//   title / desc 中可包含 <em> / <strong> 等行内标签；
//   特殊符号请直接写 Unicode（τ ≈ → —），不要写 HTML 实体（&tau; 等）。
// ============================================================================

const aboutData = {
  researchInterests: [
    {
      status: "",
      title: "Extremal Graph Theory",
      desc: "My primary research focus is on <strong>Extremal Graph Theory</strong>, with a specific emphasis on <em>H</em>-free graph problems. I am particularly interested in the structural properties of these graphs and the associated optimization problems, including Turán-type extremal problems and related enumeration questions."
    },
    {
      status: "● Completed Notes",
      title: "Notes: Density Conditions for Triangles in <em>Multipartite Graphs</em>",
      desc: "Completed a rigorous reading and detailed note set on Bondy, Shen, Thomasse, and Thomassen’s work. Explored edge density thresholds using convex hull theory (Carathéodory’s theorem) and minimal counterexample analysis. Key results highlighted include the golden ratio bound (τ ≈ 0.618) for tripartite graphs and the 1/2 threshold for infinite-partite graphs. See the Materials → Course Essays page for the full notes."
    },
    {
      status: "● In Progress",
      title: "Studying: <em>Functional Analysis for PDEs</em>",
      desc: "Focusing on the intersection of functional analysis and partial differential equations. This area uses Banach and Hilbert space theory, weak topologies and duality, operator and spectral theory, convex analysis, and monotone operator methods to study Sobolev spaces, variational formulations, and the existence, uniqueness, and regularity of weak solutions to elliptic and evolution equations."
    }
  ],

  awards: [
    {
      year: "2025",
      text: "The 17th Chinese Mathematics Competitions (CMC), Category A — Provincial 3rd Prize, Jiangsu"
    }
  ]
};

// 同时挂到 window，便于同页面的 CV 生成（fromCurrentPage）直接复用单一数据源；
// 非浏览器环境（如 CV 抓取时以 new Function 求值）忽略此行即可。
if (typeof window !== "undefined") window.aboutData = aboutData;
