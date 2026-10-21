# 验证报告（validation-report）

- 执行日期：2026-10-18
- 站点根目录：`D:/Workbuddyworkspace/mywebsite`
- 远端：GitHub Pages `https://extremalmath.github.io`，HEAD `8cd1c2a6ef13f6b42a4d9664da2ee192d151f26b`（10-17 推送）
- 迁移范围：11 个已上线 PDF（见 `mapping/rename-map.csv`）

## 一、本地验证（全部通过）

| # | 验证项 | 命令 / 方法 | 结果 |
|---|---|---|---|
| 1 | 改名执行 | `python scripts/backup_and_rename.py` | PASS — 11 renamed, 0 skipped |
| 2 | 备份完整性 | sha256 逐字节比对 `backup/` 与改后文件 | PASS — 11 ok, 0 bad |
| 3 | 引用替换 | `python scripts/update_references.py` | PASS — 11 处 href（books/notes/homework/course-essay/competition 五页） |
| 4 | 旧引用残留 | `python scripts/check_old_refs.py` | PASS — 27 个 HTML/JS 扫描，0 残留（旧路径/旧文件名/旧目录名 GraphTheoryHomework 均无） |
| 5 | 站内链接 | `python .workbuddy/check_links.py` | PASS — "No broken internal links found. OK" |
| 6 | 本地完整性 | `python .workbuddy/selfcheck.py` | PASS — 60 files scanned, integrity problems: NONE |
| 7 | JS 语法 | `node --check` 全部 6 个站点 JS | PASS（本轮未改 JS，回归确认） |
| 8 | 页脚日期 | 被改 5 页面 | PASS — books/notes/homework/course-essay 改为 Oct 18, 2026；competition 已为 Oct 18, 2026 |

补充：`selfcheck.py` 变更检测显示 local-only 23 条 / remote-only 23 条，与预期完全一致（本轮 11 个新路径 + 上午 12 个移动路径；对应 23 个旧路径待推送时删除）。

## 二、线上重定向验证（阻塞）

| # | 验证项 | 命令 / 方法 | 结果 |
|---|---|---|---|
| 9 | 旧 URL 301 → 新 URL 200 | `python scripts/verify_redirects.py` | **BLOCKED — 0 pass / 11 fail** |

失败输出（节选）：每个旧 URL 均返回 `status=200 location=None`（期望 `301` → 新 URL）。

失败原因（双重）：
1. **未推送**：改名仅在本地完成，线上旧文件仍在旧路径（故旧 URL 200）；
2. **平台无能力**：GitHub Pages 不支持服务端 301 重定向——无 `_redirects` / `.htaccess` / 反向代理 / 路由规则；`jekyll-redirect-from` 仅生成 meta-refresh 的 200 页且对 `.pdf` 路径不可用；Pages 内部唯一 301 为 HTTP→HTTPS 与 apex↔www 规范化，不能转发任意路径。（已经外部资料核实。）

按项目规范第 10 条：**已停止上线操作，旧 URL 未 404**，标记为阻塞项，待用户决策托管方案后重跑本项验证。

## 三、验收标准对照

| 验收标准 | 状态 |
|---|---|
| 范围内所有 PDF 均完成规范化改名 | PASS（本地 11/11） |
| 每个旧 URL 返回 301 并最终到达新 URL（200） | BLOCKED（平台限制，未上线） |
| books / notes / homework / course-essay / competition 无旧 URL 引用残留，链接功能正常 | PASS（本地链接层 0 失效） |
| rename-map.csv 与 old-link-record.md 完整、可审计，旧/新 URL 一一对应 | PASS |
| 平台限制已明确报告，未擅自上线 | PASS（已停止上线并报告） |

## 四、异常与修复记录

无。全部本地步骤一次通过；唯一未决项为平台 301 能力限制（阻塞，非执行缺陷）。

## 五、后续动作（上线前置）

1. 用户决策托管方案（见 README「阻塞项」两个选项）。
2. 落地 301（如迁移 Netlify/Cloudflare Pages：`redirects.conf` → `_redirects`）。
3. 重跑 `scripts/verify_redirects.py` 至 11/11 PASS。
4. 经用户确认后执行推送（含 23 增 / 23 删的完整变更集 + 页面 + style-guide/updates.js 同步）。
5. 推送后按 push-rules 六 全项验证（树 diff / 线上穿透 / Pages built / 当日日志）。

## 六、推送前自检复核（2026-10-18 下午，用户指令：排查 trouble → 按 push-rules 推送）

按 push-rules 三 全项复跑，作为推送决策依据：

| # | 自检项（push-rules 三） | 命令 | 结果 |
|---|---|---|---|
| 1 | 变更检测（远端 HEAD 比对） | `selfcheck.py` | PASS — 远端 HEAD 仍为 `8cd1c2a6`（10-17），无网页端新提交 |
| 2 | 链接检查 | `.workbuddy/check_links.py` | PASS — 21 页 61 相对链接 0 失效；「待删文件引用」项 blankk.html / 旧 GTM 名 / book/t.txt 均 0 引用 |
| 3 | JS 语法 | `node --check` ×6 | PASS — updates/picture/about-data/cv-generator/semesters/2026autumn 全过 |
| 4 | 完整性 + 本地/远端差异 | `selfcheck.py` | PASS — 60 文件本地完整 NONE；local-only 27 / remote-only 23 / sha-mismatch 6，与预期变更集一致 |
| 5 | 命名规范 | `.workbuddy/validate_filenames.py` | PASS — 0 违规 |
| 6 | 旧引用残留 | `pdf-rename-migration/scripts/check_old_refs.py` | PASS — 27 文件 0 残留 |

变更集构成：local-only 27 = 23 个新站点路径（book 3 / code 8 / notes 11 / talks 1）+ `study/competition.html` + 3 个本地 txt（style-guide / push-rules / trouble，政策不推送）；remote-only 23 = 待删除的旧路径；sha-mismatch 6 = books / notes / homework / course-essay / materials 五页 + updates.js。

### 推送决策：**BLOCKED（按 push-rules 一.3 与规范第 10 条停止上线）**

- 推送本变更集意味着 23 个旧路径被删除 → 旧 URL 直接 404，违反 push-rules 一.3「平台不支持 301 时不得上线改名——旧 URL 不得直接 404」。
- 内部解法逐一验证（均不可行）：① trouble.txt 2.3 变通「保留旧文件」可使旧 URL 保持 200，但不满足用户 301 硬性要求且遗留重复文件；② 「HTML 跳转页替代」被用户规范明禁；③ `redirects.conf`（Netlify 语法）GitHub Pages 无法消费；④ `jekyll-redirect-from` 仅 meta-refresh 200 页且对 `.pdf` 路径受 Content-Type 限制不可用。
- 备选方案需用户决策（agent 无法单方执行）：**A** 迁移 Netlify / Cloudflare Pages（Git 连接免费，`redirects.conf` → `_redirects` 直接可用）；**B** 保留 GitHub Pages + 自定义域名 + Cloudflare Redirect Rules。
- 规范冲突记录：push-rules 六.2「确认旧路径按预期 404」为通用删除语义，与本次迁移「旧路径须 301、不得 404」冲突；本次以迁移要求为准，301 落地前不上线。
- **结论：本地全部自检通过，线上推送保持阻塞；`style-guide.txt` / `push-rules.txt` / `trouble.txt` / `.workbuddy/` 按政策本就不在推送范围。** 待用户决策托管方案 → 301 生效 → 第二节验证 11/11 PASS → 用户确认后推送。

## 七、选项 A 落地准备（2026-10-18，用户决议迁移 Netlify）

用户已选 **A（迁移 Netlify / Cloudflare Pages）**，阻塞解除路径确定。已完成的准备：

| # | 准备项 | 落点 | 说明 |
|---|---|---|---|
| 1 | `_redirects`（仓库根） | `D:/Workbuddyworkspace/mywebsite/_redirects` | 11 条 301 规则，内容与 `redirects/redirects.conf` 逐条一致（已剥离注释，Netlify 语法）。GitHub Pages 会自动忽略，无副作用 |
| 2 | `netlify.toml`（仓库根） | `D:/Workbuddyworkspace/mywebsite/netlify.toml` | `publish = "."`，无构建步骤，适配纯静态站点 |
| 3 | 验证脚本支持多域名 | `scripts/verify_redirects.py` | 新增 `--host` 参数，可将 `rename-map.csv` 中 `extremalmath.github.io` 替换为任意域名（如 `extremalmath.netlify.app`）后验证 301 |

**剩余外部依赖（需用户账户操作，agent 无法单方执行）**：在 Netlify / Cloudflare Pages 用 Git 连接本仓库 `ExtremalMath/ExtremalMath.github.io`（免费，自动识别静态站点）。连接后 Netlify 会先部署当前 commit（旧文件），用户确认上线后 agent 推送完整变更集，Netlify 自动重部署 → 旧 URL 301 → 新 URL 200。

**上线后验证命令**：`python scripts/verify_redirects.py --host extremalmath.netlify.app`（域名以实际部署为准），目标 11/11 PASS。

**暂未推送**：两新文件已入待推送变更集，但推送动作保留至 Netlify 已连接且可服务之后，以确保旧 URL 在任何线上主机上都不会 404（遵守规范第 10 条）。

## 八、推送完成与线上验证（2026-10-18，用户末次裁决放弃 301）

用户末次裁决放弃托管层 301、接受旧 URL 直接 404，阻塞解除。经 Git Data API 增量推送（push-rules 五），commit `5e7d58c1`。

| # | 验证项 | 结果 |
|---|---|---|
| 1 | 树级 diff | 24 增 / 6 改 / 23 删，与预期一致（无 `.workbuddy` / txt 泄漏）；blob 仅新建 7 个（改名 PDF 内容复用旧 blob） |
| 2 | 关键页面 200 | `/`、`/study/books.html`、`/study/materials.html`、`/study/competition.html` 均 200 |
| 3 | 新资源 200 / 旧资源 404 | 新：`book/gtm_244_bondy_murty_graph_theory.pdf`、`notes/graph_theory_homework/exercise_0526.pdf`、`code/cpp/keep.cpp` → 200；旧：`book/GTM_244_Bondy_Murty_Graph_Theory.pdf.pdf`、`notes/GraphTheoryHomework/Exercise0526.pdf`、`code/c_language/keep.cpp` → 404（预期） |
| 4 | Pages 构建 | `pages/builds/latest` = built |

注：`/study/competition.html` 首查曾返回 404，系 CDN 缓存了构建前的 404（max-age=600），以 `?cb=` 穿透后返回 200，确认已上线。旧 URL 404 为用户明确接受的预期结果。

