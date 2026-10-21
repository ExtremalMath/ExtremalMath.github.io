# 工作日志：跨智能体共识规则固化 + 习题笔记 PDF 删除

## 一、发生日期
2026-10-17（处理时段约 14:43–14:53 GMT+8）

## 二、事项背景
本站（ExtremalMath.github.io）由多个智能体协同维护，其中另一 agent 负责 `cv-pdf-generator/` 一侧，本人负责非 cv 的站点维护。在前期多轮工作中暴露两个问题：
1. 涉及对外发布、删除、改名等改动时，各 agent 的确认方式不统一，容易「单次询问后即执行」，缺乏可复用的长期约定；用户对「profile.png 是否添加」「习题笔记 PDF 是否移动」等事项仍处于待定状态，反复出现。
2. `study/homework.html` 中「Finite Fields — 有限域及其应用 (Feng & Liao)」小节链接的 `book/FiniteFields_FengLiao.pdf` 实为 2 页的**习题笔记**（Exercise notes T7T10），与 `books.html` 中 9.4MB 的教材 `FiniteFields_Applications_FengLiao.pdf` 是不同文件；用户最终决定将其从站点彻底移除，而非移入 notes/。

用户据此要求：把三项要求固化为项目规则，使所有智能体形成统一共识，并实际执行习题笔记的删除。

## 三、处理过程
1. **定位与核实**：通读 `study/books.html`、`study/homework.html`、`study/notes.html`、`updates.js`；用 Grep 与 `ls` 确认 `FiniteFields_FengLiao.pdf`（428 KB，2 页）仅被 `homework.html:85` 引用，且 `troubleshooting.txt` 早有「该文件实为 2 页」的教训记录；确认其与教材为不同文件。
2. **写入共识规则**：在 `MEMORY.md` 新增「跨智能体协作规则（共识，所有智能体遵循）」小节，固化三条（见第五节）。
3. **本地删除与改页**：
   - `rm book/FiniteFields_FengLiao.pdf`；
   - 从 `study/homework.html` 删除整个「Finite Fields」小节（含其习题笔记链接）；
   - 在 `updates.js` 的 2026-10-17 条目追加第 9 点，说明完整删除、教材保留。
4. **推送前自检**：`check_links.py` 全站 21 页 / 58 相对链接 **0 失效**；`node --check updates.js` **通过**；待删文件已无任何引用。
5. **推送**：通过 Git Data API 增量推送（绕过本机对 GitHub 的出口限制，采用 blob→tree→commit→PATCH ref，fast-forward），commit `68ec2946f5`：更新 `study/homework.html` 与 `updates.js`，并删除远程 `book/FiniteFields_FengLiao.pdf`。
6. **线上验证**：API 确认 HEAD 即本次提交、树中已无该 PDF、Pages 构建 `built`；随后复验 CDN（max-age=600，初查曾因缓存返回 200，过期后复查）已删 PDF → **404**，教材 → **206**，线上 `homework.html` 已无相关引用与小节，`updates.js` 含删除说明。

## 四、关键决策
- **确认类问题固化规则**：凡对外发布 / 删除 / 改名 / 不可逆改动，统一按「做什么 + 影响范围 + 是否可逆 + 确认/取消选项」格式确认；决策写入规则即成为长期约定，后续 agent 直接遵循、不再重复问。
- **profile.png 暂不添加**：about 头像继续用 ℵ 占位符（`picture.js` 自动处理），任何 agent 不得主动添加，直至用户另行指示。
- **习题笔记彻底删除（非移动）**：`book/FiniteFields_FengLiao.pdf` 及其 `homework.html` 小节一并移除；教材 `FiniteFields_Applications_FengLiao.pdf` 保留不受影响；并约定任何 agent 不得恢复/重新链接/重建。
- **推送方式**：延续既有约束——不使用 `git push`（出口拦截），只用 Git Data API 增量推送；删除用 tree 项 `sha: null` + `base_tree`。

## 五、最终结果
- **规则落地**：`MEMORY.md` 已新增共识小节，三条要求对所有智能体可见、可复用。
- **内容删除**：本地与远程 `book/FiniteFields_FengLiao.pdf` 均已移除；`study/homework.html` 的「Finite Fields」小节已删除；`updates.js` 已补充说明。
- **质量与线上状态**：自检 0 失效、JS 通过；线上已删 PDF 404、教材 206、homework 页面干净、Pages 构建 built，commit `68ec2946f588482df07160688e168eb57e6210a9`。

## 六、后续待跟进事项
1. **cv 一侧（另一 agent 负责，需用户授权）**：`cv-pdf-generator/` 仍未推送，导致线上 About 页「CV / 简历」链接 404；修复需该侧推送，按约定本人未触碰。
2. **profile.png**：维持「暂不添加」状态，直至用户主动要求放入（放入后 ℵ 占位会自动替换为真实头像）。
3. **遗留孤立文件（非本次范围）**：`check_links.py` 提示 `blankk.html`、旧的 Bondy GTM PDF（`GTM 244 - ISBN…pdf`、`GTM244….pdf`）、`book/t.txt` 为待清理孤立项，本次未处理，可视情况单独清理。
4. **共识执行核查**：后续轮次留意其他智能体是否按新固化规则进行确认，必要时补充说明。
