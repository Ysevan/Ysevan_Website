// 首页背景音乐（2026-09-25）：蓝心羽《阿拉斯加海湾》。
// 用网页自带的 <audio> 播放，才能自己调音量（网易云外链播放器是别人家的 iframe，控制不了音量）。
// 音源按顺序试：本地 music/阿拉斯加海湾.flac（无损，音质最好）→ 本地 .mp3；
// 都没有就退回网易云外链播放器（音质由网易云决定，调不了；也调不了音量）。
// 网易云播放器会拖进来一整套网易云的 CSS/JS，打开页面就加载会让首页慢好几秒，
// 所以等访客第一次点页面/按键时才插进去（浏览器本来也要等这一下才允许出声）。
// （网易云的「外链音频地址」这首歌返回 404，已从音源里去掉，省掉一次必失败的请求。）
// 浏览器不允许「没点过页面就出声」：打开时先试着播，被拦就在访客第一次点页面/按键时开始播。
(function () {
  'use strict';
  var SONG = { title: '阿拉斯加海湾', artist: '蓝心羽', neteaseId: 1500569811 };
  var SOURCES = [
    'music/阿拉斯加海湾.flac',
    'music/阿拉斯加海湾.mp3'
  ];
  var DEFAULT_VOLUME = 0.3;
  var KEY = 'ysevan-bgm-volume';

  var box = document.getElementById('bgm');
  if (!box) return;
  var audio = box.querySelector('audio');
  var btn = box.querySelector('.bgm-play');
  var bar = box.querySelector('.bgm-progress');
  var timeEl = box.querySelector('.bgm-time');
  var vol = box.querySelector('.bgm-volume');
  var mute = box.querySelector('.bgm-mute');

  var srcIndex = 0;
  var started = false;      // 已经真正播起来过
  var userPaused = false;   // 访客自己按了暂停，就别再自动播
  var wantPlay = true;      // 打开页面就想播
  var neteasePending = false; // 本地音源都没有，等访客第一次操作再插网易云播放器

  function readVolume() {
    try {
      var v = parseFloat(localStorage.getItem(KEY));
      if (v >= 0 && v <= 1) return v;
    } catch (e) {}
    return DEFAULT_VOLUME;
  }
  function saveVolume(v) {
    try { localStorage.setItem(KEY, String(v)); } catch (e) {}
  }

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function setIcon() {
    var playing = !audio.paused;
    btn.innerHTML = playing ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>';
    btn.setAttribute('aria-label', playing ? '暂停' : '播放');
    box.classList.toggle('is-playing', playing);
  }
  function setMuteIcon() {
    var off = audio.muted || audio.volume === 0;
    mute.innerHTML = off ? '<i class="fa fa-volume-off"></i>' : (audio.volume < 0.5 ? '<i class="fa fa-volume-down"></i>' : '<i class="fa fa-volume-up"></i>');
    mute.setAttribute('aria-label', off ? '取消静音' : '静音');
  }

  function tryPlay() {
    var p = audio.play();
    if (p && p.then) {
      return p.then(function () { started = true; unhook(); }, function () { /* 被浏览器拦了，等访客第一次操作 */ });
    }
    started = true; unhook();
  }

  // 访客第一次点页面 / 按键：如果还没播、也不是自己按的暂停，就开始播
  var GESTURES = ['pointerdown', 'keydown', 'touchstart'];
  function onGesture(ev) {
    if (neteasePending) { fallbackToNetease(); return; }
    if (box.contains(ev.target)) return; // 点的是播放器本身，交给播放器自己的按钮处理
    if (!started && !userPaused && wantPlay) tryPlay();
  }
  function hook() { GESTURES.forEach(function (t) { document.addEventListener(t, onGesture, true); }); }
  function unhook() { GESTURES.forEach(function (t) { document.removeEventListener(t, onGesture, true); }); }

  // 本地文件都放不了：退回网易云外链播放器（能放，但调不了音量）
  function fallbackToNetease() {
    neteasePending = false;
    unhook();
    box.classList.add('is-fallback');
    box.innerHTML = '<iframe title="' + SONG.title + ' - ' + SONG.artist + '" frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" allow="autoplay" ' +
      'src="https://music.163.com/outchain/player?type=2&id=' + SONG.neteaseId + '&auto=1&height=66"></iframe>';
  }

  function loadSource(i) {
    srcIndex = i;
    if (i >= SOURCES.length) { audio.removeAttribute('src'); neteasePending = true; return; }
    audio.src = encodeURI(SOURCES[i]);
    audio.load();
    if (wantPlay && !userPaused) tryPlay();
  }

  audio.addEventListener('error', function () { loadSource(srcIndex + 1); });
  audio.addEventListener('play', setIcon);
  audio.addEventListener('pause', setIcon);
  audio.addEventListener('timeupdate', function () {
    var d = audio.duration;
    if (isFinite(d) && d > 0 && !bar.matches(':active')) bar.value = String(audio.currentTime / d * 1000);
    timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
  });
  audio.addEventListener('loadedmetadata', function () { timeEl.textContent = fmt(0) + ' / ' + fmt(audio.duration); });
  audio.addEventListener('volumechange', setMuteIcon);

  btn.addEventListener('click', function () {
    if (audio.paused) { userPaused = false; wantPlay = true; tryPlay(); }
    else { userPaused = true; audio.pause(); }
  });
  bar.addEventListener('input', function () {
    var d = audio.duration;
    if (isFinite(d) && d > 0) audio.currentTime = bar.value / 1000 * d;
  });
  vol.addEventListener('input', function () {
    var v = vol.value / 100;
    audio.volume = v;
    audio.muted = v === 0;
    saveVolume(v);
  });
  mute.addEventListener('click', function () {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      if (audio.volume === 0) { audio.volume = DEFAULT_VOLUME; vol.value = String(DEFAULT_VOLUME * 100); saveVolume(DEFAULT_VOLUME); }
    } else {
      audio.muted = true;
    }
  });

  audio.volume = readVolume();
  vol.value = String(Math.round(audio.volume * 100));
  audio.loop = true;
  setIcon(); setMuteIcon();
  hook();
  loadSource(0);
})();
