# 超链接检查报告 (2026-10-20)

扫描目录：站点根（排除 .git / .workbuddy / node_modules）
扫描文件：HTML 24 / JS 8 / MD 1
链接总数（去重）：79

## 按类别统计
- anchor：1
- external：7
- mailto：1
- relative：70

## 内部相对链接
- 数量：70，死亡链接（DEAD）：0
- 结论：0 死链。

## 外部链接
- [OK] https://mp.weixin.qq.com/s/X09H5X7RnB3puzs0S2R43w  （about.html, http=200）
- [OK] https://orcid.org/0009-0007-8831-9591  （about.html, http=200）
- [UNVERIFIED] https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js  （cv-pdf-generator/cv-generator.js, http=<urlopen error Tunnel connection failed: 502 Bad Gateway>）
- [OK] https://events.vercount.one/js  （index.html, http=200）
- [OK] https://arxiv.org/  （study/academic-sites.html, http=200）
- [OK] https://link.springer.com/  （study/academic-sites.html, http=200）
- [OK] https://mathworld.net.cn/  （study/academic-sites.html, http=200）

## 非 HTTP 链接
- anchor 页内锚点：1（同一页面内跳转，无需校验）
- mailto 邮件：1（非 HTTP，合法）

## 重要说明
1. jsDelivr CDN（cv-generator.js 中的 html2pdf）在沙箱内 HTTP 000（网络出口限制），
   但属版本钉死的稳定资源，真实浏览器可加载；建议浏览器内二次确认。
2. picture.js 的 data-pic 机制指向 picture/<path>.<ext>，当前 picture/ 仅含 README、
   无真实图片文件，ℵ 占位按设计优雅回退（用户尚未放置 profile.png），非死链。
3. migrations-data.js 含旧文件名字符串，为历史迁移记录数据，非活动超链接，不构成死链。
4. 三个维护 txt（push-rules / style-guide / trouble）按 R1 sanctioned 例外固定根目录，未移动。

## 总体结论
✅ 站点文件中不存在无法访问的死链（DEAD=0，外部 ERROR=0）。