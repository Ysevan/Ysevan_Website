import {resolveLayout} from './layout-policy.js?v=d3fe69be91';
// Pure, validated design data. No CAD, DOM or storage side effects.
export const DESIGN_KEY='xiyuan-design-studio-v1';
export const COLOR_FIELDS=[['wall','墙面'],['oak','主要木色'],['floor','地面'],['linen','沙发 / 床品'],['olive','点缀软装'],['terracotta','第二点缀'],['stone','台面'],['rug','地毯']];
// Tuned for NeutralToneMapping (2026-10-21): living room, master bedroom, kitchen and whole-floor views stay within 3%
// of the former ACES brightness. Sky light is neutral and dimmer, ground (bounce) light brighter; sun and fill are stronger.
// Hemisphere ×1.2 after indoor sun shadows were fitted to the unit (app.js fitSun): sharper shadows leak less light indoors.
// Indoors (walking, tour rooms) the roof casts, so sun only enters through the openings. indoor scales the hemisphere's sky
// and ground (bounce) colours, the environment and the fill so the seven standard views stay within about 3% of their
// brightness before the roof cast (desk 2040 and phone 417, four presets; calibrated 2026-10-22). Outside: OUTDOOR.
export const OUTDOOR={sky:1,ground:1,env:1,fill:1};
export const LIGHTING={day:{label:'日间',color:'#fff4d8',sun:4.04,pos:[-5,15,22],hemi:2,sky:'#c7c7c7',ground:'#f8f4e8',fill:1.28,env:.24,exposure:1.149,indoor:{sky:1,ground:1.74,env:1,fill:.82}},warm:{label:'暖阳',color:'#ffe3ba',sun:4.1,pos:[-15,8,24],hemi:1.81,sky:'#c7c7c7',ground:'#f8f4e8',fill:1.28,env:.24,exposure:1.243,indoor:{sky:.97,ground:1.41,env:.85,fill:1}},soft:{label:'柔光',color:'#fafbfc',sun:1.25,pos:[12,20,5],hemi:2.74,sky:'#c3c3c3',ground:'#f8f4e8',fill:.9,env:.31,exposure:1.035,indoor:{sky:1,ground:1,env:1.07,fill:2.14}}};
export const PRESETS={
 ji:{letter:'A',name:'全季式原木',tag:'温润 · 东方 · 留白',brief:'浅橡木、暖白与青灰，木纹地面搭配织物和小茶台。家具重秩序，空间保持温馨。',source:'https://www.aseantop.com/post/29903',sourceName:'全季5.0「晓山青」参考',home:{colors:{wall:'#f2eee4',oak:'#d0b896',floor:'#e1d1b6',linen:'#e8e2d5',olive:'#91a193',terracotta:'#b5a183',stone:'#dcd6c8',rug:'#c6c9bb'},floorFinish:'wood',lighting:'day',brightness:100}},
 soft:{letter:'B',name:'柔和极简',tag:'燕麦 · 暖白 · 低对比',brief:'米白、燕麦与浅石纹地面，淡化木色与装饰对比。轻盈安静，把质感留给织物和柔光。',source:'https://normcph.com/project/sandbjerg-residence/',sourceName:'Norm · Sandbjerg Residence 参考',home:{colors:{wall:'#f3f0e9',oak:'#c5baa8',floor:'#e4dcd0',linen:'#e4ded4',olive:'#b3b7a8',terracotta:'#ad9885',stone:'#e1ddd2',rug:'#d9d5cc'},floorFinish:'stone',lighting:'soft',brightness:100}},
 cream:{letter:'D',name:'奶油原木 · 收纳',tag:'奶油白 · 浅原木 · 焦糖点缀',brief:'屋主10-20给的三个装修视频的共同做法：奶油白平板柜、浅暖原木、焦糖和燕麦色软装，柜体做到顶、分段开门，按使用频率分区收纳。',source:'https://mbd.baidu.com/newspage/data/videolanding?nid=sv_4419108722331080201&sourceFrom=share',sourceName:'屋主给的三个装修视频（之一）',home:{colors:{wall:'#efe9de',oak:'#cdb08a',floor:'#dcc4a0',linen:'#ebe4d6',olive:'#b8a58c',terracotta:'#a8764e',stone:'#ece7de',rug:'#d8cfc0'},floorFinish:'wood',lighting:'day',brightness:104}},
 vintage:{letter:'C',name:'中古胡桃木',tag:'木色 · 橄榄绿 · 焦糖',brief:'暖白底色与中深木纹，橄榄绿织物、焦糖点缀和暖光。用可替换软装表达个性，不把全屋做暗。',source:'https://m.pchouse.com.cn/dingzhi/case/603082',sourceName:'清羽 · 家有酒香，自在寻常 参考',home:{colors:{wall:'#eee8dc',oak:'#9a7655',floor:'#d3bea1',linen:'#c5c9b3',olive:'#7e8871',terracotta:'#9e6a4d',stone:'#c6bdad',rug:'#b8ad96'},floorFinish:'wood',lighting:'warm',brightness:95}}
};
export const DEFAULT_GAMING={mode:'focus',primary:'#ffe5b7',secondary:'#ffedcf',strength:45};
const clone=x=>JSON.parse(JSON.stringify(x));
export const presetHome=id=>clone(PRESETS[Object.hasOwn(PRESETS,id)?id:'ji'].home);
const hex=(v,f)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():f;
const number=(v,f,min,max)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,Math.round(v))):f;
export function cleanHome(value,id='ji'){const d=presetHome(id),v=value&&typeof value==='object'?value:{};for(const[k]of COLOR_FIELDS)d.colors[k]=hex(v.colors?.[k],d.colors[k]);d.floorFinish=['wood','stone'].includes(v.floorFinish)?v.floorFinish:d.floorFinish;d.lighting=Object.hasOwn(LIGHTING,v.lighting)?v.lighting:d.lighting;d.brightness=number(v.brightness,d.brightness,65,130);return d;}
export function cleanGaming(value){const v=value&&typeof value==='object'?value:{};return {mode:['game','focus','rest'].includes(v.mode)?v.mode:'focus',primary:hex(v.primary,DEFAULT_GAMING.primary),secondary:hex(v.secondary,DEFAULT_GAMING.secondary),strength:number(v.strength,45,0,150)};}
export function defaultDesign(){return {version:1,layout:'original',active:'ji',homes:Object.fromEntries(Object.keys(PRESETS).map(id=>[id,presetHome(id)])),gaming:{...DEFAULT_GAMING},saved:[]};}
export function normalizeDesign(value){const d=defaultDesign(),v=value&&typeof value==='object'?value:{};d.layout=resolveLayout(v.layout);d.active=Object.hasOwn(PRESETS,v.active)?v.active:'ji';for(const id of Object.keys(PRESETS))d.homes[id]=cleanHome(v.homes?.[id],id);d.gaming=cleanGaming(v.gaming);d.saved=(Array.isArray(v.saved)?v.saved:[]).slice(0,8).filter(x=>x&&typeof x==='object').map((x,i)=>{const scheme=Object.hasOwn(PRESETS,x.scheme)?x.scheme:'ji';return {id:'saved-'+i,name:typeof x.name==='string'?x.name.trim().slice(0,24)||'我的搭配':'我的搭配',scheme,layout:resolveLayout(x.layout),home:cleanHome(x.home,scheme),gaming:cleanGaming(x.gaming)};});return d;}
export function isCustomized(home,id){return JSON.stringify(cleanHome(home,id))!==JSON.stringify(presetHome(id));}
export function exportDesign(state){return JSON.stringify({app:'xiyuan-design',version:1,design:normalizeDesign(state)},null,2);}
export function importDesign(text){if(typeof text!=='string'||text.length>100000)throw new Error('文件过大，请使用本页面导出的搭配文件。');const v=JSON.parse(text);if(v?.app!=='xiyuan-design'||v.version!==1||!v.design||typeof v.design!=='object')throw new Error('这不是支持的玺院搭配文件。');return normalizeDesign(v.design);}
