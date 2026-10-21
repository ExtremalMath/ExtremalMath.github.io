# 项目长期记忆 (MEMORY.md)

## 环境 / 网络约束（重要）
- 本机 git 全局 `http.proxy=127.0.0.1:7890`（用户代理，常未运行）；WorkBuddy 沙箱内部代理 `http_proxy=127.0.0.1:41093`（仅供 MCP，对 GitHub 无效）。
- 对 GitHub 大流量双向被出口拦截：`git push/fetch` 超小幅即 reset 或 `unpack-objects failed` 超时。**git 线协议不可用于大文件上传/下载**。
- 绕代理直连前缀：`env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u all_proxy -u no_proxy GIT_HTTP_PROXY= GIT_HTTPS_PROXY= GIT_CONFIG_COUNT=2 GIT_CONFIG_KEY_0=http.proxy GIT_CONFIG_VALUE_0= GIT_CONFIG_KEY_1=https.proxy GIT_CONFIG_VALUE_1=`；小请求（API/ls-remote）可直连。
- GitHub 大操作走 Git Data API（blob→tree→commit→PATCH ref，force=False），只传差异。**建树字段名是 `tree` 不是 `entries`**（误用返 422 Invalid tree info）。

## GitHub 仓库
- 站点仓库 `ExtremalMath/ExtremalMath.github.io`（公开 Pages，默认 main）；token 在 `~/.workbuddy/github-auto-upload/config.json`（classic `ghp_`，repo+workflow）。
- 已删 Gitee 强制同步 workflow（2026-10-16）；无 CI，推送靠 Git Data API 手动增量。
- **本地 git 非真相源**：文件多未跟踪，线上状态只认 `selfcheck.py` 的本地/远端 sha 比对，勿用 git status 推断。截至 2026-10-18 收尾：最近一次推送为 10-17（`8cd1c2a6` 术语统一）；10-18 全部改动仅本地、未推送。

## 站点维护约定
- 格式规范唯一权威 `style-guide.txt`（2026-10-17 与 design-review.txt 合并后的「样式与设计规范」；style-guide.html 已删、禁推仅历史约束；网站 Style guide 链接已移除）。
- txt 政策（2026-10-17/18 定案）：除 README（根 README.md、picture/README.txt、picture/private/README.txt）外一切 txt 仅本地、不推送。style-guide.txt / push-rules.txt / trouble.txt 固定根目录为 file-organization R1 sanctioned 例外，**任何 agent 不得移动或改名**；新增本地文档一律入 `.workbuddy/`。
- 每轮规范改动同轮同步：updates.js 当日条目 + about.html + index.html；被改页面页脚日期改为当天。
- 图片机制：图片放 `picture/`，个人图片放 `picture/private/`（推送后即公开）；aleph 占位 `<div class="aleph" data-pic="路径/不含扩展名" role="img" aria-label="...">ℵ</div>`，picture.js 探测到 picture/<path>.png|jpg|jpeg|webp 即把 ℵ 换成 img；about 头像等 `picture/private/profile.png`。
- 推送前自检（push-rules.txt）：目录归类 → check_links.py → node --check 全部 JS → selfcheck.py；推送后树 diff + 线上穿透 200 + Pages built。CDN `max-age=600`，验证须 `?cb=` 穿透；新目录首推先 404 后正常，查 pages/builds/latest=built 再稍候。
- trouble.txt 维护规则（方案 A，2026-10-17 定案并修订）：每条记录带「首次记录日期」；按「静默日」独立计时——连续一整天未触发 +1、触发归零重计；满 300 日进退役候选，agent 会话开头评估、生成待办经用户确认后删，删前清全站引用；「长期约定」类入豁免清单；规则本身不自删。详见 trouble.txt 头部七条款。

## 站点功能与内容现状（截至 2026-10-18）
- **2026-10-18 文件组织整改 + 已上线 PDF 改名轮（全部仅本地、未推送）**：用户批准全面改名并建迁移项目 `.workbuddy/pdf-rename-migration/`（README / inventory / mapping / redirects / scripts / backup / reports 九项齐全）。
  - 第一阶段（无引用文件，已完成）：`cv-pdf-generator/` 4 个过程文档 → `.workbuddy/cv-process-docs/`；`notes/1.c`→`code/c/hello_world.c`、`notes/essay/keep.cpp`→`code/cpp/keep.cpp`、`notes/GraphTheoryHomework/2.c`→`code/cpp/graph_theory_homework.cpp`；`code/c_language/`→`code/cpp/`；`notes/archive/`（新建，随站推）收 3 个 Density 笔记历史版 + Modeling 旧版 + `version_1d_to_c3.pdf`；`talks/PowerPiontPre.pdf`→`talks/powerpoint_pre.pdf`。
  - 第二阶段（11 个页面引用的 PDF，本地改名完成）：rename-map.csv 为唯一事实源；backup/ 11 个原文件 sha256 与改后一致；5 个页面（books/notes/homework/course-essay/competition）11 处 href 已同步；check_old_refs 0 残留。新名如 `book/gtm_244_bondy_murty_graph_theory.pdf`、`book/finite_fields_applications_feng_liao.pdf`、`notes/graph_theory_homework/exercise_0526.pdf` 等（全小写+下划线，禁双扩展名）。
  - **⚠️ 本地/远端名称分歧（关键）**：23 个新路径仅本地存在、23 个旧路径仅远端存在。未来任何推送必须携带完整变更集（含 backup 之外的改名），否则线上旧 URL 与新引用错位。rename-map.csv 与 reports/old-link-record.md 是唯一权威映射，**不得删除**。
  - **推送阻塞**：GitHub Pages 无服务端 301（jekyll-redirect-from 仅 meta-refresh 200 页、对 .pdf 不可用）；用户规范第 10 条——平台无法配 301 则停止上线、旧 URL 不得直接 404。redirects/redirects.conf 已备 Netlify 语法。解除选项：A 迁 Netlify/Cloudflare Pages（Git 连接免费）B 自定义域名 + Cloudflare Redirect Rules。用户决策后先验证 301 再走推送确认。
- CV 生成器 `cv-pdf-generator/`：4 功能文件已推（cv.html / cv-zh.html / cv-en.html / cv-generator.js）；过程文档已移 `.workbuddy/cv-process-docs/`（本地）。特性：中英双语、数据驱动、纵向 A4、灰度打印、正文禁超链接、姓名统一译「李元博」、术语统一（免H图 / 紫金草志愿者团队 / Bright Eyes / 大眼睛公益团队）；页脚「年+月」为 **CV 局部例外**（方案 A，不影响全站短月份格式）。
- about 数据驱动：`about-data.js` 为研究兴趣 + 获奖的单一数据源，about.html 与 CV 共用（已推）。
- Books 页 `study/books.html`：5 本书编目 + sticky "For study use only" 常驻声明；Evans PDF 已改名 `evans_pde_2nd_ed.pdf`（纯 ASCII，已推）。
- 习题笔记：`notes/FiniteFields_Exercise1_T7_T10_notes.pdf` 已入 homework 页（用户 10-17 另行提供并批准、已推）——与下方「Book 移除」是两回事，勿混淆。
- Competition 栏目 `study/competition.html`（10-18 新建并定稿，**未推**）：2026 高教社杯 A题「药材烘干过程的热质传递建模及应用」，角色 Modeling Lead。年份口径已确认为 2026（官方三源核实竞赛时间 2026-09-10 18 时–09-13 20 时）；已含授权说明（团队同意发布 + 匿名化 PDF）；页脚为年月制例外（"Last updated Oct 2026"，style-guide 第五节已登记）；链匿名化 PDF `notes/modeling_and_application_of_heat_and_mass_transfer_in_medicinal_material_drying3.pdf`。随 301 阻塞解除后与改名变更集一并推送。
- 文件组织规则 `.workbuddy/file-organization-rules.md`（R1–R8，本地规划稿，v2）。
- 改名/命名操作级规范 `.workbuddy/rename-rules.md`（九节：格式基线、分类前缀/后缀、匹配模式、8 步改名流程、引用同步、已知偏差、反模式、检查清单）+ 一键校验 `.workbuddy/validate_filenames.py`（扫 book/notes/talks/code/picture，0 违规即合规）。新增/改名文件先依其定名；style-guide.txt §13 已加指针。
- 文件迁移公告页 `migrations.html`（根，已推）+ 数据源 `.workbuddy/migrations.json`（canonical）+ 自动生成 `migrations-data.js`（根，勿手改）+ 维护脚本 `.workbuddy/update_migrations.py`（`add/list/remove/gen`，`add` 同名 filename 整体覆盖=仅留最新迁移）。页面数据驱动、按 filename 去重仅显示最新一次迁移，含按文件名筛选框；站点 `404.html` 已加链接指向该页，旧 URL 404 的访客可查新路径。新增/修改迁移记录只改 JSON → 重跑脚本即可，页面无需改。

## 跨智能体协作规则（共识，所有智能体遵循）
- **确认类问题统一规范（固化规则）**：凡对外发布（push/上线）、删除文件、重命名或任何不可逆/有副作用改动，先按统一格式（①做什么/影响范围/是否可逆 ②确认/取消选项）获用户明确同意；决策入规则即长期约定，不再重问。
- **profile.png 暂不添加**：about 头像继续 ℵ 占位，任何 agent 不得主动添加该文件。
- **习题笔记 PDF（`book/FiniteFields_FengLiao.pdf`，2 页）已从 Books 页/book/ 删除**：不得恢复该书目、不得在 Books 页重新链接（教材 `book/FiniteFields_Applications_FengLiao.pdf` 仍保留）。⚠️ 注意：homework 页现有的 Finite Fields 习题笔记节（链 `notes/FiniteFields_Exercise1_T7_T10_notes.pdf`）系用户 10-17 另行提供并批准的新增，**属正常内容、不得删除**——与原 book/ 删除是两件事。
- **txt 仅本地**：维护文档改名/删除前先 grep 全站引用并同步更新；若 txt 误推远端，按 push-rules 五.5（Git Data API 重建 tree）删除。

## 待办 / 持续跟踪
- 「年+月」页脚规则是否全站推广（当前仅 CV；推广须同轮改 style-guide + updates.js/about/index）。
- CV P2 遗留：英文兴趣描述 170 字符截断、日期三种风格并存、用词打磨。
- 放置 `picture/private/profile.png` 后 about 头像自动由 ℵ 替换（用户动作，无需改页面）。

## 图标（2026-10-21）
- 全站 favicon：`picture/` 下 `favicon.ico`（6 个 entry）、`favicon.svg`、
  `favicon-16/32/192/512.png`、`apple-touch-icon.png`（180×180）。
  24 个 HTML 页面各插入 7 个 `<link>`，路径按目录深度自动计算。
  设计：16×16 网格、实心无镂空 Aleph（`א`），每个尺寸从同一矢量原生栅格化，
  不缩放——描边版在 16px 下会糊。配色 `--accent #8c2f39`。
  另有带奶油色圆角背景的 `-bg` 变体在 `icon_assets_v2/`（本地、不推送），
  改 `gen_final.js` 的 `CREAM` 常量即可重绘。

## File Migration Log 布局（2026-10-21）
- `study/materials.html`：`File Migration Log` 链接从 `res-list` 类别列表移出，
  改为页脚上方的 `meta-link` 行（与 index.html 口径一致）。
- `migrations.html`：`.page` max-width 860→960px；表格改为
  `table-layout: fixed`（22%/30%/30%/18%）+ `overflow-wrap: anywhere`，
  因最长路径 90 字符会撑破 860px 容器。
