// 首页搜索（2026-09-25 重写）：不依赖 jQuery，数据写在本文件里，双击打开网页（file://）也能搜。
// 数据由整理脚本从 game/Game.html 和 网站素材/index.html 提取，加页面新增游戏或素材后要重新生成。
(function () {
  'use strict';
  var INDEX = [{"t": "博客首页","u": "Blog/Home.html","c": "页面","k": "home 封面 eva welcome"},{"t": "Explore","u": "Blog/Explore.html","c": "页面","k": "探索 自我介绍 友链"},{"t": "Blog","u": "Blog/Blog.html","c": "页面","k": "博客 文章"},{"t": "ACGN","u": "Blog/ACGN.html","c": "页面","k": "二次元 miku 初音 洛天依 动漫"},{"t": "Blog2","u": "Blog/Blog2/Blog2.html","c": "页面","k": "博客卡片 hipster 如何安装dw 三七分 初音"},{"t": "高一二班回忆录","u": "Blog/2class/index.html","c": "页面","k": "班级 2class 同学 军训 运动会"},{"t": "MIKU的避风港","u": "Blog/miku1/miku.html","c": "页面","k": "miku 初音 v家"},{"t": "404页面","u": "404.html","c": "页面","k": "三体 小恐龙 404 智子"},{"t": "游戏中心","u": "game/Game.html","c": "页面","k": "game 小游戏 游戏"},{"t": "表白合集","u": "game/love/index.html","c": "页面","k": "love 表白 爱心"},{"t": "刷刷软件","u": "shua/index.html","c": "工具","k": "刷刷 刷题 题库 考试 练习 shua"},{"t": "网站素材","u": "网站素材/index.html","c": "页面","k": "素材 特效 节日 小游戏 模板"},{"t": "EV's world · Explore","u": "EVa/2021-EVs-world/Explore/Explore.html","c": "旧站","k": "ev evs world 2021 第一个网站"},{"t": "EV's world · Blog","u": "EVa/2021-EVs-world/Blog/index Blog.html","c": "旧站","k": "ev evs world 2021 博客"},{"t": "EV's world · ACGN","u": "EVa/2021-EVs-world/ACGN/index ACGN.html","c": "旧站","k": "ev evs world 2021 二次元 miku"},{"t": "元素周期表","u": "game/yuansuzhouqibiao/index.html","c": "游戏","k": "小游戏 game"},{"t": "Tower-Blocks","u": "game/Tower-Blocks/index.html","c": "游戏","k": "小游戏 game"},{"t": "嫖奶茶","u": "game/dazi.html","c": "游戏","k": "小游戏 game"},{"t": "射击游戏","u": "game/sheji.html","c": "游戏","k": "小游戏 game"},{"t": "压扁小鸟","u": "game/压扁小鸟/index.htm","c": "游戏","k": "小游戏 game"},{"t": "爱吹风的狮子","u": "game/Lion-Game.html","c": "游戏","k": "小游戏 game"},{"t": "圣诞老人撑杆过桥","u": "game/Santa-Claus.html","c": "游戏","k": "小游戏 game"},{"t": "Tamagotchi养成游戏","u": "game/Tamagotchi-Game.html","c": "游戏","k": "小游戏 game"},{"t": "果冻跳跳糖","u": "game/tiaotiaotang.html","c": "游戏","k": "小游戏 game"},{"t": "打地鼠小游戏","u": "game/Catch-A-Mole.html","c": "游戏","k": "小游戏 game"},{"t": "勇猛的兔子疯狂奔跑","u": "game/tutu.html","c": "游戏","k": "小游戏 game"},{"t": "神奇宝贝小游戏","u": "game/Pokemon.html","c": "游戏","k": "小游戏 game"},{"t": "2048小游戏","u": "game/2048.html","c": "游戏","k": "小游戏 game"},{"t": "消消乐","u": "game/xiaoxiaole.html","c": "游戏","k": "小游戏 game"},{"t": "可爱的开关","u": "game/switch.html","c": "游戏","k": "小游戏 game"},{"t": "2048响应式","u": "game/2048-Responsive.html","c": "游戏","k": "小游戏 game"},{"t": "飞翔的恐龙","u": "game/Flappy-Dino.html","c": "游戏","k": "小游戏 game"},{"t": "XXOO小游戏","u": "game/XXOO.html","c": "游戏","k": "小游戏 game"},{"t": "弹吉他","u": "game/js-guitar/index.html","c": "游戏","k": "小游戏 game"},{"t": "可可爱爱敲字","u": "game/jianpanxia.html","c": "游戏","k": "小游戏 game"},{"t": "架子鼓","u": "game/jiazigu.html","c": "游戏","k": "小游戏 game"},{"t": "Kill-The-King","u": "game/Kill-The-King.html","c": "游戏","k": "小游戏 game"},{"t": "Love-Overflow","u": "game/Love-Overflow.html","c": "游戏","k": "小游戏 game"},{"t": "略略略","u": "game/lueluelue.html","c": "游戏","k": "小游戏 game"},{"t": "sixswitch","u": "game/sixswitch.html","c": "游戏","k": "小游戏 game"},{"t": "扑克记忆消","u": "game/扑克记忆消/index.html","c": "游戏","k": "小游戏 game"},{"t": "心跳6","u": "game/心跳6/index.html","c": "游戏","k": "点赞 爱心"},{"t": "国庆快乐","u": "网站素材/节日与表白/国庆快乐/国庆快乐.html","c": "素材","k": "纯CSS画的五星红旗，点按钮放音乐、满屏烟花 CSS3 Ysevan"},{"t": "圣诞雪花","u": "网站素材/节日与表白/圣诞雪花/圣诞树.html","c": "素材","k": "纯CSS的3D圣诞树，星星闪、雪花飘，配了圣诞歌 CSS3 Ysevan"},{"t": "圣诞树","u": "网站素材/节日与表白/圣诞树/Christmas-line.html","c": "素材","k": "线条画出的圣诞树，配祝福语和音乐；2024年12月改了祝福语送人 GSAP + Canvas Ysevan"},{"t": "跨年烟花","u": "网站素材/节日与表白/跨年烟花/index.html","c": "素材","k": "满天烟花，金色主烟花炸出「2020」 Canvas 2D Ysevan"},{"t": "过年烟花","u": "网站素材/节日与表白/过年烟花/index.html","c": "素材","k": "烟花碎片飞过去拼成一行字；现在拼的是素材站水印，改成祝福语就能用 Canvas 2D Ysevan"},{"t": "生日祝福","u": "网站素材/节日与表白/生日祝福/index.html","c": "素材","k": "一步步点按钮：开灯、放音乐、挂横幅、放气球、端蛋糕、点蜡烛，最后滚出祝福语 jQuery + CSS3 AJLoveChina"},{"t": "心跳1·彩虹心","u": "网站素材/节日与表白/心跳合集/心跳1/index.html","c": "素材","k": "心形线上的彩色粒子，形状会变 Canvas 2D Ysevan"},{"t": "心跳2·线条心","u": "网站素材/节日与表白/心跳合集/心跳2/index.html","c": "素材","k": "线条组成的心形 Canvas 2D Johan Karlsson"},{"t": "心跳3·汇聚彩心","u": "网站素材/节日与表白/心跳合集/心跳3/index.html","c": "素材","k": "粒子从四周慢慢汇聚成彩色心形，开头几秒是黑的 Canvas 2D Ysevan"},{"t": "心跳4·粒子心","u": "网站素材/节日与表白/心跳合集/心跳4/demo.html","c": "素材","k": "粉色粒子从心形轮廓不断喷出 Canvas 2D Ysevan"},{"t": "心跳5·霓虹心","u": "网站素材/节日与表白/心跳合集/心跳5/index.html","c": "素材","k": "霓虹发光的心形 WebGL着色器 Ysevan"},{"t": "心跳6·点赞","u": "网站素材/节日与表白/心跳合集/心跳6/index.html","c": "素材","k": "点赞按钮，小爱心沿路径飞散 anime.js + SVG Ysevan"},{"t": "璀璨群星","u": "网站素材/特效/星空宇宙/璀璨群星/index.html","c": "素材","k": "多层彩色星空向前推进 WebGL The Art of Code星空教程"},{"t": "超光速粒子","u": "网站素材/特效/星空宇宙/超光速粒子/index.html","c": "素材","k": "星空，按住鼠标就跃迁进超空间 Canvas 2D Jhey Tompkins（推测）"},{"t": "银河系星云","u": "网站素材/特效/星空宇宙/银河系星云/index.html","c": "素材","k": "4万个点组成的旋臂星系，可以拖动视角 three.js Kevin Levron"},{"t": "绘制银河","u": "网站素材/特效/星空宇宙/绘制银河/demo.html","c": "素材","k": "动鼠标，划过的地方撒出星星，连成银河 Canvas 2D Ysevan"},{"t": "能量射线","u": "网站素材/特效/星空宇宙/能量射线/index.html","c": "素材","k": "中心向外喷发彩色光线，按住鼠标会变 Canvas 2D Jack Rugile（推测）"},{"t": "火焰传送门","u": "网站素材/特效/星空宇宙/传送门/火焰传送门.html","c": "素材","k": "一圈旋转加速的火花，像奇异博士的传送门 p5.js Ysevan"},{"t": "时空隧道","u": "网站素材/特效/星空宇宙/时空隧道/时空隧道.html","c": "素材","k": "粒子组成的隧道，带雾 three.js Ysevan"},{"t": "时间隧道","u": "网站素材/特效/星空宇宙/时间隧道/时间隧道.html","c": "素材","k": "360条彩虹线组成不停缩放的隧道 Canvas 2D Ysevan"},{"t": "粒子旋涡","u": "网站素材/特效/粒子/粒子旋涡/demo.html","c": "素材","k": "3D粒子漩涡，镜头绕着转 Canvas 2D cantelope（推测）"},{"t": "粒子爆炸","u": "网站素材/特效/粒子/粒子爆炸/index.html","c": "素材","k": "100万粒子，点击爆开再聚拢 three.js GPU计算 Ysevan"},{"t": "离子清理工","u": "网站素材/特效/粒子/离子清理工/index.html","c": "素材","k": "鼠标吸引或排斥粒子，靠近了会连线 Canvas 2D Ysevan"},{"t": "花里胡哨的粒子","u": "网站素材/特效/粒子/花里胡哨的粒子/demo.html","c": "素材","k": "点一下，粒子在球、环、锥、花瓶之间变形 Canvas 2D Ikeda Ryou（推测）"},{"t": "喷泉","u": "网站素材/特效/粒子/喷泉/index.html","c": "素材","k": "100万粒子的彩色喷泉 WebGL + regl Caleb Miller（推测）"},{"t": "粒子烟火","u": "网站素材/特效/粒子/粒子烟火/粒子烟火.html","c": "素材","k": "看不见的方块边转边喷粒子，再炸成子粒子 Babylon.js Ysevan"},{"t": "线条花","u": "网站素材/特效/其他/线条花/花.html","c": "素材","k": "彩虹色的万花尺花纹一直在变 Canvas 2D·约2KB Ysevan"},{"t": "喂鱼啦","u": "网站素材/特效/其他/喂鱼啦/喂鱼啦.html","c": "素材","k": "点一下撒鱼食，字母小鱼游过来 Canvas 2D·约2KB Ysevan"},{"t": "闪电风暴雨","u": "网站素材/特效/其他/闪电风暴雨/闪电风暴雨.html","c": "素材","k": "雨丝、溅水和随机闪电，背景跟着闪 Canvas 2D Ysevan"},{"t": "图片爆炸轮播","u": "网站素材/特效/其他/图片爆炸轮播/index.html","c": "素材","k": "图片碎成小块飞散，切到下一张 CSS3 3D Ysevan"},{"t": "图片立方体轮播","u": "网站素材/特效/其他/图片立方体轮播/立方体轮播.html","c": "素材","k": "内外两层3D立方体旋转，每面一张图 CSS3 Ysevan"},{"t": "费米悖论","u": "网站素材/特效/费米悖论-64k-demo/screenshot.png","c": "素材","k": "Mercury小组2016年的64KB实时渲染demo；点开看截图，程序是同目录的exe Windows程序 Mercury"},{"t": "打飞机","u": "网站素材/小游戏/打飞机/index.html","c": "素材","k": "竖屏飞行射击，有商店和道具 Construct 2 Piponga（2014）"},{"t": "立方体跳跃","u": "网站素材/小游戏/立方体跳跃/HTML5/index.html","c": "素材","k": "点屏幕让方块跳台阶；带工程源文件 Construct 2 DoonDookStudio"},{"t": "箭头防御","u": "网站素材/小游戏/箭头防御/箭头防御.html","c": "素材","k": "炮台自动射箭，拦截落下的红箭头，鼠标可以接管 Canvas 2D Ysevan"},{"t": "箭头雨","u": "网站素材/小游戏/箭头雨/箭头雨.html","c": "素材","k": "黑客帝国风格的绿色箭头雨 Canvas 2D Ysevan"},{"t": "解压小游戏","u": "网站素材/小游戏/解压小游戏/解压小游戏.html","c": "素材","k": "鼠标经过粒子会变大，点一下炸开 GSAP + Canvas 2D Ysevan"},{"t": "金山打字","u": "网站素材/小游戏/金山打字小游戏/index.html","c": "素材","k": "字母往下掉，按对应的键消掉；缺三张背景图，能玩 jQuery Ysevan"}];

  var input = document.getElementById('local-search-input');
  var box = document.getElementById('local-search-result');
  var nav = document.getElementById('switch-area');
  if (!input || !box) return;
  var form = input.form;
  var active = -1;
  var shown = [];

  function norm(s) { return String(s || '').toLowerCase(); }

  function search(q) {
    var terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var out = [];
    INDEX.forEach(function (e, i) {
      var title = norm(e.t), hay = title + ' ' + norm(e.k) + ' ' + norm(e.c);
      for (var j = 0; j < terms.length; j++) if (hay.indexOf(terms[j]) < 0) return;
      var score = 0;
      terms.forEach(function (w) {
        if (title.indexOf(w) === 0) score += 3;
        else if (title.indexOf(w) >= 0) score += 2;
        else score += 1;
      });
      out.push({ e: e, s: score, i: i });
    });
    out.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    return out.slice(0, 10).map(function (x) { return x.e; });
  }

  function clear() {
    box.innerHTML = '';
    box.classList.remove('is-open');
    if (nav) nav.style.display = '';
    shown = []; active = -1;
  }

  function render() {
    var q = input.value.trim();
    if (!q) { clear(); return; }
    shown = search(q); active = -1;
    box.innerHTML = '';
    var ul = document.createElement('ul');
    ul.className = 'search-result-list';
    if (!shown.length) {
      var li = document.createElement('li');
      li.className = 'search-empty';
      li.textContent = '没找到「' + q + '」';
      ul.appendChild(li);
    }
    shown.forEach(function (e) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'search-result-title';
      a.href = encodeURI(e.u);
      var t = document.createElement('span');
      t.textContent = e.t;
      var c = document.createElement('em');
      c.textContent = e.c;
      a.appendChild(t); a.appendChild(c);
      li.appendChild(a); ul.appendChild(li);
    });
    box.appendChild(ul);
    box.classList.add('is-open');
    if (nav) nav.style.display = 'none';
  }

  function highlight(n) {
    var links = box.querySelectorAll('a');
    if (!links.length) return;
    active = (n + links.length) % links.length;
    for (var i = 0; i < links.length; i++) links[i].classList.toggle('is-active', i === active);
    links[active].scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('input', render);
  input.addEventListener('keydown', function (ev) {
    if (ev.isComposing || ev.keyCode === 229) return; // 输入法正在选词，这个回车不是提交
    if (ev.key === 'ArrowDown') { ev.preventDefault(); highlight(active + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); highlight(active - 1); }
    else if (ev.key === 'Escape') { input.value = ''; clear(); }
    else if (ev.key === 'Enter') {
      ev.preventDefault();
      var links = box.querySelectorAll('a');
      if (links.length) window.location.href = links[active >= 0 ? active : 0].href;
    }
  });
  if (form) form.addEventListener('submit', function (ev) { ev.preventDefault(); });
})();
