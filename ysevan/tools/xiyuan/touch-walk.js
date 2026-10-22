// Phone walking by dragging (owner, 2026-10-23: 「走动的时候能不能用拖动的而不是按钮」). On a touch-first device (primary pointer coarse)
// walk mode hides the four arrow buttons (#touchPad). A finger put down on the left half of the view is a floating stick: where it
// lands is the centre, direction and distance give the walking direction and speed (dead zone, full speed at `radius`, eased). A
// finger on the right half turns the head with the mouse-drag feel (app.js turn). Roles are kept per pointerId, so both thumbs work
// at once. A second finger landing within `grace` ms of a fresh one is a pinch or a two-finger tap: both are ignored until lifted
// and any turn already made is undone, and the stick only drives once its finger has been down for `grace` ms. The stick layer
// takes no pointer events and no event is cancelled, so a short tap still reaches ui-panels.js and panels above stay usable.
// Mouse and pen input, and devices with a fine primary pointer, keep app.js's own drag-to-look and the buttons.
export const TOUCH_WALK={query:'(pointer: coarse)',radius:56,dead:10,grace:120,slop:6,smooth:.08,hintMs:3600,hintKey:'xiyuan-touch-hint-v1',hint:'左手拖动走 · 右手拖动看'};
// Inside #viewport after the canvas and without a z-index, so every panel, label and button paints above it.
const css=R=>`#touchWalk{position:absolute;inset:0;overflow:hidden;pointer-events:none;-webkit-user-select:none;user-select:none}
#touchWalk .stick{position:absolute;left:0;top:0;width:${2*R}px;height:${2*R}px;margin:${-R}px 0 0 ${-R}px;border-radius:50%;background:rgba(248,247,241,.18);border:1.5px solid rgba(255,255,255,.8);box-shadow:0 4px 18px rgba(48,58,50,.18);opacity:0;transition:opacity .15s}
#touchWalk .stick.on{opacity:1}#touchWalk .knob{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(248,247,241,.9);box-shadow:0 2px 8px rgba(48,58,50,.3)}
#touchWalk .hint{position:absolute;left:50%;top:calc(50% + 34px);max-width:calc(100% - 32px);transform:translateX(-50%);padding:8px 14px;border-radius:999px;background:rgba(48,58,50,.74);color:#f8f7f1;font-size:13px;letter-spacing:.5px;white-space:nowrap;opacity:0;transition:opacity .3s}
#touchWalk .hint.on{opacity:1}#viewport canvas{touch-action:none;-webkit-touch-callout:none}
@media(prefers-reduced-motion:reduce){#touchWalk .stick,#touchWalk .hint{transition:none}}`;
export function createTouchWalk({canvas,pad=null,look=()=>{},doc=globalThis.document,win=globalThis.window,storage,timing=TOUCH_WALK}){
 const T=timing,mq=win.matchMedia(T.query),fingers=new Map(),out={f:0,s:0};let mode='',stick=null,head=null,hintSeen=false,hintTimer=0;
 const on=()=>mode==='walk'&&!!mq.matches,now=()=>win.performance.now(),store=()=>{try{return storage===undefined?win.localStorage:storage;}catch{return null;}};
 const style=doc.createElement('style');style.textContent=css(T.radius);doc.head.appendChild(style);
 const layer=doc.createElement('div');layer.id='touchWalk';layer.setAttribute('aria-hidden','true');canvas.parentElement.appendChild(layer);
 const add=(cls,parent)=>{const e=doc.createElement('div');e.className=cls;parent.appendChild(e);return e;},ring=add('stick',layer),knob=add('knob',ring),hint=add('hint',layer);hint.textContent=T.hint;
 // Stick target: null inside the dead zone and during the grace window; otherwise length (0..1] grows linearly to the rim.
 function aim(){if(!stick||now()-stick.t<T.grace)return null;const dx=stick.x-stick.x0,dy=stick.y-stick.y0,d=Math.hypot(dx,dy);if(d<=T.dead)return null;const m=Math.min(1,(d-T.dead)/(T.radius-T.dead))/d;return {f:-dy*m,s:dx*m};}
 function draw(){ring.classList.toggle('on',!!stick);if(!stick)return;const dx=stick.x-stick.x0,dy=stick.y-stick.y0,k=Math.min(1,T.radius/(Math.hypot(dx,dy)||1));ring.style.transform=`translate(${stick.x0-stick.left}px,${stick.y0-stick.top}px)`;knob.style.transform=`translate(${dx*k}px,${dy*k}px)`;}
 function hideHint(){win.clearTimeout(hintTimer);hint.classList.toggle('on',false);}
 // Once per browser (localStorage), and once per page load when storage is blocked.
 function showHint(){let seen=hintSeen;try{seen=seen||!!store()?.getItem(T.hintKey);}catch{}hintSeen=true;if(seen)return;try{store()?.setItem(T.hintKey,'1');}catch{}hint.classList.toggle('on',true);win.clearTimeout(hintTimer);hintTimer=win.setTimeout(hideHint,T.hintMs);}
 function reset(){fingers.clear();stick=head=null;out.f=out.s=0;draw();}
 canvas.addEventListener('pointerdown',e=>{if(!on()||e.pointerType!=='touch')return;hideHint();
  const r=canvas.getBoundingClientRect(),p={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t:e.timeStamp,left:r.left,top:r.top,role:'',dx:0,dy:0,turning:false};
  const fresh=[stick,head].find(q=>q&&e.timeStamp-q.t<T.grace);
  if(fresh){fresh.role=p.role='pinch';if(fresh===stick){stick=null;out.f=out.s=0;}else{head=null;if(fresh.dx||fresh.dy)look(-fresh.dx,-fresh.dy);}}
  else if(e.clientX-r.left<r.width/2){if(!stick){p.role='stick';stick=p;}}else if(!head){p.role='look';head=p;}
  fingers.set(p.id,p);try{canvas.setPointerCapture(p.id);}catch{}draw();});
 // Moves and releases are taken at the document, so a finger that slides onto a panel still lets go of the stick.
 doc.addEventListener('pointermove',e=>{const p=fingers.get(e.pointerId);if(!p)return;const lx=p.x,ly=p.y;p.x=e.clientX;p.y=e.clientY;
  if(p===stick)return draw();if(p!==head)return;if(!p.turning)p.turning=Math.hypot(p.x-p.x0,p.y-p.y0)>T.slop;if(p.turning){look(p.x-lx,p.y-ly);p.dx+=p.x-lx;p.dy+=p.y-ly;}},{capture:true,passive:true});
 for(const type of ['pointerup','pointercancel'])doc.addEventListener(type,e=>{const p=fingers.get(e.pointerId);if(!p)return;fingers.delete(p.id);if(p===stick){stick=null;out.f=out.s=0;}if(p===head)head=null;draw();},{capture:true,passive:true});
 win.addEventListener('blur',reset);doc.addEventListener('visibilitychange',reset);
 mq.addEventListener?.('change',()=>{if(pad)pad.hidden=mode!=='walk'||!!mq.matches;if(!on())reset();});
 return {
  // app.js leaves these pointers alone (no mouse-style drag on them).
  owns:e=>on()&&e.pointerType==='touch',
  // Called from prepare(): the arrow buttons only where the primary pointer is fine; the gesture hint on the first walk.
  setMode(m){const entering=m==='walk'&&mode!=='walk';mode=m;if(pad)pad.hidden=m!=='walk'||!!mq.matches;if(!on()){reset();hideHint();}else if(entering)showHint();},
  // Analog input for walkFrame: forward and strafe, length 0..1 = share of walking speed; eased in, zero as soon as the finger lifts.
  vector(dt){const a=aim();if(!a){out.f=out.s=0;}else{const k=1-Math.exp(-dt/T.smooth);out.f+=(a.f-out.f)*k;out.s+=(a.s-out.s)*k;}return {f:out.f,s:out.s};},
  get moving(){return on()&&!!aim();},
  reset
 };
}
