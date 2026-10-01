# 回归套件：改了站点代码，证明正文一个字没变

## v1.8.0 移动阅读改版：先验证内容，再检查真实界面

本轮有意重排目录、页头、正文工具与侧栏，并停止加载 3D 案头手册装饰。下面保留的
`run.mjs` 针对旧布局逐项比较整个 DOM，还包含旧 3D 加载闸门，**不能跨此次结构改版直接判定通过或失败**。
不要为了让旧脚本变绿而删除它的断言；以后只有布局和 3D 行为仍适用时，才使用其原有比较模式。

本轮新增 `verify-content.mjs` 和 `verify-content-html.py`。它们无需浏览器或第三方包：使用
Node 24+、Python 3 标准库、Git 和 tar，从指定提交提取基线，在两个 Node VM 中调用各自 app.js
的真实渲染函数，再独立解析生成的 HTML。正常在仓库根运行：

```bash
node tools/regress/verify-content.mjs --baseline-ref 774c278 --target . --work /tmp/gang-content-regress
```

对于没有 `.git` 的预览副本，增加 `--baseline-repo <原岗岗仓库目录>`。未提供时依次从被测目录、
脚本所在仓库根和当前目录寻找 Git 仓库。`--baseline-ref` 必填，必须选改动前的提交；不要拿同一份
已修改的内容自比。`--help` 列出参数。退出码 0 为内容检查通过，1 为内容差异，2 为工具错误。

检查范围：当前 81 项业务的键、类别、标题、阶段归属与顺序；手册数据和 114 张原图的 SHA-256；
全部增强正文、原文视图、材料勾选卡原文及逐项文字、表格单元格、图注、图片顺序与灯箱登记；
含图和无图两份打印。增强正文与改动前的真实输出比较，原文视图还独立与数据块逐字比较（只忽略空白）。
材料卡的重复展示用其原文字段归一，风险标签与图框等界面附属文字另行处理；图注单独严格核对。
打印除了正文和表格，还比较整份打印文档文字，**只允许 `.print-meta` 中的网站版本号改变**，
手册版本、标题、路径、日期、页脚及其他内容均保留比较。两侧共用固定的采集时间与页面地址，避免时间噪声。
关闭“含截图”会移除整张 figure（包括图注），因此两种打印的正文和表格相等，各自图注另与基线比较。
脚本自带删除段落/清单项/图片/打印环节的反例检查，并确认网站版本归一不会掩盖手册版本变化。

每次结果、基线截图和原文采集分别保存在 `--work/content-<基线>-<随机标识>/`；
脚本拒绝将工作目录放在被测目录或基线仓库内。**不要把结果、原文采集、截图复制进仓库**。
报告为 `report.json`，逐业务摘要为 `business-fingerprints.json`，内部正文采集为 `renderer-captures.json`。

**内容 PASS 不是完整浏览器回归 PASS。** 此工具只执行渲染函数所在的脚本前段，并做生产调用点的静态接线检查；
它不启动完整应用，不验证浏览器 DOM 纠错、CSS 可见性、图片解码、触摸、焦点、滚动、历史记录、存储和打印分页。
仍须在 390px 手机、820px 平板和 1440px 桌面检查目录/搜索/阶段跳转、材料勾选、图片放大和退出、
工具与主题、页面溢出和遮挡；确认含图/无图打印预览。localhost 预览通过也不能替代双击 `index.html`
的 file:// 冒烟检查。不得把源代码 hash 或渲染函数输出守恒表述成截图必然清晰、控件必然可用。

---

## 旧布局 DOM 与 3D 闸门套件（保留）

`run.mjs` 是一套 A/B 回归与闸门测试：拿**改动前的某个提交**当基线，用本机 Chrome 把两份站点
各自 `file://` 打开，把全部 81 个可读业务和 10 个搜索关键词、在 6 种模式下逐字比对，并检查各降级
条件下 `vendor/three.min.js` 与 `vendor/gsap.min.js` **一个字节都不加载**。

它是**开发期工具**，不参与站点运行、不进容器镜像（`.dockerignore` 已整目录排除 `tools/`）。
平时双击 `index.html` 看手册的人完全用不到它。

零依赖：只用 Node v24 自带的 `WebSocket` / `fetch`（只连本机 CDP 端口 9241）和本机 Chrome。
不 `npm install`、不下载任何东西、不起 http 服务，所有页面一律 `file://` 打开，**不加**
`--allow-file-access-from-files`。套件对被测目录只读。

---

## 怎么跑

在**仓库根目录**一条命令：

```bash
node tools/regress/run.mjs --baseline-ref <改动前的提交>
```

不传 `--target` 时被测目录就是仓库根（`tools/regress/` 的上两级，按脚本自身位置算），所以在仓库根
跑、`cd tools/regress` 再跑 `node run.mjs`、还是拿绝对路径调用，结果完全一样，任何克隆里都对。

两条实例：

```bash
# 3D 案头手册那一轮的全量：基线是改动前的 84c5e4d。约 30 分钟。
node tools/regress/run.mjs --baseline-ref 84c5e4d

# 冒烟（确认环境和路径没问题，抽 3 个业务只跑 default 模式）。约 1 分钟。
node tools/regress/run.mjs --modes default --nodes 3 --no-timing --no-mutation --baseline-ref 84c5e4d
```

`--baseline-ref` 会在工作目录里把那个提交 `git archive` 解成一份基线（只读 git 操作），解过一次
之后同一个提交直接复用、不重复解。已经有现成基线目录的话用 `--baseline <dir>` 指过去。

输出：终端汇总（每个模式的通过 / 失败计数）＋ 工作目录下的 `out/<时间戳>.json` 明细。
退出码 0 全部通过，1 有失败，2 套件自身出错。`node run.mjs --help` 打印本文件。

| 参数 | 说明 |
| --- | --- |
| `--target <dir>` | 被测目录，默认**仓库根**（按 `run.mjs` 自身位置算） |
| `--baseline-ref <commit>` | 从该提交 `git archive` 解出基线到 `<WORK>/baseline-<commit>`，已存在则复用 |
| `--baseline <dir>` | 用现成的基线目录（与 `--baseline-ref` 二选一） |
| `--work <dir>` | 工作目录，默认 `$GANG_REGRESS_WORK`，再默认系统临时目录下的 `gang-regress` |
| `--modes a,b` | 子集：`default,force,reduced,narrow,off,off-ls`，默认全部 |
| `--nodes all\|N` | 全部业务，或均匀抽 N 个 |
| `--dom-only` | 只做 DOM 等价与反向闸门断言；跳过正向断言（force 真的 ready、运行中切换的前提）；静态检查只记录 |
| `--snapshot` | 先把被测目录复制到工作目录再测：防止另一个人 / 另一个代理在运行中改文件，也让计时公平 |
| `--no-mutation` / `--no-timing` | 跳过突变自测 / 计时 |
| `--timing-runs N` | 计时次数，默认 5 |
| `--dump` | 把全部原始采集写到 `<WORK>/out/<时间戳>-captures/`（很大） |
| `--max-diff-print N` | 每个模式在终端打印的差异条数，默认 4 |

## 跑之前要什么

- **Node 24+**：用到 Node 自带的全局 `WebSocket`，更早的版本没有。
- **本机 Chrome**：路径写死 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`，
  也就是只在 macOS 上跑过；换平台要改 `run.mjs` 顶部的 `CHROME`。
- **9241 端口空闲**：CDP 固定用它（9231 另有他用）。端口被上次残留的 Chrome 占着会直接报错退出，
  先把那个进程关掉。每个模式每一侧都起一个全新 profile。
- **静音**：Chrome 一律带 `--mute-audio` 启动（四家规矩：测试时电脑绝不能出声；岗岗本身没有声音，这条防的是将来）。
  不用另外做什么，写在 `run.mjs` 的启动参数里。
- **基线**：见下一节。

## 产物一律落在仓库外

Chrome profile、`--snapshot` 的被测快照、结果 JSON、`--dump` 的原始采集、`--baseline-ref` 解出来
的基线，**全部写进工作目录**，默认是系统临时目录下的 `gang-regress`（macOS 上形如
`/var/folders/.../T/gang-regress`）。可以用环境变量 `GANG_REGRESS_WORK` 或 `--work <dir>` 换地方。

**为什么不落仓库**：手册是内部资料。明细 JSON 里有逐字的正文与 DOM，快照是整份站点（含 114 张
截图），profile 里有访问过的 `file://` 地址。这些东西一旦被 `git add -A` 顺手带进仓库就不可逆。
放在仓库之外，就没有「记得别提交」这回事。

因此**跑完 `git status` 应当是干净的**——除了你自己改的站点代码，不该多出任何东西。跑完顺手看
一眼，这是这条规矩唯一的检查方式。

## 基线怎么来

基线**不在仓库里**，要用时现解：它是整份站点（约 17MB，含手册内部资料的图片），没有理由为了
测试在仓库里再存一份。

```bash
# 最省事：交给套件，解到工作目录，下次同一个提交直接复用
node tools/regress/run.mjs --baseline-ref 84c5e4d

# 或者手工解一份放在自己指定的地方
mkdir -p /tmp/gang-baseline && git -C <岗岗仓库> archive 84c5e4d | tar -x -C /tmp/gang-baseline
node tools/regress/run.mjs --baseline /tmp/gang-baseline
```

**基线选哪个提交**：本轮改动**开始之前**的那个提交。3D 案头手册那一轮是 `84c5e4d`（v1.6.1 加上
容器 Alpine 升级那一条）。以后别的改动换成那次改动前的提交，不要图省事用 `HEAD`——改动已经在
`HEAD` 里的话，A/B 两边一模一样，套件会全绿，但什么也没证明。

**design-qa.md 第十轮（2026-09-27，搜索联想浮层）起，基线要用含第十轮的提交。** 那一轮有意改了三处顶栏
静态 DOM，都会被 bodyHTML 那个字段比出来：
- 搜索框加了 combobox 的四个属性；
- 搜索表单末尾加了联想浮层容器；
- 快捷键说明改了三条文案和底部一句。

另外套件搜索时会派发 input 事件，浮层打开后又被提交收起，收起后条目仍留在 DOM 里。所以拿更早的提交当基线，
每个业务、每个搜索词都会在 bodyHTML 一个字段上报差（第十轮冒烟实测 13 处，全在这一个字段）。
**这是有意改动，不是回归。** 第十轮自己的 A/B 用的是一份两侧同样剥掉这三块的草稿副本，全量全绿，见 design-qa.md 第十轮。

顺带一条自检：`--target <基线> --baseline <同一个基线> --dom-only` 是基线自比，用来验证采集本身
稳定、没有随机性。

## `serve-nocache.py` 是干什么的

看页面效果用的本地预览服务，和上面的回归套件是两件事。

Python 自带的 `http.server` **不发任何缓存头**，浏览器于是按启发式缓存自行决定复用——改完
`app.js`、`?v=` 没跟着变的时候，刷新看到的还是旧代码，人会去查一个根本不存在的 bug。
这个脚本就是给每个响应补一个 `Cache-Control: no-cache`：

```bash
python3 tools/regress/serve-nocache.py <仓库根> 8766
# 然后开 http://127.0.0.1:8766/
```

只听 `127.0.0.1`。注意手册是内部资料，别把它绑到 `0.0.0.0` 上。

（日常看手册不需要它——本站是特意为 `file://` 设计的，双击 `index.html` 就能用，见 `CLAUDE.md` 第二条。）

---

## 覆盖什么、怎么比

- **业务枚举**：照抄 `app.js` 的 `collectNodes/allNodes/hasContent/isEditorialLine` 判定，读页面里
  真实加载的 `window.EMPLOYEE_HANDBOOK`。两边各枚举一次并核对一致；每个业务打开后还核对
  `location.hash` 没被 `app.js` 纠正回默认业务。当前是 **81 个**可读业务
  （`design-proposal.md` 里的「110」是结构节点数，不是可读业务数）。
- **每个业务一次全新文档**：先去 `about:blank` 再打开 `index.html<查询串>#/<key>/0`。`app.js` 的
  hashchange 在同分类内只做 `updateCatalogSelection`，目录不会重建，所以不能靠换 hash 串着跑。
- **干净状态**：`Page.addScriptToEvaluateOnNewDocument` 在每个新文档最先执行：`localStorage.clear()`
  再写入本模式预置值。两边完全同一份脚本，所以「最近查看」「勾选」「主题」等状态不会漂。
- **媒体特性钉死**：`prefers-color-scheme: light` 与 `prefers-reduced-motion` 一律显式模拟。
  `app.js` 的「自动」主题提示文字（「跟随系统，当前为浅色」）随系统深浅变；跑套件的那台机器若开了
  减弱动效，不钉死的话 default 模式会悄悄变成 reduced。
- **懒加载图片去随机**：正文截图全是 `loading="lazy"`，`.is-small` 只在图片 load 回调里补。哪些懒图
  在采集前加载完取决于 Chrome 的懒加载距离阈值（随网络质量估计变，新 profile 首次导航尤其不同）和
  时序——基线自比时实测出现过一侧有 `is-small` 一侧没有。做法（两边同样）：临时改 eager → 等全部
  图片 load/error → 原样改回 `loading="lazy"`。`app.js` 的回调先注册先执行，于是 `is-small` 成为
  确定值（不是被规范化掉）。
- **稳定判据**：`readyState=complete`、无在途网络请求、去装饰后的 body 指纹连续 3 次（≥450ms）不变；
  所有模式都再等 `GangDeskBook.status()` 离开 `waiting/loading`（默认最多 4 秒；default 与 force 放宽到
  9 秒——这两个模式会真去读 530KB 的 `three.min.js`，仓库在 SMB 卷上时冷启动那一次超过 4 秒）。
  超时的采集记为「不稳定」但照样比对。非 force、非 default 模式另有断言「采集时 desk-book 已落定」：
  冷启动的首个业务实测会在 `waiting/idle` 时就稳定，这时判「没加载」为时过早。
- **比对字段**（11 个，逐字全等）：`document.title`、`location.hash`、`#head-biz` 文本、
  `#stage-rail-host`、`.toc`、`.reader-host`、`.page-aside`（去装饰）、`.aside-host`（去装饰）、
  `.manual-shell`（去装饰）、body innerHTML（去装饰、去 `<script>`、去注释、纯空白文本节点压成一个
  空格）、body innerText（去装饰）。不等时给出首个差异位置与前后 200 字。
- **去装饰规则**（两侧同样处理）：
  - `.page-aside` 的**最后一个子元素且是** `.desk-book`，至多一个；
  - `.aside-tools` 的**直接子元素**，五个开关类名各至多一个：`.theme-switch` / `.palette-switch`
    （1.7.0 粉彩那一版的名字，基线那一侧有）、`.mode-switch` / `.accent-switch`
    （1.7.0 苹果液态玻璃版的名字，改动这一侧有）、`.desk-switch`（案头手册开关，两侧都有）；
  - `body` 的**直接子元素** `nav.tab-bar`，至多一个（玻璃版新增的手机快捷栏，>600px 不渲染）；
  - `.brand` 的**直接子元素** `img.brand-icon`，至多一个（可换的品牌图标，由 `app.js` 运行时注入；
    仓库默认不带图标文件，取不到时 `app.js` 自己把它摘掉，所以默认态本来就没有这个节点）。

  五个开关名一起剥，是因为这一轮把「三态主题开关 + 六套粉彩配色开关」换成了
  「外观三态分段控件 + 六个强调色圆点」——**改名与换形态不算 DOM 回归**，
  而放错位置、放第二个仍然一定显形为差异（突变自测 M4 / M6 / M7 / M8 就是核这个的）。
- `<html>` 上的属性（`data-mode` / `data-accent`）只进报告 JSON 的 `meta.htmlAttrs`，**不参与比对**：
  比对字段表 `FIELDS` 从 `document.body` 起算，切外观 / 切强调色不会把回归判红。
  innerHTML 在克隆上删；innerText 依赖布局，只能在活 DOM 上于同一个同步任务里摘下、读取、原位装回。
- **搜索**：10 个关键词（开户、结算卡、挂失、8201200、对公、销户、密码、代理、身份证、xyzabc），
  按 `app.js` 的真实路径触发：填 `#global-search-input` 后 `requestSubmit()` `#global-search`
  （`app.js` 只在 submit 上搜索，input 只管清空按钮）。

## 模式与断言（断言只对被测侧）

| 模式 | 设置 | 每个业务的断言 | 探针 |
| --- | --- | --- | --- |
| default | 1440×900 | **正向**（1.7.0 改）：`status()` 的 `software === true`、`tier === "soft"`、`stage === "loose"`，且没有被闸门拦下（state 不是 failed / off）；出现了 `.desk-book` 就校验契约 | **精简档探针**（3 个最长正文：滚到中部等 3 秒，两份 vendor 加载成功、ready、tier=soft、画布像素比 1、物理像素长边 ≤640、抗锯齿关、契约）、突变自测、计时 |
| force | `?desk3d=force` | 若出现 `.desk-book` 则校验契约（唯一、div、aria-hidden、`.page-aside` 末子、含 canvas、无可聚焦元素） | 3 个最长正文：滚到中部等 3 秒，两份 vendor 都加载成功、脚本标签在、ready、canvas 在、契约；计时含 3D 就绪耗时 |
| reduced | 模拟 reduce（导航前） | 无 vendor、无 `.desk-book`、无 `.desk-switch` | force+reduce（带对照）；存 `hb:desk3d=on`→reduce→重载（普通 / force 两个变体）；运行中切换：force 下 ready→切 reduce，`.desk-book` 须 2 秒内移除，切回只记录 |
| narrow | 视口 1000×900 | 无 vendor、无 `.desk-book` | force+1000px（带 1440 对照） |
| off | `?desk3d=off` | 无 vendor、无 `.desk-book` | 记录 status（1.7.0 起有区分力：同一套旗标下 default 确实加载了，见「已知局限」） |
| off-ls | 每个新文档预置 `hb:desk3d=off` | 无 vendor、无 `.desk-book` | 字面流程：force 打开（对照）→ 写 off → 重载 → 不得加载 |

所有模式另有：每个业务 hash 未被纠正（两边都查）、无 http(s) 远程请求、**非 force 且非 default** 模式
采集时 desk-book 已落定、搜索页无 `.desk-book`、被测零报错（`Runtime.exceptionThrown`、`Log.entryAdded`
error、`console.error/assert`、非取消的 `Network.loadingFailed`）。基线的报错单列对照。
搜索页那条「无 vendor 请求」同样只对该拦下的四个模式设（default 与 force 下运行库本来就该加载）。

**default 模式 1.7.0 起为什么翻面**：本套件的 Chrome 跑在 `--use-angle=swiftshader` 上，渲染器名是
SwiftShader；1.6.x 的 `desk-book.js` 据此判「只有软件渲染」并拒绝，所以断言是「一个字节都不加载」。
1.7.0 把这条正则从「拒绝」改成「判软件渲染 → 强制精简档 soft」，于是**不带任何调试参数也会加载**。
逐节点只断言「判定对了」（software / tier / stage，探测在页面 load 后的空闲时刻就做完，与右栏末尾
有没有进视口无关）；「场景真的建起来了」交给本模式的探针——它滚到长正文中部，是正向断言，天然有区分力。
基线那一侧（1.6.x）在同一套旗标下仍然不加载，两侧 DOM 靠去装饰规则（`.page-aside` 末尾的
`.desk-book` 至多一个，两侧同剥）照旧等价。

**「对照 / 区分力」**：swiftshader 下若闸门本来就会拦（或功能根本没实现），「没加载」的断言是空过的。
所以闸门探针都先在同一业务上用 force 去掉该闸门跑一次对照；对照达到 ready，该探针才「有区分力」。
汇总里会标出来。

**静态检查**（非 `--dom-only` 时计入结论）：`desk-book.js` 存在、在 `index.html` 里位于 `app.js`
之前、是经典脚本；`index.html` 不直接引用 `vendor/`、无 importmap/module；`desk-book.js` 不用
fetch/XHR/动态 import/ES module/远程地址；两份 vendor 存在且不含 ESM 语法。

**突变自测会咬人**（证明套件不是摆设，结果单列）：在被测上运行时注入，再与 default 基线比对。
M1 正文改一个字、M2 `.reader-host` 里塞 `.desk-book`、M3 `.page-aside` 末尾放两个 `.desk-book`、
M4 `.desk-switch` 放在 `.aside-tools` 之外、M6 `.accent-switch` 放在 `.aside-tools` 之外、
M7 `.aside-tools` 里放**第二个** `.mode-switch`、M8 把 `nav.tab-bar` 挪进 `.manual-shell`、
M9 把 `img.brand-icon` 放到 `.brand` 之外，
都必须 FAIL 且落在对应字段；M5 在约定位置放齐合法装饰（`.desk-book` + `.desk-switch` +
`.mode-switch` + `.accent-switch`），必须 PASS（证明去装饰规则不误报）。9 条全对才算这套判据可信。

**计时**（只报告不断言）：default 与 force 两个模式，两边各 5 次打开 `index.html`，取
DOMContentLoaded、load、首次业务渲染（新文档脚本里 MutationObserver 看到 `.reader-host h1` 时打的
performance mark）的中位数；force 被测侧另取 3D 就绪耗时。

## 已知局限

- `performance.getEntriesByType('resource')` 在 `file://` 下是空的（实测），所以「vendor 没加载」以
  CDP `Network.requestWillBeSent` 为准，DOM 脚本标签为辅，resource timing 那一项只是附带、在
  `file://` 下是盲区。vendor 地址比对忽略查询串（实现会带 `?v=…`）。
- 在本机这套启动参数（`--use-angle=swiftshader --enable-unsafe-swiftshader`）下，
  **`failIfMajorPerformanceCaveat: true` 并不会拒绝 WebGL2**（实测上下文照样建出来，
  UNMASKED_RENDERER 为 SwiftShader），所以识别软件渲染必须另查渲染器字符串。
  **2026-09-23 更正**：这条结论只对「显式指定 `--use-angle=swiftshader` 的 Chrome」成立，不能推广。
  同一天用三种旗标各实测了一遍（`file://`，Chrome 141）：

  | 旗标 | 严格参数 | 宽松参数 | 宽松 WebGL 1 | `desk-book.js` 的结果 |
  | --- | --- | --- | --- | --- |
  | 默认（真显卡 Apple M5 Pro） | 成 | 没试到 | 没试到 | `strict` / `tier=high` |
  | `--use-angle=swiftshader --enable-unsafe-swiftshader`（**本套件用的就是这一套**） | **成**（但渲染器名是 SwiftShader） | 成 | 没试到 | 按名字判软件渲染 → 关抗锯齿重取 → `loose` / `tier=soft` |
  | `--disable-gpu --use-gl=swiftshader --enable-unsafe-swiftshader` | 拒 | 成 | 没试到 | `loose` / `tier=soft` |
  | `--disable-gpu`（**不带** unsafe 旗标） | 拒 | 拒 | 拒 | 安静回静态：`failed / webgl2-unavailable` |

  屋主那台真机（Windows，只有 WARP，渲染器名 `Microsoft Basic Render Driver`）走哪一行**仍未实地验证**，
  但两条路都通向 `tier=soft`：严格参数被拒就走第二行的下半段，没被拒就被渲染器名认出来。
- `?desk3d=off` 无法与 `?desk3d=force` 同时出现；**1.7.0 起 default 在本套件的 swiftshader 下会加载**，
  所以 off 模式的「未加载」断言从这一版起**有了区分力**（同一套旗标下 default 确实加载了）。
  off-ls 的字面流程探针照旧。
- 只测 >1120px（1440）与 1000px 两档；≤820px 手机形态、打印、专注模式、saveData、低端设备、
  帧率卸载、WebGL 上下文丢失都没测。
- **精简档只覆盖到「判定 + 契约 + 画布参数」，不量帧率**：套件不适合做性能测量（两侧同时跑、
  机器负载不可控）。soft 档的帧率、自身绘制耗时、看门狗耐久是另一套一次性脚本量的，
  数字记在 `design-proposal.md` §9.7。
- **拿不到上下文那一档（`--disable-gpu` 不带 unsafe 旗标）套件不覆盖**：`launchChrome` 的旗标是写死的，
  换一套旗标就得再起一轮。那一档由上面那套一次性脚本单独验（结果见 §9.7 与本文件上一节的真值表）。
- 默认直接测仓库工作区本身：仓库在 SMB 网络卷上，另一个人或另一个代理若在运行中改文件，结果会不
  可信（套件首尾对关键文件取哈希，变了会判失败）。用 `--snapshot` 避免。
- 计时时基线在本地盘、被测在 SMB，差异含存储介质因素；`--snapshot` 后才公平。
- `<head>` 与 `<html>` 属性不在比对范围（`<html style="--head-h">` 随布局变）；`<html>` 属性差异会
  记进 JSON（`htmlAttrsDiff`）但不判失败。

## v2.0：原文顺序、办理索引与 Word 格式

v2.0有意修正了旧版阶段归类，新增分环节视图与重复展示的原句索引；旧verify-content的“阶段归属必须和旧版相同”不再适用。不要删除旧断言，新版运行以下独立检查：

```bash
node tools/regress/verify-workflow.mjs
node tools/regress/verify-source-formatting.mjs
node tools/regress/verify-guided-render.mjs --baseline-ref 01da61a --baseline-repo <岗岗仓库> --target . --work /tmp/gang-guided-render
bash tools/check-dockerfile-copy.sh
```

verify-workflow检查全部81业务、1657块原文的单次覆盖、原序、摘录切片、分支范围和人物/动作反例；verify-source-formatting检查UTF-16格式范围与安全HTML；verify-guided-render实际调用新版页面、原文和含图/无图打印渲染器，并对照旧版正文、材料清单、图片与源格式。它们不替代浏览器触摸、图片解码、缩放和打印分页的人工验证。

更换Word版本时，先按现有流程重建正文数据，再运行：

```bash
python3 tools/extract_employee_handbook_formatting.py <Word原件.docx> --data employee-handbook.js --output employee-handbook-formatting.js --report /tmp/gang-formatting-audit.json
```

必须核对sourceDataSha256、差异报告和所有格式范围。原句发生新增勘误时，不得把附近颜色猜到新字符上。Word与报告不进Git，不用git add -A。
