import * as THREE from 'three';
// Finishes (scene detail round 3): procedural maps made in plain JS (the same pixels in the browser and in the node checks, no
// canvas), each preset's finish detail (design-presets.js PRESETS[id].detail: walls, floor, cabinets, handles, window frames;
// never stored in the user's home) and the bevel grades box()/round() use.

// Bevels. Casework finishes take 1–1.5 cm edges and upholstery 4–8 cm, whatever a call asks for; cushion fabrics default to
// 5 cm; untagged finishes keep the call's radius and round()'s default is the cabinet edge. RoundedBoxGeometry segments: 2 on
// GPUs (four facets a quarter round), 1 on phones and software rasterisers.
export const BEVEL={segments:1,cabinet:[.01,.015],soft:[.04,.08],cushion:.05};
export const bevelSegments=tier=>tier==='gpu'?2:1;
export function bevel(r,m){const k=m?.userData?.bevel,c=BEVEL[k];if(Array.isArray(c))return Math.min(c[1],Math.max(c[0],r??(k==='soft'?BEVEL.cushion:c[1])));return r??(k==='cushion'?BEVEL.cushion:BEVEL.cabinet[1]);}

// Map specs in metres; px is the edge on GPUs and phones (software rasterisers take half). MEAN: mean linear colour of the
// round-2 canvas maps (wood for veneer and wood floors, tile for wet-room and stone floors, fabric), so every surface keeps its
// average colour and the scene its brightness; the balcony tiles are a new, warmer grey.
export const MAPS={wood:{px:1024,tile:1.2,strips:8},fabric:{px:512,tile:.25,thread:.002},tile:{px:1024,tile:.6,grout:.002},
 outdoor:{px:1024,tile:[.3,.6],grout:.003},wall:{px:512,tile:2.4}};
export const MEAN={wood:[.554,.4374,.3196],tile:[.7929,.7545,.6598],fabric:[.794,.7554,.6606],outdoor:[.47,.445,.39]};
export const DETAIL_PARTS=['wall','floor','cabinet','handle','window'];
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
function finish(px,L,hue,mean,{rBase=.94,rGain=.4,hb=1}={}){
 const n=px*px,data=new Uint8Array(n*4);let sr=0,sg=0,sb=0;
 for(let i=0;i<n;i++){const l=L[i],h=hue?hue[i]:0;sr+=l*(1+h);sg+=l;sb+=l*(1-hb*h);}
 const mL=sg/n,kr=mean?mean[0]*n/sr:1,kg=mean?mean[1]*n/sg:1,kb=mean?mean[2]*n/sb:1;
 for(let i=0,j=0;i<n;i++,j+=4){const l=L[i],h=hue?hue[i]:0;data[j]=enc(l*(1+h)*kr);data[j+1]=enc(l*kg);data[j+2]=enc(l*(1-hb*h)*kb);data[j+3]=255;}
 const r=px>>1,R=new Float32Array(r*r),im=1/mL;let mx=0;
 for(let y=0;y<r;y++)for(let x=0;x<r;x++){const i=y*2*px+x*2,l=(L[i]+L[i+1]+L[i+px]+L[i+px+1])*.25*im,v=Math.min(1,Math.max(.5,rBase+rGain*(1-l)));R[y*r+x]=v;if(v>mx)mx=v;}
 const rough=new Uint8Array(r*r*2);let mR=0;for(let i=0;i<R.length;i++){const v=Math.round(R[i]/mx*255);rough[i*2]=rough[i*2+1]=v;mR+=v;}
 return {data,px,rough,rx:r,meanRough:mR/255/R.length,meanL:mL};
}

// Veneer: `strips` boards across (0.15 m), grain along v, the whole tile long: seamless both ways.
export function woodPixels(px=1024){const S=MAPS.wood.strips,L=new Float32Array(px*px),hue=new Float32Array(px*px),cw=px/S,sc=1024/px;
 for(let s=0;s<S;s++){const B=board(s+1,(3.5+hash(s*17+3)*3)/sc,.13+hash(s*7+1)*.07),tone=1+(hash(s*31+5)-.5)*.14,h=(hash(s*13+9)-.5)*.06,x0=Math.round(s*cw),x1=Math.round((s+1)*cw);
  for(let y=0;y<px;y++){const w=sweep(B,y*sc),o=y*px;for(let x=x0;x<x1;x++){const a=x-x0;L[o+x]=tone*ring(B,a,y*sc,w)*(a<1?.9:1);hue[o+x]=h;}}}
 return finish(px,L,hue,MEAN.wood,{rBase:.93,rGain:.45});}
const TONES={oak:{tone:.12,hue:.05,contrast:.15},honey:{tone:.1,hue:.08,contrast:.12},walnut:{tone:.18,hue:.06,contrast:.24},pale:{tone:.07,hue:.03,contrast:.09}};

// Wood floor, straight lay: about 1.2 m of boards across the map, two board lengths along it, joints staggered per column;
// 1.2 mm seams and a 1.5 mm micro-bevel. size: the map's extent in metres (repeat = 1 / size).
export function plankPixels(px,{plank=.15,length=.9,tone='oak'}={}){
 const cols=Math.max(3,Math.round(1.2/plank)),L=new Float32Array(px*px),hue=new Float32Array(px*px),cw=px/cols,sh=px/2,T=TONES[tone]||TONES.oak,mm=px/(cols*plank)/1000,sc=1024/px;
 const seam=Math.max(1,Math.round(1.2*mm)),bev=seam+Math.max(1,Math.round(1.5*mm)),tn=tone.length;
 for(let c=0;c<cols;c++){const x0=Math.round(c*cw),x1=Math.round((c+1)*cw),wd=x1-x0,off=(hash(c*41+7)*sh)|0;
  const boards=[0,1].map(s=>{const id=c*2+s+1;return {B:board(id*3+tn,(4+hash(id*11)*3.5)/sc,T.contrast*(.8+.4*hash(id*5))),tone:1+(hash(id*53+tn)-.5)*T.tone,h:(hash(id*29+tn)-.5)*T.hue};});
  for(let y=0;y<px;y++){const yy=(y+off)%px,s=(yy/sh)|0,b=yy-s*sh,P=boards[s],w=sweep(P.B,yy*sc),eb=Math.min(b,sh-1-b),o=y*px;
   for(let x=x0;x<x1;x++){const a=x-x0,e=Math.min(a,wd-1-a,eb);L[o+x]=P.tone*ring(P.B,a,yy*sc,w)*(e<seam?.45:e<bev?.93:1);hue[o+x]=P.h;}}}
 return {...finish(px,L,hue,MEAN.wood,{rBase:.92,rGain:.5,hb:1.4}),size:[cols*plank,2*length],seamPx:seam};}

// Herringbone (人字拼), boards w × l (l = k·w) at ±45° to the walls. In the board frame s = (x+y)/√2, t = (y−x)/√2 the pattern
// repeats under (w, w) and (l, −l): w√2 along the room's y, l√2 along x. The map holds 2 × 2k repeats (2l√2 square).
export function herringbonePixels(px,{plank=.1,length=.6,tone='honey'}={}){
 const k=Math.round(length/plank),w=plank,l=k*w,size=2*l*Math.SQRT2,m=size/px,im=1/m,L=new Float32Array(px*px),hue=new Float32Array(px*px),T=TONES[tone]||TONES.honey;
 const seam=Math.max(.0012,m),bev=seam+.0015,r2=Math.SQRT1_2,per=2*k,tn=tone.length,boards=[],iw=1/w,iL=1/(l*Math.SQRT2);let miss=0;
 for(let id=1;id<=4*per;id++)boards[id-1]={B:board(id*3+tn,(4+hash(id*11)*3)*.00117*im,T.contrast*(.8+.4*hash(id*5))),tone:1+(hash(id*53+tn)-.5)*T.tone,h:(hash(id*29+tn)-.5)*T.hue};
 for(let y=0;y<px;y++)for(let x=0;x<px;x++){const X=(x+.5)*m,Y=(y+.5)*m,s=(X+Y)*r2,t=(Y-X)*r2,b0=Math.floor(X*iL),i=y*px+x;let V=-1,A=0,B=0,across=0,along=0;
  for(let b=b0-1;b<=b0+1&&V<0;b++){
   // Horizontal board: 0 ≤ s−Aw−Bl ≤ l, 0 ≤ t−Aw+Bl ≤ w. Vertical board: l ≤ s−Aw−Bl ≤ l+w, w−l ≤ t−Aw+Bl ≤ w.
   let a=Math.floor((t+b*l)*iw),rs=s-a*w-b*l,rt=t-a*w+b*l;if(rs>=-1e-9&&rs<=l+1e-9){V=0;A=a;B=b;across=rt;along=rs;continue;}
   a=Math.floor((s-b*l-l)*iw);rs=s-a*w-b*l;rt=t-a*w+b*l;if(rt>=w-l-1e-9&&rt<=w+1e-9){V=1;A=a;B=b;across=rs-l;along=rt-(w-l);}}
  if(V<0){miss++;L[i]=.45;continue;}
  const P=boards[V+2*(((A%per)+per)%per+per*(B&1))],e=Math.min(across,w-across,along,l-along),b=along*im;
  L[i]=P.tone*ring(P.B,across*im,b,sweep(P.B,b))*(e<seam?.45:e<bev?.93:1);hue[i]=P.h;}
 return {...finish(px,L,hue,MEAN.wood,{rBase:.92,rGain:.5,hb:1.4}),size:[size,size],miss};}

// Tiles: nx × ny tiles of tw × th m with `grout` joints (a whole number of pixels, at least 1), rows offset by `bond` of a tile;
// per-tile tone, a faint cloud, speckle, a 1-pixel arris. size: extent in metres; groutPx: joint width in pixels.
export function tilePixels(px,{tw=.6,th=tw,nx=2,ny=2,grout=.002,bond=0,mean=MEAN.tile,cloud=.025,speck=.02,tone=.04,seed=3}={}){
 const W=nx*tw,H=ny*th,tx=px/nx,ty=px/ny,gx=Math.max(1,Math.round(grout/(W/px))),gy=Math.max(1,Math.round(grout/(H/px))),L=new Float32Array(px*px),C=upsample(fbm(256,4,4,seed,.55),256,px),sh=Math.round(bond*tx);
 // Per position across a tile: 0 face, 1 arris, 2 joint.
 const kind=(t,g)=>{const a=new Uint8Array(t),lo=Math.ceil(g/2),hi=t-Math.floor(g/2);for(let p=0;p<t;p++)a[p]=p<lo||p>=hi?2:p<lo+1||p>=hi-1?1:0;return a;},KX=kind(tx,gx),KY=kind(ty,gy);
 for(let y=0;y<px;y++){const row=(y/ty)|0,ky=KY[y-row*ty],o=y*px;for(let x=0;x<px;x++){const X=((x-row*sh)%px+px)%px,col=(X/tx)|0,kx=KX[X-col*tx],i=o+x;
  if(kx===2||ky===2){L[i]=.58+.04*(h3(x,y,seed)-.5);continue;}
  L[i]=(1+(hash((row*nx+col+1)*61+seed)-.5)*tone)*(1+cloud*C[i])*(1+speck*(h3(x,y,seed+9)-.5))*(kx||ky?.96:1);}}
 return {...finish(px,L,null,mean,{rBase:.9,rGain:1.2}),size:[W,H],groutPx:[gx,gy]};}

// Plain weave, 2 mm threads: over/under shading across each thread, slub (tone drifting along the thread), heathered threads.
export function fabricPixels(px=512){const t=Math.max(2,Math.round(MAPS.fabric.thread/(MAPS.fabric.tile/px))),L=new Float32Array(px*px),hue=new Float32Array(px*px);
 for(let y=0;y<px;y++)for(let x=0;x<px;x++){const i=y*px+x,cx=(x/t)|0,cy=(y/t)|0,over=(cx+cy)&1,fa=((over?x:y)%t+.5)/t,th=over?cx:cy+1e4,along=over?y:x;
  L[i]=(1-.32*(2*fa-1)**2)*(1+.07*wave(along*8192/px+hash(th*97)*4096)+.05*(hash(th*13)-.5))*(over?1:.94);hue[i]=(hash(th*7)-.5)*.05;}
 return {...finish(px,L,hue,MEAN.fabric,{rBase:.97,rGain:.15}),threadPx:t};}

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
// fabric is 512² everywhere (2 mm threads need 4 pixels).
export function createFinishes({tier='gpu',maxAniso=1}={}){
 const soft=tier==='soft',px=soft?512:1024,aniso=Math.max(1,Math.min(8,maxAniso)),roughMaps=!soft,wallMaps=!soft,made=new Map();
 const pack=(r,size)=>{const map=dataTex(r.data,r.px,{aniso});map.repeat.set(1/size[0],1/size[1]);let rough=null;
  if(roughMaps){rough=dataTex(r.rough,r.rx,{srgb:false,aniso,rg:true});rough.repeat.copy(map.repeat);}return {map,rough,meanL:r.meanL,meanRough:rough?r.meanRough:1,size,info:r};};
 const once=(key,fn)=>{if(!made.has(key))made.set(key,fn());return made.get(key);};
 const wood=pack(woodPixels(px),[MAPS.wood.tile,MAPS.wood.tile]),fabric=pack(fabricPixels(MAPS.fabric.px),[MAPS.fabric.tile,MAPS.fabric.tile]);
 // Fabrics are matte throughout: no roughness map (and no extra texture fetch).
 fabric.rough?.dispose();fabric.rough=null;fabric.meanRough=1;
 const tileMap=pack(tilePixels(px,{tw:MAPS.tile.tile,grout:MAPS.tile.grout}),[2*MAPS.tile.tile,2*MAPS.tile.tile]);
 const outdoor=pack(tilePixels(px,{tw:MAPS.outdoor.tile[0],th:MAPS.outdoor.tile[1],nx:4,ny:2,grout:MAPS.outdoor.grout,bond:.5,mean:MEAN.outdoor,cloud:.04,speck:.16,tone:.08,seed:7}),[4*MAPS.outdoor.tile[0],2*MAPS.outdoor.tile[1]]);
 // Floors and walls follow the preset: the one shown is kept, one replaced is freed (and made again if chosen again).
 const floorOf=(finishName,f={})=>finishName==='stone'?once('stone|'+(f.tile||.8),()=>{const r=tilePixels(px,{tw:f.tile||.8,grout:MAPS.tile.grout,cloud:.035,tone:.03,seed:5});return pack(r,r.size);})
  :once(['wood',f.pattern,f.plank,f.length,f.tone].join('|'),()=>{const r=(f.pattern==='herringbone'?herringbonePixels:plankPixels)(px,f);return pack(r,r.size);});
 const wallOf=w=>wallMaps?once('wall|'+w.finish,()=>pack(paintPixels(MAPS.wall.px,w.finish),[MAPS.wall.tile,MAPS.wall.tile])):null;
 const fixed=[wood,fabric,tileMap,outdoor],state={detail:null};
 const setMap=(m,t,base)=>{const map=t?.map||null,rough=t?.rough||null;if(m.map!==map||m.roughnessMap!==rough){m.map=map;m.roughnessMap=rough;m.needsUpdate=true;}m.roughness=Math.min(1,base/(t?.meanRough||1));};
 // Called right after app.js builds M: maps on the shared finishes, bevel classes, and the materials the presets switch.
 function extend(M,{mat,clipPlane}){
  setMap(M.oak,wood,.6);setMap(M.tile,tileMap,.8);
  for(const k of ['oak','walnut'])M[k].userData.bevel='cabinet';M.linen.userData.bevel='soft';for(const k of ['olive','terracotta'])M[k].userData.bevel='cushion';
  // Cabinet fronts and carcasses (wardrobes, side cabinet, display cabinets); framed doors' stiles and rails (shown only for
  // framed doors); one material per handle style, only the preset's style visible (batchStatic merges by material, so a
  // style is one draw and the hidden ones cost nothing); window and balcony-door frames; balcony tiles.
  M.door=new THREE.MeshStandardMaterial({color:'#efe7d9',roughness:.5});M.door.userData.bevel='cabinet';
  M.doorFrame=M.door.clone();M.doorFrame.color=M.door.color;M.doorFrame.visible=false;
  const hc=new THREE.Color('#a8834a');M.handleBar=new THREE.MeshStandardMaterial({roughness:.35,metalness:.6});M.handleKnob=new THREE.MeshStandardMaterial({roughness:.3,metalness:.7});M.handlePull=new THREE.MeshStandardMaterial({roughness:.4,metalness:.4});
  for(const m of [M.handleBar,M.handleKnob,M.handlePull])m.color=hc;M.handleKnob.visible=M.handlePull.visible=false;
  M.frame=mat('#596559',.45,{metalness:.25,clippingPlanes:[clipPlane]});
  M.outdoor=mat('#ffffff',.92,{map:outdoor.map});setMap(M.outdoor,outdoor,.92);
  // Cut twins for wall-hung pieces above 1.28 m (cut with the walls, like app.js art()): the same colour object, so palettes and
  // presets still apply; apply() keeps the door twin's map in step.
  const twin=m=>{const c=m.clone();c.color=m.color;c.clippingPlanes=[clipPlane];return c;};
  for(const k of ['door','white','olive','dark','linen','brass'])M[k+'Cut']=twin(M[k]);
  return M;
 }
 // After the home's colours are on M (app.js applyHomeDesign): the preset's floor and wall maps, cabinet doors, handles, frames.
 function apply(M,home,detail){
  if(!detail)detail=state.detail;if(!detail)return;state.detail=detail;
  const floor=floorOf(home.floorFinish,detail.floor),paint=wallOf(detail.wall);
  setMap(M.floor,floor,.78);setMap(M.wall,paint,detail.wall.roughness);if(paint)M.wall.color.multiplyScalar(1/paint.meanL);
  // Wood-grain doors take the home's wood colour, lifted for paler veneers: lift is a factor, or one per channel (r, g, b) that
  // also takes some of the veneer map's orange out.
  const grained=detail.cabinet.grain==='wood',lift=detail.cabinet.lift??1;if(grained){M.door.color.copy(M.oak.color);if(Array.isArray(lift))M.door.color.multiply(new THREE.Color().setRGB(...lift));else M.door.color.multiplyScalar(lift);}else M.door.color.set(detail.cabinet.color);
  for(const m of [M.door,M.doorFrame,M.doorCut])if(m)setMap(m,grained?wood:null,grained?.6:.5);
  M.doorFrame.visible=detail.cabinet.door==='framed';
  for(const [style,m] of [['bar',M.handleBar],['knob',M.handleKnob],['hidden',M.handlePull]])m.visible=detail.handle.style===style;
  M.handleBar.color.set(detail.handle.color);M.frame.color.set(detail.window.frame);
  for(const [k,v] of made)if(v!==floor&&v!==paint){v.map.dispose();v.rough?.dispose();made.delete(k);}
 }
 const textures=()=>[...fixed,...made.values()].flatMap(t=>[t.map,t.rough]).filter(Boolean);
 return {woodtex:wood.map,fabrictex:fabric.map,tiletex:tileMap.map,maps:{wood,fabric,tile:tileMap,outdoor},extend,apply,floorOf,wallOf,textures,
  stats:()=>({tier,px,roughMaps,wallMaps,textures:textures().length,bytes:textures().reduce((s,t)=>s+textureBytes(t),0)})};
}
