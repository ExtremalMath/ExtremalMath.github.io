# 中文简历翻译审查报告

> 审查对象：`cv-pdf-generator/cv-generator.js`（`ZH` 词典 / `TERMS` 术语表 / `BIO_ZH` / `LABELS`）与 `about.html`、`talks/talks.html` 源文。
> 审查方法：以 jsdom 复刻生成器的抽取逻辑（同一批 CSS 选择器 + `text()` 空白归一），对 **45 个字段**逐条与 `ZH` 词典比对；再渲染真实中文版 CV 扫描英文残留。
> 审查性质：**仅审查，未改动任何文件**。

---

## 〇、总体结论

| 项目 | 结果 |
|---|---|
| 字段精确命中率 | **37 / 45** |
| 未命中但**无需翻译** | 6（年份 `2025`；技能名 `C`/`MATLAB`/`Java`/`LaTeX`） |
| 未命中且**已被过滤** | 2（talks 页 Course Talk，永不渲染） |
| 未命中且**确属缺陷** | **1**（`– 2024`） |
| 英文残留 | 4 处，**全部为应保留项**（技术术语／人名／URL），非漏译 |
| 中文标点规范性 | **全部通过** |

真正的问题不止漏译——审查还发现 **4 处渲染层缺陷导致已译好的内容被丢弃**，中文与英文版同时受影响。

---

## 一、翻译缺陷（逐条对照）

### 1. 【严重·漏译】高中学历时间 `– 2024` 未翻译

- **原文**（`about.html:555`）：`<div class="period">– 2024</div>`
- **ZH 词典**：无此键
- **实际渲染**：`– 2024高中文凭江苏省南京市第九中学` ← 英文漏出，且与中文紧贴
- **建议**：补条目并统一格式
  ```js
  '– 2024': '– 2024 年',
  ```
  或按中文简历习惯改为 `'截至 2024 年'`。

### 2. 【严重·信息遗漏】5 条技能描述被整段丢弃

- **原文**（`about.html` skills-grid）：
  | 技能 | 描述（已译） |
  |---|---|
  | C | 算法实现与数值计算 |
  | MATLAB | 矩阵计算与数据可视化 |
  | Java | 面向对象编程与软件开发 |
  | LaTeX | 学术论文写作与排版 |
  | Python (Machine Learning) | 韩敦教授课程：回归、贝叶斯分类器、k-NN、决策树、SVM、集成模型、聚类等。 |
- **成因**：`cv-generator.js:462` 只输出 `s.name`，`s.desc` 提取并翻译后**从未渲染**
  ```js
  other += '<div class="cv-desc">' + esc(d.skills.map(function (s) { return s.name; }).join(' · ')) + '</div>';
  ```
- **实际渲染**：`技能 C · MATLAB · Java · LaTeX · Python（机器学习）`
- **建议**：改为 `s.name + '（' + s.desc + '）'`，或对长描述单独成行。

### 3. 【严重·信息遗漏】研究兴趣描述未渲染

- **原文**（`about.html:577-580`）：
  > My primary research focus is on Extremal Graph Theory, with a specific emphasis on *H*-free graph problems. I am particularly interested in the structural properties of these graphs and the associated optimization problems, including Turán-type extremal problems and related enumeration questions.
- **已备好译文**：「我的主要研究方向为极值图论，尤其关注 H-自由图问题；对这类图的结构性质及相关优化问题（包括 Turán 型极值问题与相关计数问题）抱有浓厚兴趣。」
- **成因**：`cv-generator.js:368` 只取标题
  ```js
  const interests = cards.filter(function (c) { return !c.status; }).map(function (c) { return c.title; });
  ```
- **实际渲染**：`研究兴趣 极值图论` ← 整段描述丢失
- **建议**：`interests` 保留 `desc`，渲染时以 `summarize(…, 120)` 截断后跟随标题。

### 4. 【中·结构缺陷】`学术服务与社会实践` 标签定义但从不显示

- **定义**：`cv-generator.js:60` `'学术服务与社会实践'`／`:72` `'Service & Outreach'`
- **现状**：`:464-472` 服务条目直接追加在「其他学术条目」下，**无二级标题**
  ```js
  other += '<div class="cv-sub2">' + esc(lab.skills) + '</div>';
  ...
  d.service.forEach(function (s) { h += entry('', s.role + (s.org ? ' — ' + s.org : ''), sub); });
  ```
- **影响**：讲解员／志愿支教老师／志愿者 三段经历裸挂在「技能」之后，读者无法区分归属。
- **建议**：服务循环前补一行 `<div class="cv-sub2">` + `lab.service`。

### 5. 【中·格式违规】页脚日期用 ISO 格式，且有时差 bug

- **代码**：`cv-generator.js:405`
  ```js
  const today = new Date().toISOString().slice(0, 10);   // → "2026-10-17"
  ```
- **规范**：`style-guide.txt` 第 53／109 行要求 **短月份格式** `"Last updated Oct 17, 2026"`
- **自相矛盾**：同一张 CV 页的页脚写的是 `Last updated Oct 17, 2026`，而简历正文页脚写 `2026-10-17`
- **附带 bug**：`toISOString()` 取 **UTC**。GMT+8 当地 00:00–08:00 之前生成，会显示**前一天**的日期。
- **建议**：改用本地时间格式化
  ```js
  const d = new Date();
  const today = d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  ```

---

## 二、日期与数字格式不统一

中文版目前**三种日期风格并存**：

| 原文 | 现译文 | 问题 |
|---|---|---|
| `2024 – Present` | `2024 至今` | 无「年」，前有空格 |
| `2024 – 2025` | `2024–2025` | 无空格短横（本身合规，但与上条风格冲突） |
| `August 2025` | `2025 年 8 月` | 年月带空格 |
| `July 2025` | `2025 年 7 月` | 同上（此二条内部一致） |
| `– 2024` | *(未译)* | 见问题 1 |
| `2025`（获奖年） | `2025` | 未加「年」，与 `2025 年 7 月` 不一致 |

**建议统一为**：`2024 年 – 至今`、`2024 – 2025 年`、`2025 年 8 月`、`2025 年`。

---

## 三、用词与语气建议（非错误，可优化）

| 原文 | 现译 | 建议 | 理由 |
|---|---|---|---|
| `Exchange Program — Data Science` | 交换项目 — 数据科学 | **交换生项目** 或 **校际交流项目** — 数据科学 | 「交换项目」搭配生硬，高校语境惯用「交流／交换生项目」 |
| `See notes in the Materials->Course essays` | 笔记见 Materials→Course essays。 | 见资料页 → 课程论文（或保留原文并加注） | 站内栏目名直接留英文，中文版显得突兀 |
| `Read the feature article ↗` | 阅读专题报道 ↗ | 去掉 `↗`，或改「（详见专题报道）」 | `↗` 是网页跳转符号，**打印／PDF 中无意义** |
| `From Prof. Han Dun's course: …` | 韩敦教授课程：… | **取自**韩敦教授课程：… | 脱落 `From` 后语气略生硬 |
| `from Jiangsu, China` | 中国江苏人 | **江苏人** 或 **来自江苏** | 「中国江苏人」口语略生硬 |
| `B.Sc. in Mathematics` | 数学理学学士 | 理学学士（数学） | 「数学理学」读来重复（现译可接受） |
| `Delivered engaging club courses` | 开设生动的兴趣课程 | 现译可接受 | `club` 意译为「兴趣」，属合理意译 |

---

## 四、中英文标点与排版：**核查全部通过**

以下均正确，无需修改：

- **全角引号**：`江苏大学“大眼睛”志愿团队`、`“紫草”志愿团队` ✓
- **全角括号**：`新加坡国立大学（NUS）`、`中国大学生数学竞赛（CMC）` ✓
- **全角冒号**：`笔记：`、`研读中：`、`韩敦教授课程：` ✓
- **全角逗号**：`“紫草”志愿团队，侵华日军南京大屠杀遇难同胞纪念馆` ✓
- **顿号**：`回归、贝叶斯分类器、k-NN、决策树、SVM、集成模型、聚类等。` ✓
- **句号**：中文句号 `。` 全文一致 ✓
- **间隔号／破折号**：`本科生 · 江苏大学数学科学学院`、`交换项目 — 数据科学` 保留原符号 ✓
- **数字与单位留空**：`τ ≈ 0.618`、`1/2 阈值`、`2025 年 8 月` ✓
- **专有名词正确保留拉丁原形**：`Turán`、`Sobolev`、`Banach`、`Hilbert`、`Carathéodory`、`Bondy / Shen / Thomasse / Thomassen`、`Python / MATLAB / LaTeX / Java / SVM / k-NN` ✓

**英文残留扫描结论**：仅 4 处，均为**应保留**项，非漏译——
`token`（大模型技术术语）、`Shen / Thomasse / Thomassen`（作者姓氏）、`Carathéodory`（定理名）、`extremalmath.github.io`（URL）。

---

## 五、额外发现（非翻译问题）

1. **姓名重复**：页眉已显示 `Yuanbo Li` + `Bruce Lee`，`BIO_ZH` 又写「我是 Yuanbo Li（Bruce Lee）」，信息冗余。建议 `BIO_ZH` 省略姓名。
2. **全站无中文姓名**：site 内一律用 `Yuanbo Li`，`docTitle: 'Yuanbo_Li_CV'` 与之一致 ✓。若正式中文简历需要中文姓名，需你自行提供（我不便推测）。
3. **`token` 建议加注**：`大语言模型中使用的 token 概念` → 可作 `token（词元）` 首次出现加注，更易中文读者理解。
4. **状态标签位置**：`相关作品` 中「● 已完成笔记」排在标题**之后**且与标题无分隔（`:441` `entry('', w.title, sub)`），建议前置并加分隔。
5. **课程作业过滤有效** ✓：talks 页唯一条目 `2026-10-10 · Course Talk` 被 `excludeTalkTypes` 正确排除，故「相关作品」仅 2 条研究笔记——符合「排除课程作业」要求。

---

## 六、修改优先级建议

| 优先级 | 条目 |
|---|---|
| **P0 必修** | 1（`– 2024` 漏译）、2（技能描述丢失）、3（研究兴趣描述丢失） |
| **P1 建议** | 4（服务标签缺失）、5（页脚日期格式 + UTC bug）、日期格式统一 |
| **P2 可选** | 第三节全部用词打磨、`BIO_ZH` 去重、`↗` 移除 |

---

## 七、核查范围声明

- **已核查**：`ZH` 词典 36 键全量、`TERMS` 术语表全量、`BIO_ZH`、`LABELS` 中英标签、`about.html` 的 hero／timeline／research-card／award-list／skills-grid／exp-list 全部字段、`talks/talks.html` 全部条目、生成器抽取与渲染逻辑（`extractBasic`～`extractTalks`、`assemble`、`render`）。
- **方法**：jsdom 复刻抽取 → 45 字段逐条词典命中比对 → 渲染真实中文版 → 扫描英文残留 → 人工逐句核对语义与标点。
- **未核查**：浏览器实际打印／PDF 栅格化效果、html2pdf 一键下载路径（依赖 CDN，需联网）、真实移动端显示效果。
- **本次未改动任何站点文件**，仅输出本报告。