# 岗岗 —— 开工前必读

这个文件记的**只有坑和硬约束**，不是项目介绍。项目介绍看 `README.txt`、
`design-proposal.md`、`design-qa.md`。

每次踩到新的、会重复发生的坑，**追加到这里**，不要只记在脑子里或聊天记录里。
判断标准：如果同一个人（或同一个 AI）三个月后可能再踩一次，就写进来。

---

## 一、上岗手册是内部资料

任何部署都必须带访问保护。生产链路是 Cloudflare Tunnel → Nginx 网关 → Authentik 认证
→ 容器，容器**不映射宿主机端口**。

`deploy.yml` 里有两道校验：拒绝从公开仓库部署、发布后复核 GHCR 包 visibility 为 private。
**不要为了图方便绕过它们。**

---

## 二、这个项目是特意为 `file://` 设计的

`index.html` 里全是**普通同步脚本**，没有 `type="module"`、没有 `fetch`。
文件里就写着原因：`file://` 下 `type="module"` 会因 CORS 直接加载失败。

所以 `双击打开手册网站.bat` 直接开 `index.html` 是可以工作的。

**但改动时要守住这条**：一旦引入 ES module、`fetch()`、`XMLHttpRequest` 或
动态 `import()`，双击启动就会静默失效——页面出得来，功能全死。
真要引入，就得同时把启动器改成起本地 http 服务，并更新 `README.txt`。

---

## 三、那个 17MB 的 .docx 不在 git 里

`新员工上岗手册（20260205）.docx` 是数据源，**没有被 git 跟踪**（`.dockerignore` 里也排掉了）。
提交前用 `git ls-files | grep docx` 确认一下，别手滑 `git add -A` 把它加进去——
仓库现在 14.87 MiB，加进去会直接翻倍且不可逆。

---

## 四、报错不指向真正原因的

### `Permission denied: .git/COMMIT_EDITMSG`

**别去查杀软或权限配置。** 是文件被打了 Windows **Hidden** 属性，而 Windows 不允许用普通
create 语义覆写 Hidden 文件——git 和构建插件都是「先删再建」，于是报权限错。

来源没有完全查实：2026-09-04 查过，**这台机器上并没有装任何同步客户端**，所以属性多半是
文件当初从别处拷进来时带上的，而不是有进程在持续设置。清理后复查没有再自发出现。报错完全不指向它，会白白耗掉很多时间。

```powershell
# 只清 Hidden。用 tools/deploy/sync-all.sh 会自动做这一步。
Get-ChildItem .git -Recurse -Force -File |
  Where-Object { $_.Attributes -band [IO.FileAttributes]::Hidden } |
  ForEach-Object { $_.Attributes = $_.Attributes -band (-bnot [IO.FileAttributes]::Hidden) }
```

**不要顺手把 ReadOnly 也清掉。** `.git/objects/` 下的松散对象本来就是只读的——那是 git
自己的保护（内容寻址的不可变数据），每个平台都这样，不是故障。2026-09-04 我一度把它们
当成同一个问题清掉过，是清过头了。**只有 `Hidden` 才是异常。**

---

## 五、容器化的四个坑（2026-09-04 全部修过一遍）

改 `Dockerfile` 或 `docker/nginx.conf` 前先读这四条：

1. **必须有 `WORKDIR /usr/share/nginx/html`**。基础镜像的 WORKDIR 是 `/`，不切的话
   `COPY ... ./` 会把静态文件全放到根目录，**整站 404**。
2. **构建期 `nginx -t` 会以 root 建出 `/tmp` 临时目录，必须删掉**。留着的话运行时
   非 root 的 nginx 用户会撞上 root 属主的目录而写不进去。
3. **缓存策略用 `map` 集中判定，不要在 `location` 里写 `add_header`**。nginx 的规则是：
   一个 `location` 里只要出现 `add_header`，就**不再继承 server 级的任何 `add_header`**。
   **注意这条约束的适用对象是网关那份 `tools/deploy/nginx/gateway.conf`**（它逐个 location 重复写
   安全头，正是因为这个机制），**不是容器内的 `docker/nginx.conf`**——后者本来就没有 server 级安全头，
   全文只有两条 `Cache-Control`。（2026-09-23 更正：原文写的是「会清空 CSP 和禁止索引声明」，
   那是从刷刷抄来的说法，岗岗容器里没有这些头。）
4. **安全响应头目前不在容器这一层**：`X-Robots-Tag: noindex, nofollow` 与 `X-Frame-Options: DENY`
   由 Caddy 提供（`tools/deploy/Caddyfile` 的 `tool_site` 片段，岗岗 `import` 它）；`gateway.conf` 另有
   `X-Content-Type-Options` 与 `Referrer-Policy`；**整条链路上没有 CSP**（`Caddyfile` 里那条
   `Content-Security-Policy-Report-Only` 是整行注释掉的草案）。**容器层待补，已单独立项**：
   补的时候照刷刷那组，且 CSP 的 `img-src` **必须含 `data:`**，否则会挡掉 §10.14c 那枚 data URI 的 favicon。

改完 `Dockerfile` 后，**逐个核对 `COPY` 列出的每个文件/目录是否真的存在**（特别是
`assets/`），漏一个构建就失败。

---

## 六、大文件不要整篇读

`app.js`（约 216KB）、`employee-handbook.js`（265KB，内联的手册数据）、`styles.css`（约 157KB）。
用 grep 定位，别整篇读进上下文。

---

## 七、输入法：回车、Esc、方向键先判 isComposing

凡是 keydown 处理，第一行都写 `if (event.isComposing || event.keyCode === 229) return;`：
拼音选词的回车、取消选词的 Esc、翻候选的方向键都归输入法，不是给网页的。

**表单 submit 里也要拦**：隐式提交是回车的默认动作，不经过任何 keydown 分支。
**但拦提交只认 `isComposing`、不认 229**：安卓软键盘上不在合成中的键也常报 229，
认了会把键盘的「搜索」键拦成按了没反应，比「拼音被当成词搜一次」后果重。

这类 bug 用户感觉得到、报不上来（「打字时偶尔自己提交了 / 焦点跳走 / 被清空」）。
2026-09-27 在 625efcc 上实测过四个，已在 1ece5aa 修掉；细节与测法见 `design-proposal.md` §11.4。

---

## 收尾规矩：改完先汇报，屋主点头才推

**这个仓库的推送权在屋主手里，不在你手里。**

做完一段工作后：

1. **提交到本地**（提交信息按本文件其他章节的要求写），但**先不要 `git push`**
2. **汇报**：说清楚三件事——
   - **改了什么**：逐条列，不是「优化了若干」这种含糊话
   - **为什么这么改**：尤其是做过取舍的地方，把被否掉的方案和否掉的理由也写出来
   - **验证到什么程度**：哪些门禁真跑过、结果是什么；没跑的要明说没跑，不要让人以为验过了
3. **等屋主看过、满意了**，再推。他说可以之前，本地留着就行——提交已经在，不会丢

汇报要诚实：失败就说失败并贴真实报错，跳过的步骤明说跳过了。
**不要粉饰，也不要为了让汇报好看而略过没验的部分。**

**汇报给谁**：给屋主，同时也是给总控窗口（管六个仓库的那个会话）。它需要掌握
每个项目各自在干什么，否则跨项目的问题（依赖版本不一致、家族设计契约走样、
同一个坑在两个仓库各踩一次）没人看得见。

**总控那边不会干等你汇报**——它会跑 `bash tools/deploy/whats-new.sh` 主动拉增量。
所以你就算忘了说，提交本身也会被看到。但**提交信息是你唯一的表达机会**：
写清「改了什么、为什么、验到什么程度」，不要写「优化若干」。

2026-09-04 就漏过一次：主项目窗口连推三个提交（滚动叙事 + 两轮显示修复），
总控一无所知，是事后跑自查才发现本地领先远端。whats-new.sh 就是为了补这个洞。

## 三个维护脚本

```bash
bash tools/deploy/whats-new.sh        # 上次看过之后，六个仓库各自发生了什么
bash tools/deploy/sync-all.sh         # 一次提交推送全部六个仓库，推后核对
bash tools/deploy/check-all-repos.sh  # 一次扫六处红灯（CI、PR、安全告警、可见性、通知、同步状态）
```

## 响应式排版复核补充（2026-09-28）

改布局不能只检查横向溢出：旧断点的grid行号和auto外边距可能仍然生效，在1101–1120px把正文推到下一行，或在2552px以上把正文居中成窄柱。布局覆盖时显式核对行、列、外边距及抽屉子规则；至少检查1100/1101/1120和2552px下目录边界、正文起点、卡片宽度。视口宽度测试与实际浏览器缩放、真机触摸分开记录，不能互相冒充。

## 办理分组与原色（2026-10-01）

不要根据整段中出现“材料”“传票”“注意事项”就移动环节：原文操作中会同时出现这些词。workflow-guide.js只认明确主标题，遇条件分支/交错流程保持原序。

签章索引必须保留来源和适用情形。“主管授权”不是主管签字，“复印”不是复审，“加盖公章”没有写谁盖时不能补成客户盖章。阅读下一环节也不能表示业务办理完成。

正文数据和格式数据须配套更新。employee-handbook-formatting.js记录原块和UTF-16范围；禁止全局同词着色。交易码识别只作用于原始文字，不可在带style的HTML上做数字正则替换，否则会把颜色值当交易码而损坏属性。

四环节在分环节模式下有隐藏DOM。定位原句/交易入口前须先显出所属环节；隐藏时停用基于滚动几何的自动阶段切换。工具抽屉内的跳转须先关闭抽屉，再把焦点交给正文。
