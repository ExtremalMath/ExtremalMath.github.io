# 文件重命名规则与命名规范（Rename & Naming Convention）

> 定位：本文件是站点**文件改名与命名**的统一标准与操作规程，是 style-guide.txt
> 第十三节「文件与命名」的**操作级补充**。凡新增、改名、迁移站点内文件，均先依本
> 规范确定目标名，再走「改名标准流程」保证引用同步。
> 适用范围：仅本地维护文档（不推送，遵循 txt/维护文档仅本地的项目约定）。
> 关联文档：style-guide.txt（§7 改名政策、§13 命名）、file-organization-rules.md
> （目录组织 R1–R8）、pdf-rename-migration/（改名迁移项目实例与脚本）。

---

## 一、核心格式基线（强制）

所有**公开资源文件**（book/ notes/ talks/ code/ picture/ 下随站发布的文件）须满足：

| 项目 | 约定 | 说明 |
|---|---|---|
| 字符集 | `a-z 0-9 _ .` | 仅小写字母、数字、下划线、单个扩展名点；**禁用大写、空格、中文、重音字符** |
| 分词符 | 单下划线 `_` | 单词间用 `_`；**禁止双下划线 `__`** |
| 大小写 | 全小写 | 含扩展名（`pdf` `cpp` `c` 等小写） |
| 扩展名 | **单一** | 仅一个 `.ext`；**禁止双扩展名**（如 `.pdf.pdf`） |
| 边界 | 不下划/点开头或结尾 | 文件名不得 `^[_.\s]` 或 `[_.\s]$` |
| 行结束 | LF、UTF-8 无 BOM | 与全站编码约定一致 |

**基线正则（路径级，供校验）**
```
^(?:[a-z0-9]+(?:_[a-z0-9]+)*/)*[a-z0-9]+(?:_[a-z0-9]+)*\.[a-z0-9]{1,12}$
```
（目录段与文件名段同构：小写字母数字 + 单下划线分词；扩展名 1–12 字母。）

---

## 二、分类命名规范（含前缀/后缀规则）

每类资源在基线之上还有**前缀/后缀约定**。下表为当前站点已落地的模式，**新增
文件须沿用同类前缀/后缀**；改名时后缀语义不得丢失。

### 1. 教材 book/（PDF）
- 模式：`book/<可选系列前缀><主题/作者标识>.pdf`
- 系列前缀（保留，便于识别）：
  - `gtm_<编号>_` —— Graduate Texts in Math（如 `gtm_244_`）
  - `finite_fields_`、`strass_`、`evans_`、`royden_` —— 作者/书名短标识
- 例：`gtm_244_bondy_murty_graph_theory.pdf`、`finite_fields_applications_feng_liao.pdf`、
  `strass_partial_differential_equations_2007.pdf`、`evans_pde_2nd_ed.pdf`、
  `royden_real_analysis.pdf`
- 无系列前缀亦合规（短标识即可），但同一丛书须统一加前缀。

### 2. 笔记 notes/（PDF）
- 顶层：`notes/<主题>_<版本或序号>.pdf`
  - 版本后缀：**`_vN`**（如 `_v6`）；归档版入 `notes/archive/`（`_v3`、`_v5`）。
  - 序号/草稿后缀：**`_N`**（下划线 + 数字，如 `drying3` 见「已知偏差」）。
  - 专题笔记可加 `_notes` 后缀（如 `finite_fields_exercise1_t7_t10_notes.pdf`）。
- 子目录即路径前缀（命名同构）：
  - `notes/essay/`：`8th_edition.pdf`、`final_report_2.pdf`（序数可用单词 `8th` 或 `_2`）
  - `notes/graph_theory_homework/`：**`<主题>_<MMDD>.pdf`**（日期后缀，如
    `exercise_0526.pdf`、`proof_of_inequation_0521.pdf`、`property_0532.pdf`）
  - `notes/archive/`：旧版留档，`<主题>_vN.pdf` 或 `<主题>.pdf`（如 `version_1d_to_c3.pdf`）

### 3. 讲义/汇报 talks/（PDF + HTML）
- `talks/<主题>_<修饰>.pdf` / `.html`（如 `powerpoint_pre.pdf`、`report-kitchen-waste.html`）
- 注意：talks/ 下 HTML 用**连字符**（历史约定，属目录内既有风格，改名时保持一致）。

### 4. 代码 code/（C / C++）
- `code/c/<名>.c`、`code/cpp/<名>.cpp`
- 子目录同为 snake_case：`code/cpp/data_structure/<名>.cpp`
- 例：`hello_world.c`、`graph_theory_homework.cpp`、`data_structure/ticket_system.cpp`、
  `data_structure/twenty_four_game.cpp`
- 扩展名须与内容语言一致（C 用 `.c`、C++ 用 `.cpp`，曾有误把 C++ 存为 `.c` 已更正）。

### 5. 图片 picture/（私有）
- `picture/private/<名>.<png|jpg|jpeg|webp>`，snake_case（如 `profile.png`、`tour_map.png`）
- 未放图时用 `<div class="aleph" data-pic="路径/不含扩展名">` 占位（`picture.js` 自动探测）。

### 6. 维护文档（不推送，本地）
- `*.txt` 规范类：小写 + **连字符**（如 `style-guide.txt`、`push-rules.txt`、`trouble.txt`）
- 研究报告/日志 `*.md`：小写 + 连字符或下划线均可，置于 `.workbuddy/` 或各项目目录。

---

## 三、匹配模式（Matching Patterns）

### 3.1 合规检测（白名单，逐类细化）
```
book/      ^book/(?:gtm_[0-9]+_|finite_fields_|strass_|evans_|royden_)?[a-z0-9]+(?:_[a-z0-9]+)*\.pdf$
notes/     ^notes/[a-z0-9_]+(?:_v[0-9]+)?\.pdf$                                   # 顶层+版本
essay/     ^notes/essay/[a-z0-9]+(?:_[a-z0-9]+)*\.pdf$
hw/        ^notes/graph_theory_homework/[a-z0-9_]+_[0-9]{4}\.pdf$                 # 日期 MMDD 后缀
archive/   ^notes/archive/[a-z0-9_]+(?:_v[0-9]+)?\.pdf$
talks/     ^talks/[a-z0-9_]+\.(pdf|html)$
code/c/    ^code/c/[a-z0-9_]+\.c$
code/cpp/  ^code/cpp/(?:[a-z0-9_]+\.cpp|data_structure/[a-z0-9_]+\.cpp)$
picture/   ^picture/private/[a-z0-9_]+\.(png|jpg|jpeg|webp)$
```

### 3.2 违规检测（黑名单，用于扫描）
扫描公开资源树时，任一路径命中即违规，并标注原因：
```
[A-Z]                      # 大写字母
[ ]                        # 空格
[\u4e00-\u9fff]            # 中文（公开资源文件名禁用）
\.{2,}                     # 双点 / 双扩展名（.pdf.pdf）
__                         # 双下划线
^[_.]|[_.]$                # 前导/尾随下划线或点
[^a-z0-9_./]               # 非常规字符（公开资源禁用连字符等）
```
> 一键扫描见 `.workbuddy/validate_filenames.py`（输出违规路径 + 原因；`--json` 可机读）。

---

## 四、改名标准流程（保证引用同步）

每次改名**严格按顺序**执行；任一步失败即中止、不推送。

1. **规划**：依本规范确定新名；先用 `validate_filenames.py` 自检新名合规。
2. **留档（唯一事实源）**：在 rename-map（CSV）登记——原相对路径、新相对路径、
   原 URL、新 URL、引用页面、备份路径、状态。字段顺序固定，便于脚本消费。
3. **备份**：`copy` 原文件入 `backup/`（**保留旧相对路径**），并对原/新文件做 sha256
   校验，确认逐字节一致后方可继续。
4. **扫描引用**：`needles = 旧相对路径 ∪ 旧文件名(basename) ∪ 旧目录名`（旧目录改名
   会牵连其下全部文件）。遍历 `.html/.js/.md/.txt`，**排除** `.git/`、`.workbuddy/`；
   `updates.js` 历史条目按 HISTORICAL 豁免（不计入残留，但变更说明须标注）。
5. **更新引用**：精确字符串替换（保留 LF、不引入多余改动）；替换后用 `text.count`
   校验前后出现次数一致。
6. **残留检查**：`check_old_refs.py` 须返回 **0 残留**；非 0 则回到第 4 步补齐。
7. **已上线文件（关键）**：在 `redirects.conf` 增 **301** 规则（旧 URL → 新 URL）；
   托管层配置后 `verify_redirects.py` 须**全部 301 PASS**。
   - 若平台不支持服务端 301（如 GitHub Pages）：**立即停止上线**，标记阻塞项，
     **旧 URL 不得直接 404**（旧文件保留或配可迁平台的 301）；禁以 PDF 内跳转、
     HTML meta-refresh 跳转页替代 301。
8. **验证与同轮同步**：本地 8 项 PASS（改名、备份 sha、引用替换、残留 0、check_links
   0 失效、node --check、被改页面页脚改当天、页面功能正常）；再写 `updates.js` 当日
   条目（≤100 英文词），并同步受影响的 `about.html`/`index.html`；最后走**用户确认**
   的推送流程（已上线改名须用户明确批准）。

---

## 五、引用/依赖同步规则

- **路径风格**：站点内引用一律用**相对路径**（`../book/...`、`../notes/...`、
  `../notes/graph_theory_homework/...`），自 `study/` 子页出发；不写绝对 URL 到本地文件。
- **needles 三件套**：旧相对路径 + 旧 basename + 旧目录名，缺一不可，避免漏改。
- **精确替换**：仅替换匹配字符串，不改动周围 DOM/类名/文案/间距（无损增量原则）。
- **豁免与标注**：`updates.js` 历史日志中的旧名属留档，不计残留，但须在当次变更说明列出。
- **禁止折中**：不得用 HTML 跳转页或 PDF 内部链接替代托管层 301（GitHub Pages 限制下
  亦不被接受，违反规范第 10 条）。
- **目录改名牵连**：改目录名须同步其下全部文件引用，并把旧目录名加入 needles。

---

## 六、工具与脚本

| 工具 | 位置 | 用途 |
|---|---|---|
| `validate_filenames.py` | `.workbuddy/` | 扫描公开资源树，按基线正则报违规文件名 + 原因 |
| `backup_and_rename.py` | `.workbuddy/pdf-rename-migration/scripts/` | 读 rename-map → 备份 + 原地改名（幂等） |
| `update_references.py` | 同上 | 按 map 精确替换引用（幂等） |
| `check_old_refs.py` | 同上 | 全站残留扫描，0 残留才放行 |
| `verify_redirects.py` | 同上 | 旧 URL 须 301→新 URL，新 URL 须 200 |

---

## 七、已知偏差（历史遗留，改名时顺带归一）

- `notes/modeling_and_application_of_heat_and_mass_transfer_in_medicinal_material_drying3.pdf`
  序数后缀应为 `_3`（下划线），当前为 `drying3`（连写）。规范化为 `drying_3` 时须同步
  `course-essay.html` 与 `competition.html` 两处引用。
- `notes/essay/8th_edition.pdf` 用单词序数（`8th`）而非数字（`_8`）；全站建议统一为
  `_N` 形式，但仅当重命名时顺带统一，不单独发起改名。
- `book/evans_pde_2nd_ed.pdf`、`book/royden_real_analysis.pdf` 无系列前缀属正常（短标识即可）。

---

## 八、反模式（禁止）

- 文件名用空格、中文、大写、重音字符。
- 双扩展名（`.pdf.pdf`）、双下划线、前导/尾随下划线或点。
- 已上线文件改名却不配 301 / 不更新引用 → 产生死链。
- 用 HTML meta-refresh 跳转页或 PDF 内链接替代托管层 301。
- 仅更新部分页面引用，遗漏 `.js` / `.md` / 历史日志中的旧名。
- 在推送前才改名（应在新增即按规范命名，不留到推送前）。

---

## 九、快速检查清单（每次改名前/后）

- [ ] 新名符合基线正则（`validate_filenames.py` 输出 0 违规）
- [ ] 前缀/后缀符合所在目录约定（见第二节）
- [ ] 已写入 rename-map.csv（原/新路径、URL、引用页、备份、状态）
- [ ] `backup/` 留档且 sha 与原文件一致
- [ ] `check_old_refs.py` 返回 0 残留
- [ ] 已上线文件：`redirects.conf` 增 301 + `verify_redirects.py` 全 PASS（否则不推送）
- [ ] 同轮同步 `updates.js` / 受影响 `about` `index` / 被改页面页脚当天
- [ ] 推送前取得用户明确批准（已上线改名强制）
