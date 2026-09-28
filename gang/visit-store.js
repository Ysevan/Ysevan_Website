"use strict";
/* 三期「最近查看 / 标星常办」的存储层（design-proposal §4.8）。
   纯逻辑模块：不碰 DOM、不认识手册数据结构，只把「一串业务 key」按两条策略存好——
     hb:recent  最近查看：去重、最新在前、最多 8 条；
     hb:star    标星常办：集合语义、按加星先后稳定排列、不设上限（key 总量本就只有 81 个业务）。

   降级策略与二期 hb:check:<nodeKey> 同风格：localStorage 的每一次触碰都包 try/catch，
   `file://` 下抛 SecurityError 就静默转内存态，功能照常可用，刷新即失效，主流程一行不受影响。
   与二期的差别只有一处：这里的降级是「一次失败，永久内存态」——
   最近查看会在每次 render 时被调用，若每次都去撞一个必然抛异常的 localStorage，
   柜面老机器上会被异常开销拖慢，所以降级后一次都不再重试。 */
(function (root, factory) {
  var api = factory();
  /* 既能被 Node 测试 require，也能在 index.html 里当普通 <script> 挂全局；
     不用 ES module —— file:// 下 type="module" 会因 CORS 直接加载失败。 */
  if (typeof module === "object" && module && module.exports) module.exports = api;
  else root.createVisitStore = api.createVisitStore;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {

  var RECENT_KEY = "hb:recent";
  var STAR_KEY = "hb:star";
  var RECENT_LIMIT = 8;

  /* 只认非空字符串 key（业务 key 形如 "0-1-2"）。传进来别的东西一律当没发生：
     存储层永远不因为调用方传错而抛异常，这是「不影响主流程」的底线。 */
  function validKey(key) {
    return typeof key === "string" && key ? key : "";
  }

  function dedupe(list) {
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < list.length; i += 1) {
      if (seen[list[i]]) continue;
      seen[list[i]] = true;
      out.push(list[i]);
    }
    return out;
  }

  /* `file://` 下个别浏览器连读 window.localStorage 这个属性本身就抛 SecurityError，
     所以取值也要包起来，不能只包后面的 getItem。Node 里没有该全局，直接落到 null（纯内存态）。 */
  function pickStorage(injected) {
    if (injected !== undefined && injected !== null) return injected;
    try {
      return (typeof globalThis !== "undefined" && globalThis.localStorage) || null;
    } catch (error) {
      return null;
    }
  }

  /* 只要求 getItem/setItem 两个方法：注入桩最省事，也不对宿主的 Storage 实现做多余假设。
     清空用写 "[]" 而不是 removeItem，同样是为了把依赖面收在这两个方法上。 */
  function usable(storage) {
    return Boolean(storage) && typeof storage.getItem === "function" && typeof storage.setItem === "function";
  }

  function createVisitStore(injected) {
    var storage = pickStorage(injected);
    /* live=false 即「已降级为纯内存态」，此后一次都不再触碰 storage（读也不再读）。 */
    var live = usable(storage);
    var recents = [];
    var stars = [];

    /* 读一次。返回 { list, dirty }：dirty 表示磁盘上那份与规范值不一致，需要就地重写。
       区分两类问题：
         类型错误（非法 JSON / 非数组 / 含非字符串项）→ 整体重置为空，不做部分抢救，
                    因为无法判断残缺数据的语义，宁可丢一份「最近查看」也不能猜错；
         策略越界（重复项 / 超过 8 条）→ 就地规范化，数据本身是好的，只是不合当前策略。 */
    function readList(key, limit) {
      if (!live) return { list: [], dirty: false };
      var raw = null;
      try {
        raw = storage.getItem(key);
      } catch (error) {
        live = false; // 读都读不了，后面的写更不必试
        return { list: [], dirty: false };
      }
      if (raw === null || raw === undefined || raw === "") return { list: [], dirty: false };
      var parsed = null;
      try {
        parsed = JSON.parse(String(raw));
      } catch (error) {
        return { list: [], dirty: true }; // 非法 JSON：静默重置
      }
      if (!Array.isArray(parsed)) return { list: [], dirty: true };
      for (var i = 0; i < parsed.length; i += 1) {
        if (!validKey(parsed[i])) return { list: [], dirty: true }; // 含非字符串/空串项：静默重置
      }
      var list = dedupe(parsed);
      if (limit > 0 && list.length > limit) list = list.slice(0, limit);
      return { list: list, dirty: list.length !== parsed.length };
    }

    /* 写失败一次就永久降级。之后所有 persist 都是空操作，storage 再也不会被碰。 */
    function persist(key, list) {
      if (!live) return;
      try {
        storage.setItem(key, JSON.stringify(list));
      } catch (error) {
        live = false;
      }
    }

    var loadedRecent = readList(RECENT_KEY, RECENT_LIMIT);
    recents = loadedRecent.list;
    /* 若第一次 getItem 就抛了异常，这里已经是 live=false，第二次读直接返回空，
       但上一把成功读到的 recents 会原样保留——读成功的部分不因后续失败而作废。 */
    var loadedStar = readList(STAR_KEY, 0);
    stars = loadedStar.list;
    /* 损坏或越界的存量数据就地重写成规范值，免得每次进站都要再清一遍。 */
    if (loadedRecent.dirty) persist(RECENT_KEY, recents);
    if (loadedStar.dirty) persist(STAR_KEY, stars);

    /* 去重上移 + 裁尾。已经排在第一位时直接返回，不写盘：
       recordVisit 打算挂在 currentNode() 上（每次 render 都会走），
       同一业务内切环节、改过滤、前进后退都会重复调用，不能每次都写一遍 localStorage。 */
    function recordVisit(key) {
      var value = validKey(key);
      if (!value) return;
      if (recents[0] === value) return;
      var next = [value];
      for (var i = 0; i < recents.length && next.length < RECENT_LIMIT; i += 1) {
        if (recents[i] !== value) next.push(recents[i]);
      }
      recents = next;
      persist(RECENT_KEY, recents);
    }

    /* 一律返回副本：调用方拿去 map 成 DOM、排序、过滤都不会污染内部状态。 */
    function getRecents() {
      return recents.slice();
    }

    function getStars() {
      return stars.slice();
    }

    function isStarred(key) {
      var value = validKey(key);
      return Boolean(value) && stars.indexOf(value) >= 0;
    }

    /* 返回切换之后的状态：true = 现在是标星。无效 key 返回 false 且不动任何状态。
       新加的星追加到末尾（按加星先后稳定排列），不像最近查看那样往前插——
       常办是一份钉住的清单，位置乱跳会毁掉肌肉记忆。 */
    function toggleStar(key) {
      var value = validKey(key);
      if (!value) return false;
      var at = stars.indexOf(value);
      if (at >= 0) stars = stars.slice(0, at).concat(stars.slice(at + 1));
      else stars = stars.concat([value]);
      persist(STAR_KEY, stars);
      return at < 0;
    }

    /* 返回是否真的删掉了。数据重生成后 key 漂移，调用方可以拿它做静默清理。 */
    function removeRecent(key) {
      var value = validKey(key);
      if (!value) return false;
      var next = [];
      for (var i = 0; i < recents.length; i += 1) {
        if (recents[i] !== value) next.push(recents[i]);
      }
      if (next.length === recents.length) return false; // 没这条就不写盘
      recents = next;
      persist(RECENT_KEY, recents);
      return true;
    }

    function clearRecents() {
      recents = [];
      persist(RECENT_KEY, recents);
    }

    function clearStars() {
      stars = [];
      persist(STAR_KEY, stars);
    }

    return {
      recordVisit: recordVisit,
      getRecents: getRecents,
      toggleStar: toggleStar,
      isStarred: isStarred,
      getStars: getStars,
      removeRecent: removeRecent,
      clearRecents: clearRecents,
      clearStars: clearStars,
    };
  }

  return {
    createVisitStore: createVisitStore,
    RECENT_KEY: RECENT_KEY,
    STAR_KEY: STAR_KEY,
    RECENT_LIMIT: RECENT_LIMIT,
  };
});
