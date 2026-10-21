# 文件组织规则（规划稿）

> 状态：**v2（2026-10-18 修订）**：根目录 3 个维护 txt 经决议定为 sanctioned 例外、保留根目录（R1 与整改项 #4 已同步）；未执行任何文件移动 / 重命名 / 删除 / 修改，其余为待确认的规划建议。
> 生成日期：2026-10-18
> 依据：对 `D:/Workbuddyworkspace/mywebsite` 的只读扫描（排除 `.git/`、`.workbuddy/`）。
> 定位：本文为本地规划文档，暂不入远端；若日后转为常驻维护文档，须连同全站引用一并处理（见 R8）。

---

## 一、现状统计

### 1.1 总量与类型
- 站点文件合计 **64**（不含 `.git/`、`.workbuddy/`）。
- 类型分布：`.html` 21、`.pdf` 18、`.js` 6、`.txt` 6、`.cpp` 5、`.md` 4、`.c` 2、无扩展名 2（`.gitignore`、`LICENSE`）。

### 1.2 各目录文件数（直接 / 递归）

| 目录 | 直接 | 递归 | 说明 |
|---|---:|---:|---|
| 根目录 `.` | 15 | — | 6 门户 HTML + 3 站点 JS + 3 本地 txt + README/LICENSE/.gitignore |
| `notes/` | 8 | 15 | 笔记 PDF + 课程报告 PDF + 源代码 + 2 个子目录 |
| `cv-pdf-generator/` | 8 | 8 | 4 功能文件 + 4 过程文档 |
| `study/` | 7 | 7 | 7 个分类导航页 |
| `book/` | 5 | 5 | 教材 PDF |
| `code/c_language/data_structure/` | 4 | 4 | 三层嵌套仅 4 个文件 |
| `notes/GraphTheoryHomework/` | 4 | 4 | |
| `notes/essay/` | 3 | 3 | 含 1 个 `.cpp` |
| `talks/` | 3 | 3 | |
| `nownow/data/` | 2 | 2 | |
| `research/` | 2 | 2 | |
| `nownow/` | 1 | 3 | |
| `picture/` | 1 | 2 | 仅 README |
| `picture/private/` | 1 | 1 | 仅 README |

### 1.3 大文件（>1MB，共 9 个）
`book/evans_pde_2nd_ed.pdf` 11.5MB、`book/FiniteFields_Applications_FengLiao.pdf` 9.0MB、`book/royden_real_analysis.pdf` 7.4MB、`notes/Modeling_..._Drying.pdf` 7.3MB、`notes/Modeling_..._Drying3.pdf` 4.4MB、`book/GTM_244_...pdf.pdf` 4.1MB、`book/Strass-partial-differential-equations-2007.pdf` 2.7MB、`notes/essay/8thedition.pdf` 2.3MB、`notes/essay/FinalREPORT2.pdf` 1.4MB。

---

## 二、识别出的结构性问题

1. **根目录维护 txt（已决议·非问题）**：`style-guide.txt`、`push-rules.txt`、`trouble.txt` 置于根目录，经核为既有约定例外（`push-rules.txt` 明列、`style-guide.txt`/`MEMORY.md` 同载）。2026-10-18 定案：固定保留根目录、不移动、不纳入 R1 计数（见 R1 与整改项 #4）。
2. **`notes/` 类型混杂（递归 15）**：笔记 PDF、课程报告 PDF、源代码（`notes/1.c`、`notes/essay/keep.cpp`、`notes/GraphTheoryHomework/2.c`）同置一册。
3. **版本蔓延**：`Notes_on_Density..._V3/_V5/_V6` 三个版本并存；`Modeling_..._Drying.pdf` 与 `..._Drying3.pdf` 两个版本并存。
4. **`cv-pdf-generator/` 功能与过程文档混合**：4 个过程文档（`PROMPT.md`、`cv-optimization-notes.md`、`cv-translation-review.md`、`cv-dev-notes.txt`）与 4 个功能文件（`cv.html`/`cv-zh.html`/`cv-en.html`/`cv-generator.js`）同处一个推送目录。
5. **命名规范三套并存**：小写下划线（`evans_pde_2nd_ed.pdf`）、驼峰（`FiniteFields_Applications_FengLiao.pdf`、`Notes_on_Density...`）、连字符（`Strass-partial-differential-equations-2007.pdf`、`academic-sites.html`）。
6. **双扩展名**：`book/GTM_244_Bondy_Murty_Graph_Theory.pdf.pdf`（对应 trouble 2.1）。
7. **拼写 / 名实小问题**：`talks/PowerPiontPre.pdf`（应为 PowerPoint）；`code/c_language/` 下放 `.cpp`（C++ 归入 "c_language" 名实不符）；`code/` 为 4 个文件设三层嵌套。

---

## 三、分类标准（三条轴线）

判定顺序固定：**先受众 → 再类型 → 后主题**。

1. **受众轴线**：公开（入远端 Pages） vs 本地（仅本地保留、不入远端）。
2. **类型轴线**：页面 HTML / 脚本 JS / 资料 PDF / 源代码 .c·.cpp / 图片 / 数据 / 文档 txt·md。
3. **主题轴线**：书籍 / 课程与笔记 / 研究 / 讲座 / 教学 / 学习资源 / CV 工具。

---

## 四、存放路径映射（规范目标态）

| 类别 | 目标路径 | 入远端 |
|---|---|---|
| 门户 / 导航页 | 根目录 | 是 |
| 全站共享脚本（被多页引用） | 根目录 | 是 |
| 仓库标准文件 | 根目录（`README.md`、`LICENSE`、`.gitignore`） | 是 |
| 教材 / 专著 PDF | `book/` | 是 |
| 课程笔记 / 作业 / 报告 PDF | `notes/<子主题>/` | 是 |
| 研究报告 / 日志 | `research/` | 是 |
| 讲座资料 | `talks/` | 是 |
| 学习资源导航页 | `study/` | 是 |
| 源代码 | `code/<语言>/<主题>/` | 是 |
| 图片 | `picture/`（+ `picture/private/`） | 是 |
| CV 功能文件 | `cv-pdf-generator/`（仅功能文件） | 是 |
| CV 过程 / 开发文档 | 本地专用区（移出 `cv-pdf-generator/`） | 否 |
| 维护规范 txt | 3 个既有文件固定根目录（sanctioned 例外，见 R1）；新增维护文档入 `.workbuddy/` | 否 |
| 脚本 / 自检 / 推送 / 临时产物 | `.workbuddy/` | 否 |

---

## 五、硬性规则（可执行）

- **R1 根目录上限 12**（不含已 sanctioned 的 3 个维护 txt：`style-guide.txt`、`push-rules.txt`、`trouble.txt`——既有约定例外，固定保留根目录、不移动、不入远端）。根目录仅保留门户 HTML、全站共享脚本、`README.md`/`LICENSE`/`.gitignore` 及上述 3 个维护 txt；**新增**本地文档一律入 `.workbuddy/`，不得再堆到根目录。
- **R2 内容目录直接文件上限 8**：超过则按子主题拆子目录，避免单层堆积。
- **R3 类型不混装**：源代码不得置于 `notes/` 等资料目录；过程文档不得与功能文件同置推送目录。
- **R4 版本单一化**：同一成果主目录只保留 1 个当前版本；历史版本入 `<目录>/archive/` 或本地归档，不散落主目录。
- **R5 命名统一**：公开资源一律英文小写 + 下划线（遵循 `style-guide.txt`「文件命名」节）；文档类可用连字符；禁中文 / 空格文件名、禁双扩展名。
- **R6 大文件阈值**：单文件 >10MB 入库前评估推送成本（Git Data API blob，见 trouble 3.3）。
- **R7 新文件先定类再落盘**：落盘前按 §三 判定受众 → 类型 → 主题，写入对应目录，不临时堆在根目录。
- **R8 移动前三步**：任何移动 / 重命名 / 删除前，先 `grep` 全站引用 → 更新引用 → `check_links.py` 复验 → 经用户确认后执行（遵循跨智能体确认规范与 `push-rules.txt`）。

---

## 六、整改建议（按优先级；**2026-10-18 已全部执行完毕，仅本地、未推送**）

> 执行记录：建议 1/2/3/7（无页面引用，零死链风险）当日完成；建议 5/6（已上线 PDF 改名）
> 经用户批准「全面改名」后建迁移项目 `.workbuddy/pdf-rename-migration/` 完成；
> 建议 4 上午已决议不移动。推送阻塞于托管层 301 配置（详见迁移项目 README 阻塞项）。

| # | 问题 | 建议动作 | 影响面 / 前置 | 状态（2026-10-18） |
|---|---|---|---|---|
| 1 | `cv-pdf-generator/` 混装 | 4 个过程文档移至本地专用区，仅留 4 个功能文件 | 无页面引用过程文档；需确认目标目录 | ✅ 已移至 `.workbuddy/cv-process-docs/` |
| 2 | `notes/` 源代码散落 | `1.c`、`essay/keep.cpp`、`GraphTheoryHomework/2.c` 归入 `code/` | 源代码无页面引用；需确认 | ✅ 已归位（`code/c/` 1 个、`code/cpp/` 2 个） |
| 3 | `notes/` 版本蔓延 | Density 保留最新 `_V6`、Drying 保留其一；其余入 `notes/archive/` | 若有页面引用旧版需同步（当前无） | ✅ V3/V5 + Drying 旧版 + version_1d_to_c3 已入 archive |
| 4 | 根目录本地 txt | **已决议（2026-10-18）：不移动**，3 txt 定为根目录 sanctioned 例外，R1 已同步 | 无需改引用；零破坏 | ✅ 决议不变 |
| 5 | `book/` 双扩展名 | `GTM_244_...pdf.pdf` → 单 `.pdf`（属**已上线文件改名**，须走 style-guide 改名变通：留跳转或评估外链，谨慎） | 已发布 URL 会 404，风险最高，建议单独决策 | ✅ 已改名 `gtm_244_bondy_murty_graph_theory.pdf`；旧 URL 映射与 301 规则已备，上线阻塞中 |
| 6 | 命名三套并存 | 制定分批统一计划（公开资源→小写下划线） | 每改一个文件即触发全站引用更新 + 已上线改名风险 | ✅ 11 个页面引用 PDF 全部小写下划线；5 页面 11 处 href 同步 |
| 7 | 拼写 / 嵌套 | `PowerPiontPre.pdf` 正字；评估 `code/c_language/` 改名与三层嵌套是否保留 | 低风险，仍需确认 | ✅ `powerpoint_pre.pdf`；`code/c_language/`→`code/cpp/` |

---

## 七、执行检查清单（供未来整改轮使用）

- [ ] 已 `grep` 目标文件全站引用并列出清单
- [ ] 已更新所有引用（页面 / JS / 其他维护文档）
- [ ] 已跑 `check_links.py`，全站 0 失效
- [ ] 已跑 `node --check` 全部受影响 JS
- [ ] 本地 txt / 过程文档未入推送清单（遵循 push-rules）
- [ ] 涉及已上线文件改名时，已评估外链 / 收藏影响并留变通
- [ ] 已按统一格式向用户确认（将做什么 / 影响范围 / 是否可逆）并获明确同意
- [ ] 执行后：树 diff + 线上缓存穿透验证 + Pages built + 写当日日志

---

*本文档由只读统计与规划生成；除已决议项（整改 #4）外，其余整改动作须待用户确认后另行执行。*
