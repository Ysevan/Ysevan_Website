// Phone walk mode (owner, 2026-10-21): below the compact-map breakpoint the information panels fade out shortly after you
// enter, leaving the walking pad and one toggle; a tap on the view (not a drag) brings them back, and another tap or a few
// seconds without touching a panel hides them again. Desktop widths never change. CSS: body.ui-collapsed in style.css.
// Panels are hidden with opacity + visibility only, so nothing moves, the page never widens and hidden controls leave the
// focus order and the accessibility tree. Never collapses while a text field or select has focus (IME, on-screen keyboard),
// while the design panel or a dialog is open, or while the walking pad is held.
export const WALK_UI={first:2500,idle:5000,tapMove:10,tapMs:400,query:'(max-width:700px)'};
export function createWalkUI({canvas,toggle,viewport,doc=globalThis.document,win=globalThis.window,timing=WALK_UI}){
 const body=doc.body,mq=win.matchMedia(timing.query),held=new Set();let mode='',timer=0,down=null;
 const on=()=>mode==='walk'&&mq.matches,collapsed=()=>body.classList.contains('ui-collapsed');
 const busy=()=>{const a=doc.activeElement;return held.size>0||body.classList.contains('design-open')||!!doc.querySelector('dialog[open]')||!!a?.closest?.('input,textarea,select,[contenteditable="true"]');};
 function set(hide){body.classList.toggle('ui-collapsed',hide);toggle.setAttribute('aria-expanded',String(!hide));toggle.setAttribute('aria-label',hide?'显示界面':'收起界面');toggle.title=hide?'显示界面（或轻点画面）':'收起界面（或轻点画面）';}
 function schedule(ms){win.clearTimeout(timer);timer=on()?win.setTimeout(()=>{if(!on())return;if(busy())schedule(timing.idle);else collapse();},ms):0;}
 // Focus left on a control that is about to disappear moves to the 3D view, so keyboard and screen-reader users are not stranded.
 function collapse(){if(!on())return;win.clearTimeout(timer);const a=doc.activeElement;if(a&&a!==body&&!a.closest?.('#viewport,#touchPad,#uiToggle'))viewport.focus({preventScroll:true});set(true);}
 function expand(ms=timing.idle){set(false);schedule(ms);}
 const flip=()=>collapsed()?expand():collapse();
 canvas.addEventListener('pointerdown',e=>{down=on()&&e.isPrimary?{x:e.clientX,y:e.clientY,t:e.timeStamp,id:e.pointerId}:null;});
 canvas.addEventListener('pointerup',e=>{const d=down;down=null;if(d&&on()&&e.pointerId===d.id&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<=timing.tapMove&&e.timeStamp-d.t<=timing.tapMs)flip();});
 canvas.addEventListener('pointercancel',()=>{down=null;});
 toggle.addEventListener('click',flip);
 // Using any panel keeps them up; holding the walking pad postpones a pending collapse until release.
 for(const type of ['pointerdown','keydown','focusin','input','wheel'])doc.addEventListener(type,e=>{const t=e.target;if(!on()||collapsed()||!t?.closest||t.closest('#viewport,#touchPad,#uiToggle'))return;schedule(timing.idle);},{capture:true,passive:true});
 doc.addEventListener('pointerdown',e=>{if(e.target?.closest?.('#touchPad'))held.add(e.pointerId);},{capture:true,passive:true});
 for(const type of ['pointerup','pointercancel'])doc.addEventListener(type,e=>held.delete(e.pointerId),{capture:true,passive:true});
 mq.addEventListener?.('change',()=>{if(on())expand(timing.first);else{win.clearTimeout(timer);set(false);}});
 return {
  // Called from prepare(): entering walk shows everything, then collapses after timing.first; any other mode restores the panels.
  setMode(m){const entering=m==='walk'&&mode!=='walk';mode=m;if(!on()){win.clearTimeout(timer);set(false);}else if(entering)expand(timing.first);},
  expand,collapse,get collapsed(){return collapsed();}
 };
}
