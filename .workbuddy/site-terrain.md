# 站点立体化：内容补充与优化清单

> 基于 `ExtremalMath.github.io` 当前信息架构（21 个线上 HTML + 3 个 JS 数据源 + 11 个 PDF），对照「证据 / 过程 / 关系 / 时间」四维模型生成。

---

## 一、内容分类差距（缺什么）

| 维度 | 当前已有 | 差距 / 缺失 |
|---|---|---|
| **证据（Outcomes）** | homework / notes / books / awards / competition / CV | 缺少「项目级成果展示」（项目页、Behind the paper）；文章/书籍只有目录无推介语 |
| **过程（Process）** | research-log（仅 4 条会议/读书记录） / research-directions（3 个方向简介） | 缺少研究路线/概念图；缺少单次研究的项目页（问题→方法→数据→结果→局限）；缺少失败/阴性结果记录 |
| **关系（Relations）** | myteachers / talks / academic-sites / drama | 缺少合作者/note 网络、合作者谁的页面、合作项目入口；教学导师无独立页面 |
| **时间（Timeline）** | education timeline（3 条）/ changelog（3 条）/ Now 页 | 时间线太短；缺少按月的 mini log、学期回顾 |
| **公共服务（Service）** | 完全缺失 | 无审数据/服务/开源社区贡献 |
| **公众与影响** | 完全缺失 | 无科普入口、无媒体/报告、无互动展望 |
| **教学（Teaching）** | teaching.html 占位「Soon」 | 无课程体系、课程大纲、讲义、学生反馈 |

## 二、功能模块差距（缺什么功能）

1. **研究地图（Study Map）** — `index.html` 仅放了两段简介和"View Profile"，访客 10 秒内看不懂你的研究主线。需加一个「3–5 个研究问题如何接入同一张网」的视觉图或精炼句子（P0）。
2. **项目页（Project Page）** — 每个研究/课程论文应有一页：what/why/how/what broke。你现在有 notes / course essay 的 PDF 链接但没页面说明（P0）。
3. **代码入口** — `code/c` 与 `code/cpp` 已有 7 个文件，但全站没有任何入口/目录页（P1，接口小）。
4. **Now 页** — `nownow/now.html` 已存在，但约一年未更（2026 Fall 2026），与约页面右侧 "Now" 状态可能不跳动（P1）。
5. **联系页** — 联系方式仅约页面底部，且需 JS 解密邮箱；缺少 "合作意向/审稿/媒体" 的分隔是合理的。建议把联系拆成独立短页（P1）。
6. **搜索 & 标签** — 全站静态 HTML，无搜索、无标签/主题筛选（P2，由于无后端，只能做本地搜索）。
7. **翻译/双语** — 内容全英文；你有中文课程和中文向志愿者活动，可考虑对关键页面做简短中文摘要，或至少在一个页面为英文铺底（P2）。
8. **RSS / Newsletter** — 静态页难以自动，除非转 GitHub feed（P2）。
9. **图像/视觉素材** — 无实验装置、田野、走廊照、图片集，符合规（P2）。
10. **键盘导航、a11y、alt text** — 页面短篇视觉未加 alt（图片只有 avatar 占位）（P1）。

## 三、数据结构差距（As-is → 亮点）

- 你已做对了两点：`about-data.js` 数据驱动 about + CV（最佳实践）和 `migrations-data.js` 驱动的迁移日志。**应把数据驱动扩大到 study、books、academic-sites、now、updates**。当前 `notes.html`、`books.html`、`homework.html`、`study/competition.html` 全部静态手写，后续每加一项都改 HTML，维护成本随内容线性增长。
- 建议新增数据源，统一按以下字段模型：
  - `project.js`: `title`, `status` (complete/ongoing/planned), `category` (research/competition/course), `desc`, `date`, `tags`, `pdf`/`link`
  - `books.js`: `title`, `author`, `year`, `year_edition`, `lang`, `pages`, `size`, `why` (加上推荐理由), `status` (reading/finished)
  - `projects.js`: `image`, `source` (link), `team`
  - `events.js`: `date`, `kind` (talk/award/exchange), `title`
- **推荐先改 `books` 和 `homework` 两个页，作为数据驱动模板**。优先级方式：小规模 + 产生报复用。

## 四、导航层级差距（读结构不够）

当前导航：

- 根 index.html →「View Profile & Research」/「Browse Study Materials」
- about 侧栏：Talks & Reports / My respected teacher / what I'm doing now / Research diary / CV
- materials 目录：Homework / Course Essay / Notes / Books / Academic Sites / Competition / Teaching(Soon)

主要问题：

1. **入口太"学习计划"，不严整**。首页两个大按钮把 research 和 study 并列，但访客轻易找不到 "research map" 或 "code"。建议在 index 加第三入口「Code」或把研究地图放第一屏。
2. **无全局 header/nav**。每个页用 `← Back to Home` 返回而不是水平主导航，手机/桌面全靠侧栏小字。对单个毕业生的小站来说这是可接受的（已确认 style-guide），但 level 不多的情况下需要做汉堡菜单或固定在左侧的目录锚点。
3. **姐妹页互链缺失**：study/materials → research-directions 没有出入口。可在 materials 页加 "Research directions" 行（P1）。
4. **404 页面** — 状态良好。

### 建议的新导航结构（三列）

- **About**：Timeline(中)、研究兴趣、工具箱、工作经历、捐款(志愿者)、联系方式
- **Research/Study**：研究地图、项目页（按类别）、课程作业、课程论文、书籍、代码
- **Service/Community**：服务(Soon)、Talks、Drama、联系

## 五、用户体验差距

1. **时间性** — 约页面右侧 "Now" 状态与现在实际日期 2026 年 10 月一致；所有页面 footer 写 "Last updated Oct 21"，但站点的更新频率会越来越让人摸不着头脑。如果关于 page 下面为较少，可以上「低更新频率」仪式，比如每周五一次小批处理。
2. **登录/无接触过** — 首页欢迎语目前让访客自行发现。
3. **多语言入口** — 如果你的读者一半在英语国家，另一半在中文区，最次要的是在我的每一块加中文小标签。建议：仅一处混合（Volunteer Experience 已做）即可。
4. **状态可见性** — 约和声明页皆有 "Last updated"，但 `books` 页 (2026-10-21) 上的书籍可能比你写的 PDF 标题时间要长毫，注意要加日期和修改时间。
5. **搜索（Search）** — 本地实现：引入 GitHub Pages 支持的静态搜索（如 Lunatech Lunr.js + Algolia?）。要么不要。如果有搜索，可以用 `search` 按钮建立。
6. **自学 Progress （可选）** — 当前 notation 仅 3 条进度条，可以考虑可选项。

---

## 六、按优先级的行动计划（执行顺序）

**P0 — 本周必做（90 分钟）**
1. 在 `about.html` 加「研究地图」短版（3–5 questions, 1 concept map/句子）；
2. 修复或更新 `nownow/now.html`（写清本学期 What I'm doing now，含阅读书目）；
3. 补充 `books.html` 项目的每一本 "Why I'm reading" 说明。

**P1 — 两周内**
4. 新建 `code/` 代码目录页（列出 7 份，附有说明快捷键，指向 GitHub 如果有）；
5. `materials.html` 增加 "Research Directions" 和 "Code" 入口；
6. 把 `books.html` → 数据驱动（新建 `books-data.js`）作为样板页；
7. 把 `homework.html` → 数据驱动（新建 `homework-data.js`）；
8. 检查所有图片 `alt` 文本和键盘可达性。

**P2 — 按月/半轮流（有精力再上）**
9. 为每篇 course essay 添加对应的 "Behind the paper" 页面；
10. 考虑将约页面中 service/行业部分、testim。
11. 中文摘要入口；
12. 搜索/标签；
13. Newsletter。

---

因为需要你自己确认范围与精力，先不要一次性全部做完。一次一个模块、上线一个页面后再做下一个。
