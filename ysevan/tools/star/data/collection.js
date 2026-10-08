/*
 * 设计合集 · 收藏数据（collection.html 读它）
 *
 * 加一条只改这里，不改页面：在数组末尾照格式补一个对象即可。
 * 用 .js 不用 .json：页面要能双击用 file:// 打开，Chrome 在 file:// 下 fetch 本地 JSON 会被拦。
 *
 * 字段：
 *   id      唯一，小写字母、数字、连字符
 *   kind    四种之一：skill（好看的 skill）| project（有意思的项目）| prompt（提示词）| effect（特效与小游戏；小游戏在 tags 里加「小游戏」）
 *   name    名字
 *   link    公开网址；没有写 null
 *   source  本地位置（相对工作区根）或来源说明
 *   what    一句话说清它是什么（自己写，不抄原文）
 *   why     屋主觉得好在哪——只填屋主本人说过的话，并在 notes 里注明出处；没说过写 null，页面显示「待屋主补一句」
 *   tags    标签数组：技术 + 主题
 *   added   收录日期 YYYY-MM-DD
 *   notes   可选：吃显卡 / 用过 / 原作者 / 屋主改编了什么 / 落到了哪些项目
 *   text    可选：kind 为 prompt 时放提示词原文（逐字照抄）
 *   demo    现场演示（每条都有；屋主2026-10-08：「每一个提到的设计都需要在旁边可以现场演示出来效果的」）。四种：
 *     { type: "iframe", src, vw?, heavy?, sound?, muted?, online?, note?, choices? }   老站特效与小游戏，卡里一个16:10演示框
 *         src     从 tools/star/collection.html 出发的相对路径；指向老站的一律以 ../../../ 开头
 *                 （以后发布到 old/ysevan/tools/star/ 时由发布脚本统一改写成 ../../../，这里不用管）
 *         vw      可选：老页面写死了像素宽、框太窄会被裁时，按这个宽度排版再整体缩进框里
 *         heavy   true＝吃显卡（照 old/网站素材/index.html 的 heavy 标注）：不自动跑，点「运行（吃显卡）」才跑
 *         sound   有声音时写清怎么响（卡上显示「有声音，点了才放：…」）；有声音的不自动跑。
 *                 演示框带 allow="autoplay 'none'"，老页面一打开就自动放的音乐在框里放不出来，这种加 muted: true
 *         online  可选：file:// 下跑不起来的（Construct 2 的两个游戏，图片被当跨域拦下）在双击打开时改用的线上地址；
 *                 http(s) 下一律用 src。有 online 的不自动跑，点了才联网加载
 *         note    可选：怎么玩、开头会黑几秒这类提示
 *         choices 可选：合集用，[{ label, src, vw?, sound?, note? }]，卡上一排按钮选一个跑，第一个是默认
 *       没有 heavy / sound / online / choices 的，滚到就自动跑；全站同一时间只跑一个，滚出视口就卸掉。
 *     { type: "flip", front, back: { img, w, h, alt, caption, live? } 或 back: { sketch, caption } }
 *         skill、project、提示词：原地翻面卡。正面 front 一句话说它是什么，背面放效果截图（assets/shots/ 里的 webp）
 *         或静态示意（sketch：font-dial / hold-record，画在 collection.js 里）；live 是「去看活样例」的站内链接
 *     { type: "link", href, img, w, h, mini? }   已经在交互页有活样例的：缩略图 +「去交互页玩」
 *         mini: "oldnav" 时缩略图是页面现画的小窗，底图按相对路径引用老站原图（不拷进 star）
 *     { type: "shot", img?, w?, h?, alt?, reason }   实在不能现场跑的（Windows 程序）：有截图放截图，没有就写明为什么
 *   截图放 assets/shots/：webp、长边≤600、每张≤80KB；由本机量具 make-shots.mjs 生成（量具不进仓库，跑法见 README「更新规矩」）。
 *
 * 文案口径：中英文之间不加空格，数字和中文之间不留空（「共12题」），URL 两侧留空格。
 * 老站条目 link 一律 null；source 是它在 old/ 下的路径（相对工作区根）。
 * 【吃显卡】没独显的机器会卡（屋主台式机没有独显）；【用过】真用进过老站。
 */
window.STAR_COLLECTION = [

  /* ───────── skill ───────── */
  {
    id: "remotion-best-practices",
    kind: "skill",
    name: "remotion-best-practices",
    link: "https://github.com/remotion-dev/skills",
    source: "tools/travel/.agents/skills/remotion-best-practices",
    what: "Remotion官方的Agent Skill总入口：按任务把AI引到对应的子技能，覆盖新建视频与项目、React写法（时序、转场、字幕、音频、3D、字体等）、地图、音视频处理、渲染、Studio、SaaS集成、查文档和升级。",
    why: null,
    tags: ["视频", "Remotion", "React", "Agent Skill"],
    added: "2026-09-27",
    notes: "版本4.0.529，和travel用的Remotion同版。travel的README把它记为「Remotion官方Skill」，随项目保留提交cf49eff5d4463b33966b6618c83f7295797dd028；travel的AGENTS.md要求改视频合成前先读它的SKILL.md。本身只是一张路由表，下面11个子技能：remotion-create、remotion-markup、remotion-maps、remotion-multimedia、remotion-interactivity、remotion-render、remotion-studio、remotion-captions、remotion-saas、remotion-docs、remotion-upgrade；另带一份给Codex用的agents/openai.yaml。",
    demo: {
      type: "flip",
      front: "Remotion官方给AI的写法手册",
      back: {
        img: "assets/shots/remotion-travel.webp",
        w: 476,
        h: 600,
        alt: "travel视频的一帧：杭州示例路线画在OSM底图上",
        caption: "travel照它写的竖屏旅行视频（杭州示例：OSM底图＋手工示意路线），第420帧的上半截。"
      }
    }
  },

  /* ───────── project ───────── */
  {
    id: "holo-card-studio",
    kind: "project",
    name: "Holo Card Studio",
    link: "https://github.com/EverettFish/holo-card-studio",
    source: "tools/card（git remote里的upstream）",
    what: "一个Codex Skill：说一句话就做出一张随视角流光溢彩的3D全息闪卡——画好四层图、搭Blender场景、组装成能拖着转和翻面的Three.js网页。",
    why: null,
    tags: ["3D", "全息卡", "three.js", "Blender", "Codex Skill"],
    added: "2026-09-27",
    notes: "卡集tools/card的上游，MIT许可，只拉不推（我们的私有仓是Ysevan/Ysevan_card）。拿它做了什么：屋主用它的Skill做了十三张卡的「蓝调幻光·闪卡集」（原有四张，2026-09-23又加了九张），在collection/里另做了自己的画廊——Cover Flow选卡台、苹果液态玻璃风外壳、按压倾斜；页脚写明代码基于holo-card-studio与three.js（MIT）并附许可全文。上游README注明实现教程来自小红书@乌托邦的香蕉。出处：tools/card/README.md开头、tools/card/CLAUDE.md「两个远端，方向不一样」、tools/card/collection/README.md。",
    demo: {
      type: "flip",
      front: "说一句话，做一张3D全息闪卡",
      back: { img: "assets/shots/holo-card.webp", w: 432, h: 600, alt: "卡集「蓝调幻光」里的一张卡：星轨观测", caption: "屋主用它做的卡集「蓝调幻光」里的一张（星轨观测）封面；这里是平面图，流光要在卡集里拖着转才看得到。" }
    }
  },

  /* ───────── prompt：屋主给的六个交互组件（2026-09-27） ───────── */
  {
    id: "prompt-multi-select-filter",
    kind: "prompt",
    name: "多选筛选标签",
    link: null,
    source: "tools/star/docs/sources/six-components.md",
    what: "一排可多选的筛选胶囊：选中时长出对勾、底色铺满、相邻让位、数量跳动。",
    why: null,
    tags: ["交互", "筛选", "FLIP", "aria-pressed"],
    added: "2026-09-27",
    notes: "按「只升级已有交互、不为套组件造新功能」逐家核对。plan：做了，但只升级手感——全部任务的状态筛选仍是单选（改多选等于改筛选规则，算新功能），选中那枚长出对勾、底色从左铺满、相邻FLIP让位、计数跳一下，一条隐藏的aria-live播报「显示N项」；笔记页标签筛选同样处理但不铺底色。刷刷：一度做在专项练习的题型、难度、混合题库三排，屋主看后觉得不如原来，撤回——要好看，不要更紧凑，以后先出样张再落代码。岗岗：分类是单选切换，没有按分类筛选，不做。小屋：随笔和归档都没有筛选，套上去等于补回被禁掉的标签云和分类导航，不做。old：总览页顶上的分类是锚点不是筛选，不做。卡集：没做。出处：tools/plan/docs/BUSINESS_LOGIC.md「交互组件轮：哪些做了、哪些不做」；tools/shua/design-proposal.md「专项练习的筛选标签：做过，撤回」；tools/gang/design-proposal.md「六个组件的核对表」；Ysevan_web/docs/xiaowu-ui-spec.md「明确不存在的元素」；old/说明.md 2026-09-27两条整理记录。",
    text: "多选筛选标签：做一排可多选的筛选标签，选中时左侧长出对勾，底色填满宽度平滑撑开，相邻标签同步让位，筛选按钮上的数量跳动更新",
    demo: {
      type: "flip",
      front: "选中长对勾、底色铺满、邻居让位",
      back: {
        img: "assets/shots/ix-filter.webp",
        w: 600,
        h: 269,
        alt: "交互页筛选标签样例：「收件箱」那枚选中，左侧对勾、底色铺满",
        caption: "落地的是plan的单选状态筛选（只升级手感）；多选版刷刷做过、屋主看后撤回，交互页也留了档。",
        live: "interaction.html#ix-filter"
      }
    }
  },
  {
    id: "prompt-removable-tags",
    kind: "prompt",
    name: "可删除的标签",
    link: null,
    source: "tools/star/docs/sources/six-components.md",
    what: "输入框里的一组可删除标签：点叉号后缩成圆点消失，后面的依次补位，框跟着变矮。",
    why: null,
    tags: ["交互", "标签", "FLIP", "删除动画"],
    added: "2026-09-27",
    notes: "按「只升级已有交互、不为套组件造新功能」逐家核对。刷刷：做在搜题框——选中的联想变成框里可删除的标签；删除时底色层缩成真圆点再淡掉（共240ms），后面的标签FLIP依次补位、错峰24ms；框的高度不做动画，补位走完一次性收缩。plan：任务没有标签字段，挪到笔记的标签输入上做（原来是逗号分隔的文本框），点叉号立刻落库，缩点再补位。岗岗、old：没有标签输入，没做。小屋、卡集：没做。出处：tools/shua/design-proposal.md「搜题框的输入联想与标签」；tools/plan/docs/BUSINESS_LOGIC.md「笔记页」「交互组件轮：哪些做了、哪些不做」。",
    text: "可删除的标签：在输入框里做一组可删除的标签，点击叉号时标签缩成圆点后消失，后续标签依次平滑补位，输入框高度随之收缩",
    demo: {
      type: "flip",
      front: "点叉号，缩成圆点再消失",
      back: {
        img: "assets/shots/ix-tags.webp",
        w: 600,
        h: 153,
        alt: "交互页可删除标签样例：框里七枚带叉号的标签",
        caption: "交互页「可删除标签＋联想」：点叉号，底色缩成圆点再没掉，后面的错峰补位，框最后一次收矮。",
        live: "interaction.html#ix-tags"
      }
    }
  },
  {
    id: "prompt-autocomplete-popover",
    kind: "prompt",
    name: "输入联想浮层",
    link: null,
    source: "tools/star/docs/sources/six-components.md",
    what: "边输边在光标旁弹出联想列表，选中后变成标签插进正文、浮层收起。",
    why: null,
    tags: ["交互", "联想", "combobox", "输入法"],
    added: "2026-09-27",
    notes: "按「只升级已有交互、不为套组件造新功能」逐家核对。刷刷：做在搜题框，只联想现成的题库名和常用术语，最多8条，浮层左端跟着光标，选中后以标签插进搜索框。plan：挪到笔记标签上做，输入#弹出当前库已有的标签。岗岗：做在顶栏搜索框，边输边出、选中直达；「以标签插入正文」那一半不做，阅读器没有正文。old：首页搜索升级成combobox联想框，Esc先收浮层再清空，同样不做插标签那一半。小屋、卡集：没做。几家回车确认前都先判isComposing，输入法选词的回车不算提交。出处：tools/shua/design-proposal.md「搜题框的输入联想与标签」；tools/plan/docs/BUSINESS_LOGIC.md「笔记页」；tools/gang/design-proposal.md「六个组件的核对表」；old/说明.md「首页搜索联想、素材卡片按压」。",
    text: "输入联想浮层：输入时在光标旁弹出联想列表，随输入实时筛选，选中后以标签形式插入正文，浮层收起",
    demo: {
      type: "flip",
      front: "边输边弹联想，选中插成标签",
      back: {
        img: "assets/shots/ix-tags-suggest.webp",
        w: 600,
        h: 486,
        alt: "交互页标签输入框里打了#，下面弹出已有标签的联想浮层",
        caption: "交互页「可删除标签＋联想」：输入#弹出已有标签，回车插成一枚；只联想不插标签的版本见「联想浮层规矩」。",
        live: "interaction.html#ix-tags"
      }
    }
  },
  {
    id: "prompt-font-size-dial",
    kind: "prompt",
    name: "拨动字号刻度",
    link: null,
    source: "tools/star/docs/sources/six-components.md",
    what: "键盘顶上一排横向字号刻度，左右拨动时正文字号实时跟着变，停手吸附到最近一档。",
    why: null,
    tags: ["交互", "字号", "吸附", "手机"],
    added: "2026-09-27",
    notes: "没有项目对口，没做。plan：笔记正文、任务备注有编辑区，但工具条和字号偏好都得新造，桌面上也没有「键盘顶部」；岗岗：没有字号调节，字号靠clamp随窗口和浏览器缩放变化；old：没有正文编辑。刷刷、卡集、小屋的文档里没单独提这一条，代码里也没有可升级的字号控件。出处：tools/plan/docs/BUSINESS_LOGIC.md「交互组件轮：哪些做了、哪些不做」；tools/gang/design-proposal.md「六个组件的核对表」；old/说明.md「首页搜索联想、素材卡片按压」。",
    text: "拨动字号刻度：在键盘顶部加一排横向字号刻度，当前值居中高亮，两侧渐隐，左右拨动时正文字号实时变化，停下后吸附到最近的刻度",
    demo: {
      type: "flip",
      front: "键盘顶上拨字号，停手吸附",
      back: { sketch: "font-dial", caption: "没有项目做过：plan、岗岗、old都没有可升级的字号控件，桌面上也没有「键盘顶部」，不为它新造功能。上图是照提示词画的静态示意。" }
    }
  },
  {
    id: "prompt-press-tilt-card",
    kind: "prompt",
    name: "按压倾斜卡片",
    link: null,
    source: "tools/star/docs/sources/six-components.md",
    what: "按下时朝触点轻轻倾斜、缩小一点，背后光斑聚到指尖，松手弹性复原的卡片。",
    why: null,
    tags: ["交互", "按压反馈", "3D倾斜", "弹簧"],
    added: "2026-09-27",
    notes: "按「只升级已有交互、不为套组件造新功能」逐家核对。刷刷：做在首页「练习方式」入口行，倾角按行宽压（鼠标最多约1°、触屏约3°），光斑垫在列表底下不放行内；滚动引起的取消160ms直接回位不回弹。卡集：做在Cover Flow正中那张和查看器里的卡，边上最多7°、缩到.96，全息光聚到触点，弹簧复原；画廊里松开才进查看器。old：网站素材总览页卡片（最多5°、缩到97.5%、暖纸色柔光），后来放开到老站本身：书生子白和EV's world的友链卡片、ACGN作品横条、Game页游戏入口（做在提交4702be0当时的页面上；其中书生子白两页和Game页后来在老站整理中移出工作树（old@d216d8f），EV's world两页还在，去向以old/说明.md为准）；链接是#的占位卡片不接。plan：没有任务卡片，整行倾斜会让「按的是哪个」变模糊，不做。岗岗：目录是列表不是卡片，不做。小屋：工具页没有卡片，做成可按压会破掉「恰好一个tab stop」，不做。出处：tools/shua/design-proposal.md「首页入口行的按压反馈」；tools/card/CLAUDE.md「按压」；old/说明.md 2026-09-27两条整理记录；tools/plan/docs/BUSINESS_LOGIC.md「交互组件轮」；Ysevan_web/docs/xiaowu-ui-spec.md「不做按压倾斜」。",
    text: "按压倾斜卡片：做一张可按压的卡片，按下时朝触点方向轻微倾斜并缩小一点，背后的光斑向触点聚拢，松手弹性复原",
    demo: {
      type: "flip",
      front: "按哪边哪边沉，松手弹回",
      back: {
        img: "assets/shots/ix-press.webp",
        w: 600,
        h: 388,
        alt: "交互页按压倾斜样例：按住卡片左上角，光团聚到那里",
        caption: "交互页「按压倾斜」：截图是按住卡片左上角那一刻；刷刷、卡集、老站都落了这一条。",
        live: "interaction.html#ix-press"
      }
    }
  },
  {
    id: "prompt-hold-to-record",
    kind: "prompt",
    name: "长按变录音条",
    link: null,
    source: "tools/star/docs/sources/six-components.md",
    what: "底部双按钮组：长按麦克风横向拉长成带实时波形的录音条，加号转成取消，松手复原。",
    why: null,
    tags: ["交互", "长按", "语音", "手机"],
    added: "2026-09-27",
    notes: "谁都没做：没有一个项目有语音输入，不为它新造麦克风功能（控制室下发时就定了这一轮谁都不做）。出处：tools/star/docs/sources/six-components.md「四家共同规矩」；tools/plan/docs/BUSINESS_LOGIC.md「交互组件轮」；tools/gang/design-proposal.md「六个组件的核对表」。",
    text: "长按变录音条：底部做一个双按钮组，长按麦克风时，按钮组横向拉长成录音条，并显示实时波形，加号旋转成取消，松手复原",
    demo: {
      type: "flip",
      front: "长按麦克风，拉长成录音条",
      back: { sketch: "hold-record", caption: "没有项目做过：没有一个项目有语音输入，不为它新造麦克风功能。上图是照提示词画的静态示意。" }
    }
  },

  /* ───────── effect：老站 old/网站素材 · 节日与表白 ───────── */
  {
    id: "old-national-day",
    kind: "effect",
    name: "国庆快乐",
    link: null,
    source: "old/网站素材/节日与表白/国庆快乐/国庆快乐.html",
    what: "纯CSS画一面五星红旗，点按钮放音乐、满屏放烟花的国庆祝福页。",
    why: null,
    tags: ["老站", "节日", "国庆", "烟花", "CSS3"],
    added: "2026-09-27",
    notes: "屋主改编：2019年国庆自己拼装，按钮文案和音乐是屋主加的。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/国庆快乐/国庆快乐.html", vw: 800, sound: "页面里的「国庆节快乐！」按钮放音乐和烟花" }
  },
  {
    id: "old-christmas-snow",
    kind: "effect",
    name: "圣诞雪花",
    link: null,
    source: "old/网站素材/节日与表白/圣诞雪花/圣诞树.html",
    what: "纯CSS搭的3D圣诞树，顶上星星闪、四周雪花飘。",
    why: null,
    tags: ["老站", "节日", "圣诞", "CSS3", "CSS 3D"],
    added: "2026-09-27",
    notes: "屋主改编：加了圣诞歌。原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/圣诞雪花/圣诞树.html", vw: 800, sound: "原页面一打开就自动放圣诞歌；演示框不许自动放音，框里听不到", muted: true }
  },
  {
    id: "old-christmas-tree",
    kind: "effect",
    name: "圣诞树",
    link: null,
    source: "old/网站素材/节日与表白/圣诞树/Christmas-line.html",
    what: "线条一笔笔画出一棵圣诞树，配祝福语和音乐。",
    why: null,
    tags: ["老站", "节日", "圣诞", "GSAP", "Canvas 2D"],
    added: "2026-09-27",
    notes: "屋主改编：2024年12月改了祝福语送人。原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/圣诞树/Christmas-line.html", vw: 560, sound: "点一下画面开始画树，同时去网易云取背景音乐（老页面写死的外链）" }
  },
  {
    id: "old-fireworks-2020",
    kind: "effect",
    name: "跨年烟花",
    link: null,
    source: "old/网站素材/节日与表白/跨年烟花/index.html",
    what: "满天烟花，金色主烟花在空中炸出「2020」。",
    why: null,
    tags: ["老站", "节日", "跨年", "烟花", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。【用过】书生子白的MIKU子站。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/跨年烟花/index.html", vw: 800 }
  },
  {
    id: "old-fireworks-text",
    kind: "effect",
    name: "过年烟花",
    link: null,
    source: "old/网站素材/节日与表白/过年烟花/index.html",
    what: "烟花炸开后碎片飞到一起，拼成一行字。",
    why: null,
    tags: ["老站", "节日", "过年", "烟花", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。拼出的字现在写死成素材站水印「17sucai」，改成祝福语就能用。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/过年烟花/index.html" }
  },
  {
    id: "old-birthday",
    kind: "effect",
    name: "生日祝福",
    link: null,
    source: "old/网站素材/节日与表白/生日祝福/index.html",
    what: "一步步点按钮：开灯、放音乐、挂横幅、放气球、端蛋糕、点蜡烛，最后滚出祝福语。",
    why: null,
    tags: ["老站", "节日", "生日", "jQuery", "CSS3"],
    added: "2026-09-27",
    notes: "收藏，原作者：AJLoveChina（开源项目AJLoveChina/birthday）。2026-09-25整理时改成直接引用编译好的cake.css，双击打开也能完整跑完。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/生日祝福/index.html", vw: 640, sound: "一步步点按钮，点到放音乐那一步才响" }
  },
  {
    id: "old-heart-rainbow",
    kind: "effect",
    name: "心跳1·彩虹心",
    link: null,
    source: "old/网站素材/节日与表白/心跳合集/心跳1/index.html",
    what: "彩色粒子沿心形线排开，形状不停变化。",
    why: null,
    tags: ["老站", "表白", "爱心", "粒子", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/心跳合集/心跳1/index.html", vw: 640 }
  },
  {
    id: "old-heart-lines",
    kind: "effect",
    name: "心跳2·线条心",
    link: null,
    source: "old/网站素材/节日与表白/心跳合集/心跳2/index.html",
    what: "一根根线条组成的心形。",
    why: null,
    tags: ["老站", "表白", "爱心", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者：Johan Karlsson。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/心跳合集/心跳2/index.html" }
  },
  {
    id: "old-heart-gather",
    kind: "effect",
    name: "心跳3·汇聚彩心",
    link: null,
    source: "old/网站素材/节日与表白/心跳合集/心跳3/index.html",
    what: "粒子从四周慢慢聚成一颗彩色的心，开头几秒是黑屏。",
    why: null,
    tags: ["老站", "表白", "爱心", "粒子", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/心跳合集/心跳3/index.html", note: "开头几秒是黑屏，粒子慢慢聚过来。" }
  },
  {
    id: "old-heart-particles",
    kind: "effect",
    name: "心跳4·粒子心",
    link: null,
    source: "old/网站素材/节日与表白/心跳合集/心跳4/demo.html",
    what: "粉色粒子沿心形轮廓不停向外喷。",
    why: null,
    tags: ["老站", "表白", "爱心", "粒子", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/心跳合集/心跳4/demo.html", vw: 640 }
  },
  {
    id: "old-heart-neon",
    kind: "effect",
    name: "心跳5·霓虹心",
    link: null,
    source: "old/网站素材/节日与表白/心跳合集/心跳5/index.html",
    what: "着色器画出的霓虹发光心形。",
    why: null,
    tags: ["老站", "表白", "爱心", "WebGL", "着色器"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/心跳合集/心跳5/index.html" }
  },
  {
    id: "old-heart-like",
    kind: "effect",
    name: "心跳6·点赞",
    link: null,
    source: "old/网站素材/节日与表白/心跳合集/心跳6/index.html",
    what: "一个点赞按钮，点下去小爱心沿路径四散飞出。",
    why: null,
    tags: ["老站", "表白", "爱心", "anime.js", "SVG"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。【用过】EV's world的Blog。old/game/心跳6/里另有一份，内容和这份不完全相同。",
    demo: { type: "iframe", src: "../../../网站素材/节日与表白/心跳合集/心跳6/index.html", note: "点框里的爱心按钮。" }
  },
  {
    id: "old-love-vb6",
    kind: "effect",
    name: "表白小程序",
    link: null,
    source: "old/网站素材/节日与表白/表白小程序.exe",
    what: "网上流传的VB6表白小程序。",
    why: null,
    tags: ["老站", "表白", "VB6", "Windows"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。不是网页：Windows的exe程序。",
    demo: { type: "shot", reason: "没有现场演示：这是VB6写的Windows程序（old/网站素材/节日与表白/表白小程序.exe），浏览器里跑不了；老站也没存它的截图。" }
  },

  /* ───────── effect：老站 · 星空宇宙 ───────── */
  {
    id: "old-starfield-layers",
    kind: "effect",
    name: "璀璨群星",
    link: null,
    source: "old/网站素材/特效/星空宇宙/璀璨群星/index.html",
    what: "一层层彩色星空朝镜头推过来。",
    why: null,
    tags: ["老站", "星空", "WebGL", "着色器"],
    added: "2026-09-27",
    notes: "收藏，出自The Art of Code的星空教程。",
    demo: { type: "iframe", src: "../../../网站素材/特效/星空宇宙/璀璨群星/index.html", heavy: true, note: "老站没标吃显卡；2040软件渲染档实测开着它整页掉到约30帧（量了两次，5秒里都有四到五成的帧超过25ms），所以也改成点了才跑。" }
  },
  {
    id: "old-hyperspace",
    kind: "effect",
    name: "超光速粒子",
    link: null,
    source: "old/网站素材/特效/星空宇宙/超光速粒子/index.html",
    what: "星空背景，按住鼠标就跃迁进超空间。",
    why: null,
    tags: ["老站", "星空", "粒子", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/星空宇宙/超光速粒子/index.html", note: "在框里按住鼠标就跃迁。" }
  },
  {
    id: "old-galaxy",
    kind: "effect",
    name: "银河系星云",
    link: null,
    source: "old/网站素材/特效/星空宇宙/银河系星云/index.html",
    what: "4万个点组成的旋臂星系，能拖动换视角。",
    why: null,
    tags: ["老站", "星空", "three.js", "WebGL"],
    added: "2026-09-27",
    notes: "收藏，原作者：Kevin Levron。【吃显卡】",
    demo: { type: "iframe", src: "../../../网站素材/特效/星空宇宙/银河系星云/index.html", heavy: true, vw: 800, note: "可以拖动换视角。" }
  },
  {
    id: "old-draw-milky-way",
    kind: "effect",
    name: "绘制银河",
    link: null,
    source: "old/网站素材/特效/星空宇宙/绘制银河/demo.html",
    what: "鼠标划过的地方撒下星星，连成一条银河。",
    why: null,
    tags: ["老站", "星空", "粒子", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。【用过】EV's world的MIKU子站。",
    demo: { type: "iframe", src: "../../../网站素材/特效/星空宇宙/绘制银河/demo.html", note: "鼠标在框里划过才撒星星，不动是黑的。" }
  },
  {
    id: "old-energy-rays",
    kind: "effect",
    name: "能量射线",
    link: null,
    source: "old/网站素材/特效/星空宇宙/能量射线/index.html",
    what: "彩色光线从中心向外喷发，按住鼠标会变样。",
    why: null,
    tags: ["老站", "星空", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/星空宇宙/能量射线/index.html", note: "在框里按住鼠标会变样。" }
  },
  {
    id: "old-fire-portal",
    kind: "effect",
    name: "火焰传送门",
    link: null,
    source: "old/网站素材/特效/星空宇宙/传送门/火焰传送门.html",
    what: "一圈火花越转越快，像奇异博士开的传送门。",
    why: null,
    tags: ["老站", "星空", "p5.js"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。old/说明.md里叫「传送门」。",
    demo: { type: "iframe", src: "../../../网站素材/特效/星空宇宙/传送门/火焰传送门.html", vw: 800 }
  },
  {
    id: "old-space-tunnel",
    kind: "effect",
    name: "时空隧道",
    link: null,
    source: "old/网站素材/特效/星空宇宙/时空隧道/时空隧道.html",
    what: "粒子组成、带雾气的隧道。",
    why: null,
    tags: ["老站", "星空", "粒子", "three.js"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/星空宇宙/时空隧道/时空隧道.html" }
  },
  {
    id: "old-time-tunnel",
    kind: "effect",
    name: "时间隧道",
    link: null,
    source: "old/网站素材/特效/星空宇宙/时间隧道/时间隧道.html",
    what: "360条彩虹线围成一条不停缩放的隧道。",
    why: null,
    tags: ["老站", "星空", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/星空宇宙/时间隧道/时间隧道.html" }
  },

  /* ───────── effect：老站 · 粒子 ───────── */
  {
    id: "old-particle-vortex",
    kind: "effect",
    name: "粒子旋涡",
    link: null,
    source: "old/网站素材/特效/粒子/粒子旋涡/demo.html",
    what: "3D粒子漩涡，镜头绕着它转。",
    why: null,
    tags: ["老站", "粒子", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/粒子/粒子旋涡/demo.html" }
  },
  {
    id: "old-particle-explosion",
    kind: "effect",
    name: "粒子爆炸",
    link: null,
    source: "old/网站素材/特效/粒子/粒子爆炸/index.html",
    what: "100万个粒子，点一下炸开再聚回来。",
    why: null,
    tags: ["老站", "粒子", "three.js", "GPU计算"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。【吃显卡】",
    demo: { type: "iframe", src: "../../../网站素材/特效/粒子/粒子爆炸/index.html", heavy: true, vw: 800, note: "点一下炸开，再慢慢聚回来。" }
  },
  {
    id: "old-ion-cleaner",
    kind: "effect",
    name: "离子清理工",
    link: null,
    source: "old/网站素材/特效/粒子/离子清理工/index.html",
    what: "鼠标吸住或推开粒子，粒子挨近了会连线。",
    why: null,
    tags: ["老站", "粒子", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/粒子/离子清理工/index.html", note: "左上角切换吸住或推开，鼠标在框里移动。" }
  },
  {
    id: "old-particle-morph",
    kind: "effect",
    name: "花里胡哨的粒子",
    link: null,
    source: "old/网站素材/特效/粒子/花里胡哨的粒子/demo.html",
    what: "点一下，粒子在球、环、锥、花瓶几种形状之间变形。",
    why: null,
    tags: ["老站", "粒子", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/粒子/花里胡哨的粒子/demo.html", vw: 640, note: "点一下换形状。" }
  },
  {
    id: "old-fountain",
    kind: "effect",
    name: "喷泉",
    link: null,
    source: "old/网站素材/特效/粒子/喷泉/index.html",
    what: "100万个粒子组成的彩色喷泉。",
    why: null,
    tags: ["老站", "粒子", "WebGL", "regl"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。【吃显卡】",
    demo: { type: "iframe", src: "../../../网站素材/特效/粒子/喷泉/index.html", heavy: true }
  },
  {
    id: "old-particle-fireworks",
    kind: "effect",
    name: "粒子烟火",
    link: null,
    source: "old/网站素材/特效/粒子/粒子烟火/粒子烟火.html",
    what: "看不见的方块边转边喷粒子，粒子再炸成更小的粒子。",
    why: null,
    tags: ["老站", "粒子", "烟花", "Babylon.js", "WebGL"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。【吃显卡】（总览页标了；old/说明.md列的吃显卡名单只有银河系星云、粒子爆炸、喷泉三项。）",
    demo: { type: "iframe", src: "../../../网站素材/特效/粒子/粒子烟火/粒子烟火.html", heavy: true }
  },

  /* ───────── effect：老站 · 其他 ───────── */
  {
    id: "old-line-flower",
    kind: "effect",
    name: "线条花",
    link: null,
    source: "old/网站素材/特效/其他/线条花/花.html",
    what: "彩虹色的万花尺花纹不停变换，整页约2KB。",
    why: null,
    tags: ["老站", "几何", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/其他/线条花/花.html", vw: 640 }
  },
  {
    id: "old-feed-fish",
    kind: "effect",
    name: "喂鱼啦",
    link: null,
    source: "old/网站素材/特效/其他/喂鱼啦/喂鱼啦.html",
    what: "点一下撒鱼食，字母小鱼游过来抢，整页约2KB。",
    why: null,
    tags: ["老站", "互动", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/其他/喂鱼啦/喂鱼啦.html", note: "点一下撒鱼食。" }
  },
  {
    id: "old-lightning-rain",
    kind: "effect",
    name: "闪电风暴雨",
    link: null,
    source: "old/网站素材/特效/其他/闪电风暴雨/闪电风暴雨.html",
    what: "雨丝、溅起的水花和随机闪电，背景跟着一闪。",
    why: null,
    tags: ["老站", "天气", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/其他/闪电风暴雨/闪电风暴雨.html" }
  },
  {
    id: "old-image-explode-carousel",
    kind: "effect",
    name: "图片爆炸轮播",
    link: null,
    source: "old/网站素材/特效/其他/图片爆炸轮播/index.html",
    what: "当前图片碎成小块飞散，切到下一张。",
    why: null,
    tags: ["老站", "轮播", "CSS3", "CSS 3D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/特效/其他/图片爆炸轮播/index.html", vw: 1000 }
  },
  {
    id: "old-image-cube-carousel",
    kind: "effect",
    name: "图片立方体轮播",
    link: null,
    source: "old/网站素材/特效/其他/图片立方体轮播/立方体轮播.html",
    what: "内外两层3D立方体一起转，每一面贴一张图。",
    why: null,
    tags: ["老站", "轮播", "CSS3", "CSS 3D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。【用过】书生子白的MIKU子站。",
    demo: { type: "iframe", src: "../../../网站素材/特效/其他/图片立方体轮播/立方体轮播.html", vw: 1000 }
  },
  {
    id: "old-fermi-paradox",
    kind: "effect",
    name: "费米悖论",
    link: null,
    source: "old/网站素材/特效/费米悖论-64k-demo",
    what: "Mercury小组2016年做的64KB实时渲染demo。",
    why: null,
    tags: ["老站", "demo", "64K", "Windows"],
    added: "2026-09-27",
    notes: "收藏，原作者：Mercury。不是网页：Windows的exe程序（1280×720和1920×1080两个版本），总览页点开看的是同目录的截图。",
    demo: {
      type: "shot",
      img: "assets/shots/fermi-paradox.webp",
      w: 600,
      h: 265,
      alt: "费米悖论demo的画面：红色行星的边缘与城市剪影",
      reason: "没有现场演示：这是64KB的Windows程序，浏览器里跑不了；图是它同目录自带的截图（old/网站素材/特效/费米悖论-64k-demo/screenshot.png）缩小。"
    }
  },

  /* ───────── effect：老站 · 小游戏 ───────── */
  {
    id: "old-game-plane",
    kind: "effect",
    name: "打飞机",
    link: null,
    source: "old/网站素材/小游戏/打飞机/index.html",
    what: "竖屏飞行射击，带商店和道具。",
    why: null,
    tags: ["老站", "小游戏", "Construct 2"],
    added: "2026-09-27",
    notes: "收藏，原作者：Piponga（2014），Construct 2商业模板。要用「打开老站」起本地服务器，双击打开会被浏览器以跨域为由拦下图片。",
    demo: { type: "iframe", src: "../../../网站素材/小游戏/打飞机/index.html", online: "https://old.ysevan.com/网站素材/小游戏/打飞机/", sound: "游戏音效，点进游戏才响" }
  },
  {
    id: "old-game-cube-jump",
    kind: "effect",
    name: "立方体跳跃",
    link: null,
    source: "old/网站素材/小游戏/立方体跳跃/HTML5/index.html",
    what: "点屏幕让方块往上跳台阶，附工程源文件（.capx）。",
    why: null,
    tags: ["老站", "小游戏", "Construct 2"],
    added: "2026-09-27",
    notes: "收藏，原作者不详，Construct 2商业模板。同样要用「打开老站」起本地服务器。",
    demo: { type: "iframe", src: "../../../网站素材/小游戏/立方体跳跃/HTML5/index.html", online: "https://old.ysevan.com/网站素材/小游戏/立方体跳跃/HTML5/", sound: "游戏音效，点进游戏才响" }
  },
  {
    id: "old-game-arrow-defense",
    kind: "effect",
    name: "箭头防御",
    link: null,
    source: "old/网站素材/小游戏/箭头防御/箭头防御.html",
    what: "炮台自动射箭拦截落下的红箭头，鼠标可以接管。",
    why: null,
    tags: ["老站", "小游戏", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/小游戏/箭头防御/箭头防御.html", note: "鼠标进框就接管炮台。" }
  },
  {
    id: "old-game-arrow-rain",
    kind: "effect",
    name: "箭头雨",
    link: null,
    source: "old/网站素材/小游戏/箭头雨/箭头雨.html",
    what: "黑客帝国风格的绿色箭头雨。",
    why: null,
    tags: ["老站", "小游戏", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/小游戏/箭头雨/箭头雨.html" }
  },
  {
    id: "old-game-stress-relief",
    kind: "effect",
    name: "解压小游戏",
    link: null,
    source: "old/网站素材/小游戏/解压小游戏/解压小游戏.html",
    what: "鼠标扫过粒子会变大，点一下炸开。",
    why: null,
    tags: ["老站", "小游戏", "粒子", "GSAP", "Canvas 2D"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。",
    demo: { type: "iframe", src: "../../../网站素材/小游戏/解压小游戏/解压小游戏.html", vw: 480, note: "鼠标扫过粒子会变大，点一下炸开。" }
  },
  {
    id: "old-game-typing",
    kind: "effect",
    name: "金山打字",
    link: null,
    source: "old/网站素材/小游戏/金山打字小游戏/index.html",
    what: "字母往下掉，按对应的键把它消掉。",
    why: null,
    tags: ["老站", "小游戏", "打字", "jQuery"],
    added: "2026-09-27",
    notes: "收藏，原作者不详。缺三张背景图，照样能玩。",
    demo: { type: "iframe", src: "../../../网站素材/小游戏/金山打字小游戏/index.html", vw: 640, note: "点「开始游戏」后按键盘；键盘要先点一下框里才接得到。" }
  },
  {
    id: "old-game-center",
    kind: "effect",
    name: "老站小游戏合集（old/game）",
    link: null,
    source: "old/game",
    what: "老站当年「游戏中心」里攒的一批网页小游戏和小玩具，比如2048、打地鼠、飞翔的恐龙、元素周期表、架子鼓。",
    why: null,
    tags: ["老站", "小游戏", "合集"],
    added: "2026-09-27",
    notes: "收藏，逐个来源未核实；old/说明.md记书生子白站里的小游戏出自CSDN博主海拥的Hexo博客（网页模板里有全站压缩包）。数量：old/game/下共29个（22个单页html，加7个带入口页的文件夹），不算两个随同名html走的素材文件夹（Tamagotchi-Game/、tiaotiaotang/）；old/说明.md在提交4702be0时写的「31个」是把这两个素材文件夹也算进去的数。当年的入口页game/Game.html（提交4702be0时还在，后来在老站整理中移出工作树（old@d216d8f），游戏改从old首页搜索直达）列了28项，指向27个不同页面（「神奇宝贝」和「Pokemon」是同一个文件，另有一项是站点根上的404小恐龙页）；guitar.html、js-drumkit/、心跳6/没挂在入口上。",
    demo: {
      type: "iframe",
      src: "../../../game/2048.html",
      vw: 640,
      note: "合集29个，这里放简介里点名的五个。",
      choices: [
        { label: "2048", src: "../../../game/2048.html", vw: 640, note: "方向键移动方块；先点一下框里。" },
        { label: "打地鼠", src: "../../../game/Catch-A-Mole.html", vw: 800, note: "样式表是老页面写死的外链（leonidlebedev.github.io），断网时排版会乱。" },
        { label: "飞翔的恐龙", src: "../../../game/Flappy-Dino.html", vw: 800, note: "空格或点击让恐龙往上飞。" },
        { label: "元素周期表", src: "../../../game/yuansuzhouqibiao/index.html", vw: 800, note: "d3从cdnjs取（老页面写死的外链），断网时出不来。" },
        {
          label: "架子鼓",
          src: "../../../game/js-drumkit/index.html",
          vw: 800,
          sound: "按键盘敲鼓才响",
          note: "老站搜索里的「架子鼓」（game/jiazigu.html）是存下来的CodeSandbox页面，脚本全指向codesandbox.io、本地会报错，这里放同一套鼓的本地版js-drumkit。"
        }
      ]
    }
  },
  {
    id: "old-transparent-nav",
    kind: "effect",
    name: "老站透明导航栏（书生子白首页）",
    link: null,
    source: "old@4702be0 Blog/Home.html；样例见 interaction.html#ix-oldnav",
    what: "封面大图顶上一条完全透明的导航：不画底、不描边、不模糊、不加阴影，字靠整张图压的一层60%黑罩看清；品牌和当前页纯白，其余半透明白，右端一颗绿胶囊。",
    why: "上面我画框的这个透明背景可以值得我们后面学习使用，可以保存工具架的star里面",
    tags: ["导航栏", "透明", "老站"],
    added: "2026-09-27",
    notes: "why是屋主原话：2026-09-27屋主，控制室转述（框的是书生子白首页顶上这条导航栏）。约2021年，模板是FREEHTML5.co的Drag & Drop Cards。页面Blog/Home.html后来在老站整理中移出工作树（old@d216d8f），去向以old/说明.md为准；封面原图old/Blog/images/Home2.jpeg还在，交互页的活样例按相对路径引用它，不拷进star（初音图版权属于原画师）。拆解、对比度实测（有黑罩半透明白链接中位4.8–5.2，去掉黑罩只剩2.8–4.0）、坑和与液态玻璃的对照都在交互页「透明导航栏」一条。出处：old@4702be0 Blog/Home.html:48–72；old@4702be0 Blog/css/cards.css:611「NAV STYLE #1」、:954（黑罩）。",
    demo: { type: "link", href: "interaction.html#ix-oldnav", img: "../../../Blog/images/Home2.jpeg", w: 1920, h: 1080, mini: "oldnav" }
  },

  /* ───────── effect：弹窗（屋主2026-10-08收集，原出处未知） ───────── */
  {
    id: "sheet-frosted",
    kind: "effect",
    name: "毛玻璃浮层（Frosted Glass Sheet）",
    link: null,
    source: "屋主2026-10-08收集，原出处未知；样例见 interaction.html#ix-sheet-frosted",
    what: "打开时背景模糊从0过渡到26px，.42白底的面板从0.94放大浮起，12个月份格按已用比例错开4帧从底部填满，1秒内收完。",
    why: null,
    tags: ["弹窗", "动画", "backdrop-filter"],
    added: "2026-10-08",
    notes: "样例另附四种做法的实测（原样、模糊固定只淡入、不模糊压暗、什么都不加），以及「降级做法」开关；背景模糊过渡在没显卡的机器上最贵。",
    demo: { type: "link", href: "interaction.html#ix-sheet-frosted", img: "assets/shots/sheet-frosted.webp", w: 337, h: 600 }
  },
  {
    id: "sheet-ring",
    kind: "effect",
    name: "圆环计数弹出（Ring Count Sheet）",
    link: null,
    source: "屋主2026-10-08收集，原出处未知；样例见 interaction.html#ix-sheet-ring",
    what: "底部面板0.5秒从屏幕外升到位、背景压暗到40%，落定后圆环用同一条曲线1.2秒画到剩余比例，中心数字同步从0滚到目标值。",
    why: null,
    tags: ["弹窗", "底部面板", "动画"],
    added: "2026-10-08",
    demo: { type: "link", href: "interaction.html#ix-sheet-ring", img: "assets/shots/sheet-ring.webp", w: 337, h: 600 }
  },
  {
    id: "sheet-ruler",
    kind: "effect",
    name: "刻度尺进度弹出（Tick Ruler Sheet）",
    link: null,
    source: "屋主2026-10-08收集，原出处未知；样例见 interaction.html#ix-sheet-ruler",
    what: "面板滑入后53根周刻度从左到右逐根变深、每根错开1帧，走到今天那根换成强调色停住；点「显示」，被遮住的编号在原地逐字展开、行高不变。",
    why: null,
    tags: ["弹窗", "底部面板", "动画"],
    added: "2026-10-08",
    demo: { type: "link", href: "interaction.html#ix-sheet-ruler", img: "assets/shots/sheet-ruler.webp", w: 337, h: 600 }
  },
  {
    id: "sheet-photo",
    kind: "effect",
    name: "照片抽屉弹出（Photo Drawer Sheet）",
    link: null,
    source: "屋主2026-10-08收集，原出处未知；样例见 interaction.html#ix-sheet-photo",
    what: "上半部照片从1.08缩回1铺满、暗角托住白色大字，抽屉用-22px的上外边距压住照片底边从下方推入，随后进度条涨到剩余比例。",
    why: null,
    tags: ["弹窗", "底部面板", "照片"],
    added: "2026-10-08",
    notes: "样例照片用old/background/bg-3.jpg（老站背景图里的一张山景，没有人像），按相对路径引用、没有拷进star。",
    demo: { type: "link", href: "interaction.html#ix-sheet-photo", img: "assets/shots/sheet-photo.webp", w: 337, h: 600 }
  },
  {
    id: "sheet-flip",
    kind: "effect",
    name: "原地翻面面板（Flip to Reveal）",
    link: null,
    source: "屋主2026-10-08收集，原出处未知；样例见 interaction.html#ix-sheet-flip",
    what: "点击后面板以1200px透视绕Y轴翻180度（0.8秒，cubic-bezier(.3,.7,.2,1)），翻到90度时换面，背面是出示用的编号和完整信息，再点沿原路翻回。",
    why: null,
    tags: ["弹窗", "3D翻面", "动画"],
    added: "2026-10-08",
    demo: { type: "link", href: "interaction.html#ix-sheet-flip", img: "assets/shots/sheet-flip.webp", w: 337, h: 600 }
  },
  {
    id: "sheet-pull",
    kind: "effect",
    name: "下拉展开面板（Pull Down Reveal）",
    link: null,
    source: "屋主2026-10-08收集，原出处未知；样例见 interaction.html#ix-sheet-pull",
    what: "面板从底部弹入落定，下沿留一截把手和一条虚线；往下拖把手，下半张沿虚线分离、跟手下移带2度摆动，过40%松手就展开完整信息，不到就弹回。",
    why: null,
    tags: ["弹窗", "拖动", "手势"],
    added: "2026-10-08",
    demo: { type: "link", href: "interaction.html#ix-sheet-pull", img: "assets/shots/sheet-pull.webp", w: 337, h: 600 }
  }
];
