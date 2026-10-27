// Panels (2026-10-28, owner: "these vanish once clicked, and only the 收起 at the top left brings them back; why not highlight what I
// turned on, and no highlight when it is off ... no intro card, no hints; on opening show only the top bar, the mode bar and a little
// of the introduction"). Every box has one switch in the toolbar #uiChips (inside #uiDock). The switch never leaves the toolbar: it is
// shown whenever its box exists in the current mode, aria-pressed says whether the box is on, and a second press turns it off again.
// There is no master collapse any more. A box that is off is display:none (style.css body.ui-min-<key>), the room card shrinks to one
// line instead. The design panel keeps its own open state (its header button 装修方案 and its close button); its switch drives those.
// Defaults on opening: the top bar, the mode bar, the short introduction (and the room name, the sandbox card where they apply).
// Remembered (localStorage, per device class): only boxes a visitor turned on, and the two sizes. Nothing that hides a default box is
// ever stored, so a returning visitor cannot open the page to an empty screen; the round-3 key (collapsed boxes) is ignored and removed.
// On a phone a tap on the 3D view while walking or touring hides the boxes that are on, for the moment (never saved); another tap
// brings them back, as does any switch or a mode change.
// Line icons come from the sprite at the top of index.html (#i-<name>); data-icon names the one a button shows.
export const icon=n=>`<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
export function setIcon(el,n){el.setAttribute?.('data-icon',n);el.innerHTML=icon(n);}
export const UI_KEY='xiyuan-ui-v2',UI_OLD_KEYS=['xiyuan-ui-v1'],UI_TIMING={tapMove:10,tapMs:400,hint:6000};
// A phone is narrow, or a short touch screen: a 900×417 landscape phone is wider than 700 px but is not a desktop. Mirrored in style.css.
export const PHONE_QUERY='(max-width:700px),(pointer:coarse) and (max-height:500px)',LAND_QUERY='(pointer:coarse) and (max-height:500px) and (orientation:landscape)';
// on: the default (phoneOn overrides it on a phone). keep: may be remembered as turned on. own: an existing button inside the box that
// turns it off. line: off means one line in place, not hidden. sizes: large/small. proxy: [open button, close button] that own the box.
export const PANELS=[
 {key:'top',sel:['header','.unit-nav'],icon:'panel-top',label:'顶栏',on:true},
 {key:'modes',sel:['.mode-bar'],icon:'panel-bottom',label:'模式',on:true},
 {key:'intro',sel:['#intro'],icon:'home',label:'简介',on:true},
 {key:'room',sel:['#roomLabel'],line:true,icon:'door',label:'房间',on:true,phoneOn:false},
 {key:'map',sel:['#miniPanel'],own:'#mapToggle',sizes:true,icon:'map',label:'定位',on:false,keep:true},
 {key:'bed',sel:['#bedPanel'],own:'#closeBed',sizes:true,icon:'bed',label:'床距',on:false,keep:true},
 {key:'study',sel:['#studyControls'],icon:'monitor',label:'书房',on:false,keep:true},
 {key:'tour',sel:['#tourCaption'],icon:'video',label:'导览',on:false,keep:true},
 {key:'floor',sel:['#floorPanel'],icon:'building',label:'沙盘',on:true},
 {key:'tools',sel:['.tools','.footer-meta'],icon:'sliders',label:'显示',on:false,keep:true},
 {key:'design',sel:['#designPanel'],proxy:['#designBtn','#closeDesign'],icon:'palette',label:'装修'},
 {key:'help',sel:['#helpPop'],icon:'info',label:'操作',on:false},
];
export function createPanels({canvas,viewport,dock,chips,doc=globalThis.document,win=globalThis.window,store,timing=UI_TIMING,panels=PANELS}={}){
 if(store===undefined)try{store=win.localStorage;}catch{store=null;}
 const body=doc.body,mq=win.matchMedia(PHONE_QUERY),hush=new Set(),cur={};let cls=mq.matches?'phone':'desk',down=null,mode='';
 for(const k of UI_OLD_KEYS)try{store?.removeItem?.(k);}catch{}
 let saved={};try{const v=JSON.parse(store?.getItem(UI_KEY)??'null');if(v&&typeof v==='object'&&!Array.isArray(v))saved=v;}catch{}
 const bag=k=>{let c=saved[cls];if(!c||typeof c!=='object'||Array.isArray(c))c=saved[cls]={};if(!c[k]||typeof c[k]!=='object'||Array.isArray(c[k]))c[k]={};return c[k];};
 const save=()=>{try{store?.setItem(UI_KEY,JSON.stringify(saved));}catch{}};
 const P=panels.map(p=>({...p,els:p.sel.map(s=>doc.querySelector(s)).filter(Boolean),btns:[]}));
 const get=k=>P.find(p=>p.key===k);
 const dflt=p=>cls==='phone'&&'phoneOn' in p?p.phoneOn:!!p.on;
 // A session choice first, then a remembered "on" (keep boxes only), then the default.
 const pref=p=>{if(p.proxy)return !p.els[0]?.hidden;const c=cur[cls]?.[p.key];if(typeof c==='boolean')return c;if(p.keep&&bag('on')[p.key]===true)return true;return dflt(p);};
 const large=p=>{const v=bag('size')[p.key];return v==='L'||v==='S'?v==='L':cls!=='phone';};
 const present=p=>p.proxy?p.els.length>0:p.els.some(e=>!e.hidden),shown=p=>p.proxy?pref(p):pref(p)&&!hush.has(p.key);
 const inside=(p,t)=>!!t&&p.els.some(e=>e===t||e.contains?.(t));
 const focusIn=p=>{const a=doc.activeElement;return !!a&&a!==body&&inside(p,a);};
 const mk=(cl,name,label)=>{const b=doc.createElement('button');b.type='button';b.className=cl;setIcon(b,name);b.setAttribute('aria-label',label);b.title=label;return b;};
 function setPref(p,on){(cur[cls]||(cur[cls]={}))[p.key]=on;if(p.keep){const o=bag('on');if(on)o[p.key]=true;else delete o[p.key];save();}}
 for(const p of P){if(!p.els.length)continue;const ids=p.els.map((e,i)=>e.id||(e.id='ui-'+p.key+(i||''))).join(' ');
  if(p.own){const b=doc.querySelector(p.own);if(b){p.btns.push(b);b.setAttribute('aria-controls',ids);b.addEventListener('click',()=>close(p.key));}}
  if(p.line)p.els[0].addEventListener('click',e=>{if(!shown(p)&&!e.target?.closest?.('button,a,input,select,summary'))open(p.key);});
  if(p.sizes&&p.btns[0]){const b=p.size=mk('ui-size-btn','maximize','放大'+p.label);b.setAttribute('aria-controls',ids);p.btns[0].before(b);b.addEventListener('click',()=>setSize(p.key,!large(p)));}
  if(chips){const t=p.tog=doc.createElement('button');t.type='button';t.className='ui-tog';t.setAttribute('data-panel',p.key);t.setAttribute('aria-controls',ids);t.setAttribute('aria-pressed','false');t.title=p.label;
   const i=doc.createElement('span');i.setAttribute('aria-hidden','true');setIcon(i,p.icon);const s=doc.createElement('small');s.textContent=p.label;t.append(i,s);t.hidden=true;chips.append(t);
   t.addEventListener('click',()=>toggle(p.key));}}
 function render(){
  for(const p of P){if(!p.els.length)continue;const here=present(p),on=shown(p);
   if(!p.proxy)body.classList.toggle('ui-min-'+p.key,!on);
   for(const b of p.btns)b.setAttribute('aria-expanded',String(on));
   if(p.sizes){const L=large(p);body.classList.toggle('ui-small-'+p.key,!L);if(p.size){p.size.setAttribute('aria-pressed',String(L));setIcon(p.size,L?'minimize':'maximize');p.size.setAttribute('aria-label',(L?'缩小':'放大')+p.label);p.size.title=(L?'缩小':'放大')+p.label;}}
   if(p.tog){p.tog.hidden=!here;p.tog.setAttribute('aria-pressed',String(pref(p)));}}
  body.classList.toggle('ui-phone',cls==='phone');body.classList.toggle('ui-hush',hush.size>0);}
 function open(k,focus=false){const p=get(k);if(!p)return;hush.clear();if(p.proxy){if(!pref(p))doc.querySelector(p.proxy[0])?.click();}else setPref(p,true);render();if(focus)(p.els.find(e=>!e.hidden)||p.els[0])?.focus?.({preventScroll:true});}
 // Focus on a control that disappears moves to the box's switch, so keyboard and screen-reader users stay put.
 function close(k){const p=get(k);if(!p)return;const f=focusIn(p);hush.clear();if(p.proxy){if(pref(p))doc.querySelector(p.proxy[1])?.click();}else setPref(p,false);render();if(f&&!p.line)(p.tog&&!p.tog.hidden?p.tog:viewport)?.focus?.({preventScroll:true});}
 function toggle(k){const p=get(k);if(!p)return;if(hush.size&&!p.proxy&&pref(p)){hush.clear();render();return;}pref(p)?close(k):open(k);}
 function setSize(k,L){const p=get(k);if(!p?.sizes)return;bag('size')[k]=L?'L':'S';save();render();}
 // The tap on the view (phone, walking or touring): hide what is on, for the moment; the next tap shows it again. Nothing is written.
 function tapFlip(){if(hush.size){hush.clear();render();return;}const f=P.some(p=>!p.proxy&&present(p)&&shown(p)&&focusIn(p));for(const p of P)if(!p.proxy&&p.key!=='modes'&&present(p)&&pref(p))hush.add(p.key);render();if(f)viewport?.focus?.({preventScroll:true});}
 const tappable=()=>cls==='phone'&&(mode==='walk'||mode==='tour');
 canvas?.addEventListener('pointerdown',e=>{down=tappable()&&e.isPrimary?{x:e.clientX,y:e.clientY,t:e.timeStamp,id:e.pointerId}:null;});
 canvas?.addEventListener('pointerup',e=>{const d=down;down=null;if(d&&tappable()&&e.pointerId===d.id&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<=timing.tapMove&&e.timeStamp-d.t<=timing.tapMs)tapFlip();});
 canvas?.addEventListener('pointercancel',()=>{down=null;});
 mq.addEventListener?.('change',()=>{cls=mq.matches?'phone':'desk';hush.clear();render();});
 const MO=win.MutationObserver;if(typeof MO==='function'){const mo=new MO(()=>render());for(const p of P)for(const e of p.els)mo.observe(e,{attributes:true,attributeFilter:['hidden']});}
 render();
 return {open,close,collapse:close,toggle,setSize,sync:render,
  // Called from prepare(): a mode change ends a tap's hush.
  setMode(m){mode=m;hush.clear();down=null;render();},
  state:k=>{const p=get(k);return p?{open:shown(p),pref:pref(p),large:large(p),present:present(p)}:null;},
  get phone(){return cls==='phone';},get hushed(){return hush.size>0;}};
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
// Interface copy (2026-10-28, owner: plain, no slogans; punctuation only ，。、（）). The two main layouts first, 02 and 03 under 更多.
export const MAIN_LAYOUTS=['original','central'],MORE_LAYOUTS=['balanced','family'];
export const LAYOUT_COPY={
 original:{name:'01 原四房优化',brief:'三间卧室加北侧电竞书房，走廊那段墙按 04 补直'},
 central:{name:'04 集中收纳加主卧电竞',brief:'南侧主卧兼电竞，北东间集中做衣帽间，北墙为条件移墙试摆'},
 balanced:{name:'02 收纳均衡',brief:'两间卧室，南侧电竞兼客房，另有衣帽间'},
 family:{name:'03 三卧电竞',brief:'三间卧室，南侧独立电竞房'},
};
// The short introduction: a name and one line, per scope (no slogans, no numbers block, no disclaimers).
export function introCopy(scope,layout,unitName=''){
 if(scope==='floor')return ['整层四户','按 CAD 图纸复建的整层模型，我的 B 户型在左侧'];
 if(scope==='bl')return ['我的 B 户型','按 CAD 图纸复建，当前布置 '+(LAYOUT_COPY[layout]?.name||LAYOUT_COPY.original.name)];
 if(scope==='common')return ['公共区域','左右前室与连廊，按 CAD 图纸复建'];
 return [unitName,'按 CAD 图纸复建，家具为示意'];
}
// Data strings written elsewhere (layout-data.js) keep their wording; on screen they use the owner's punctuation.
export const plain=s=>String(s??'').replace(/\s*[\u00b7\u2022]\s*/g,'\uff0c').replace(/[\uff1b\uff1a:]/g,'\uff0c').replace(/\u2014\u2014|\u2014|\u2013/g,'\uff0c').replace(/\u2026+/g,'').replace(/\s*\/\s*/g,'\u3001').replace(/[\u201c\u201d\u0022\u300c\u300d\u300a\u300b]/g,'').replace(/\uff0b/g,'\u52a0').replace(/\uff1d/g,'\uff0c\u5171').replace(/\uff0c{2,}/g,'\uff0c').replace(/\uff0c([\u3002\uff09])/g,'$1').replace(/^\uff0c|\uff0c$/g,'');
