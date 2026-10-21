# 学术简历自动生成器 · 增强提示词（Prompt Spec）

> 本文件是「从个人网站公开页面自动汇总、生成可打印 PDF 学术简历」功能的**增强版提示词 / 规格说明**。
> 它是本任务的文本交付物：既可作为需求规格，也可作为可复用的系统提示词，重新驱动相同或同类功能的实现。
> 配套代码：`cv-generator.js`（独立函数 `CVGenerator.generateCV`）、`cv.html`（双语选择首页）、`cv-zh.html`（中文版简历页）、`cv-en.html`（英文版简历页）。

---

## 1. 任务目标

实现一个**独立函数**，用于自动抓取并总结「关于 (about) 页面」及其他相关公开网页内容，实时维护一份**学术场景用的可打印 PDF 个人简历**：

- 仅在我**点击指定按钮**时触发编译生成；
- 若**超链接指向该文件**，也可随时调用生成；
- 内容板块随**源网页变化实时同步刷新**；
- 输出为**排版整洁、适合打印的 PDF**，采用**黑框白底、简洁精炼**的正常简历样式；
- **内容克制**，且**不包含任何非公开信息或课程作业**。
- **双语输出**：同时提供**中文版**与**英文版**简历，各自为独立网页，可独立查看、打印与下载 PDF。
- **横向版式**：生成 / 打印 / 下载的 PDF 均为 **A4 横向（landscape）**。

## 2. 触发方式（均按需，不静默自动生成）

1. **指定按钮**（在 `about.html` 侧栏中）：
   - 引入 `<script src="cv-pdf-generator/cv-generator.js"></script>`；
   - 放置 `<button onclick="CVGenerator.generateCV({fromCurrentPage:true, lang:'en'})">生成 / 打印 PDF 简历</button>`；
   - 点击即读取**当前已打开页面**的 DOM —— 始终与源同步，无需联网、无跨域问题；
   - 默认直接调起浏览器打印（另存为 PDF，横向）。
2. **超链接**（指向双语首页 `cv.html`）：
   - `<a href="cv-pdf-generator/cv.html">简历 / CV (PDF)</a>`；
   - 首页提供「📄 中文版简历」「📄 English CV」两个入口，分别进入 `cv-zh.html` / `cv-en.html`；
   - 每个语言页打开即 `fetch` 公开源页面（`../about.html`、`../talks/talks.html`）并生成对应语言预览；
   - 每个语言页顶栏提供「重新生成 / 打印 / 下载 PDF」，且下载文件名带语言后缀（`_zh` / `_en`）。

## 3. 简历内容板块（随源网页变化实时刷新）

| 板块 | 数据来源 | 说明 |
|------|----------|------|
| 个人公开基本信息 | about 页 Hero / 联系方式 | 姓名、英文名、身份、公开邮箱、ORCID、一句话简介 |
| 教育经历 | about 页 Education 时间线 | 学位、学校、时间段、备注 |
| 相关作品（Selected Works） | about 页 research 卡片（含 `.status` 者）+ talks 页学术报告 | **明确排除课程作业 / Course Talk** |
| 获奖经历 | about 页 Awards 列表 | 年份 + 奖项 |
| 其他学术条目 | 研究兴趣 / 技能 / 学术服务与社会实践 | 归入「Other Academic Items」 |

## 4. 内容安全与课程作业过滤（硬性约束）

- 仅抓取**公开页面**；不读取 `private/` 等私有目录下的图片与资料。
- 内置过滤规则，**明确排除课程作业**：
  - `excludeTalkTypes`（精确小写匹配）：`course talk`、`homework`、`coursework`、`课程作业`、`作业`；
  - `excludeKeywords`（标题/描述兜底）：`homework`、`coursework`、`课程作业`、`作业`、`core coursework`；
  - research 卡片仅取含 `.status` 者归入「作品」，无 `.status` 者归入「研究兴趣」——天然避开 "My Teachers" 区下的 `Core Coursework` 标签。
- 输出中**绝不出现**非公开信息、`homework`、`Core Coursework`、课程名、`Course Talk` 等。

## 5. 输出样式要求

- **黑框白底**：简历主体 `border:2px solid #000`、`background:#fff`、深色字。
- **简洁精炼**：正常简历版式，**A4 横向（landscape）**，无彩色装饰，内容克制。
- **打印适配**：`@media print` 下 `@page{ size:A4 landscape }`、隐藏页内其它元素，仅渲染 `#cv-root .cv-sheet`；通过浏览器打印「另存为 PDF」为默认输出，可选 html2pdf 一键下载（同样 `orientation:'landscape'`，离线自动回退到打印）。

## 6. 双语实现要点

- 生成器支持 `lang: 'zh' | 'en'`（默认 `en`）。板块标签与页脚按 `LABELS` 字典本地化。
- 源站正文以英文为主：**英文版**直接取源；**中文版**通过内置 `ZH` 词典将正文译为中文，未命中词典的内容回退为原文（英文），保证不丢失。
- 词典键做了标点归一化（弯直引号、破折号统一），避免源页与词典标点不一致导致漏译。
- 两个语言版本为**各自独立的网页**（`cv-zh.html` / `cv-en.html`），可分别打开、查看、打印与下载，互不干扰。

## 7. 技术约束 / 设计要点

- 纯浏览器端、零运行时依赖（打印路径）；PDF 下载按需从 CDN 加载 `html2pdf.js`，失败回退打印。
- 通过 `DOMParser` 解析抓取到的 HTML，按既定 CSS 选择器抽取各板块，再用 `summarize()` 做克制性截断总结。
- 触发即「重新生成」，不缓存过期内容，满足实时同步。
- 源页面与生成器同源部署（GitHub Pages / 本地静态服务器）方能 `fetch`；直接双击本地文件会被协议拦截（已在前端给出友好提示）。

## 8. 验收标准（可用于回归测试）

- 姓名、教育经历、获奖（如 2025 CMC）、研究笔记类作品、研究兴趣、技能、学术服务、公开邮箱、ORCID 均**正确包含**；
- `Core Coursework`、`Mathematical Analysis` 等课程名、`private/profile` 私有图片、`Course Talk` 报告**均被排除**；
- 中文版关键正文（获奖、学校、研究兴趣、作品、服务）已正确译为中文；英文版保留英文原文；两版输出不同；
- 点击按钮与打开超链接两种路径均可生成；输出为黑框白底、**横向 A4**、可打印 PDF 版式；
- 中/英两版均可独立打开、查看、打印与下载。
