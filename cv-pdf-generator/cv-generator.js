/*
 * cv-generator.js
 * ----------------------------------------------------------------------------
 * 独立函数：从本站公开网页（默认 ../about.html 与 ../talks/talks.html）抓取并
 * 「总结」内容，实时生成一份学术场景用、适合打印的 PDF 个人简历。
 *
 * 触发方式（均按需调用，不会自动静默生成）：
 *   1) 指定按钮：在 about.html 中加入
 *        <script src="cv-pdf-generator/cv-generator.js"></script>
 *        <button onclick="CVGenerator.generateCV({ fromCurrentPage:true })">生成简历(PDF)</button>
 *      点击即读取「当前已打开的 about 页面」DOM —— 始终与源同步，无需联网 / 无跨域问题。
 *   2) 超链接：cv-zh.html / cv-en.html 在加载时自动调用（按页面语言抓取生成）。
 *
 * 双语（lang）：'zh' 中文版 | 'en' 英文版。两版为各自独立页面，可独立打印 / 下载。
 *   源页面正文以英文为主，故英文版直接取源；中文版通过内置 ZH 词典翻译正文，
 *   未命中词典的新内容会回退为原文（英文），保证不丢失。
 *
 * 输出：黑框白底、简洁精炼的简历版式；默认纵向（portrait）A4，经浏览器打印
 *       （另存为 PDF）输出；可选 downloadPDF() 一键下载（同样为纵向）。
 *
 * 内容安全：仅抓取公开页面；内置过滤规则明确排除课程作业
 *   （homework / 课程作业 / Core Coursework / Course Talk 等），
 *   且不包含任何非公开信息（如 private/ 目录下的图片与资料）。
 * ----------------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  /* ============================ 可配置项 ============================ */
  const CONFIG = {
    // 默认抓取的公开源页面（相对站点根目录的上一级，因本脚本位于 cv-pdf-generator/ 子目录）
    sources: {
      about: '../about.html',
      talks: '../talks/talks.html',
      // About 页面 Research Interests / Awards 的唯一数据源（与 about.html 共用）
      aboutData: '../about-data.js'
    },
    // 演讲 / 作品中若带有以下「类型标签」，则视为课程作业并排除（小写精确匹配）
    excludeTalkTypes: ['course talk', 'homework', 'coursework', '课程作业', '作业'],
    // 命中以下关键词的任意条目（标题或描述）一律排除 —— 兜底过滤课程作业
    excludeKeywords: ['homework', 'coursework', '课程作业', '作业', 'core coursework'],
    // 打印 / 下载时的建议文件名前缀
    docTitle: 'Yuanbo_Li_CV',
    // 是否在屏幕上显示预览（cv 页面建议 true；about.html 按钮触发建议 false → 直接打印）
    showPreview: false,
    // 默认语言
    lang: 'en'
  };

  // 运行时状态（当前生成的语言）
  const state = { lang: CONFIG.lang };

  /* ====================== 双语 UI / 板块标签 ====================== */
  const LABELS = {
    zh: {
      education: '教育经历',
      works: '相关作品',
      awards: '获奖经历',
      other: '其他学术条目',
      interests: '研究兴趣',
      skills: '技能',
      service: '学术服务与社会实践',
      talk: '报告',
      footer: '由 extremalmath.github.io 公开页面自动汇总生成'
    },
    en: {
      education: 'Education',
      works: 'Selected Works',
      awards: 'Awards & Honors',
      other: 'Other Academic Items',
      interests: 'Research Interests',
      skills: 'Technical Skills',
      service: 'Service & Outreach',
      talk: 'Talk',
      footer: 'Auto-compiled from public pages of extremalmath.github.io'
    }
  };
  function L() { return LABELS[state.lang] || LABELS.en; }

  // 中文版简介（源站 bio 为英文，单独提供克制的中文摘要）
  const BIO_ZH = '我是 Yuanbo Li（Bruce Lee），中国江苏人，江苏大学数学科学学院本科生。' +
    '研究兴趣主要位于极值图论与偏微分方程泛函分析方法的交叉地带，目前仍在广泛探索阶段。';

  /* ============== 中文翻译词典（英文源 → 中文；未命中回退原文） ============== */
  const ZH = {
    // 基本信息
    'Undergraduate · School of Mathematical Sciences · Jiangsu University':
      '本科生 · 江苏大学数学科学学院',
    // 教育经历
    'B.Sc. in Mathematics': '数学理学学士',
    'School of Mathematical Sciences, Jiangsu University': '江苏大学数学科学学院',
    '2024 – Present': '2024 至今',
    'Exchange Program — Data Science': '交换项目 — 数据科学',
    'National University of Singapore (NUS)': '新加坡国立大学（NUS）',
    'August 2025': '2025 年 8 月',
    'Studied data science and related computational methods, with familiarity in token concepts and gradient descent algorithms used in large language models.':
      '学习数据科学及相关计算方法，熟悉大语言模型中使用的 token 概念与梯度下降算法。',
    'High School Diploma': '高中文凭',
    'Nanjing No.9 High School, Jiangsu Province': '江苏省南京市第九中学',
    '– 2024': '– 2024 年',
    // 研究兴趣 / 作品
    'Extremal Graph Theory': '极值图论',
    'My primary research focus is on Extremal Graph Theory, with a specific emphasis on H-free graph problems. I am particularly interested in the structural properties of these graphs and the associated optimization problems, including Turán-type extremal problems and related enumeration questions.':
      '我的主要研究方向为极值图论，尤其关注 H-自由图问题；对这类图的结构性质及相关优化问题（包括 Turán 型极值问题与相关计数问题）抱有浓厚兴趣。',
    '● Completed Notes': '● 已完成笔记',
    'Notes: Density Conditions for Triangles in Multipartite Graphs': '笔记：多部图中三角形的密度条件',
    'Completed a rigorous reading and detailed note set on Bondy, Shen, Thomasse, and Thomassen’s work. Explored edge density thresholds using convex hull theory (Carathéodory’s theorem) and minimal counterexample analysis. Key results highlighted include the golden ratio bound (τ ≈ 0.618) for tripartite graphs and the 1/2 threshold for infinite-partite graphs. See notes in the Materials->Course essays':
      '对 Bondy、Shen、Thomasse 与 Thomassen 的工作进行了严谨研读并整理详细笔记；借助凸包理论（Carathéodory 定理）与极小反例分析探讨边密度阈值。关键结果包括三部图的黄金比界（τ ≈ 0.618）与无限部图的 1/2 阈值。笔记见 Materials→Course essays。',
    '● In Progress': '● 进行中',
    'Studying: Functional Analysis for PDEs': '研读中：偏微分方程的泛函分析',
    'Focusing on the intersection of functional analysis and partial differential equations. This area uses Banach and Hilbert space theory, weak topologies and duality, operator and spectral theory, convex analysis, and monotone operator methods to study Sobolev spaces, variational formulations, and the existence, uniqueness, and regularity of weak solutions to elliptic and evolution equations.':
      '聚焦泛函分析与偏微分方程的交叉领域，运用 Banach 与 Hilbert 空间理论、弱拓扑与对偶、算子与谱理论、凸分析及单调算子方法，研究 Sobolev 空间、变分形式，以及椭圆与演化方程弱解的存在性、唯一性与正则性。',
    // 获奖
    'The 17th Chinese Mathematics Competitions (CMC), Category A — Provincial 3rd Prize, Jiangsu':
      '第十七届中国大学生数学竞赛（CMC）A 类 — 江苏赛区三等奖',
    // 技能
    'Algorithm implementation and numerical computation': '算法实现与数值计算',
    'Matrix computation and data visualization': '矩阵计算与数据可视化',
    'Object-oriented programming and software development': '面向对象编程与软件开发',
    'Academic paper writing and typesetting': '学术论文写作与排版',
    'Python (Machine Learning)': 'Python（机器学习）',
    'From Prof. Han Dun’s course: regression, Bayesian classifiers, k-NN, decision trees, SVM, ensemble models, clustering, etc.':
      '韩敦教授课程：回归、贝叶斯分类器、k-NN、决策树、SVM、集成模型、聚类等。',
    // 学术服务与社会实践
    'Docent': '讲解员',
    'University History Museum and Agricultural Machinery Culture Exhibition Hall, Jiangsu University':
      '江苏大学中国农机文化展示馆暨校史博物馆',
    'Guided visitors through the history and development of Jiangsu University.':
      '为访客讲解江苏大学的历史与发展。',
    'Volunteer Teacher': '志愿支教老师',
    'Big Eyes Volunteer Team, Jiangsu University — Jianbi Primary School':
      '江苏大学“大眼睛”志愿团队 — 谏壁中心小学',
    '2024 – 2025': '2024–2025',
    'Delivered engaging club courses to children at Jianbi Primary School. Read the feature article ↗':
      '在谏壁中心小学为孩子们开设生动的兴趣课程。阅读专题报道 ↗',
    'Volunteer': '志愿者',
    'Purple Grass Volunteer Team, Memorial Hall of the Victims in Nanjing Massacre by Japanese Invaders':
      '“紫草”志愿团队，侵华日军南京大屠杀遇难同胞纪念馆',
    'July 2025': '2025 年 7 月',
    'Guided crowds and assisted visitors in need at the memorial hall.':
      '在纪念馆内引导人流，协助有需要的访客。'
  };
  // 归一化：统一弯直引号与破折号，避免源页与词典标点不一致导致漏译
  function norm(s) {
    return String(s)
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-');
  }
  // 预构建归一化索引
  const ZHN = {};
  Object.keys(ZH).forEach(function (k) { ZHN[norm(k)] = ZH[k]; });

  /* ============ 前瞻术语表（TERMS）：整句未命中时的子串中译 ============
   * 仅维护「整句 ZH」会让任何源站措辞微调都整句回退英文。故额外提供术语级
   * 替换表：对未命中整句的英文自由文本，做子串中译，覆盖未来可能新增的内容。
   * 规则：长词条优先替换（避免短词提前破坏长词）；大小写不敏感；替换为中文。
   * 新增术语只需在此追加 [英文, 中文] 一对，维护成本极低。 */
  const TERMS = [
    // 数学
    ['Extremal Graph Theory', '极值图论'],
    ['Graph Theory', '图论'],
    ['Ramsey Theory', '拉姆齐理论'],
    ['Turán-type', '图兰型'],
    ['Turán', '图兰'],
    ['Convex Analysis', '凸分析'],
    ['Convex Hull', '凸包'],
    ['Functional Analysis', '泛函分析'],
    ['Partial Differential Equations', '偏微分方程'],
    ['Partial Differential Equation', '偏微分方程'],
    ['Sobolev spaces', 'Sobolev 空间'],
    ['Sobolev', 'Sobolev'],
    ['Banach', 'Banach'],
    ['Hilbert', 'Hilbert'],
    ['Edge Density', '边密度'],
    ['Edge density', '边密度'],
    ['Multipartite Graphs', '多部图'],
    ['Multipartite', '多部'],
    ['Optimization', '最优化'],
    ['Optimization Problems', '最优化问题'],
    ['Enumeration', '计数'],
    ['Triangles', '三角形'],
    ['Triangle', '三角形'],
    ['Density', '密度'],
    // 计算机 / 机器学习
    ['Machine Learning', '机器学习'],
    ['Deep Learning', '深度学习'],
    ['Neural Network', '神经网络'],
    ['Neural Networks', '神经网络'],
    ['Gradient Descent', '梯度下降'],
    ['Large Language Models', '大语言模型'],
    ['Large Language Model', '大语言模型'],
    ['Data Science', '数据科学'],
    ['Numerical Computation', '数值计算'],
    ['Support Vector Machine', '支持向量机'],
    ['Support Vector Machines', '支持向量机'],
    ['SVM', 'SVM（支持向量机）'],
    ['Decision Tree', '决策树'],
    ['Decision Trees', '决策树'],
    ['Bayesian', '贝叶斯'],
    ['Regression', '回归'],
    ['Clustering', '聚类'],
    ['k-NN', 'k-NN'],
    ['Algorithm', '算法'],
    ['Algorithms', '算法'],
    ['Python', 'Python'],
    // 机构 / 地名
    ['National University of Singapore', '新加坡国立大学'],
    ['Jiangsu University', '江苏大学'],
    ['School of Mathematical Sciences', '数学科学学院'],
    ['Nanjing', '南京'],
    ['Singapore', '新加坡'],
    ['China', '中国'],
    ['Chinese', '中国'],
    ['Exchange', '交换'],
    // 学术 / 获奖 / 服务
    ['Mathematics Competition', '数学竞赛'],
    ['Mathematics Competitions', '数学竞赛'],
    ['Competition', '竞赛'],
    ['Competitions', '竞赛'],
    ['First Prize', '一等奖'],
    ['Second Prize', '二等奖'],
    ['Third Prize', '三等奖'],
    ['Prize', '奖'],
    ['Honor', '荣誉'],
    ['Honors', '荣誉'],
    ['Award', '奖'],
    ['Awards', '奖'],
    ['Provincial', '省级'],
    ['National', '国家级'],
    ['Scholarship', '奖学金'],
    ['Research', '研究'],
    ['Internship', '实习'],
    ['Publication', '论文'],
    ['Publications', '论文'],
    ['Conference', '会议'],
    ['Volunteer', '志愿'],
    ['Volunteers', '志愿'],
    ['Teaching', '教学'],
    ['Talk', '报告'],
    ['Talks', '报告']
  ];
  // 预排序：长词条优先，避免短词提前替换而破坏长词匹配
  const TERMS_SORTED = TERMS.slice().sort(function (a, b) { return b[0].length - a[0].length; });
  function applyTerms(s) {
    TERMS_SORTED.forEach(function (pair) {
      const en = pair[0], zh2 = pair[1];
      const re = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      s = s.replace(re, zh2);
    });
    return s;
  }

  // 翻译辅助：中文版先查整句 ZH（精确、人工审定），未命中则做术语级子串替换
  function zh(s) {
    if (s == null) return s;
    s = String(s);
    const k = norm(s);
    if (ZHN[k] !== undefined) return ZHN[k];   // 整句中译优先
    return applyTerms(s);                       // 否则术语级替换（前瞻覆盖）
  }
  // 按当前语言翻译（英文版原样返回）
  function t(s) { return state.lang === 'zh' ? zh(s) : s; }

  /* ============================ 工具函数 ============================ */
  function text(node) {
    if (!node) return '';
    return (node.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // 克制地总结：截断到 max 字符，尽量在词边界断开
  function summarize(str, max) {
    str = (str || '').replace(/\s+/g, ' ').trim();
    if (str.length <= max) return str;
    let cut = str.slice(0, max);
    const idx = cut.lastIndexOf(' ');
    if (idx > max * 0.6) cut = cut.slice(0, idx);
    return cut.replace(/[,;]\s*$/, '') + ' …';
  }
  function matchesExclude(str) {
    str = (str || '').toLowerCase();
    return CONFIG.excludeKeywords.some(function (k) { return str.indexOf(k) >= 0; });
  }
  // 去掉数据字符串中的行内标签（<em>/<strong> 等），得到纯文本，
  // 与 DOM 元素的 textContent 行为一致，确保翻译词典命中等逻辑不受影响。
  function stripTags(s) {
    return String(s == null ? '' : s).replace(/<[^>]*>/g, '');
  }

  /* ============================ 内容抽取 ============================ */
  function extractBasic(doc) {
    const name = text(doc.querySelector('.hero-info h1'));
    const nameEn = text(doc.querySelector('.name-en'));
    const title = t(text(doc.querySelector('.subtitle')));
    let email = '';
    const el = doc.querySelector('.email-link');
    if (el) email = (el.dataset.user || '') + '@' + (el.dataset.domain || '');
    let orcid = '';
    const oc = doc.querySelector('.contact-box a[href*="orcid.org"]');
    if (oc) orcid = text(oc);
    const bioP = doc.querySelector('.bio p');
    const summary = state.lang === 'zh'
      ? BIO_ZH
      : (bioP ? summarize(text(bioP), 150) : '');
    return { name: name, nameEn: nameEn, title: title, email: email, orcid: orcid, summary: summary };
  }

  function extractEducation(doc) {
    return Array.from(doc.querySelectorAll('.timeline .timeline-item')).map(function (it) {
      return {
        degree: t(text(it.querySelector('.degree'))),
        school: t(text(it.querySelector('.school'))),
        period: t(text(it.querySelector('.period'))),
        detail: t(text(it.querySelector('.detail')))
      };
    }).filter(function (e) { return e.degree; });
  }

  // 返回全部 research 卡片；有 .status 的是「作品/笔记」，无 .status 的是「研究兴趣」
  function extractCards(doc) {
    return Array.from(doc.querySelectorAll('.research-card')).map(function (card) {
      const status = t(text(card.querySelector('.status')));
      const title = t(text(card.querySelector('h3')));
      const p = card.querySelector('p');
      const desc = p ? summarize(t(text(p)), 170) : '';
      return { status: status, title: title, desc: desc };
    }).filter(function (c) { return c.title && !matchesExclude(c.title + ' ' + c.desc); });
  }

  function extractAwards(doc) {
    return Array.from(doc.querySelectorAll('.award-list li')).map(function (li) {
      return { year: t(text(li.querySelector('.award-year'))), text: t(text(li.querySelector('.award-text'))) };
    }).filter(function (a) { return a.text; });
  }

  // 数据驱动抽取：直接读取 about-data.js 的 aboutData（与 about.html 同源），
  // 行为对齐 extractCards / extractAwards，但无需依赖 about.html 的静态 DOM。
  function extractCardsData(data) {
    const items = (data && data.researchInterests) || [];
    return items.map(function (it) {
      const status = t(stripTags(it.status || ''));
      const title = t(stripTags(it.title || ''));
      const desc = it.desc ? summarize(t(stripTags(it.desc)), 170) : '';
      return { status: status, title: title, desc: desc };
    }).filter(function (c) { return c.title && !matchesExclude(c.title + ' ' + c.desc); });
  }
  function extractAwardsData(data) {
    const items = (data && data.awards) || [];
    return items.map(function (a) {
      return { year: t(stripTags(a.year || '')), text: t(stripTags(a.text || '')) };
    }).filter(function (x) { return x.text; });
  }

  function extractSkills(doc) {
    return Array.from(doc.querySelectorAll('.skills-grid .skill-item')).map(function (it) {
      return { name: t(text(it.querySelector('.skill-name'))), desc: t(text(it.querySelector('.skill-desc'))) };
    }).filter(function (s) { return s.name; });
  }

  function extractService(doc) {
    return Array.from(doc.querySelectorAll('.exp-list .exp-item')).map(function (it) {
      return {
        role: t(text(it.querySelector('.exp-role'))),
        org: t(text(it.querySelector('.exp-org'))),
        period: t(text(it.querySelector('.exp-period'))),
        desc: summarize(t(text(it.querySelector('.exp-desc'))), 120)
      };
    }).filter(function (s) { return s.role; });
  }

  function extractTalks(doc) {
    if (!doc) return [];
    return Array.from(doc.querySelectorAll('.talk')).map(function (tk) {
      const dateRaw = text(tk.querySelector('.date')); // 形如 "2026-10-10 · Course Talk"
      const parts = dateRaw.split('·').map(function (s) { return s.trim(); });
      const date = parts[0] || '';
      const type = (parts[1] || '').toLowerCase();
      const title = text(tk.querySelector('h3'));
      const zhText = text(tk.querySelector('.zh'));
      return { date: date, type: type, title: title, zh: zhText };
    }).filter(function (tk) {
      return tk.title && CONFIG.excludeTalkTypes.indexOf(tk.type) < 0 && !matchesExclude(tk.title);
    });
  }

  function assemble(aboutDoc, talksDoc, aboutData) {
    // 优先使用 about-data.js 的单一数据源；缺失时回退到 about.html 的 DOM 抽取
    const cards = aboutData ? extractCardsData(aboutData) : extractCards(aboutDoc);
    const interests = cards.filter(function (c) { return !c.status; })
      .map(function (c) { return { title: c.title, desc: c.desc }; });
    const notes = cards.filter(function (c) { return c.status; });
    const talks = extractTalks(talksDoc);
    // 「相关作品」= 研究笔记/项目 + 学术报告(Talks)
    const works = notes.concat(talks.map(function (tk) {
      return {
        status: L().talk,
        title: (state.lang === 'zh' && tk.zh) ? tk.zh : tk.title,
        desc: tk.date
      };
    }));
    return {
      basic: extractBasic(aboutDoc),
      education: extractEducation(aboutDoc),
      works: works,
      awards: aboutData ? extractAwardsData(aboutData) : extractAwards(aboutDoc),
      interests: interests,
      skills: extractSkills(aboutDoc),
      service: extractService(aboutDoc)
    };
  }

  /* ============================ 渲染 ============================ */
  function sectionHead(title) { return '<h2 class="cv-h2">' + esc(title) + '</h2>'; }

  function entry(date, title, desc) {
    let s = '<div class="cv-entry">';
    s += '<div class="cv-date">' + esc(date || '') + '</div>';
    s += '<div class="cv-body">';
    s += '<div class="cv-title">' + esc(title || '') + '</div>';
    if (desc) s += '<div class="cv-desc">' + esc(desc) + '</div>';
    s += '</div></div>';
    return s;
  }

  /* 生成日期：按北京时间（UTC+8）计算，仅显示「年 + 月」。
   * 取绝对时间戳后加固定 8 小时偏移，再读 UTC 字段，即为北京时间；
   * 这样既不受运行环境本地时区影响，也规避了 UTC 与北京时间的日期边界错位
   * （例如北京时间 10-17 07:00 = UTC 10-16 23:00，直接用 toISOString 会少一天）。*/
  const BJ_OFFSET_MS = 8 * 60 * 60 * 1000;
  function buildDate() {
    const d = new Date(Date.now() + BJ_OFFSET_MS);
    return state.lang === 'zh'
      ? d.getUTCFullYear() + '年' + (d.getUTCMonth() + 1) + '月'
      : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  function buildHTML(d) {
    const b = d.basic;
    const today = buildDate();
    const lab = L();
    let h = '<div class="cv-sheet">';

    // 头部：姓名 / 英文名 / 身份
    h += '<div class="cv-head">';
    h += '<div class="cv-mono">YL</div>';
    h += '<div class="cv-head-main">';
    h += '<h1>' + esc(b.name) + '</h1>';
    if (b.nameEn) h += '<div class="cv-sub">' + esc(b.nameEn) + '</div>';
    if (b.title) h += '<div class="cv-sub">' + esc(b.title) + '</div>';
    h += '</div></div>';

    // 公开联系方式
    const contacts = [];
    if (b.email) contacts.push('✉ ' + b.email);
    if (b.orcid) contacts.push('ORCID: ' + b.orcid);
    if (contacts.length) {
      h += '<div class="cv-contact">' + contacts.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>';
    }
    if (b.summary) h += '<div class="cv-summary">' + esc(b.summary) + '</div>';
    h += '<hr class="cv-rule">';

    // 教育经历
    if (d.education.length) {
      h += sectionHead(lab.education);
      d.education.forEach(function (e) {
        const sub = [e.school, e.detail].filter(Boolean).join('  —  ');
        h += entry(e.period, e.degree, sub);
      });
    }

    // 相关作品（明确排除课程作业）
    if (d.works.length) {
      h += sectionHead(lab.works);
      d.works.forEach(function (w) {
        const sub = [w.status, w.desc].filter(Boolean).join('  ');
        h += entry('', w.title, sub);
      });
    }

    // 获奖经历
    if (d.awards.length) {
      h += sectionHead(lab.awards);
      d.awards.forEach(function (a) {
        h += entry(a.year, a.text, '');
      });
    }

    // 其他学术相关条目
    let other = '';
    if (d.interests.length) {
      other += '<div class="cv-sub2">' + esc(lab.interests) + '</div>';
      const isep = state.lang === 'zh' ? '：' : ': ';
      other += d.interests.map(function (it) {
        return '<div class="cv-desc">' + esc(it.title + (it.desc ? isep + it.desc : '')) + '</div>';
      }).join('');
    }
    if (d.skills.length) {
      other += '<div class="cv-sub2">' + esc(lab.skills) + '</div>';
      other += d.skills.map(function (s) {
        return '<div class="cv-desc">' + esc(s.name + (s.desc ? ' — ' + s.desc : '')) + '</div>';
      }).join('');
    }
    if (other) {
      h += sectionHead(lab.other);
      h += other;
      if (d.service.length) {
        h += '<div class="cv-sub2">' + esc(lab.service) + '</div>';
        d.service.forEach(function (s) {
          const sub = (s.period ? '(' + s.period + ') ' : '') + s.desc;
          h += entry('', s.role + (s.org ? ' — ' + s.org : ''), sub);
        });
      }
    }

    // 页脚
    h += '<hr class="cv-rule">';
    h += '<div class="cv-foot">' + esc(lab.footer) + ' · ' + esc(today) + '</div>';
    h += '</div>';
    return h;
  }

  /* ============================ 样式注入 ============================ */
  function ensureStyle() {
    if (document.getElementById('cv-style')) return;
    const css = [
      '/* 简历正片：默认隐藏，预览/打印时才显示 */',
      '#cv-root{ display:none; }',
      '#cv-root .cv-sheet{',
      '  max-width:720px; margin:0 auto; background:#fff; color:#1b1b1b;',
      '  border:2px solid #000; padding:30px 34px;',
      '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,"PingFang SC","Microsoft YaHei",sans-serif;',
      '  font-size:13.5px; line-height:1.6;',
      '}',
      '#cv-root .cv-head{ display:flex; align-items:center; gap:20px; }',
      '#cv-root .cv-mono{ flex:0 0 auto; width:56px; height:56px; border:2px solid #000;',
      '  display:flex; align-items:center; justify-content:center; font-weight:700; font-size:21px; }',
      '#cv-root .cv-head-main{ flex:1; min-width:0; }',
      '#cv-root .cv-head-main h1{ font-size:28px; margin:0; letter-spacing:.3px; line-height:1.2; }',
      '#cv-root .cv-sub{ color:#6d6a63; font-size:13px; margin-top:3px; }',
      '#cv-root .cv-contact{ margin-top:10px; font-size:12.5px; color:#6d6a63; }',
      '#cv-root .cv-contact span{ margin-right:18px; white-space:nowrap; }',
      '#cv-root .cv-summary{ margin-top:10px; font-size:12.5px; color:#1b1b1b; line-height:1.6; }',
      '#cv-root .cv-rule{ border:none; border-top:1.5px solid #000; margin:22px 0; }',
      '#cv-root .cv-h2{ font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:.06em;',
      '  border-bottom:1.5px solid #000; padding-bottom:5px; margin:26px 0 12px; break-after:avoid; }',
      '#cv-root .cv-entry{ display:flex; gap:16px; margin-bottom:11px; break-inside:avoid; }',
      '#cv-root .cv-date{ flex:0 0 96px; color:#6d6a63; font-size:12px; padding-top:2px; }',
      '#cv-root .cv-body{ flex:1; min-width:0; }',
      '#cv-root .cv-title{ font-weight:700; font-size:13.5px; }',
      '#cv-root .cv-desc{ color:#6d6a63; font-size:12.5px; margin-top:2px; line-height:1.55; }',
      '#cv-root .cv-sub2{ font-weight:700; font-size:13px; margin:14px 0 3px; color:#8c2f39; break-inside:avoid; }',
      '#cv-root .cv-foot{ font-size:11px; color:#6d6a63; text-align:right; margin-top:16px; }',
      '@media print{',
      '  @page{ size:A4 portrait; margin:12mm; }',
      '  html,body{ background:#fff !important; }',
      '  .cv-no-print,.back-link,.page-head,.page-foot,#cv-status{ display:none !important; }',
      '  .page{ max-width:none !important; padding:0 !important; margin:0 !important; }',
      '  #cv-root{ display:block !important; }',
      '  #cv-root .cv-sheet{ border:2px solid #000; max-width:none; width:100%; padding:28px 34px; }',
      '  /* 黑白灰度：简历正文内唯一的彩色是 .cv-sub2 的绛红 #8c2f39，压为纯黑；其余已为黑白灰 */',
      '  #cv-root .cv-sub2{ color:#1b1b1b !important; }',
      '  #cv-root, #cv-root *{ background:#fff !important; border-color:#000 !important; box-shadow:none !important; text-shadow:none !important; }',
      '}'
    ].join('\n');
    const st = document.createElement('style');
    st.id = 'cv-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function showStatus(msg) {
    let s = document.getElementById('cv-status');
    if (!s) {
      s = document.createElement('div');
      s.id = 'cv-status';
      const wrap = document.querySelector('.content') || document.body;
      wrap.appendChild(s);
    }
    s.textContent = msg;
  }

  function render(data, preview) {
    ensureStyle();
    const existing = document.getElementById('cv-status');
    if (existing) existing.remove();
    let root = document.getElementById('cv-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'cv-root';
      document.body.appendChild(root);
    }
    root.innerHTML = buildHTML(data);
    if (preview) {
      root.style.display = 'block';
    } else {
      // 屏幕隐藏，仅打印时显示；略微延迟确保样式与渲染完成
      root.style.display = 'none';
      setTimeout(function () { global.print(); }, 60);
    }
  }

  /* ============================ 抓取源页面 ============================ */
  function fetchPages(urls) {
    return Promise.all(urls.map(function (url) {
      return fetch(url, { cache: 'no-store' }).then(function (res) {
        if (!res.ok) throw new Error('无法获取 ' + url + '（HTTP ' + res.status + '）');
        return res.text().then(function (html) {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          return { url: url, doc: doc };
        });
      });
    }));
  }

  // 抓取 about-data.js：取出其中的 aboutData 对象（本站可信数据文件，仅在本作用域内执行）。
  // 失败则返回 null，由 assemble 回退到 about.html 的 DOM 抽取。
  function fetchAboutData(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) return null;
      return res.text().then(function (js) {
        try {
          const fn = new Function(js + '\n; return (typeof aboutData !== "undefined") ? aboutData : null;');
          return fn() || null;
        } catch (e) { return null; }
      });
    }).catch(function () { return null; });
  }

  /* ============================ 对外主函数 ============================ */
  function generateCV(opts) {
    opts = opts || {};
    state.lang = opts.lang || CONFIG.lang;
    let aboutDoc, talksDoc;

    if (opts.fromCurrentPage) {
      // 直接读取当前已打开页面（about.html），始终与源同步，无跨域问题
      aboutDoc = document;
      talksDoc = null;
      // about.html 已加载 about-data.js，直接使用同源数据
      const aboutData = (typeof global.aboutData !== 'undefined') ? global.aboutData : null;
      const data = assemble(aboutDoc, talksDoc, aboutData);
      render(data, opts.showPreview !== undefined ? opts.showPreview : CONFIG.showPreview);
      return;
    }

    const pages = opts.fetchPages || [CONFIG.sources.about, CONFIG.sources.talks];
    showStatus('正在抓取并生成简历…');
    return Promise.all([
      fetchPages(pages),
      fetchAboutData(CONFIG.sources.aboutData)
    ]).then(function (results) {
      const docs = results[0];
      const aboutData = results[1];
      aboutDoc = docs.filter(function (d) { return d.url.indexOf('talks') < 0; })[0].doc;
      const tk = docs.filter(function (d) { return d.url.indexOf('talks') >= 0; })[0];
      talksDoc = tk ? tk.doc : null;
      const data = assemble(aboutDoc, talksDoc, aboutData);
      render(data, opts.showPreview !== undefined ? opts.showPreview : CONFIG.showPreview);
    }).catch(function (err) {
      showStatus('生成失败：' + err.message +
        '。请确认通过 http(s)://（如 GitHub Pages 或本地服务器）访问本页，而非直接双击打开本地文件。');
    });
  }

  /* ============================ 可选：直接下载 PDF（纵向） ============================ */
  function downloadPDF() {
    const el = document.querySelector('#cv-root .cv-sheet');
    if (!el) { alert('请先生成简历后再下载。'); return; }
    const suffix = (state.lang === 'zh') ? 'zh' : 'en';
    loadScript('https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js', function () {
      if (!global.html2pdf) {
        alert('PDF 组件加载失败（可能处于离线 / 受限网络）。已改为打印方式，请在对话框中选择“另存为 PDF”。');
        global.print();
        return;
      }
      const opt = {
        margin: 8,
        filename: CONFIG.docTitle + '_' + suffix + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      global.html2pdf().set(opt).from(el).save();
    });
  }

  function loadScript(src, cb) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  global.CVGenerator = { generateCV: generateCV, downloadPDF: downloadPDF, CONFIG: CONFIG, LABELS: LABELS };
})(typeof window !== 'undefined' ? window : this);
