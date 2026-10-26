// Panels (round 3, owner 2026-10-23: "the phone screen is all windows; landscape would suit it; each box should shrink or hide").
// Every box collapses on its own to a chip in #uiDock (the room card to one line); the map and the bed panel have a large and a small
// size; #uiToggle collapses or expands them all. Choices are each visitor's own, kept in localStorage per device class (phone / desk).
// Phones start with only the mode bar, the room name and the dock; desktops start with everything open, as before.
// Round 2's walk-ui.js is merged here: on a phone a tap on the 3D view (walk, tour) hides or shows them all, but only for the moment
// (never saved: a stray touch must not hide the mode bar for good; a reload or a mode change shows the saved choices again), and what a
// tap or the switch expanded folds back after UI_TIMING.idle without use; never while a field has focus, a dialog or the design panel is
// open, or a finger holds a walking control. Only the switch, a box's − / chip and the size buttons save. Collapsed boxes are display:none (style.css body.ui-min-*): nothing moves and the page never widens.
// Line icons come from the sprite at the top of index.html (#i-<name>); data-icon names the one a button shows.
export const icon=n=>`<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
export function setIcon(el,n){el.setAttribute?.('data-icon',n);el.innerHTML=icon(n);}
export const UI_KEY='xiyuan-ui-v1',UI_TIMING={idle:5000,tapMove:10,tapMs:400,hint:6000};
// A phone is narrow, or a short touch screen: a 900×417 landscape phone is wider than 700 px but is not a desktop. Mirrored in style.css.
export const PHONE_QUERY='(max-width:700px),(pointer:coarse) and (max-height:500px)',LAND_QUERY='(pointer:coarse) and (max-height:500px) and (orientation:landscape)';
// own: an existing button becomes the collapse button; into: append one to these containers; else one is pinned to the box's corner.
// line: collapses to one line in place (no chip). sizes: large/small, the switch sits before the collapse button. show: opening the box
// (the design button) also expands it. phone: the phone default.
export const PANELS=[
 {key:'top',sel:['header','.unit-nav'],into:['.header-actions'],icon:'panel-top',label:'顶栏',phone:'min'},
 {key:'intro',sel:['#intro'],icon:'home',label:'介绍',phone:'open'},
 {key:'room',sel:['#roomLabel'],line:true,label:'房间说明',phone:'min'},
 {key:'map',sel:['#miniPanel'],own:'#mapToggle',sizes:true,icon:'map',label:'定位',phone:'min'},
 {key:'tools',sel:['.tools','.footer-meta'],into:['.tools'],icon:'sliders',label:'显示',phone:'min'},
 {key:'bed',sel:['#bedPanel'],own:'#closeBed',sizes:true,icon:'bed',label:'床距',phone:'min'},
 {key:'study',sel:['#studyControls'],icon:'monitor',label:'书房',phone:'min'},
 {key:'design',sel:['#designPanel'],show:true,icon:'palette',label:'装修',phone:'open'},
 {key:'tour',sel:['#tourCaption'],icon:'video',label:'导览',phone:'min'},
 {key:'floor',sel:['#floorPanel'],icon:'building',label:'楼层',phone:'open'},
 {key:'info',sel:['#walkHint','.layout-flag'],into:['#walkHint','.layout-flag'],icon:'info',label:'提示',phone:'min'},
 {key:'modes',sel:['.mode-bar'],into:['.mode-bar'],icon:'panel-bottom',label:'模式',phone:'open'},
];
export function createPanels({canvas,viewport,toggle,dock,chips,doc=globalThis.document,win=globalThis.window,store,timing=UI_TIMING,panels=PANELS}={}){
 if(store===undefined)try{store=win.localStorage;}catch{store=null;}
 const body=doc.body,mq=win.matchMedia(PHONE_QUERY),peek=new Set(),hush=new Set(),held=new Set();let cls=mq.matches?'phone':'desk',timer=0,down=null,mode='';
 let saved={};try{const v=JSON.parse(store?.getItem(UI_KEY)??'null');if(v&&typeof v==='object'&&!Array.isArray(v))saved=v;}catch{}
 const bag=k=>{let c=saved[cls];if(!c||typeof c!=='object'||Array.isArray(c))c=saved[cls]={};if(!c[k]||typeof c[k]!=='object'||Array.isArray(c[k]))c[k]={};return c[k];};
 const save=()=>{try{store?.setItem(UI_KEY,JSON.stringify(saved));}catch{}};
 const P=panels.map(p=>({...p,els:p.sel.map(s=>doc.querySelector(s)).filter(Boolean),btns:[],was:false}));
 const get=k=>P.find(p=>p.key===k),pref=p=>{const v=bag('pref')[p.key];return v==='open'||v==='min'?v:cls==='phone'?p.phone:'open';};
 const large=p=>{const v=bag('size')[p.key];return v==='L'||v==='S'?v==='L':cls!=='phone';};
 const present=p=>p.els.some(e=>!e.hidden),shown=p=>!hush.has(p.key)&&(pref(p)==='open'||peek.has(p.key)),anyShown=()=>P.some(p=>present(p)&&shown(p));
 const setPref=(p,v)=>{bag('pref')[p.key]=v;},inside=(p,t)=>!!t&&p.els.some(e=>e===t||e.contains?.(t));
 const inUI=t=>!!t&&(P.some(p=>inside(p,t))||!!dock?.contains?.(t)||toggle===t);
 const focusIn=p=>{const a=doc.activeElement;return !!a&&a!==body&&inside(p,a);},toView=()=>viewport?.focus?.({preventScroll:true});
 const mk=(cl,name,label)=>{const b=doc.createElement('button');b.type='button';b.className=cl;setIcon(b,name);b.setAttribute('aria-label',label);b.title=label;return b;};
 for(const p of P){if(!p.els.length)continue;const ids=p.els.map((e,i)=>e.id||(e.id='ui-'+p.key+(i||''))).join(' ');
  if(p.own){const b=doc.querySelector(p.own);if(b)p.btns.push(b);}
  else if(p.into)for(const s of p.into){const box=doc.querySelector(s);if(box){const b=mk('ui-min-btn','minus','收起'+p.label);box.append(b);p.btns.push(b);}}
  else{const b=mk('ui-min-btn ui-abs','minus','收起'+p.label);p.els[0].prepend(b);p.btns.push(b);}
  for(const b of p.btns){b.setAttribute('aria-controls',ids);b.addEventListener('click',()=>p.line&&!shown(p)?open(p.key):collapse(p.key));}
  if(p.line)p.els[0].addEventListener('click',e=>{if(!shown(p)&&!p.btns.includes(e.target))open(p.key);});
  if(p.sizes&&p.btns[0]){const b=p.size=mk('ui-size-btn','maximize','放大'+p.label);b.setAttribute('aria-controls',ids);p.btns[0].before(b);b.addEventListener('click',()=>setSize(p.key,!large(p)));}
  if(!p.line&&chips){const c=p.chip=doc.createElement('button');c.type='button';c.className='ui-chip';c.setAttribute('data-panel',p.key);c.setAttribute('aria-controls',ids);c.setAttribute('aria-expanded','false');c.setAttribute('aria-label','展开'+p.label);c.title='展开'+p.label;
   const i=doc.createElement('span');i.setAttribute('aria-hidden','true');setIcon(i,p.icon);const s=doc.createElement('small');s.textContent=p.label;c.append(i,s);c.hidden=true;chips.append(c);
   c.addEventListener('click',()=>open(p.key,true));}
  p.was=present(p);}
 function render(){let any=false;
  for(const p of P){const here=present(p);
   // Opening the design panel (its header button) brings it back even if it was last collapsed to a chip.
   if(p.show&&here&&!p.was&&!shown(p)){setPref(p,'open');save();}p.was=here;
   const on=shown(p);if(on&&here)any=true;body.classList.toggle('ui-min-'+p.key,!on);
   for(const b of p.btns){b.setAttribute('aria-expanded',String(on));if(p.line){setIcon(b,on?'minus':'plus');b.setAttribute('aria-label',(on?'收起':'展开')+p.label);b.title=(on?'收起':'展开')+p.label;}}
   if(p.sizes){const L=large(p);body.classList.toggle('ui-small-'+p.key,!L);if(p.size){p.size.setAttribute('aria-pressed',String(L));setIcon(p.size,L?'minimize':'maximize');p.size.setAttribute('aria-label',(L?'缩小':'放大')+p.label);p.size.title=(L?'缩小':'放大')+p.label;}}
   if(p.chip)p.chip.hidden=on||!here;}
  const t=any?'全部收起':'全部展开';toggle?.setAttribute('aria-expanded',String(any));toggle?.setAttribute('aria-label',t);if(toggle){toggle.title=cls==='phone'?t+'（漫游、导览时也可轻点画面）':t;const s=toggle.querySelector?.('small');if(s)s.textContent=any?'收起':'展开';}
  body.classList.toggle('ui-phone',cls==='phone');}
 function open(k,focus=false){const p=get(k);if(!p)return;setPref(p,'open');peek.delete(k);hush.delete(k);save();render();if(focus)(p.btns.find(b=>p.els.some(e=>!e.hidden&&e.contains?.(b)))||p.els[0])?.focus?.({preventScroll:true});}
 // Focus on a control that disappears moves to its chip (one box) or to the 3D view (all), so keyboard and screen-reader users stay put.
 function collapse(k){const p=get(k);if(!p)return;const f=focusIn(p);setPref(p,'min');peek.delete(k);hush.delete(k);save();render();if(f&&!p.line)(p.chip&&!p.chip.hidden?p.chip:viewport)?.focus?.({preventScroll:true});}
 function setSize(k,L){const p=get(k);if(!p?.sizes)return;bag('size')[k]=L?'L':'S';save();render();}
 function collapseAll(){const vis=P.filter(present),f=vis.some(focusIn);win.clearTimeout(timer);peek.clear();hush.clear();for(const p of vis)setPref(p,'min');save();render();if(f)toView();}
 // Desktops keep what the switch opened; on a phone it is a look (peek) that folds back to the saved choices after timing.idle.
 function expandAll(){win.clearTimeout(timer);hush.clear();const vis=P.filter(present);if(cls==='phone'){for(const p of vis)if(pref(p)==='min')peek.add(p.key);schedule();}else{for(const p of vis)setPref(p,'open');save();}render();}
 const flip=()=>anyShown()?collapseAll():expandAll();
 // The tap on the view: the same look, but its collapse is only a hush over the saved choices, and nothing is written.
 function tapFlip(){if(!anyShown())return expandAll();const vis=P.filter(present),f=vis.some(focusIn);win.clearTimeout(timer);peek.clear();for(const p of vis)if(pref(p)==='open')hush.add(p.key);render();if(f)toView();}
 const busy=()=>{const a=doc.activeElement;return held.size>0||(body.classList.contains('design-open')&&!body.classList.contains('ui-min-design'))||!!doc.querySelector('dialog[open]')||!!a?.closest?.('input,textarea,select,[contenteditable="true"]');};
 function schedule(ms=timing.idle){win.clearTimeout(timer);timer=peek.size?win.setTimeout(()=>{if(!peek.size)return;if(busy())schedule();else fold();},ms):0;}
 function fold(){const f=P.some(p=>peek.has(p.key)&&focusIn(p));peek.clear();render();if(f)toView();}
 const tappable=()=>cls==='phone'&&(mode==='walk'||mode==='tour');
 canvas?.addEventListener('pointerdown',e=>{down=tappable()&&e.isPrimary?{x:e.clientX,y:e.clientY,t:e.timeStamp,id:e.pointerId}:null;});
 canvas?.addEventListener('pointerup',e=>{const d=down;down=null;if(d&&tappable()&&e.pointerId===d.id&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<=timing.tapMove&&e.timeStamp-d.t<=timing.tapMs)tapFlip();});
 canvas?.addEventListener('pointercancel',()=>{down=null;});
 toggle?.addEventListener('click',flip);
 // Using a box keeps a peek up; a finger on anything outside the boxes and the 3D view (the desktop walking pad) postpones the fold.
 for(const type of ['pointerdown','keydown','focusin','input','wheel'])doc.addEventListener(type,e=>{if(peek.size&&inUI(e.target))schedule();},{capture:true,passive:true});
 doc.addEventListener('pointerdown',e=>{const t=e.target;if(t&&t!==body&&t!==doc.documentElement&&!inUI(t)&&!viewport?.contains?.(t))held.add(e.pointerId);},{capture:true,passive:true});
 for(const type of ['pointerup','pointercancel'])doc.addEventListener(type,e=>held.delete(e.pointerId),{capture:true,passive:true});
 mq.addEventListener?.('change',()=>{cls=mq.matches?'phone':'desk';win.clearTimeout(timer);peek.clear();hush.clear();render();});
 const MO=win.MutationObserver;if(typeof MO==='function'){const mo=new MO(()=>render());for(const p of P)for(const e of p.els)mo.observe(e,{attributes:true,attributeFilter:['hidden']});}
 render();
 return {open,collapse,setSize,collapseAll,expandAll,toggleAll:flip,sync:render,
  // Called from prepare(): a mode change ends a peek or a tap's hush and shows the saved choices.
  setMode(m){mode=m;win.clearTimeout(timer);peek.clear();hush.clear();held.clear();down=null;render();},
  state:k=>{const p=get(k);return p?{open:shown(p),pref:pref(p),large:large(p),present:present(p)}:null;},
  get phone(){return cls==='phone';},get anyShown(){return anyShown();},get peeking(){return peek.size>0;}};
}
// Landscape: fullscreen, then lock the orientation (Android Chrome / Edge). Where either is refused (iOS, the browser says no, not in
// fullscreen) a "turn the phone" hint shows instead; nothing is forced and nothing throws. The exit button, the system back key
// (it leaves fullscreen) and fullscreenchange all restore the page.
export function createLandscape({button,exit,hint,doc=globalThis.document,win=globalThis.window,timing=UI_TIMING}={}){
 const body=doc.body,de=doc.documentElement,land=win.matchMedia('(orientation:landscape)');let hintTimer=0;
 const fsEl=()=>doc.fullscreenElement||doc.webkitFullscreenElement||null,orient=()=>win.screen?.orientation;
 const unlock=()=>{try{orient()?.unlock?.();}catch{}};
 function setHint(on){win.clearTimeout(hintTimer);if(hint)hint.hidden=!on;hintTimer=on?win.setTimeout(()=>setHint(false),timing.hint):0;}
 function sync(){const fs=!!fsEl();body.classList.toggle('ui-fs',fs);if(exit)exit.hidden=!fs;}
 async function enter(){setHint(false);
  try{if(!fsEl())await (de.requestFullscreen?de.requestFullscreen({navigationUI:'hide'}):de.webkitRequestFullscreen?.());}catch{}
  let locked=false;if(fsEl())try{await orient().lock('landscape');locked=true;}catch{}
  sync();if(!locked&&!land.matches)setHint(true);return locked;}
 async function leave(){unlock();try{if(fsEl())await (doc.exitFullscreen?doc.exitFullscreen():doc.webkitExitFullscreen?.());}catch{}sync();}
 const changed=()=>{if(!fsEl()){unlock();}sync();};
 doc.addEventListener('fullscreenchange',changed);doc.addEventListener('webkitfullscreenchange',changed);
 land.addEventListener?.('change',()=>{if(land.matches)setHint(false);});
 button?.addEventListener('click',enter);exit?.addEventListener('click',leave);hint?.addEventListener('click',()=>setHint(false));
 body.classList.toggle('ui-can-fs',!!(doc.fullscreenEnabled||doc.webkitFullscreenEnabled));sync();
 return {enter,leave,get fullscreen(){return !!fsEl();},get hint(){return !!hint&&!hint.hidden;}};
}
