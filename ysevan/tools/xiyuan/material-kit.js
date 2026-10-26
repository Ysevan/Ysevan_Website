import * as THREE from 'three';
// Finishes (scene detail round 3): procedural maps made in plain JS (the same pixels in the browser and in the node checks, no
// canvas), each preset's finish detail (design-presets.js PRESETS[id].detail: walls, floor, cabinets, handles, window frames;
// never stored in the user's home) and the bevel grades box()/round() use. Round 4 (GPU tier only): normal maps from height
// fields made in the same pixel loops (seams, bevels, grout, arrises, threads, a faint grain), so relief and colour line up.

// Bevels. Casework finishes take 1–1.5 cm edges and upholstery 4–8 cm, whatever a call asks for; cushion fabrics default to
// 5 cm; untagged finishes keep the call's radius and round()'s default is the cabinet edge. RoundedBoxGeometry segments: 2 on
// GPUs (four facets a quarter round), 1 on phones and software rasterisers.
export const BEVEL={segments:1,cabinet:[.01,.015],soft:[.04,.08],cushion:.05};
export const bevelSegments=tier=>tier==='gpu'?2:1;
export function bevel(r,m){const k=m?.userData?.bevel,c=BEVEL[k];if(Array.isArray(c))return Math.min(c[1],Math.max(c[0],r??(k==='soft'?BEVEL.cushion:c[1])));return r??(k==='cushion'?BEVEL.cushion:BEVEL.cabinet[1]);}

// Map specs in metres; px is the edge on GPUs and phones (software rasterisers take half). MEAN: mean linear colour of the
// round-2 canvas maps (wood for veneer and wood floors, tile for wet-room and stone floors, fabric), so every surface keeps its
// average colour and the scene its brightness; the balcony tiles are a new, warmer grey.
// Fit-out round (2026-10-26), real products: veneer leaves 15 cm, glued edge to edge (no groove: a groove is a floor board's);
// wet rooms one 600 × 1200 porcelain tile on walls and floors (墙地通铺, upright on the walls, 2 rows to the 2.4 m bathroom
// ceiling), stacked, 1.5 mm joints, a faint stone figure; quartz worktops and sills (石英石) with 1 mm grains.
export const MAPS={wood:{px:1024,tile:1.2,strips:8},fabric:{px:512,tile:.25,thread:.002},tile:{px:1024,tile:[.6,1.2],grout:.0015},
 outdoor:{px:1024,tile:[.3,.6],grout:.003},wall:{px:512,tile:2.4},stone:{px:512,tile:.6,grain:.001}};
export const MEAN={wood:[.554,.4374,.3196],tile:[.7929,.7545,.6598],fabric:[.794,.7554,.6606],outdoor:[.47,.445,.39]};
export const DETAIL_PARTS=['wall','floor','cabinet','handle','window'];
// Metals by what they are (fit-out round). Brass and the handles are bare metal (metalness 1), brushed (roughness 0.3–0.45);
// the dark railings, faucets, frames and stands (M.metal) are powder-coated, i.e. paint over metal: dielectric, satin. Colours of
// bare metals are their reflectance (brass about #d8b46a); the handle colour comes from the preset. stone: quartz worktops and
// sills, semi-polished.
export const METAL={brass:{metalness:1,roughness:.36,color:'#d2ad68'},coated:{metalness:0,roughness:.52,color:'#2f3832'},handleBar:{metalness:1,roughness:.42},handleKnob:{metalness:1,roughness:.3},handlePull:{metalness:1,roughness:.4}};
export const STONE_ROUGHNESS=.32;
// Stone figure (tilePixels vein): wet-room porcelain faint, B's stone floor a little more.
export const TILE_VEIN=.05,STONE_VEIN=.09;
// Relief, heights in mm (GPU tier only). Wood floors: seams `seam` deep, a rounded shoulder `shoulder` mm wide dropping `bevel`
// towards them, late-wood bands `grain` × their darkening lower (open grain, light). Tiles: grout `joint` below the face, the
// 1-pixel arris `arris`. Fabric: each visible thread a dome `thread` high across it, arching ±20 % along it, thicker by `slub` ×
// the colour's slub. scale: the material's normalScale. Tuned 2026-10-24 on desk 2040 and laptop 2552 close-ups: joints and
// shoulders read under the fill and sun, faces stay clean, brightness of the seven standard views unchanged (≤ 0.1 %).
export const RELIEF={wood:{seam:1.2,bevel:.9,shoulder:3,grain:1.2,scale:1.2},tile:{joint:1.2,arris:.4,scale:.8},fabric:{thread:.6,slub:.5,scale:1}};
// Height of a seam and its rounded shoulder at e pixels (or metres) in from a board edge: seam below e0, then rising over w
// (the colour map's micro-bevel or `shoulder` mm, whichever is wider) to the face.
const groove=(e,e0,w)=>e<e0?-RELIEF.wood.seam:e<e0+w?-RELIEF.wood.bevel*((e0+w-e)/w)**2:0;
export const ENUMS={wall:['limewash','plaster','eggshell','matte'],floor:['straight','herringbone'],door:['framed','slab'],grain:['wood','plain'],handle:['bar','knob','hidden'],tone:['oak','honey','walnut','pale']};

// --- pixels -------------------------------------------------------------------------------------------------------------
const ENC=new Uint8Array(4097);for(let i=0;i<=4096;i++){const v=i/4096;ENC[i]=Math.round(255*(v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055));}
const enc=v=>ENC[v<=0?0:v>=1?4096:(v*4096+.5)|0];
export const lin=b=>{const v=b/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};
function hash(n){n=Math.imul(n^n>>>16,0x7feb352d);n=Math.imul(n^n>>>15,0x846ca68b);return ((n^n>>>16)>>>0)/4294967296;}
const h3=(a,b,s)=>hash(Math.imul(a|0,73856093)^Math.imul(b|0,19349663)^Math.imul(s|0,83492791));
// Smooth profiles with period 4096: WAVE (harmonics 3–29: brush marks, slubs), LOW (harmonics 1–3: grain sweep, streaks).
// An argument scaled by 4096/n·k repeats every n pixels.
const profile=h=>{const t=new Float32Array(4096);let mx=0;for(let i=0;i<4096;i++){const a=i/4096*Math.PI*2;t[i]=h.reduce((s,[f,w,p])=>s+w*Math.sin(a*f+p),0);mx=Math.max(mx,Math.abs(t[i]));}for(let i=0;i<4096;i++)t[i]/=mx;return t;};
const WAVE=profile([[3,1,.4],[7,.55,1.9],[13,.3,4.1],[29,.18,2.3]]),LOW=profile([[1,1,.7],[2,.45,2.6],[3,.25,5.1]]);
const wave=x=>WAVE[(x|0)&4095],low=x=>LOW[(x|0)&4095];
// Late-wood band across one growth ring (q in 0…1), with a fainter early band.
const RING=new Float32Array(256);for(let i=0;i<256;i++){const q=i/256;RING[i]=Math.exp(-(((q-.62)/.15)**2))+.35*Math.exp(-(((q-.2)/.08)**2));}
// Periodic fractal value noise on an n×n grid, first octave `cells` across, about −1…1.
function fbm(n,cells,octaves,seed,gain=.5){const out=new Float32Array(n*n);let amp=1,sum=0;
 for(let o=0;o<octaves&&cells<=n;o++,cells*=2,amp*=gain){sum+=amp;const g=new Float32Array(cells*cells);for(let i=0;i<g.length;i++)g[i]=hash(i*977+seed*7717+o*131)*2-1;const s=cells/n;
  for(let y=0;y<n;y++){const fy=y*s,iy=fy|0,ty=fy-iy,v=ty*ty*(3-2*ty),y0=iy*cells,y1=((iy+1)%cells)*cells;for(let x=0;x<n;x++){const fx=x*s,ix=fx|0,tx=fx-ix,u=tx*tx*(3-2*tx),x1=(ix+1)%cells;
   const a=g[y0+ix],b=g[y0+x1],c=g[y1+ix],d=g[y1+x1];out[y*n+x]+=amp*(a+(b-a)*u+(c-a+(d-c-b+a)*u)*v);}}}
 for(let i=0;i<out.length;i++)out[i]/=sum;return out;}
// Periodic n×n field bilinearly enlarged to a px×px map (px a multiple of n).
function upsample(f,n,px){const out=new Float32Array(px*px),s=n/px,row=new Float32Array(n+1);
 for(let y=0;y<px;y++){const fy=y*s,iy=fy|0,ty=fy-iy,y0=iy*n,y1=((iy+1)%n)*n;for(let k=0;k<n;k++)row[k]=f[y0+k]+(f[y1+k]-f[y0+k])*ty;row[n]=row[0];
  const o=y*px;for(let x=0;x<px;x++){const fx=x*s,ix=fx|0;out[o+x]=row[ix]+(row[ix+1]-row[ix])*(fx-ix);}}return out;}

// Wood figure for one board: growth rings across it (spacing about p px, irregular, some rings darker), sweeping gently along it
// (one or two sweeps per 1024 px, so maps tile), pores as short dashes along the grain, faint streaks. Tables per board keep the
// per-pixel work to a few lookups.
function board(seed,p,contrast){const rk=new Float32Array(256);for(let r=0;r<256;r++)rk[r]=contrast*(.55+.9*hash(r*131+seed));
 return {seed,ip:1/p,rk,ph:(seed*.37)%1,s53:seed*53,s911:seed*911,s313:seed*313,s577:seed*577,st:contrast/.15*.025};}
const sweep=(B,b)=>LOW[((b*4+B.s911)|0)&4095]*1.6+LOW[((b*8+B.s313)|0)&4095]*.5;
function ring(B,a,b,w){let u=a*B.ip+w+B.ph;u+=.3*LOW[((u*97+B.s53)|0)&4095];const r=Math.floor(u);
 return 1-B.rk[(r+16)&255]*RING[((u-r)*256)|0]+.03*(h3(a,b/18,B.seed)-.5)+B.st*LOW[((a*37+B.s577)|0)&4095];}

// Pattern L with a per-pixel hue shift h (red ×(1+h), blue ×(1−hb·h)) to an sRGB map whose mean linear colour is `mean`
// (null: keep L, ≤ 1, as grey), plus a roughness map derived from it at half size: darker (pores, joints, grout) is rougher.
// The roughness map peaks at 1; meanRough is its mean, so a material roughness of base / meanRough keeps the average at base.
function finish(px,L,hue,mean,{rBase=.94,rGain=.4,hb=1,height=null,scale=1}={}){
 const n=px*px,data=new Uint8Array(n*4);let sr=0,sg=0,sb=0;
 for(let i=0;i<n;i++){const l=L[i],h=hue?hue[i]:0;sr+=l*(1+h);sg+=l;sb+=l*(1-hb*h);}
 const mL=sg/n,kr=mean?mean[0]*n/sr:1,kg=mean?mean[1]*n/sg:1,kb=mean?mean[2]*n/sb:1;
 for(let i=0,j=0;i<n;i++,j+=4){const l=L[i],h=hue?hue[i]:0;data[j]=enc(l*(1+h)*kr);data[j+1]=enc(l*kg);data[j+2]=enc(l*(1-hb*h)*kb);data[j+3]=255;}
 const r=px>>1,R=new Float32Array(r*r),im=1/mL;let mx=0;
 for(let y=0;y<r;y++)for(let x=0;x<r;x++){const i=y*2*px+x*2,l=(L[i]+L[i+1]+L[i+px]+L[i+px+1])*.25*im,v=Math.min(1,Math.max(.5,rBase+rGain*(1-l)));R[y*r+x]=v;if(v>mx)mx=v;}
 const rough=new Uint8Array(r*r*2);let mR=0;for(let i=0;i<R.length;i++){const v=Math.round(R[i]/mx*255);rough[i*2]=rough[i*2+1]=v;mR+=v;}
 return {data,px,rough,rx:r,meanRough:mR/255/R.length,meanL:mL,...(height?{height,normalScale:scale}:{})};
}

// Tangent-space normal map (RGBA, linear) from a periodic height field H (mm) on px×px pixels of pu × pv mm: Sobel gradient,
// n = normalize(−∂h/∂u, −∂h/∂v, 1). Rows run along +v (DataTexture, no flip), as the colour map's. Flat is (128, 128, 255).
export function normalPixels(H,px,pu,pv){const out=new Uint8Array(px*px*4),ku=1/(8*pu),kv=1/(8*pv);
 for(let y=0;y<px;y++){const a=((y+px-1)%px)*px,b=y*px,c=((y+1)%px)*px;
  for(let x=0;x<px;x++){const l=(x+px-1)%px,r=(x+1)%px,gx=(H[a+r]+2*H[b+r]+H[c+r]-H[a+l]-2*H[b+l]-H[c+l])*ku,gy=(H[c+l]+2*H[c+x]+H[c+r]-H[a+l]-2*H[a+x]-H[a+r])*kv;
   const k=1/Math.sqrt(gx*gx+gy*gy+1),j=(b+x)*4;out[j]=Math.round((1-gx*k)*127.5);out[j+1]=Math.round((1-gy*k)*127.5);out[j+2]=Math.round((1+k)*127.5);out[j+3]=255;}}
 return out;}

// Veneer: `strips` leaves across (0.15 m), grain along v, the whole tile long: seamless both ways. Sliced veneer is laid up
// leaf to leaf on the panel and sanded flush: leaves differ a little in tone and figure, with no dark line between them.
export const VENEER={leafTone:.1};
export function woodPixels(px=1024){const S=MAPS.wood.strips,L=new Float32Array(px*px),hue=new Float32Array(px*px),cw=px/S,sc=1024/px;
 for(let s=0;s<S;s++){const B=board(s+1,(3.5+hash(s*17+3)*3)/sc,.13+hash(s*7+1)*.07),tone=1+(hash(s*31+5)-.5)*VENEER.leafTone,h=(hash(s*13+9)-.5)*.06,x0=Math.round(s*cw),x1=Math.round((s+1)*cw);
  for(let y=0;y<px;y++){const w=sweep(B,y*sc),o=y*px;for(let x=x0;x<x1;x++){L[o+x]=tone*ring(B,x-x0,y*sc,w);hue[o+x]=h;}}}
 return finish(px,L,hue,MEAN.wood,{rBase:.93,rGain:.45});}
const TONES={oak:{tone:.12,hue:.05,contrast:.15},honey:{tone:.1,hue:.08,contrast:.12},walnut:{tone:.18,hue:.06,contrast:.24},pale:{tone:.07,hue:.03,contrast:.09}};

// End joints of neighbouring rows (the map's columns, the last next to the first when it tiles) at least `min` of a board length
// apart, the installer's rule (相邻两排端缝错开 ≥ 1/3 板长, ≥ 300 mm for 0.9 m boards), and rows two apart at least `skip` apart,
// so the joints do not line up every other row (a brick bond reads as a pattern): each row steps 1/3–2/3 of a board from the
// last (with a 2 % margin), redrawn until it keeps `skip`; the first seed (of 4096) whose wrap-around pairs keep both is used.
// Fractions of a board.
export const STAGGER={min:1/3,skip:1/6};
// A map that tiles needs its rows' steps (each 1/3–2/3, two in a row clear of a whole board by `skip`, so all under 5/12) to add
// up to whole boards: k boards over n rows with n/3 < k < 5n/12 (with margins). 5, 8, 10, 13… rows can; others (6, 7, 9, 11)
// only with near-exact steps, a fixed pattern. The map takes the next row count up that can (0.19 m boards: 8 rows, 1.52 m).
const feasible=n=>{for(let k=Math.ceil(n*(STAGGER.min+.04));k<n*(5/12-.01);k++)return true;return false;};
export const staggerCols=n=>{for(let m=Math.max(5,n);;m++)if(feasible(m))return m;};
export const boardGap=(a,b)=>{const d=((a-b)%1+1)%1;return Math.min(d,1-d);};
export function staggerOffsets(cols,seed=7){const {min:lo,skip}=STAGGER,valid=o=>o.every((v,i)=>boardGap(v,o[(i+1)%cols])>=lo-1e-9&&(cols<4||boardGap(v,o[(i+2)%cols])>=skip-1e-9));let off=[];
 for(let k=0;k<4096;k++){off=[hash(seed*131+k)];
  for(let c=1;c<cols;c++){let v=0;for(let j=0;j<24;j++){v=(off[c-1]+lo+.02+(1-2*lo-.04)*hash(c*41+seed+k*977+j*7919))%1;if(c<2||boardGap(v,off[c-2])>=skip)break;}off.push(v);}
  if(valid(off))break;}
 return off;}
// Wood floor, straight lay: about 1.2 m of boards across the map, two board lengths along it, end joints staggered per row
// (staggerOffsets); 1.2 mm seams and a 1.5 mm micro-bevel. size: the map's extent in metres (repeat = 1 / size).
export function plankPixels(px,{plank=.15,length=.9,tone='oak',relief=false}={}){
 const cols=staggerCols(Math.max(3,Math.round(1.2/plank))),L=new Float32Array(px*px),Hh=relief?new Float32Array(px*px):null,hue=new Float32Array(px*px),cw=px/cols,sh=px/2,T=TONES[tone]||TONES.oak,mm=px/(cols*plank)/1000,sc=1024/px;
 const seam=Math.max(1,Math.round(1.2*mm)),bev=seam+Math.max(1,Math.round(1.5*mm)),tn=tone.length,sw=Math.max(bev-seam,RELIEF.wood.shoulder*mm),offs=staggerOffsets(cols);
 for(let c=0;c<cols;c++){const x0=Math.round(c*cw),x1=Math.round((c+1)*cw),wd=x1-x0,off=Math.round(offs[c]*sh)%sh;
  const boards=[0,1].map(s=>{const id=c*2+s+1;return {B:board(id*3+tn,(4+hash(id*11)*3.5)/sc,T.contrast*(.8+.4*hash(id*5))),tone:1+(hash(id*53+tn)-.5)*T.tone,h:(hash(id*29+tn)-.5)*T.hue};});
  for(let y=0;y<px;y++){const yy=(y+off)%px,s=(yy/sh)|0,b=yy-s*sh,P=boards[s],w=sweep(P.B,yy*sc),eb=Math.min(b,sh-1-b),o=y*px;
   for(let x=x0;x<x1;x++){const a=x-x0,e=Math.min(a,wd-1-a,eb),rv=ring(P.B,a,yy*sc,w);L[o+x]=P.tone*rv*(e<seam?.45:e<bev?.93:1);hue[o+x]=P.h;if(Hh)Hh[o+x]=groove(e+.5,seam,sw)+RELIEF.wood.grain*(rv-1);}}}
 return {...finish(px,L,hue,MEAN.wood,{rBase:.92,rGain:.5,hb:1.4,height:Hh,scale:RELIEF.wood.scale}),size:[cols*plank,2*length],seamPx:seam,rows:offs.map(o=>Math.round(o*sh)%sh/sh)};}

// Herringbone (人字拼), boards w × l (l = k·w) at ±45° to the walls. In the board frame s = (x+y)/√2, t = (y−x)/√2 the pattern
// repeats under (w, w) and (l, −l): w√2 along the room's y, l√2 along x. The map holds 2 × 2k repeats (2l√2 square).
export function herringbonePixels(px,{plank=.1,length=.6,tone='honey',relief=false}={}){
 const k=Math.round(length/plank),w=plank,l=k*w,size=2*l*Math.SQRT2,m=size/px,im=1/m,L=new Float32Array(px*px),Hh=relief?new Float32Array(px*px):null,hue=new Float32Array(px*px),T=TONES[tone]||TONES.honey;
 const seam=Math.max(.0012,m),bev=seam+.0015,sw=Math.max(bev-seam,RELIEF.wood.shoulder/1000),r2=Math.SQRT1_2,per=2*k,tn=tone.length,boards=[],iw=1/w,iL=1/(l*Math.SQRT2);let miss=0;
 for(let id=1;id<=4*per;id++)boards[id-1]={B:board(id*3+tn,(4+hash(id*11)*3)*.00117*im,T.contrast*(.8+.4*hash(id*5))),tone:1+(hash(id*53+tn)-.5)*T.tone,h:(hash(id*29+tn)-.5)*T.hue};
 for(let y=0;y<px;y++)for(let x=0;x<px;x++){const X=(x+.5)*m,Y=(y+.5)*m,s=(X+Y)*r2,t=(Y-X)*r2,b0=Math.floor(X*iL),i=y*px+x;let V=-1,A=0,B=0,across=0,along=0;
  for(let b=b0-1;b<=b0+1&&V<0;b++){
   // Horizontal board: 0 ≤ s−Aw−Bl ≤ l, 0 ≤ t−Aw+Bl ≤ w. Vertical board: l ≤ s−Aw−Bl ≤ l+w, w−l ≤ t−Aw+Bl ≤ w.
   let a=Math.floor((t+b*l)*iw),rs=s-a*w-b*l,rt=t-a*w+b*l;if(rs>=-1e-9&&rs<=l+1e-9){V=0;A=a;B=b;across=rt;along=rs;continue;}
   a=Math.floor((s-b*l-l)*iw);rs=s-a*w-b*l;rt=t-a*w+b*l;if(rt>=w-l-1e-9&&rt<=w+1e-9){V=1;A=a;B=b;across=rs-l;along=rt-(w-l);}}
  if(V<0){miss++;L[i]=.45;if(Hh)Hh[i]=-RELIEF.wood.seam;continue;}
  const P=boards[V+2*(((A%per)+per)%per+per*(B&1))],e=Math.min(across,w-across,along,l-along),b=along*im;
  const rv=ring(P.B,across*im,b,sweep(P.B,b));L[i]=P.tone*rv*(e<seam?.45:e<bev?.93:1);hue[i]=P.h;if(Hh)Hh[i]=groove(e,seam,sw)+RELIEF.wood.grain*(rv-1);}
 return {...finish(px,L,hue,MEAN.wood,{rBase:.92,rGain:.5,hb:1.4,height:Hh,scale:RELIEF.wood.scale}),size:[size,size],miss};}

// Tiles: nx × ny tiles of tw × th m with `grout` joints (a whole number of pixels, at least 1), rows offset by `bond` of a tile;
// per-tile tone, a faint cloud, speckle, a 1-pixel arris; `vein` > 0: a stone figure, veins that much darker: bands of a sine
// across the tile (VEIN.spacing apart, a common direction ± VEIN.spread) bent by a fractal field (VEIN.warp), hair-thin finer
// veins between, fading in and out with the cloud; each tile its own phase, angle and part of the field, as every porcelain
// face differs. Veins stay lighter than the grout and carry no relief. size: extent in metres; groutPx: joint width in pixels.
export const VEIN={angle:.65,spread:.5,spacing:.42,warp:.8,width:.025,fine:.45};
export function tilePixels(px,{tw=.6,th=tw,nx=2,ny=2,grout=.002,bond=0,mean=MEAN.tile,cloud=.025,speck=.02,tone=.04,seed=3,vein=0,relief=false}={}){
 const W=nx*tw,H=ny*th,tx=px/nx,ty=px/ny,gx=Math.max(1,Math.round(grout/(W/px))),gy=Math.max(1,Math.round(grout/(H/px))),L=new Float32Array(px*px),Hh=relief?new Float32Array(px*px):null,C=upsample(fbm(256,4,4,seed,.55),256,px),sh=Math.round(bond*tx);
 const VF=vein?upsample(fbm(256,3,5,seed+17,.55),256,px):null,mx=W/px,my=H/px,iw=1/VEIN.width,iF=1/(1.6*VEIN.width),
  vo=VF?[...Array(nx*ny+nx)].map((_,t)=>{const a=VEIN.angle+(hash(t*53+seed)-.5)*2*VEIN.spread;return [(hash(t*97+seed)*px)|0,(hash(t*131+seed)*px)|0,Math.cos(a)/VEIN.spacing,Math.sin(a)/VEIN.spacing,hash(t*71+seed)];}):null;
 // Per position across a tile: 0 face, 1 arris, 2 joint.
 const kind=(t,g)=>{const a=new Uint8Array(t),lo=Math.ceil(g/2),hi=t-Math.floor(g/2);for(let p=0;p<t;p++)a[p]=p<lo||p>=hi?2:p<lo+1||p>=hi-1?1:0;return a;},KX=kind(tx,gx),KY=kind(ty,gy);
 for(let y=0;y<px;y++){const row=(y/ty)|0,ky=KY[y-row*ty],o=y*px;for(let x=0;x<px;x++){const X=((x-row*sh)%px+px)%px,col=(X/tx)|0,kx=KX[X-col*tx],i=o+x;
  if(kx===2||ky===2){L[i]=.58+.04*(h3(x,y,seed)-.5);if(Hh)Hh[i]=-RELIEF.tile.joint;continue;}
  let v=1;if(VF){const [ox,oy,c,s,ph]=vo[row*nx+col],p=X*mx*c+y*my*s+ph+VEIN.warp*VF[((y+oy)%px)*px+(X+ox)%px],a=Math.max(0,1-Math.abs(Math.sin(Math.PI*p))*iw),b=Math.max(0,1-Math.abs(Math.sin(Math.PI*(2.3*p+.37)))*iF);v=1-vein*(.6+.4*C[i])*Math.min(1,a*a+VEIN.fine*b*b);}
  L[i]=(1+(hash((row*nx+col+1)*61+seed)-.5)*tone)*(1+cloud*C[i])*(1+speck*(h3(x,y,seed+9)-.5))*v*(kx||ky?.96:1);if(Hh&&(kx||ky))Hh[i]=-RELIEF.tile.arris;}}
 return {...finish(px,L,null,mean,{rBase:.9,rGain:1.2,height:Hh,scale:RELIEF.tile.scale}),size:[W,H],groutPx:[gx,gy],module:[tw,th]};}

// Quartz (石英石) worktops, sills and stone tops: grains about `grain` m (1 mm), a few in a hundred darker or lighter, over a faint
// cloud. L around 1 (apply() divides the stone colour by its mean, so the home's stone colour holds on average); no relief
// (polished). size: extent in metres.
export function quartzPixels(px,{size=MAPS.stone.tile,grain=MAPS.stone.grain,seed=13}={}){const L=new Float32Array(px*px),C=upsample(fbm(256,3,4,seed,.5),256,px),g=Math.max(1,Math.round(grain/(size/px)));
 for(let y=0;y<px;y++)for(let x=0;x<px;x++){const i=y*px+x,r=h3((x/g)|0,(y/g)|0,seed),q=r<.05?-.16*(1-r/.05):r>.975?.05:0;L[i]=(1+.025*C[i])*(1+q)*(1+.012*(h3(x,y,seed+3)-.5));}
 let m=0;for(let i=0;i<L.length;i++)m+=L[i];m/=L.length;for(let i=0;i<L.length;i++)L[i]=Math.min(1,L[i]/m*.97);
 return {...finish(px,L,null,null,{rBase:.92,rGain:.5}),size:[size,size],grainPx:g};}

// Plain weave, 2 mm threads: over/under shading across each thread, slub (tone drifting along the thread), heathered threads.
export function fabricPixels(px=512,{relief=false}={}){const t=Math.max(2,Math.round(MAPS.fabric.thread/(MAPS.fabric.tile/px))),L=new Float32Array(px*px),hue=new Float32Array(px*px),Hh=relief?new Float32Array(px*px):null;
 for(let y=0;y<px;y++)for(let x=0;x<px;x++){const i=y*px+x,cx=(x/t)|0,cy=(y/t)|0,over=(cx+cy)&1,fa=((over?x:y)%t+.5)/t,th=over?cx:cy+1e4,along=over?y:x;
  const sl=wave(along*8192/px+hash(th*97)*4096);L[i]=(1-.32*(2*fa-1)**2)*(1+.07*sl+.05*(hash(th*13)-.5))*(over?1:.94);hue[i]=(hash(th*7)-.5)*.05;
  if(Hh){const fb=(along%t+.5)/t;Hh[i]=RELIEF.fabric.thread*(1-(2*fa-1)**2)*(.8+.2*(1-(2*fb-1)**2))*(1+RELIEF.fabric.slub*sl);}}
 return {...finish(px,L,hue,MEAN.fabric,{rBase:.97,rGain:.15,height:Hh,scale:RELIEF.fabric.scale}),threadPx:t};}

// Wall paint: limewash (cloudy, brushed), plaster (trowel patches), eggshell (fine orange peel), matte (fine grain). L ≤ 1 around
// white; apply() divides the wall colour by its mean, so walls keep the home's wall colour on average.
export const PAINT={limewash:{cloud:.07,brush:.025,fine:.008,peel:0},plaster:{cloud:.045,brush:.03,fine:.01,peel:0},eggshell:{cloud:.01,brush:0,fine:.006,peel:.012},matte:{cloud:.012,brush:0,fine:.012,peel:0}};
export function paintPixels(px,name){const P=PAINT[name]||PAINT.matte,L=new Float32Array(px*px),C=upsample(fbm(256,3,5,11,.55),256,px),G=P.brush?upsample(fbm(256,16,2,23,.6),256,px):null,E=P.peel?upsample(fbm(256,128,1,31),256,px):null,mk=px-1;
 const lane=new Float32Array(2*px/96+2);for(let i=0;i<lane.length;i++)lane[i]=hash(i)*4096;
 for(let y=0;y<px;y++)for(let x=0;x<px;x++){const i=y*px+x;let v=1-P.cloud*(.5+.5*C[i])-P.fine*h3(x,y,41);
  if(G)v-=P.brush*(.5+.5*G[y*px+((x+y)&mk)])*(.5+.5*C[x*px+y])*Math.abs(WAVE[(((x-y)*4096/px*5+lane[((x+y)/96)|0])|0)&4095]);if(E)v-=P.peel*(.5+.5*E[i]);L[i]=v;}
 return finish(px,L,null,null,{rBase:.96,rGain:.6});}

// --- textures and materials ---------------------------------------------------------------------------------------------
function dataTex(data,w,{srgb=true,aniso=1,rg=false}={}){const t=new THREE.DataTexture(data,w,w,rg?THREE.RGFormat:THREE.RGBAFormat,THREE.UnsignedByteType);
 t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=aniso;t.needsUpdate=true;return t;}
// GPU bytes including mipmaps.
export const textureBytes=t=>t?.image?Math.round(t.image.width*t.image.height*(t.format===THREE.RGFormat?2:4)*4/3):0;

// tier: render-tier.js. Software rasterisers (fill-bound) get 512² wood and tile maps, no roughness maps and plain walls; the
// fabric is 512² everywhere (2 mm threads need 4 pixels). Normal maps (wood floors, wet-room, stone and balcony tiles, fabric;
// the size of their colour map) only on GPUs: phones and software rasterisers never compute or carry them.
export function createFinishes({tier='gpu',maxAniso=1}={}){
 const soft=tier==='soft',px=soft?512:1024,aniso=Math.max(1,Math.min(8,maxAniso)),roughMaps=!soft,wallMaps=!soft,normals=tier==='gpu',made=new Map();
 const pack=(r,size)=>{const map=dataTex(r.data,r.px,{aniso});map.repeat.set(1/size[0],1/size[1]);let rough=null,normal=null;
  if(roughMaps){rough=dataTex(r.rough,r.rx,{srgb:false,aniso,rg:true});rough.repeat.copy(map.repeat);}
  if(normals&&r.height){normal=dataTex(normalPixels(r.height,r.px,size[0]/r.px*1000,size[1]/r.px*1000),r.px,{srgb:false,aniso});normal.repeat.copy(map.repeat);delete r.height;}
  return {map,rough,normal,normalScale:normal?r.normalScale:0,meanL:r.meanL,meanRough:rough?r.meanRough:1,size,info:r};};
 const once=(key,fn)=>{if(!made.has(key))made.set(key,fn());return made.get(key);};
 const wood=pack(woodPixels(px),[MAPS.wood.tile,MAPS.wood.tile]),fabric=pack(fabricPixels(MAPS.fabric.px,{relief:normals}),[MAPS.fabric.tile,MAPS.fabric.tile]);
 // Fabrics are matte throughout: no roughness map (and no extra texture fetch).
 fabric.rough?.dispose();fabric.rough=null;fabric.meanRough=1;
 const tileRaw=tilePixels(px,{tw:MAPS.tile.tile[0],th:MAPS.tile.tile[1],grout:MAPS.tile.grout,vein:TILE_VEIN,relief:normals}),tileMap=pack(tileRaw,tileRaw.size);
 // Quartz: one map for every M.stone surface; software rasterisers take 256² (2.3 mm grains), no roughness map.
 const quartz=pack(quartzPixels(soft?MAPS.stone.px/2:MAPS.stone.px),[MAPS.stone.tile,MAPS.stone.tile]);
 const outdoor=pack(tilePixels(px,{tw:MAPS.outdoor.tile[0],th:MAPS.outdoor.tile[1],nx:4,ny:2,grout:MAPS.outdoor.grout,bond:.5,mean:MEAN.outdoor,cloud:.04,speck:.16,tone:.08,seed:7,relief:normals}),[4*MAPS.outdoor.tile[0],2*MAPS.outdoor.tile[1]]);
 // Floors and walls follow the preset: the one shown is kept, one replaced is freed (and made again if chosen again).
 // Stone floors: tile × tileLong slabs (B: 750 × 1500), stacked, the preset's joint, a soft stone figure.
 const floorOf=(finishName,f={})=>finishName==='stone'?once(['stone',f.tile||.8,f.tileLong||f.tile||.8].join('|'),()=>{const r=tilePixels(px,{tw:f.tile||.8,th:f.tileLong||f.tile||.8,grout:f.grout||MAPS.tile.grout,cloud:.035,tone:.03,seed:5,vein:f.vein??STONE_VEIN,relief:normals});return pack(r,r.size);})
  :once(['wood',f.pattern,f.plank,f.length,f.tone].join('|'),()=>{const r=(f.pattern==='herringbone'?herringbonePixels:plankPixels)(px,normals?{...f,relief:true}:f);return pack(r,r.size);});
 const wallOf=w=>wallMaps?once('wall|'+w.finish,()=>pack(paintPixels(MAPS.wall.px,w.finish),[MAPS.wall.tile,MAPS.wall.tile])):null;
 const fixed=[wood,fabric,tileMap,outdoor,quartz],state={detail:null};
 const setMap=(m,t,base)=>{const map=t?.map||null,rough=t?.rough||null;if(m.map!==map||m.roughnessMap!==rough){m.map=map;m.roughnessMap=rough;m.needsUpdate=true;}m.roughness=Math.min(1,base/(t?.meanRough||1));if(normals)setRelief(m,t);};
 // GPU tier: the finish's normal map (or none) with its normalScale. Never called on phones or software rasterisers.
 const setRelief=(m,t)=>{const n=t?.normal||null;if(m.normalMap!==n){m.normalMap=n;m.needsUpdate=true;}if(n)m.normalScale.set(t.normalScale,t.normalScale);};
 // Called right after app.js builds M: maps on the shared finishes, bevel classes, and the materials the presets switch.
 function extend(M,{mat,clipPlane}){
  setMap(M.oak,wood,.6);setMap(M.tile,tileMap,.8);if(normals)for(const k of ['linen','olive'])setRelief(M[k],fabric);
  setMap(M.stone,quartz,STONE_ROUGHNESS);
  for(const k of ['brass','metal']){const q=METAL[k==='metal'?'coated':k];M[k].metalness=q.metalness;M[k].roughness=q.roughness;M[k].color.set(q.color);}
  for(const k of ['oak','walnut'])M[k].userData.bevel='cabinet';M.linen.userData.bevel='soft';for(const k of ['olive','terracotta'])M[k].userData.bevel='cushion';
  // Cabinet fronts and carcasses (wardrobes, side cabinet, display cabinets); framed doors' stiles and rails (shown only for
  // framed doors); one material per handle style, only the preset's style visible (batchStatic merges by material, so a
  // style is one draw and the hidden ones cost nothing); window and balcony-door frames; balcony tiles.
  M.door=new THREE.MeshStandardMaterial({color:'#efe7d9',roughness:.5});M.door.userData.bevel='cabinet';
  M.doorFrame=M.door.clone();M.doorFrame.color=M.door.color;M.doorFrame.visible=false;
  const hc=new THREE.Color('#a8834a');for(const k of ['handleBar','handleKnob','handlePull'])M[k]=new THREE.MeshStandardMaterial({roughness:METAL[k].roughness,metalness:METAL[k].metalness});
  for(const m of [M.handleBar,M.handleKnob,M.handlePull])m.color=hc;M.handleKnob.visible=M.handlePull.visible=false;
  // Window and balcony-door frames: powder-coated aluminium (paint): dielectric.
  M.frame=mat('#596559',.45,{metalness:0,clippingPlanes:[clipPlane]});
  M.outdoor=mat('#ffffff',.92,{map:outdoor.map});setMap(M.outdoor,outdoor,.92);
  // Cut twins for wall-hung pieces above 1.28 m (cut with the walls, like app.js art()): the same colour object, so palettes and
  // presets still apply; apply() keeps the door twin's map in step.
  const twin=m=>{const c=m.clone();c.color=m.color;c.clippingPlanes=[clipPlane];return c;};
  for(const k of ['door','white','olive','dark','linen','brass','metal','handleBar','handleKnob','handlePull'])M[k+'Cut']=twin(M[k]);
  return M;
 }
 // After the home's colours are on M (app.js applyHomeDesign): the preset's floor and wall maps, cabinet doors, handles, frames.
 function apply(M,home,detail){
  if(!detail)detail=state.detail;if(!detail)return;state.detail=detail;
  const floor=floorOf(home.floorFinish,detail.floor),paint=wallOf(detail.wall);
  setMap(M.floor,floor,.78);setMap(M.wall,paint,detail.wall.roughness);if(paint)M.wall.color.multiplyScalar(1/paint.meanL);
  // Quartz keeps the home's stone colour on average. Wet-room tiles (not a home colour): the preset's tile, whose colour is the
  // tiled surface's average (the map's own mean taken out); the bathroom wall-tile twins share M.tile's colour object.
  M.stone.color.multiplyScalar(1/quartz.meanL);
  if(detail.tile?.color){M.tile.color.set(detail.tile.color);M.tile.color.r/=MEAN.tile[0];M.tile.color.g/=MEAN.tile[1];M.tile.color.b/=MEAN.tile[2];}
  // Wood-grain doors take the home's wood colour, lifted for paler veneers: lift is a factor, or one per channel (r, g, b) that
  // also takes some of the veneer map's orange out.
  const grained=detail.cabinet.grain==='wood',lift=detail.cabinet.lift??1;if(grained){M.door.color.copy(M.oak.color);if(Array.isArray(lift))M.door.color.multiply(new THREE.Color().setRGB(...lift));else M.door.color.multiplyScalar(lift);}else M.door.color.set(detail.cabinet.color);
  for(const m of [M.door,M.doorFrame,M.doorCut])if(m)setMap(m,grained?wood:null,grained?.6:.5);
  M.doorFrame.visible=detail.cabinet.door==='framed';
  for(const [style,m] of [['bar',M.handleBar],['knob',M.handleKnob],['hidden',M.handlePull]])m.visible=detail.handle.style===style;
  for(const k of ['handleBar','handleKnob','handlePull'])M[k+'Cut'].visible=M[k].visible;
  M.handleBar.color.set(detail.handle.color);M.frame.color.set(detail.window.frame);
  for(const [k,v] of made)if(v!==floor&&v!==paint){v.map.dispose();v.rough?.dispose();v.normal?.dispose();made.delete(k);}
 }
 // GPU tier, once the scene is built (app.js): every standard material drawn with one of these maps takes its normal map too
 // (rugs and the wet-room tile twins are made outside M). apply() keeps M.floor in step when the preset changes. Returns the
 // number of materials changed; 0 and nothing touched on phones and software rasterisers.
 function relief(root){if(!normals)return 0;const by=new Map([...fixed,...made.values()].filter(t=>t.normal).map(t=>[t.map,t]));let n=0;
  root.traverse(o=>{for(const m of o.isMesh?[].concat(o.material):[])if(m&&'normalMap' in m&&by.has(m.map)){const t=by.get(m.map);if(m.normalMap!==t.normal)n++;setRelief(m,t);}});return n;}
 const textures=()=>[...fixed,...made.values()].flatMap(t=>[t.map,t.rough,t.normal]).filter(Boolean);
 const normalTextures=()=>[...fixed,...made.values()].map(t=>t.normal).filter(Boolean);
 return {woodtex:wood.map,fabrictex:fabric.map,tiletex:tileMap.map,maps:{wood,fabric,tile:tileMap,outdoor,quartz},extend,apply,relief,floorOf,wallOf,textures,
  stats:()=>({tier,px,roughMaps,wallMaps,normals,textures:textures().length,bytes:textures().reduce((s,t)=>s+textureBytes(t),0),normalMaps:normalTextures().length,normalBytes:normalTextures().reduce((s,t)=>s+textureBytes(t),0)})};
}
