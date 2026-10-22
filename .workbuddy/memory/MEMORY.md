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

## 站点功能与内容现状
- **文件组织整改 + 已上线 PDF 改名（2026-10-18，已推送 commit 5e7d58c1）**：
  11 个已上线 PDF 改小写下划线名，5 个页面 11 处 href 同步；代码归 code/c、code/cpp；
  旧版笔记归 notes/archive；talks/ 拼写修正；CV 过程文档移 .workbuddy/cv-process-docs/。
  映射文件 `.workbuddy/pdf-rename-migration/rename-map.csv` 与 `reports/old-link-record.md`
  为唯一权威，**不得删除**。
  301 阻塞已解除（用户接受旧 URL 直接 404）；push-rules 一.3 / style-guide 第七/十三/十四节
  改为「改名只需引用同步+迁移留档，不再强制 301」。
- CV 生成器 `cv-pdf-generator/`：4 功能文件已推；过程文档本地。特性：中英双语、数据驱动、
  纵向 A4、灰度打印、正文禁超链接、姓名统一译「李元博」、术语统一（免H图 / 紫金草志愿者团队 /
  Bright Eyes / 大眼睛公益团队）；页脚「年+月」为 **CV 局部例外**。
- about 数据驱动：`about-data.js` 为研究兴趣 + 获奖的单一数据源，about.html 与 CV 共用。
- Books 页 `study/books.html`：5 本书编目 + sticky "For study use only" 声明；
  Evans PDF `evans_pde_2nd_ed.pdf`。
- 习题笔记 `notes/FiniteFields_Exercise1_T7_T10_notes.pdf` 已入 homework 页（10-17 新增，
  属正常内容、不得删除）——与 book/ 已删除的 2 页 FiniteFields_FengLiao.pdf 是两回事。
- Competition 页 `study/competition.html`：2026 高教社杯 A 题，年份口径 2026（已核实），
  授权说明 + 匿名化 PDF + 页脚年月制例外就位。
- 迁移公告 `migrations.html`（根，已推）+ `.workbuddy/migrations.json`（canonical）+
  `migrations-data.js`（自动生成，勿手改）+ `.workbuddy/update_migrations.py`。
  404.html 已加指向该页的链接。新增/修改记录只改 JSON → 重跑脚本即可。

## 跨智能体协作规则（共识，所有智能体遵循）
- **确认类问题统一规范（固化规则）**：凡对外发布（push/上线）、删除文件、重命名或任何不可逆/有副作用改动，先按统一格式（①做什么/影响范围/是否可逆 ②确认/取消选项）获用户明确同意；决策入规则即长期约定，不再重问。
- **profile.png 暂不添加**：about 头像继续 ℵ 占位，任何 agent 不得主动添加该文件。
- **习题笔记 PDF（`book/FiniteFields_FengLiao.pdf`，2 页）已从 Books 页/book/ 删除**：不得恢复该书目、不得在 Books 页重新链接（教材 `book/FiniteFields_Applications_FengLiao.pdf` 仍保留）。⚠️ 注意：homework 页现有的 Finite Fields 习题笔记节（链 `notes/FiniteFields_Exercise1_T7_T10_notes.pdf`）系用户 10-17 另行提供并批准的新增，**属正常内容、不得删除**——与原 book/ 删除是两件事。
- **txt 仅本地**：维护文档改名/删除前先 grep 全站引用并同步更新；若 txt 误推远端，按 push-rules 五.5（Git Data API 重建 tree）删除。

## 待办 / 持续跟踪
- 「年+月」页脚规则是否全站推广（当前仅 CV；推广须同轮改 style-guide + updates.js/about/index）。
- CV P2 遗留：英文兴趣描述 170 字符截断、日期三种风格并存、用词打磨。
- 放置 `picture/private/profile.png` 后 about 头像自动由 ℵ 替换（用户动作，无需改页面）。

## 交错悬停规则（2026-10-22，已注册到 style-guide.txt）
- 全站 26 个页面的 `<style>` 末尾都插入了 `a:not(.back-link):not(.btn):hover`，效果：文字深酒红 #8B0000 + 左倾 skewX(-10deg) + 过渡 0.2s ease。
- 被排除的类：`.back-link`（页面导航 "← Back to X"）和 `.btn`（404 页面 "Back to Home" 按钮），保持原绛红+下划线悬停。
- 格式规范唯一权威 `style-guide.txt` 第十四节已登记该例外（任何智能体修改时必须保留该选择器）。
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

## 2026-10-21 新增：academic-sites 数据驱动与悬停交互
- `study/sites.js` 为 `study/academic-sites.html` 的单一数据源：`SITES` 数组
 （category / name / url / desc / note 五字段）+ `renderSites(containerId)` +
  `SITE_CATEGORY_ORDER` + `esc()`。新增条目只改数据，HTML 不动。
- 中文站点 name/desc 保留中文（PubScholar 公益学术、书生·浦语 AI 工作台、
  书生·浦语 Discovery、MathWorld 中文版）；分类标签与页面结构全英文。
- 文字悬停交互：`.text-hover` 包裹所有渲染文字与静态标题/页脚，
  hover 时 `skewX(-10deg)` + `#8B0000`，0.2s ease；skew 作用于 inline 包裹层
  而非 flex 行，故布局不变。补充 `.res-row:focus-within` 深红 outline。
  保留 `prefers-reduced-motion` 禁用过渡。
- 长异常文本：`.alert` white-space nowrap→normal + max-width 45%。

## 推送机制现状（2026-10-21）
- 两条推送通道并存（需统一，见 trouble 11.7）：
  ① `.workbuddy/push_site.py`（Git Data API 增量，已验证可用；
    2026-10-21 加空变更守卫防 422 "Invalid tree info"）；
  ② `github-auto-upload` 技能（`auto_upload.py sync`，能 commit 但推送失败——
    git 线协议被代理拦截，API fallback 因本地/远端历史分歧未成功）。
- 本地 git 仓库为 push_site.py 自建的单提交历史（49b8143 + 81779be），
  与远端主线不同步；**线上状态以 selfcheck.py 的本地/远端 sha 比对为准**，
  勿用 git status 推断。
- 代理绕行：小请求用 `env -u http_proxy ...` 直连；大流量走 Git Data API。
