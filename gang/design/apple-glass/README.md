# 苹果液态玻璃风 · 视觉真源（2026-09-23 拷入）

这个目录只有两份文件，都是**只读真源**，不是岗岗自己的文档：

- `SPEC-apple-glass.md` —— 屋主 2026-09-23 拍板的「四个工具统一视觉规格」，由控制室维护。
  岗岗怎么落这套规格（令牌名、文字档取值、对比度核算、例外与理由）写在
  `../../design-proposal.md` §10，**以 §10 为准**；两边打架时先回来对 SPEC。
- `shua-glass.html` —— 规格的样张，按刷刷首页画的。浏览器直接双击打开，
  `?mode=dark`、`?accent=green|indigo|orange|pink|teal` 看变体，拖窗口看自适应。
  岗岗**取壳不取内容**：`:root` 里那组 `--fs-*/--gap/--pad/--side-w` 的 clamp 令牌、
  玻璃与光晕的手法、§5b 那套 SVG 线条图标的笔触与路径照搬，页面本身的业务内容与刷刷无关。

来源：控制室 2026-09-23 的规格目录（含 g1440-v3.png / gdark.png / gpink.png /
g1100.png / g768.png / brand-crop.png / sidebar-crop.png / icons-crop.png 等渲染图，
那些图没有拷进仓库——它们只是样张的截图，要看直接开样张）。

本目录已在 `.dockerignore` 里排掉（`design/`），不进镜像。
