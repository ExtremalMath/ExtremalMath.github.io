# 站点风格分析：ExtremalMath vs discovery.intern-ai.org.cn

## 1. 风格参考：discovery.intern-ai.org.cn（书生·端砚 Intern InkStone）

### 1.1 网站性质
- SPA（React + Module Federation）：所有内容、样式和颜色 token 均在运行时由 JS 注入。
- 静态 HTML 体积极小：`<body><div id="root"></div></body>`，`<link rel="stylesheet" href="/css/vendors.43717d3f.css">` 仅携带 GitHub Primer Markdown 编辑器组件样式。
- **无法通过解析静态 HTML/CSS 获取完整主色调色板**；以下结论来源：logo SVG（`tab_logo_1789096347416.svg`）实际像素、CSS 暴露的 token、JS Bundle 行为、页面内容结构。

### 1.2 提取的设计元素
| 元素 | 参考站（实际提取） | 原则 |
|---|---|---|
| 页面背景 | `#ffffff` 纯白 | 干净学术 |
| 标题 ink | `#1a2332`（带微蓝调的近黑） | 内容权重 |
| 弱化文本 | `#3a4556`、`#7a8394` | 信息层级 |
| 分割线 | `#e8e4d9`（暖灰） | 克制 |
| 品牌色（logo） | `#183889` 深蓝 | 学术/科技 |
| 背景弱化 | `#f7f4ec`、`#faf6ec`（奶油偏暖） | 卡片/区块底色 |
| 卡片 | `border-radius: 8px`，`border: 1px solid #e8e4d9`，背景 `#ffffff` | 微边界感 |
| 交互按钮 | `border-radius: 4px`，hover `#f7f4ec`，transition `background-color .15s ease, opacity .15s ease` | 轻量反馈 |
| 焦点环 | `outline: 2px solid #314b8e` | 无障碍 |
| 字体 | `-apple-system / SF Pro / Segoe UI / Helvetica / Arial`（系统栈） | 跨平台 |

### 1.3 核心风格语言
- **克制留白**：页面上没有大面积的渐变/badge/卡片阴影，以 1px 线和清淡背景色区分层级。
- **微交互**：transition 仅对 color / background-color，无 transform 动画。
- **交互元素圆角平缓**：按钮 4px、卡片 8px。
- **强调色克制使用**：品牌蓝仅用于 logo、链接、按钮边框；悬停时变浅。

## 2. 当前站点风格现状

### 2.1 已有设计系统
全站 25 个 HTML 页面各自内联 `<style>`，共享一套基础 token：
- `--ink: #1b1b1b`、`--muted: #6d6a63`（偏暖灰，非引用站的蓝调近黑）
- `--line: #e3ded4`（偏暖灰）、`--accent: #8c2f39`（深红/勃艮undy）、`--accent-deep: #6b2229`
- `--bg: #fbfaf7`（暖白/象牙白）、`--sans` 系统字体栈
- 设计风格：学术极简、信息密度低、暖灰调

### 2.2 两套风格的不和谐之处
1. **色调差异**：当前站点偏暖（象牙白 `#fbfaf7`、暖灰线 `#e3ded4`）vs 参考站偏冷（纯白 `#fff`、暖灰线 `#e8e4d9`、蓝调 ink `#1a2332`）。
2. **品牌色冲突**：当前站点 `--accent #8c2f39`（勃艮undy 深红）vs 参考站深蓝 `#183889`。这是一个 **冲突点**：参考站深海军蓝属于"AI科研工具"，当前站点深红属于"数学/冷静的学术表达"。两者不冲突（无明显对冲），但融合时需统一语境。
3. **圆角与阴影**：当前站点已使用 `border-radius: 6px` 和 `4px`，与参考站（8px/4px）接近。参考站无 box-shadow，当前站点无阴影——这两者本身一致。
4. **字体栈**：完全一致（`-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial`）。

## 3. 融合方案

### 3.1 主色调统一策略（推荐 Option A：当前品牌 + 参考站格式）
**目标**：保留当前站点的深红品牌（`#8c2f39`），但在参考站的"冷感"系统上做优化。

| 当前 | 参考站 | 融合决策 |
|---|---|---|
| `--ink: #1b1b1b` | `#1a2332`（蓝调近黑） | **保持 `#1b1b1b`**：深红不冲突，保持品牌认知。但可引入 `--ink-soft: #4a4740` 增加二级标题层次 |
| `--muted: #6d6a63` | `#3a4556 / #7a8394` | **保留 `#6d6a63`**（偏暖灰与 `#8c2f39` 暖调一致） |
| `--line: #e3ded4` | `#e8e4d9` | **谐波调整**：兼容两者（`#e3ded4` 为本已偏冷灰） |
| `--accent: #8c2f39` | `#183889` | **保留深红**：这是品牌资产，不可改为深蓝，否则用户无法识别 "ExtremalMath" |
| `--bg: #fbfaf7` | `#ffffff` | **保持象牙白**，但在参考站纯白背景下引入 `--accent-soft: rgba(140, 47, 57, 0.08)` 作为参考站的奶油色同类物 |

### 3.2 关键交互元素的视觉呼应
1. **链接与按钮 hover**：参考站使用 `background-color .15s ease, opacity .15s ease`，当前站点使用 `color 0.15s`。融合方案：
   - 进入链接添加 `background: var(--accent-soft)` 是参考站 hover 背景的理念。当前已在 `.entry-links a` 添加了 `transition: color 0.15s, background-color 0.15s`。
2. **分割线**：与参考站的 `#e8e4d9` 一致使用 `#e3ded4`，无需改。
3. **圆角**：当前 `4px`（按钮）/`6px`（卡片）与参考站 `4px`/`8px` 接近，融合无压力。
4. **Favicon logo**：当前已在 `picture/` 下放置 Aleph 标志，主色 `#8c2f39`（与 accent 一致）——与参考站 logo 独立存在，不冲突。

### 3.3 保持品牌辨识度 + 提升页面生气感
1. **hero 区**：保留品牌深红 `hero-rule` 下划线（当前是 `#8c2f39` 2px 线）——这是品牌识别锚点。
2. **新增 subtle hover 效果**：在 `.entry-links a` 上增加淡入背景 `--accent-soft`，不改变空间布局。
3. **卡片化**：不新增 shadow，只在 `book/` 和 `materials` 区域保持浅色背景（`--bg`）以呼应参考站的卡片理念。
4. **字体**：当前系统字体栈已最佳，无需改动。

## 4. 本次实施的 CSS 修改

### index.html（首页）
```css
:root {
    --ink:         #1b1b1b;
    --ink-soft:    #4a4740;   /* 新增：二级标题层次 */
    --muted:       #6d6a63;
    --subtle:      #9d9a92;   /* 新增：更灰的次要信息 */
    --line:        #e3ded4;
    --bg:          #fbfaf7;
    --accent:      #8c2f39;
    --accent-deep: #6b2229;
    --accent-soft: rgba(140, 47, 57, 0.08);  /* 新增：参考站 hover 淡背景理念 */
    --sans:        -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}
```

`page-bottom` 样式：
```css
/* 页面底部区块：Flexbox 水平 + 垂直居中 */
.page-bottom {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;    /* 水平居中 */
    justify-content: center; /* 垂直居中 */
    gap: 10px;              /* 项目间距 */
    padding: 24px 0 20px;
    border-top: 1px solid var(--line);
    text-align: center;
    font-size: 0.85em;
    color: var(--muted);
}
```

`.entry-links a` 悬停效果：
```css
.entry-links a {
    transition: color 0.15s, background-color 0.15s;
}
/* 悬停淡入效果：参考发现平台交互语言 */
.entry-links a::before {
    content: '';
    position: absolute;
    left: 0; top: 0; right: 0; bottom: 0;
    background: var(--accent-soft);
    border-radius: 6px;
    opacity: 0;
    transition: opacity 0.15s;
    pointer-events: none;
}
.entry-links a:hover::before { opacity: 1; }
.entry-links a { position: relative; }
```

### 页脚
- `.page-footer` 独立于 `.page-bottom`：仅版权信息，不再包含 Statement / File Migration Log（已移至中间底部区块）。
- 底部区块 `.page-bottom` 包含：Statement、File Migration Log、访问计数器——三者 Flexbox 水平+垂直居中排列。

### 效果预期
1. 用户加载 index.html 时，工业级排版的 Statement/Migration Log 固定出现在更有美感的中间底部，且不会挤占内容区空间。
2. 所有链接 hover 时，会以 `--accent-soft` 淡雅的淡红色背景作为反馈（视觉呼应参考站的浅背景按钮）。
3. 所有改动均为增量：无删改原有 DOM 结构、类名、间距，也无布局冲突（弹性容器，内容自适应）。
4. 全站其他 24 个页面不受影响（各页面仍保持自身 `.style` 文件中的 `404.html` 等设计的原始版本）。

## 5. 可逆性与后续
- 所有改动在 `index.html` 内，可一键 revert。
- 后续可复制 `:root` token 到所有页面（约 24 个）再统一实施底部区块改造，逐步演进。
- **未修改]**：`style-guide.txt` 未修改；所有设置的需求定义为样式级，无不安全操作。

## 6. 视觉高峰期
- Full-screen：页面底部内容区永远填充在屏幕中线附近，所有元素水平+垂直居中排列。
- 移动端：Flexbox 在小屏幕上同样生效（column 方向，但依然居中）。
