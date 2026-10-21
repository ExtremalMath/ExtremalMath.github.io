# pdf-rename-migration — 已上线 PDF 全面改名及旧 URL 重定向迁移

> 项目位置：`.workbuddy/pdf-rename-migration/`（本地工具，不入远端）
> 执行日期：2026-10-18 ｜ 状态：**改名与结构整改已推送（commit 5e7d58c1）；线上验证新路径 200 / 旧路径 404（预期）/ Pages built。用户末次裁决放弃 301、接受旧 URL 404，Netlify 部署文件已删除，迁移按「引用同步 + 留档」闭环**（见「五」）

## 一、任务来源与决策记录

- **来源**：`.workbuddy/file-organization-rules.md` 整改建议 #5（GTM_244 双扩展名）与 #6（10 个已上线 PDF 命名三套并存）。
- **用户决策（2026-10-18）**：不再沿用「已发布文件永不改名」的豁免方案，对本范围 PDF **全面改名**；旧链接进行统计记录；输入旧链接时**自动调整到新链接**；新建本文件夹承载全程工作。
- **规则冲突与处理**：原 `style-guide.txt` 规定「文件名一旦发布永不改名」并明确「GTM_244 双扩展名 PDF 记录备查、不改」，`trouble.txt` 2.1/2.3 同此。本轮依用户决议修订 style-guide 改名条款（须用户批准 + 引用同步 + 托管层 301 + 迁移留档；平台不支持 301 时不得上线），并在 trouble.txt 更新记录留痕。
- **命名依据**：`style-guide.txt`「文件命名」节——英文小写、单词间下划线；禁双扩展名。

## 二、范围

**包含（11 个文件）**：建议 #5 的 GTM_244 双扩展名 PDF；建议 #6 的 9 个命名不统一 PDF；GraphTheoryHomework 目录改名牵连的 property0532.pdf（无页面引用，但 URL 随目录变更，一并纳入映射）。

**不包含**：PDF 内容修改；2026-10-18 上午已完成的无引用文件移动/改名（源码归位 code/、版本入 notes/archive/、PowerPiontPre.pdf 正字等——其旧 URL 见 `reports/old-link-record.md` 附注，不重复处理）；为 PDF 建 HTML 跳转页（本项目只用托管层 301）。

## 三、目录结构

```
pdf-rename-migration/
├── README.md                    本文件：任务、决策、执行、回滚
├── inventory/
│   ├── old-files.csv            待改名 PDF 清单（旧路径/旧 URL/大小/引用/来源）
│   └── references.csv           站内引用位置清单（5 页面 11 处 + 1 无引用）
├── mapping/
│   └── rename-map.csv           旧→新 完整映射（唯一事实源，脚本据此执行）
├── redirects/
│   └── redirects.conf           301 重定向规则（Netlify/Cloudflare Pages 语法）
├── scripts/
│   ├── backup_and_rename.py     备份 + 原地改名（幂等）
│   ├── update_references.py     批量替换站内引用（幂等）
│   ├── check_old_refs.py        全站旧路径/旧名/旧目录名残留扫描
│   └── verify_redirects.py      线上验证：旧 URL 301 → 新 URL 200
├── backup/                      改名前的原文件（保留旧相对路径，共 11 个）
└── reports/
    ├── validation-report.md     验证报告（命令、结果、验收对照、阻塞项）
    └── old-link-record.md       旧链接统计记录（含全部要求字段）
```

## 四、执行记录（2026-10-18）

| 步骤 | 动作 | 结果 |
|---|---|---|
| 1 | 盘点范围 PDF，生成 inventory/ | 11 文件、12 引用位置（11 处 href + 1 无引用） |
| 2 | 制定新名并生成 mapping/rename-map.csv | 11 条，旧 URL 与新 URL 一一对应 |
| 3 | 备份 + 改名（backup_and_rename.py） | 11/11 改名；backup/ sha256 与改后文件逐字节一致 |
| 4 | 批量替换引用（update_references.py） | 5 个页面 11 处 href 全部更新 |
| 5 | 残留扫描（check_old_refs.py） | 27 个 HTML/JS 扫描，0 残留 |
| 6 | 重定向规则（redirects/redirects.conf） | 11 条 301 规则就绪；**GitHub Pages 无法生效（阻塞）** |
| 7 | 验证（见 reports/validation-report.md） | 本地 8 项全 PASS；线上 301 验证 BLOCKED |

## 五、阻塞项（未上线的原因）

**GitHub Pages 不支持服务端 301 重定向**：无 `_redirects` / `.htaccess` / 反向代理 / 路由规则任何机制；`jekyll-redirect-from` 仅生成 meta-refresh 的 200 页面，且对 `.pdf` 路径受 Content-Type 限制不可用； Pages 内部唯一的 301 是 HTTP→HTTPS 与 apex↔www 规范化，不能转发任意路径。项目规范明确禁用 PDF 内跳转与 HTML 跳转页替代，且要求「平台无法配置重定向时立即停止上线，不得让旧 URL 直接 404」。

**现状**：改名与引用替换仅在本地完成，**未推送**；线上旧 URL 仍正常 200，新 URL 尚未上线。按规范第 10 条标记为阻塞项，未擅自上线。

**选项 A 已撤销（2026-10-18 末次裁决）**：
- 用户最终放弃托管层 301 要求、接受已上线 PDF 改名后旧 URL 直接 404；仓库根 `_redirects` / `netlify.toml` 已删除，原「七、Netlify 部署步骤」作废。
- B（Cloudflare Redirect Rules）同废。

**上线前置条件（最终）**：旧 URL 允许 404 → 不再要求 301。直接经 Git Data API 增量推送完整变更集（11 改名 + 结构移动 12 项 + `study/competition.html` + 5 页面 href + `updates.js`），按 push-rules 五/六 执行与验证；旧路径 404 为预期结果。

## 六、回滚步骤

1. 停止任何推送操作。
2. 将 `backup/` 下文件按原相对路径复制回站点根目录（如 `backup/book/GTM_244_Bondy_Murty_Graph_Theory.pdf.pdf` → `book/GTM_244_Bondy_Murty_Graph_Theory.pdf.pdf`）。
3. 页面引用反向替换：按 `mapping/rename-map.csv` 将各页「新相对路径」替换回「原相对路径」（update_references.py 反向执行即可）。
4. 重跑 `.workbuddy/check_links.py` 与 `scripts/check_old_refs.py` 确认恢复原状。

## 七、Netlify 部署步骤（选项 A，2026-10-18 已决议）

> 目标：把支持 301 的托管层接上，使旧 URL 自动 301 到新 URL，旧 URL 永不 404。

### 7.1 已就位（agent 完成）
- 仓库根 `_redirects`：11 条 301 规则，与 `redirects/redirects.conf` 逐条一致（剥离注释，Netlify 语法）。
- 仓库根 `netlify.toml`：`publish = "."`，无构建步骤，适配纯静态站点。
- `scripts/verify_redirects.py` 新增 `--host` 参数：可将 `rename-map.csv` 中的 `extremalmath.github.io` 替换为任意域名后验证 301。

### 7.2 需用户操作（外部账户，agent 无法单方执行）
1. 打开 Netlify（或 Cloudflify Pages）控制台，选择 **Add new site → Import an existing project → GitHub**，授权并选中 `ExtremalMath/ExtremalMath.github.io`。
2. 构建设置保持默认（无需命令，发布目录为仓库根）；点击 **Deploy**。
3. 等待首次部署完成，记下分配的域名（如 `extremalmath.netlify.app`）。

### 7.3 推送与验证（用户确认 Netlify 已上线后，agent 执行）
1. agent 推送完整变更集：改名后的 11 个 PDF + `_redirects` + `netlify.toml` + 5 页面 href + updates.js（注意：`style-guide.txt` / `push-rules.txt` / `trouble.txt` / `.workbuddy/` 按政策不推送）。
2. Netlify 监听到新 commit 自动重部署。
3. 运行 `python scripts/verify_redirects.py --host <netlify-domain>` → 目标 11/11 PASS。
4. （可选）绑定自定义域名并指向 Netlify；或停用 GitHub Pages，使 Netlify 成为唯一线上主机。

### 7.4 回滚（若迁移异常）
- 先按第六节从 `backup/` 恢复 11 个旧文件 + 反向替换引用（恢复 GitHub Pages 原状）；
- 在 Netlify 控制台删除站点或断开仓库连接即可停止 Netlify 服务。
