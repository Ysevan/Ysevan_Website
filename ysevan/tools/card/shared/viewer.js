// Shared, local-only viewer. Art stays at its native aspect ratio in artwork mode.
// 主题（模式 + 强调色）随查看器一起进来：卡页是生成器重生成的，不指望页面自己带 <script src=theme.js>。
import './theme.js';
const $ = id => document.getElementById(id);
const stage = $('stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const state = { auto: false, flipped: false, dragging: false, ready: false, disposed: false };
let THREE, renderer, scene, camera, root, uniforms, config, observer;
let targetX = .025, targetY = -.12, rotationX = .025, rotationY = -.12;
let frameId = 0, previousTime = 0, elapsed = 0, cardHeight = 9.45, cardWidth = 6.3;
let pointer = null, defaultFoil = .35;
/*
 * 按压（屋主给的组件 5「按压倾斜卡片」）：按下朝触点倾斜、缩小一点，全息光团向触点聚拢，松手弹性复原。
 * 3D 就绪后并进拖动转卡的同一个 root 变换（render 里 rotation 与 scale 一起写），不另起一层 CSS transform 跟它打架；
 * 用一个量 a 驱动全部三件事（0 = 静止，1 = 压到底）：倾角 = a·7°，缩放 = 1 − .04a，光团强度 = a、半径随 a 收拢。
 * a 走弹簧：按下临界阻尼（快、不回弹），松手阻尼比 .5（过冲约 16%，与画廊 .is-springing 的 linear() 曲线同一组参数）。
 * 3D 还没好（封面阶段）或拿不到 WebGL（回退原图）时，改由 CSS 压那张原图，只倾斜缩放、没有光团。
 */
const PRESS_TILT = .122; // 弧度，≈ 7°
const press = { a: 0, v: 0, target: 0, nx: 0, ny: 0, glow: false, held: false, key: false };
const pressTargets = new Set();
let raycaster = null, imagePointer = null, imageKey = false;
const depthControls = [['subject-scale','uScale'],['subject-depth','uDepth'],['background-depth','uBgDepth']];
const defaultDepth = {};
const resources = new Set();
window.__holo = { ready: false, loading: true };

/*
 * 源 PNG 不入 git，仓库与线上只有 scripts/build-web-assets.py 生成的 cards/<id>/web/*.webp。
 * card-config.json 由生成器写、仍指向 ./assets/x.png 与 ./cover.png，这里把它们映射到 web 版；
 * 本机没跑过构建时 web 版不存在，加载失败就回退源 PNG，两边都不用改配置。
 */
function webAsset(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/(^|\/)assets\/(subject|background|lineart|text)\.png$/, '$1web/$2.webp').replace(/(^|\/)cover\.png$/, '$1web/cover.webp');
}
function localURL(value, label = '素材') {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}路径缺失`);
  const url = new URL(value, document.baseURI);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== location.origin) throw new Error(`${label}必须来自本站`);
  return url.href;
}
function finite(value, fallback, min, max) {
  return Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
}
function metadata() {
  document.title = `${config.title || '收藏卡'} · ${config.collection || '蓝调幻光'}`;
  for (const key of ['title', 'subtitle', 'description', 'collection', 'edition']) {
    const node = $(key === 'title' ? 'card-title' : key);
    if (config[key]) node.textContent = String(config[key]);
  }
  // 每张卡自己的美术色只进 --card-accent（光晕、色点）；--accent 是壳的强调色，归 theme.js 管
  if (/^#[0-9a-f]{6}$/i.test(config.accent || '')) document.documentElement.style.setProperty('--card-accent', config.accent);
  $('mode-label').textContent = config.mode === 'artwork' ? '原画虹彩 · 完整构图' : '分层全息 · 立体景深';
  $('depth-controls').hidden = config.mode === 'artwork';
  if (config.originalWidth && config.originalHeight) $('format-label').textContent = `${config.originalWidth} × ${config.originalHeight}`;
  for (const direction of ['previous', 'next']) {
    const link = $(direction);
    if (config[direction]) link.href = localURL(config[direction], '卡片导航');
    else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
  }
  const cover = config.assets?.cover || config.assets?.artwork;
  if (cover) {
    const fallback = $('fallback-image');
    fallback.src = localURL(webAsset(cover), '预览图');
    if (webAsset(cover) !== cover) fallback.addEventListener('error', () => { fallback.src = localURL(cover, '预览图'); }, { once: true });
    fallback.alt = `${config.title || '收藏卡'} · 完整原画`;
    fallback.hidden = false;  // 先把封面摆上去，3D 就绪后再换掉（见 coverFirst / revealCard）
  }
}

const vertex = `varying vec2 vUv;
void main(){vUv=vec2(uv.x,1.0-uv.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const shared = `precision highp float;
varying vec2 vUv;
uniform float uTime,uFoil,uScale,uDepth,uBgDepth,uSafeScale;
uniform vec2 uSafeOffset,uArtFit,uLineOffset;
uniform vec3 uView,uAccent,uMatte;
uniform vec4 uPress;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
vec3 spectrum(float t){return .58+.42*cos(6.28318*(t+vec3(0.,.33,.67)));}
vec3 overlay(vec3 b,vec3 f){return mix(2.*b*f,1.-2.*(1.-b)*(1.-f),step(vec3(.5),b));}
float inside(vec2 p){return step(0.,p.x)*step(0.,p.y)*step(p.x,1.)*step(p.y,1.);}
vec2 parallax(vec2 p,float s,float d){return(p-.5)*s+.5+uView.xy/max(abs(uView.z),.35)*d*.14;}
float wave(vec2 p){vec2 a=p+uView.xy*2.4;return .5+.5*sin((a.x*.848-a.y*.530)*6.283*.55+7.*noise(a*1.5));}
vec3 pressGlow(vec2 p,vec3 foil){vec2 d=(p-uPress.xy)*vec2(1.,1.5);return(foil*.55+.45)*exp(-dot(d,d)/(uPress.w*uPress.w))*max(uPress.z,0.)*.3;}
float star(vec2 p){vec2 q=p*100.,id=floor(q),f=fract(q)-.5;float point=exp(-dot(f,f)*160.);float sparse=step(.985,hash(id+8.8));float twinkle=pow(.5+.5*sin(uTime*1.3+hash(id)*30.+uView.x*27.+uView.y*21.),8.);return point*sparse*twinkle;}
`;
const layeredFragment = shared + `
uniform sampler2D tSubject,tBackground,tText,tLine;
void main(){
 vec2 su=parallax(vUv,uScale,uDepth)*uSafeScale+uSafeOffset;
 vec2 bu=parallax(vUv,1.,uBgDepth);
 vec4 sub=texture2D(tSubject,clamp(su,0.,1.));sub.a*=inside(su);
 vec3 bg=texture2D(tBackground,clamp(bu,0.,1.)).rgb;
 vec3 foil=spectrum(wave(vUv)*.8+noise(vUv*5.)*.12);
 vec3 subject=mix(sub.rgb,overlay(sub.rgb,foil),uFoil*.22);
 bg=mix(bg,overlay(bg,foil),uFoil*.29);
 vec3 col=mix(bg,subject,sub.a);
 float sweep=pow(max(0.,sin((vUv.x*.83+vUv.y*.35+uView.x*1.8+uView.y*.9)*6.283)),12.);
 col+=foil*sweep*uFoil*.17;
 float line=1.-smoothstep(.06,.25,texture2D(tLine,clamp(su+uLineOffset,0.,1.)).r);
 col+=vec3(.82,.94,1.)*line*inside(su)*sub.a*sweep*uFoil*.17;
 col+=vec3(.66,.86,1.)*star(bu)*uFoil*.55*(1.-sub.a*.7);
 col+=pressGlow(vUv,foil);
 vec4 text=texture2D(tText,vUv);col=mix(col,text.rgb,text.a);
 gl_FragColor=vec4(pow(max(col,vec3(0.)),vec3(2.2)),1.);
 #include <colorspace_fragment>
}`;
const artworkFragment = shared + `uniform sampler2D tArtwork;
void main(){
 vec2 uv=(vUv-.5)/uArtFit+.5;
 vec4 art=texture2D(tArtwork,clamp(uv,0.,1.));
 float inArt=inside(uv)*art.a;
 float vignette=1.-smoothstep(.15,.78,length(vUv-.5));
 vec3 matte=uMatte*(.94+vignette*.06);
 vec3 col=mix(matte,art.rgb,inArt);
 vec3 foil=spectrum(vUv.x*.62+vUv.y*.8+uView.x*1.9+uView.y*1.4);
 float sweep=pow(max(0.,sin((vUv.x*.55+vUv.y*.39+uView.x*2.1+uView.y*.85)*6.283)),14.);
 col=mix(col,overlay(col,foil),uFoil*.12*inArt);
 col+=foil*sweep*uFoil*.09*inArt;
 col+=vec3(.84,.94,1.)*star(vUv)*uFoil*.4;
 vec2 p=abs(vUv-.5);
 float border=step(.487,max(p.x,p.y));
 col=mix(col,uAccent*.4+foil*.13,border*.8);
 col+=pressGlow(vUv,foil);
 gl_FragColor=vec4(pow(max(col,vec3(0.)),vec3(2.2)),1.);
 #include <colorspace_fragment>
}`;
const edgeFragment = shared + `void main(){vec3 col=mix(uAccent*.25,spectrum(wave(vUv))*.45,uFoil*.65);gl_FragColor=vec4(col+.04,1.);
#include <colorspace_fragment>
}`;
const backFragment = shared + `uniform sampler2D tBack;
void main(){
 vec4 ink=texture2D(tBack,vec2(1.-vUv.x,vUv.y));
 vec2 p=vUv-.5;
 float rings=.5+.5*sin(length(p*vec2(1.,1.5))*85.);
 vec3 col=vec3(.026,.047,.077)+uAccent*.027*rings;
 col+=spectrum(wave(vUv))*uFoil*.055;
 col=mix(col,ink.rgb,ink.a);
 col+=pressGlow(vUv,spectrum(wave(vUv)));
 gl_FragColor=vec4(pow(max(col,vec3(0.)),vec3(2.2)),1.);
 #include <colorspace_fragment>
}`;

function backTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1536;
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center'; ctx.strokeStyle = config.accent || '#8ad8ee'; ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 1.5; ctx.globalAlpha = .65;
  ctx.strokeRect(53,53,918,1430); ctx.strokeRect(65,65,894,1406);
  ctx.save(); ctx.translate(512,620); ctx.rotate(Math.PI/4);
  ctx.strokeRect(-164,-164,328,328); ctx.strokeRect(-146,-146,292,292); ctx.restore();
  ctx.beginPath(); ctx.arc(512,620,117,0,Math.PI*2); ctx.stroke();
  ctx.globalAlpha = 1; ctx.font = '94px serif'; ctx.fillText('✧',512,656);
  ctx.font = '30px sans-serif'; ctx.fillText(String(config.collection || '蓝调幻光'),512,1020,800);
  ctx.font = '18px sans-serif'; ctx.globalAlpha = .7; ctx.fillText('A COLLECTION OF LIGHT',512,1075,800);
  ctx.font = '22px sans-serif'; ctx.fillText(String(config.edition || ''),512,1320,800);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.NoColorSpace;
  resources.add(texture); return texture;
}

/*
 * 「先出封面、3D 后加载」。三件事本来就现成：模板里有 <img id="fallback-image">，
 * metadata() 已经把它指向 web/cover.webp，three 也一直是动态 import。
 * 缺的只是次序——原来一进页面就去拉 2 MB 的 three，封面跟它抢带宽和主线程，
 * 陌生人要等 2.5 秒才看到东西。现在等封面这一帧真的上了屏再去拉。
 * 等的是「已解码 + 连续两帧」，不是拍脑袋的 setTimeout；封面坏了也不能把 3D 卡住，所以加了上限。
 */
function afterCoverPainted() {
  const image = $('fallback-image');
  const decoded = image.getAttribute('src') && image.decode ? image.decode().catch(() => {}) : Promise.resolve();
  return decoded.then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
function coverFirst(limit = 1200) {
  return Promise.race([afterCoverPainted(), new Promise(resolve => setTimeout(resolve, limit))]);
}
/** 3D 就绪，把封面淡掉。canvas 与封面同在 z-index 1，封面在 DOM 里更靠后，不撤掉会盖住画面。 */
function revealCard() {
  const image = $('fallback-image');
  if (image.hidden) return;
  if (reducedMotion.matches) { image.hidden = true; return; }
  image.classList.add('is-handing-over');
  setTimeout(() => { image.hidden = true; image.classList.remove('is-handing-over'); }, 280);
}

/*
 * 拿 WebGL2 分两段（照岗岗 2026-09-23 的四家样板，desk-book.js 的 acquireContext），在下载 three 之前做：
 *   1. 严参数（failIfMajorPerformanceCaveat: true，其余与原来交给 three 的一字不差）：有显卡的机器在这里拿到，画面与改前逐像素相同。
 *   2. 被拒（没显卡的 Windows 走 WARP、没开 3D 加速的虚拟机），或给了但渲染器名是软件渲染（显式指定 SwiftShader 的 Chrome
 *      严参数照给），就放宽这一条、关掉抗锯齿重取一块，走省力档。只关抗锯齿（软件渲染下多重采样纯吃 CPU），像素比、贴图、着色器、
 *      几何都不动——画不许为性能牺牲。实测 SwiftShader、2040×1019@1.25：每帧 38–48 → 17–21 ms；再把像素比压到 1 只多省 4–5 ms，
 *      画面却明显发糊（1x 的画布被拉到 1.25x 显示），所以不压。
 *   3. 两段都拿不到（Chrome 122 起默认不给 SwiftShader 的 WebGL）：安静回原图，不下载 three、控制台不报错。
 * 拿到的上下文连同画布一起交给 three（不让它再要一块）。每一段都用新画布：同一块画布 getContext 失败后能不能换参数重试，各浏览器说法不一。
 */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|lavapipe|softpipe|software|basic render/i;
const STRICT_CONTEXT = { alpha:true, depth:true, stencil:false, antialias:true, premultipliedAlpha:true, preserveDrawingBuffer:true, powerPreference:'low-power', failIfMajorPerformanceCaveat:true };
const SOFT_CONTEXT = { ...STRICT_CONTEXT, antialias:false, failIfMajorPerformanceCaveat:false };
function tryContext(attributes) {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', attributes);
    return gl ? { canvas, gl, attributes } : null;
  } catch { return null; }
}
function rendererName(gl) {
  try {
    let name = String(gl.getParameter(gl.RENDERER) || '');
    if (/^webkit webgl$/i.test(name)) {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      if (info) name = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || name);
    }
    return name;
  } catch { return ''; }
}
const loseContext = gl => { try { gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* 已经没了也无妨 */ } };
/** 返回 { canvas, gl, attributes, tier: 'full' | 'soft', stage, renderer }；两段都拿不到返回 null。 */
function acquireContext() {
  const strict = tryContext(STRICT_CONTEXT);
  if (strict) {
    const name = rendererName(strict.gl);
    if (!SOFTWARE_RENDERER.test(name)) return { ...strict, tier:'full', stage:'strict', renderer:name };
    const soft = tryContext(SOFT_CONTEXT);
    if (!soft) return { ...strict, tier:'soft', stage:'strict', renderer:name };  // 换不到就将就用手里这块，档位照样按软件渲染算
    loseContext(strict.gl);
    return { ...soft, tier:'soft', stage:'loose', renderer:rendererName(soft.gl) || name };
  }
  const soft = tryContext(SOFT_CONTEXT);
  return soft ? { ...soft, tier:'soft', stage:'loose', renderer:rendererName(soft.gl) } : null;
}
let graphics = null;

async function init() {
  const response = await fetch('./card-config.json');
  if (!response.ok) throw new Error('无法读取卡片配置');
  config = await response.json(); metadata();
  await coverFirst();
  graphics = acquireContext();
  if (!graphics) throw Object.assign(new Error('这台设备拿不到 WebGL2'), { quiet:true });
  const modules = await Promise.all([import('three'), import('three/addons/loaders/GLTFLoader.js')]);
  THREE = modules[0]; const { GLTFLoader } = modules[1];
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-5,5,5.65,-5.65,.1,100); camera.position.set(0,0,20);
  graphics.canvas.style.display = 'block';  // three 自己建画布时会加这一句，交给它的画布要自己补
  renderer = new THREE.WebGLRenderer({ ...graphics.attributes, canvas:graphics.canvas, context:graphics.gl });
  renderer.setClearColor(0x08111e,0); renderer.setPixelRatio(Math.min(devicePixelRatio || 1,2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden','true'); stage.prepend(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', event => {event.preventDefault(); showFallback(new Error('图形上下文已中断'));});
  const loader = new THREE.TextureLoader();
  const texture = async name => {
    const original = config.assets?.[name];
    const tex = await loader.loadAsync(localURL(webAsset(original), name)).catch(error => {
      if (webAsset(original) === original) throw error;
      return loader.loadAsync(localURL(original, name));
    });
    tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(),8);
    resources.add(tex); return tex;
  };
  const artworkMode = config.mode === 'artwork';
  const names = artworkMode ? ['artwork'] : ['subject','background','text','lineart'];
  const textures = await Promise.all(names.map(texture));
  defaultFoil = finite(config.parameters?.foil, artworkMode ? .35 : .65, 0, 1);
  let fitX=.94,fitY=.94;
  if (artworkMode) {
    const img = textures[0].image;
    const aspect = img.width / img.height;
    if (aspect > 2/3) fitY *= (2/3)/aspect; else fitX *= aspect/(2/3);
  }
  uniforms = {
    tArtwork:{value:artworkMode?textures[0]:null},tSubject:{value:artworkMode?null:textures[0]},
    tBackground:{value:artworkMode?null:textures[1]},tText:{value:artworkMode?null:textures[2]},
    tLine:{value:artworkMode?null:textures[3]},tBack:{value:backTexture()},uTime:{value:0},
    uView:{value:new THREE.Vector3(0,0,1)},uFoil:{value:defaultFoil},uArtFit:{value:new THREE.Vector2(fitX,fitY)},
    uLineOffset:{value:new THREE.Vector2(finite(config.lineartOffset?.[0],0,-.1,.1),finite(config.lineartOffset?.[1],0,-.1,.1))},
    uAccent:{value:new THREE.Color(/^#[0-9a-f]{6}$/i.test(config.accent || '')?config.accent:'#8ad8ee').convertLinearToSRGB()},
    uMatte:{value:new THREE.Color(/^#[0-9a-f]{6}$/i.test(config.matte || '')?config.matte:'#182b3d').convertLinearToSRGB()},
    uScale:{value:finite(config.parameters?.subjectScale,1.2,.5,2)},uDepth:{value:finite(config.parameters?.subjectDepth,.38,0,1)},
    uBgDepth:{value:finite(config.parameters?.backgroundDepth,-.24,-1,0)},uSafeScale:{value:finite(config.safeArea?.scale,1.08,.5,2)},
    uSafeOffset:{value:new THREE.Vector2(finite(config.safeArea?.offset?.[0],-.04,-1,1),finite(config.safeArea?.offset?.[1],-.055,-1,1))},
    uPress:{value:new THREE.Vector4(.5,.5,0,.62)}
  };
  const material = fragmentShader => {
    const mat = new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader}); resources.add(mat); return mat;
  };
  const front = material(artworkMode?artworkFragment:layeredFragment);
  const back = material(backFragment), edge = material(edgeFragment);
  const rim = new THREE.MeshBasicMaterial({color:config.accent || '#8ad8ee'}); resources.add(rim);
  const gltf = await new GLTFLoader().loadAsync(localURL(config.assets?.model,'卡片模型'));
  root = new THREE.Group(); root.add(gltf.scene); scene.add(root);
  let frontFound = false;
  gltf.scene.traverse(object => {
    if (!object.isMesh) return;
    resources.add(object.geometry);
    const materials = Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(mat=>{if(mat){resources.add(mat);for(const value of Object.values(mat))if(value?.isTexture)resources.add(value);}});
    const role = object.material?.name;
    if(role==='web_front'){object.material=front;frontFound=true;pressTargets.add(object);}
    else if(role==='web_back'){object.material=back;pressTargets.add(object);}
    else if(role==='web_gold')object.material=rim;
    else if(role==='web_text')object.visible=false;
    else object.material=edge;
  });
  if (!frontFound) throw new Error('卡片模型缺少正面材质');
  const bounds = new THREE.Box3().setFromObject(gltf.scene);
  const center = bounds.getCenter(new THREE.Vector3()); gltf.scene.position.sub(center);
  const size = bounds.getSize(new THREE.Vector3());
  cardHeight = size.y || 9.45; cardWidth = size.x || cardHeight * 2 / 3;
  setupControls(); observer = new ResizeObserver(resize); observer.observe(stage); resize();
  state.ready=true; $('loading').hidden=true; revealCard();
  for(const id of ['auto','flip','reset','foil','save',...depthControls.map(([id])=>id)])$(id).disabled=false;
  releaseImage();
  window.__holo = {ready:true,config,renderer,scene,camera,root,uniforms,state,reset,flip,resize,modelSource:config.assets.model,artFit:[fitX,fitY],pressState,graphics:{tier:graphics.tier,stage:graphics.stage,renderer:graphics.renderer}};
  schedule();
}

function resize() {
  if(!renderer || !camera || state.disposed)return;
  const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;
  const aspect=width/height;
  const halfHeight=Math.max(cardHeight*.575,(cardHeight*2/3)*.62/aspect);
  camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;
  camera.updateProjectionMatrix();renderer.setSize(width,height);schedule();
}
// 按钮 = SVG 图标 + .label 文字；改状态只换文字和图标路径，不用字符凑图标（生成器旧模板没有 .label 时退回纯文字）
const PLAY = '<path data-fill d="M8 5.5v13l10-6.5z"/>';
const PAUSE = '<path data-fill d="M7 5.5h3.5v13H7zM13.5 5.5H17v13h-3.5z"/>';
function setButton(id, text, paths) {
  const button = $(id);
  const label = button.querySelector('.label');
  if (label) label.textContent = text; else button.textContent = text;
  const svg = button.querySelector('svg');
  if (svg && paths) svg.innerHTML = paths;
}
function setAuto(value) {state.auto=value;$('auto').setAttribute('aria-pressed',String(value));setButton('auto',value?'暂停赏卡':'自动赏卡',value?PAUSE:PLAY);schedule();}
function updateSide() {$('flip').setAttribute('aria-pressed',String(state.flipped));setButton('flip',state.flipped?'回到正面':'翻看背面');$('view-label').textContent=state.flipped?'BACK · 背面':'FRONT · 正面';}
function reset() {
  targetX=.025;targetY=-.12;state.flipped=false;setAuto(false);updateSide();
  if(uniforms){uniforms.uFoil.value=defaultFoil;$('foil').value=String(defaultFoil);$('foil-value').value=`${Math.round(defaultFoil*100)}%`;}
  for(const [id,key] of depthControls){uniforms[key].value=defaultDepth[key];$(id).value=String(defaultDepth[key]);$(id+'-value').value=defaultDepth[key].toFixed(2);}
  schedule();
}
function flip() {state.flipped=!state.flipped;setAuto(false);targetY=state.flipped?Math.PI:0;targetX=0;updateSide();schedule();}
function constrain() {const base=state.flipped?Math.PI:0;targetY=THREE.MathUtils.clamp(targetY,base-.6,base+.6);targetX=THREE.MathUtils.clamp(targetX,-.38,.38);}
function setupControls() {
  for(const [id,key] of depthControls){
    defaultDepth[key]=uniforms[key].value;$(id).value=String(defaultDepth[key]);$(id+'-value').value=defaultDepth[key].toFixed(2);
    $(id).addEventListener('input',()=>{uniforms[key].value=Number($(id).value);$(id+'-value').value=uniforms[key].value.toFixed(2);schedule();});
  }
  $('foil').value=String(defaultFoil);$('foil-value').value=`${Math.round(defaultFoil*100)}%`;
  $('foil').addEventListener('input',()=>{uniforms.uFoil.value=Number($('foil').value);$('foil-value').value=`${Math.round(uniforms.uFoil.value*100)}%`;schedule();});
  stage.addEventListener('pointerdown',event=>{
    if(!state.ready||event.button!==0)return;
    state.dragging=true;setAuto(false);pointer={id:event.pointerId,x:event.clientX,y:event.clientY,sx:event.clientX,sy:event.clientY};
    stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging');stage.focus({preventScroll:true});
    pressAt(event.clientX,event.clientY);
  });
  stage.addEventListener('pointermove',event=>{
    if(!state.dragging||pointer?.id!==event.pointerId)return;
    // 拖出 6px 就是在转卡、不是在按：按压复原，转动照旧
    if(press.held&&!press.key&&Math.hypot(event.clientX-pointer.sx,event.clientY-pointer.sy)>6)releasePress();
    targetY+=(event.clientX-pointer.x)*.005;targetX+=(event.clientY-pointer.y)*.004;
    pointer.x=event.clientX;pointer.y=event.clientY;constrain();schedule();
  });
  const release=()=>{state.dragging=false;pointer=null;stage.classList.remove('is-dragging');if(!press.key)releasePress();};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(event,release);
  stage.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    if(!['arrowleft','arrowright','arrowup','arrowdown','f','r'].includes(key)||!state.ready)return;
    event.preventDefault();setAuto(false);
    if(key==='arrowleft')targetY-=.075;if(key==='arrowright')targetY+=.075;
    if(key==='arrowup')targetX-=.06;if(key==='arrowdown')targetX+=.06;
    if(key==='f')flip();if(key==='r')reset();constrain();schedule();
  });
  $('auto').addEventListener('click',()=>{if(state.flipped){state.flipped=false;updateSide();targetY=0;}setAuto(!state.auto);});
  $('flip').addEventListener('click',flip);$('reset').addEventListener('click',reset);
  $('save').addEventListener('click',()=>{
    try{
      render();renderer.domElement.toBlob(blob=>{
        if(!blob){$('save-status').textContent='保存失败，请重试。';return;}
        const url=URL.createObjectURL(blob),a=document.createElement('a');
        a.download=`${String(config.title||'card').replace(/[\\/:*?"<>|]/g,'-')}-holographic.png`;a.href=url;a.click();
        setTimeout(()=>URL.revokeObjectURL(url),30000);$('save-status').textContent='已保存当前角度的 PNG。';
      },'image/png');
    }catch(error){$('save-status').textContent='暂时无法保存，请刷新页面后重试。';}
  });
}
function render(){
  if(!root||!renderer||state.disposed)return;
  // 按压并进同一个变换：倾斜叠在拖动 / 自动赏卡的角度上，缩放乘在同一个 root 上。减弱动效时不倾斜不缩放，只剩光团淡入淡出
  const still=reducedMotion.matches,tilt=still?0:press.a*PRESS_TILT;
  root.rotation.set(rotationX+press.ny*tilt,rotationY+press.nx*tilt,0);root.scale.setScalar(still?1:1-.04*press.a);
  uniforms.uPress.value.z=press.glow?press.a:0;uniforms.uPress.value.w=still?.3:.62-.46*Math.min(1,Math.max(0,press.a));
  root.updateMatrixWorld(true);uniforms.uView.value.copy(camera.position).applyMatrix4(new THREE.Matrix4().copy(root.matrixWorld).invert()).normalize();uniforms.uTime.value=reducedMotion.matches&&!state.auto?0:elapsed;renderer.render(scene,camera);}
function schedule(){if(!frameId&&!document.hidden&&!state.disposed&&renderer&&root)frameId=requestAnimationFrame(animate);}
function pressSettled(){return Math.abs(press.target-press.a)+Math.abs(press.v)<1e-4;}
/** 弹簧按 1/240 s 细分积分：一帧最长 .06 s，直接一步积会在按下那档（ω = 30）发散。 */
function stepPress(dt){
  if(pressSettled()){press.a=press.target;press.v=0;return;}
  const down=press.target>0,k=down?900:219,c=down||reducedMotion.matches?2*Math.sqrt(k):14.8;
  for(let left=dt;left>0;left-=1/240){const h=Math.min(left,1/240);press.v+=(k*(press.target-press.a)-c*press.v)*h;press.a+=press.v*h;}
}
function animate(now){
  frameId=0;if(state.disposed||document.hidden)return;
  const dt=previousTime?Math.min((now-previousTime)/1000,.06):1/60;previousTime=now;elapsed+=dt;
  if(state.auto){targetY=Math.sin(elapsed*.55)*.35;targetX=Math.sin(elapsed*.72)*.09;}
  const ease=reducedMotion.matches?1:1-Math.exp(-dt*9);
  rotationX+=(targetX-rotationX)*ease;rotationY+=(targetY-rotationY)*ease;stepPress(dt);render();
  if(state.auto||Math.abs(targetX-rotationX)+Math.abs(targetY-rotationY)>.0001||!pressSettled())schedule();
  // 停下来之后下一次开动（比如按下去）第一帧按 1/60 s 算，别拿闲置了多久当 dt，按压一开始就跳一大步
  else previousTime=0;
}
/** 按在卡上才算按压（按在卡外面只是拖动）。倾斜方向按屏幕算：翻到背面时卡的本地 x 是反的。 */
function pressAt(x,y,key=false){
  if(!state.ready)return false;
  const rect=stage.getBoundingClientRect();
  const pxPerUnit=rect.height/(camera.top-camera.bottom);
  if(key){press.nx=0;press.ny=0;uniforms.uPress.value.x=.5;uniforms.uPress.value.y=.5;press.glow=true;}
  else{
    raycaster??=new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2),camera);
    const hit=raycaster.intersectObject(root,true).find(item=>item.object.visible);
    if(!hit)return false;
    press.nx=Math.max(-1,Math.min(1,(x-rect.left-rect.width/2)/(cardWidth/2*pxPerUnit)));
    press.ny=Math.max(-1,Math.min(1,(y-rect.top-rect.height/2)/(cardHeight/2*pxPerUnit)));
    // 光团落在正面 / 背面的触点上（vUv 在顶点着色器里翻了 y）；按在金边上就只倾斜不发光
    press.glow=Boolean(hit.uv&&pressTargets.has(hit.object));
    if(press.glow){uniforms.uPress.value.x=hit.uv.x;uniforms.uPress.value.y=1-hit.uv.y;}
  }
  press.target=1;press.held=true;press.key=key;schedule();return true;
}
function releasePress(){if(!press.held)return;press.held=false;press.key=false;press.target=0;schedule();}
function pressState(){return{a:press.a,v:press.v,target:press.target,nx:press.nx,ny:press.ny,glow:press.glow,held:press.held,key:press.key,uPress:uniforms?uniforms.uPress.value.toArray():null,rotation:root?[root.rotation.x,root.rotation.y]:null,scale:root?root.scale.x:null};}

/* 3D 之外的那张原图（封面阶段、回退原图）：CSS 压图，只倾斜缩放。曲线在 viewer.css 的 .fallback-image。 */
function pressImage(x,y,key=false){
  const image=$('fallback-image');
  if(state.ready||image.hidden||!image.naturalWidth)return false;
  // object-fit:contain 两侧有留白，按在留白上不算按到卡
  const r=image.getBoundingClientRect(),fit=Math.min(r.width/image.naturalWidth,r.height/image.naturalHeight);
  const w=image.naturalWidth*fit,h=image.naturalHeight*fit,left=r.left+(r.width-w)/2,top=r.top+(r.height-h)/2;
  const fx=key?.5:(x-left)/w,fy=key?.5:(y-top)/h;
  if(fx<0||fx>1||fy<0||fy>1)return false;
  if(!reducedMotion.matches){
    image.style.setProperty('--pry',`${((fx-.5)*14).toFixed(2)}deg`);
    image.style.setProperty('--prx',`${(-(fy-.5)*14).toFixed(2)}deg`);
    image.style.setProperty('--ps','.96');
  }
  image.classList.add('is-pressed');imageKey=key;return true;
}
function releaseImage(){
  const image=$('fallback-image');imageKey=false;imagePointer=null;
  if(!image.classList.contains('is-pressed'))return;
  image.classList.remove('is-pressed');
  for(const name of ['--prx','--pry','--ps'])image.style.removeProperty(name);
}
stage.addEventListener('pointerdown',event=>{if(!state.ready&&event.button===0&&pressImage(event.clientX,event.clientY))imagePointer={id:event.pointerId,x:event.clientX,y:event.clientY};});
stage.addEventListener('pointermove',event=>{if(imagePointer?.id===event.pointerId&&Math.hypot(event.clientX-imagePointer.x,event.clientY-imagePointer.y)>6)releaseImage();});
for(const type of ['pointerup','pointercancel'])stage.addEventListener(type,event=>{if(imagePointer?.id===event.pointerId)releaseImage();});
// 键盘：焦点在卡台上按空格 / 回车，按下时正压（不倾斜），松开复原
stage.addEventListener('keydown',event=>{
  if((event.key!==' '&&event.key!=='Enter')||event.altKey||event.ctrlKey||event.metaKey||event.target!==stage)return;
  event.preventDefault();
  if(event.repeat||press.held||imageKey)return;
  if(!pressAt(0,0,true))pressImage(0,0,true);
});
stage.addEventListener('keyup',event=>{
  if(event.key!==' '&&event.key!=='Enter')return;
  if(press.key)releasePress();
  if(imageKey)releaseImage();
});
// 按住时焦点被抢走 / 切走窗口，keyup 永远不来
for(const [target,type] of [[stage,'blur'],[window,'blur']])target.addEventListener(type,()=>{if(press.key)releasePress();if(imageKey)releaseImage();});
function showFallback(error){
  state.ready=false;state.auto=false;state.disposed=true;cancelAnimationFrame(frameId);frameId=0;observer?.disconnect();
  renderer?.domElement.remove();
  resources.forEach(resource=>resource.dispose?.());renderer?.dispose();
  const hasImage=Boolean($('fallback-image').getAttribute('src'));
  $('fallback-image').hidden=!hasImage;
  $('loading').hidden=false;$('loading').classList.add('is-error');
  $('loading').textContent=hasImage?'当前设备无法显示交互效果，已为你展示完整原图。':'卡片暂时未能加载。请返回卡集后重试。';

  for(const id of ['auto','flip','reset','foil','save',...depthControls.map(([id])=>id)])$(id).disabled=true;
  window.__holo={ready:false,fallback:hasImage,error:String(error?.message||error),config};
  if(!error?.quiet)console.warn('Card viewer fallback:',error);  // 拿不到 WebGL 是预料之中的分支，安静回原图
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;previousTime=0;}else if(state.ready)schedule();});
window.addEventListener('pagehide',event=>{
  cancelAnimationFrame(frameId);frameId=0;
  if(event.persisted)return;
  state.disposed=true;observer?.disconnect();resources.forEach(resource=>resource.dispose?.());renderer?.dispose();
});
window.addEventListener('pageshow',event=>{if(event.persisted&&state.ready){previousTime=0;schedule();}});
init().catch(showFallback);
