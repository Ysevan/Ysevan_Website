// Render tier, fixed once at startup: antialias can only be chosen when the WebGL context is created.
// 'phone' | 'gpu' | 'soft' (software rasteriser). Unrelated to the 'soft' lighting / preset ids.
export const SOFT_RENDERER=/SwiftShader|Basic Render|llvmpipe|WARP/i;
// Still-frame ratio cap for software rendering. SwiftShader at 2040×1019 CSS px (M5 Pro): ratio 1.25 ≈ 135 ms, 2.5 ≈ 580 ms;
// 1.25 is the 2040 desktop's full DPR and leaves 4-5× headroom for slower CPUs within the ~0.7 s budget.
export const SOFT_STILL=1.25;
const TIERS={phone:{antialias:true,move:2,still:3},gpu:{antialias:true,move:1.5,still:2},soft:{antialias:false,move:1,still:SOFT_STILL}};
// Moving-frame pixel budgets (device px). Soft keeps the pre-tier budgets; GPUs are capped by ratio, the budget only feeds the watchdog.
const BUDGETS={soft:{auto:1400000,smooth:900000,fine:3000000},gpu:{auto:8000000,smooth:900000,fine:16000000}};
export const SOFT_FLOOR_BUDGET=720000;
// Soft tier has no scene environment: per unit of environmentIntensity, white light added to the hemisphere sky and ground.
export const SOFT_ENV_SKY=4.5,SOFT_ENV_GROUND=2;

export function pickTier({renderer='',coarse=false,shortSide=Infinity}={}){
 if(SOFT_RENDERER.test(renderer))return 'soft';
 return coarse&&shortSide<=900?'phone':'gpu';
}
// Reads the unmasked renderer name from a throwaway context, then releases it.
export function probeRenderer(doc=globalThis.document){
 let gl=null,name='';try{const c=doc.createElement('canvas');gl=c.getContext('webgl2')||c.getContext('webgl');}catch{}
 if(!gl)return '';
 try{const info=gl.getExtension('WEBGL_debug_renderer_info');name=String(gl.getParameter(info?info.UNMASKED_RENDERER_WEBGL:gl.RENDERER)||'');}catch{}
 gl.getExtension('WEBGL_lose_context')?.loseContext();return name;
}
export const tierBudget=(tier,quality)=>(BUDGETS[tier==='soft'?'soft':'gpu'][quality]??BUDGETS[tier==='soft'?'soft':'gpu'].auto);
// move: pixel ratio while anything animates; still: one sharper frame once the view settles; floor: lowest the watchdog may go.
export function tierSettings(tier,quality='auto',dpr=1,cssPixels=1,budget=tierBudget(tier,quality)){
 const t=TIERS[tier]||TIERS.gpu,soft=tier==='soft',q=BUDGETS.gpu[quality]?quality:'auto',fit=Math.sqrt(budget/cssPixels);
 const cap=q==='smooth'?1:q==='fine'?(soft?1.5:2):t.move;
 const floor=Math.min(cap,dpr,q==='smooth'?Math.sqrt(budget/cssPixels):soft?Math.sqrt(SOFT_FLOOR_BUDGET/cssPixels):1);
 const move=Math.min(cap,dpr,Math.max(floor,fit));
 // A watchdog cut on soft also lowers the still frame: the CPU is slower than the one SOFT_STILL was measured on.
 const stillCap=soft?t.still*Math.min(1,Math.sqrt(budget/tierBudget(tier,q))):t.still;
 const still=q==='smooth'?Math.min(1,dpr,stillCap):Math.max(move,Math.min(stillCap,dpr));
 return {antialias:t.antialias,move,still,floor,budget,shadows:q!=='smooth'};
}
