import {createLivingBalcony,LEGACY_LIVING_BOXES} from './living-balcony.js?v=3cc6ecc8d3';
import {FITOUT_DIMENSIONS} from './fitout-dimensions.js?v=40ecd197db';
import {resolveLayout,WITHDRAWAL_NOTICE} from './layout-policy.js?v=d3fe69be91';
import {MASTER_ENTRIES,CENTRAL_ENTRY,REFUGE_ENTRY,NORTH_ENTRY,ENTRY_VIEWS,DOOR_VIEW_DEFAULT,DOOR_VIEW_WALK,DOOR_OPEN} from './door-layout.js?v=dbf9e8b9fa'; import {createSky,eyeFov,crosses} from './scene-env.js?v=b921ffdb6b'; import {createPanels,createLandscape} from './ui-panels.js?v=ea5002819f';
import {LAYOUTS,CONCEPT_ROOMS,REDESIGN_VIEWS,OWNER_REPLACED_BOXES,BAY_BOXES,bayBoxesForLayout,WARDROBES,NORTHWEST_BED,NORTH_BED,NORTH_DESK,SOUTH_BED,MASTER_PLACEMENTS,ROOM_DECOR,OWNER_ROOMS,NORTH_ROOM,layoutBoxes,masterBox,masterClearance} from './layout-data.js?v=177b5128ed';
import {createDesignStudio} from './design-studio.js?v=b4a1425ed7';
import {createConceptRoom} from './concept-rooms.js?v=2c689347a0';
import {LIGHTING,OUTDOOR} from './design-presets.js?v=0154371027';
import {createGamingRoom} from './gaming-room.js?v=63b9f2b6d6'; import {createBayWindow} from './bay-window.js?v=c3e426e534'; import {createSideCabinet} from './storage-fitout.js?v=4c5573f604';
import {createOwnerMasterBed} from './owner-master-bed.js?v=f9e70db44c';
import {createFittedWardrobe} from './fitted-wardrobe.js?v=3c06a47c42';
import {STUDY_COLLISIONS,STUDY_VIEWS,GAMING_MODES,studyBoxes,studyWalkBoxes} from './design-data.js?v=0d48267e23';
import {createNavigator,pointIn} from './navigation.js?v=3af6116843';
import {createTouchWalk} from './touch-walk.js?v=c90b65fc68';
import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js?v=b97879c748';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js?v=c1b7c9bd2c';
import {metricBoxUV,WALL_UV} from './metric-uv.js?v=ff624541bd';
import {RoomEnvironment} from './vendor/RoomEnvironment.js?v=c20f0b4677';
import {mergeGeometries} from './utils/BufferGeometryUtils.js?v=fda7e946b8';
import {pickTier,probeRenderer,tierSettings,tierBudget,SOFT_ENV_SKY,SOFT_ENV_GROUND,SUN_MAP} from './render-tier.js?v=72ed1d1d60';import {lightSpaceBounds,layoutFootprints,shadeMaterial,contactGeometry,wallAOGeometry} from './light-layer.js?v=04d6265177';
import {leverGeo} from './detail-kit.js?v=95ac5fde41';import {createDetailLayer,doorReveal,windowSide} from './detail-layer.js?v=590ca89d63';
import {BEVEL,bevel,bevelSegments,createFinishes} from './material-kit.js?v=f605101d42';
import {createWetRooms} from './wet-rooms.js?v=f51fc87429';
import {createFurnishing,bedding,COFFEE} from './furnish-layer.js?v=e90d2fee72';
import {createRoomLights,ownerRoomAt} from './room-lights.js?v=af40d3a7b9';

const $=id=>document.getElementById(id);
let dirtyUntil=performance.now()+1500;function invalidate(ms=400,shadow=false){dirtyUntil=Math.max(dirtyUntil,performance.now()+ms);if(shadow&&renderer)renderer.shadowMap.needsUpdate=true;}
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp;
let data;
try { data=await (await fetch('./assets/plan-data.json?v=976f9c6492')).json(); } catch(e){$('loading').hidden=true;$('error').hidden=false;throw e;}
const redesignData=await (await fetch('./assets/layout-redesign.json?v=37375c0b7b')).json();
const originalData=await (await fetch('./assets/layout-original.json?v=9f0584f807')).json();
const centralWallData=await (await fetch('./assets/layout-central.json?v=6359d239dc')).json();
const conceptData=await (await fetch('./assets/balanced-concept.json?v=c15a9b0af1')).json();
const centralData=await (await fetch('./assets/central-concept.json?v=3d468f5316')).json();
conceptData.layouts.central=centralData.layout;
let activeLayout='original';const layoutBedWidths={original:1.8,redesign:1.8};
const scene=new THREE.Scene(); scene.background=new THREE.Color('#e7e4db');
let renderer;let renderTier=pickTier({renderer:probeRenderer(),coarse:matchMedia('(pointer: coarse)').matches,shortSide:Math.min(screen.width,screen.height)}),ratios=tierSettings(renderTier,'auto',devicePixelRatio,innerWidth*innerHeight),hiRes=false,idleAt=0,sizeDirty=false;
try {renderer=new THREE.WebGLRenderer({antialias:ratios.antialias,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:false});}catch(e){$('loading').hidden=true;$('error').hidden=false;throw e;}
renderer.setPixelRatio(ratios.move);renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=LIGHTING.day.exposure;renderer.localClippingEnabled=true;
$('viewport').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.04,600);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.maxPolarAngle=Math.PI/2-.045;controls.minDistance=8;controls.maxDistance=55;controls.target.set(4.8,.0,6.7);
const pmrem=new THREE.PMREMGenerator(renderer);const roomEnv=new RoomEnvironment(),envMap=pmrem.fromScene(roomEnv,.04).texture;roomEnv.dispose();pmrem.dispose();
// Software rasterisers spend about half of each frame on the environment: drop it there, lift the hemisphere instead,
// and give only reflective finishes their own envMap (startup, below).
scene.environment=renderTier==='soft'?null:envMap;
const hemi=new THREE.HemisphereLight(LIGHTING.day.sky,LIGHTING.day.ground,LIGHTING.day.hemi);scene.add(hemi);
const reflective=[],skyColor=new THREE.Color(LIGHTING.day.sky),groundColor=new THREE.Color(LIGHTING.day.ground);let ambient,homeLight=LIGHTING.day,indoor=OUTDOOR;
// ambient keeps the preset's values; indoors (walking, tour rooms) the lighting preset's indoor factors scale sky, ground and environment on the way out.
function setAmbient(h,e){ambient={hemi:h,env:e};e*=indoor.env;scene.environmentIntensity=e;for(const m of reflective)m.envMapIntensity=e;if(renderTier!=='soft'){hemi.intensity=h;hemi.color.copy(skyColor).multiplyScalar(indoor.sky);hemi.groundColor.copy(groundColor).multiplyScalar(indoor.ground);return;}
 hemi.intensity=1;hemi.color.copy(skyColor).multiplyScalar(h*indoor.sky).addScalar(e*SOFT_ENV_SKY);hemi.groundColor.copy(groundColor).multiplyScalar(h*indoor.ground).addScalar(e*SOFT_ENV_GROUND);}setAmbient(LIGHTING.day.hemi,LIGHTING.day.env);
const sun=new THREE.DirectionalLight(LIGHTING.day.color,LIGHTING.day.sun);sun.position.set(-5,15,22);sun.target.position.set(4,0,7);sun.castShadow=true;sun.shadow.mapSize.setScalar(SUN_MAP[renderTier]);sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;sun.shadow.camera.near=.1;sun.shadow.camera.far=120;sun.shadow.bias=-.00025;sun.shadow.normalBias=.035;sun.shadow.radius=3;scene.add(sun,sun.target);
// Sun shadows cover the whole floor (60×50 m) in the overviews. Inside a unit (walking, tour rooms) the roof casts, so sun only
// comes in through the openings, and the shadow frame is fitted to that unit's outline as the sun sees it: B is about 16 × 13 m
// with the day sun, 0.8 × 0.6 cm per texel with the 2048 map. The lighting preset only sets the sun's direction.
const SUN_HOME=V(4,0,7),sunDir=V(-9,15,15);let sunFit='',sunVersion=0;
const unitOutline=id=>{if(id==='bl')return unitBFootprint;if(id==='br')return unitBFootprint.map(([x,z])=>[41.8-x,z]);const [x0,z0,x1,z1]=furnishingZones.find(q=>q.id===id).bounds;return [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];};
function fitSun(){const inside=mode==='walk'||(mode==='tour'&&!TOUR.find(s=>tourTime>=s.start&&tourTime<s.end)?.overview),c=inside?unitCenters[activeUnit]:null,key=(c?activeUnit:'floor')+'|'+sunVersion;syncRoomLights(inside);if(key===sunFit)return;sunFit=key;const s=sun.shadow.camera;sun.target.position.copy(c?V(c[0],0,c[1]):SUN_HOME);sun.position.copy(sun.target.position).add(sunDir);if(c)Object.assign(s,lightSpaceBounds(sun.position,sun.target.position,unitOutline(activeUnit)));else{s.left=-30;s.right=30;s.top=25;s.bottom=-25;}s.updateProjectionMatrix();sun.target.updateMatrixWorld();setIndoor(!!c);renderer.shadowMap.needsUpdate=true;}
const fill=new THREE.DirectionalLight('#e2edf2',LIGHTING.day.fill);fill.position.set(15,10,-10);scene.add(fill);const fillColor=fill.color.clone();
// Under the roof the sun only comes in through the openings; the preset's indoor factors re-balance the unshadowed light
// (mostly more bounce from below) so the rooms stay as bright as before (design-presets.js).
const aoCeilings=[];function setIndoor(on){indoor=on?homeLight.indoor:OUTDOOR;for(const q of aoCeilings)q.visible=on;fill.color.copy(fillColor).multiplyScalar(indoor.fill);setAmbient(ambient.hemi,ambient.env);}
let furniture=new THREE.Group();
const allFurnishings=new THREE.Group();
const house=new THREE.Group(), arch=new THREE.Group(), roof=new THREE.Group(), annotations=new THREE.Group(), stage=new THREE.Group(), building=new THREE.Group(),landscape=new THREE.Group();
scene.add(house,stage,building,landscape);house.add(arch,allFurnishings,roof,annotations);allFurnishings.add(furniture);building.visible=false;landscape.visible=false;roof.visible=false;annotations.visible=false;
const clipPlane=new THREE.Plane(V(0,-1,0),1.28), wallCaps=[];
const bDetails=new THREE.Group();arch.add(bDetails);let detailTarget=bDetails;
const matCache=new Map();
const mat=(color,roughness=.78,extra={})=>{const key=color+'|'+roughness+'|'+JSON.stringify(Object.fromEntries(Object.entries(extra).map(([k,v])=>[k,k==='clippingPlanes'?'wall-cut':v?.isTexture?v.uuid:v])));if(!matCache.has(key))matCache.set(key,new THREE.MeshStandardMaterial({color,roughness,...extra}));return matCache.get(key);};
function seeded(n){let a=n>>>0;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;};}
// Procedural maps (material-kit.js): veneer 1024², wood floors by the preset's board and lay, tiles with real-size joints, woven
// fabric, wall paint; roughness maps derived from them. UVs are metres (metric-uv.js), so each map's repeat is 1 / its size.
// Software rasterisers: 512² maps, no roughness maps, plain walls. RoundedBoxGeometry segments by tier (bevelSegments).
const finishes=createFinishes({tier:renderTier,maxAniso:renderer.capabilities.getMaxAnisotropy()}),woodtex=finishes.woodtex,tiletex=finishes.tiletex,fabrictex=finishes.fabrictex,floorWood=woodtex;BEVEL.segments=bevelSegments(renderTier);
const M={wall:mat('#efece1',.84,{clippingPlanes:[clipPlane]}),cap:mat('#eeeade'),oak:mat('#c4a982',.6,{map:woodtex}),walnut:mat('#6e573d',.62),floor:mat('#d4c2a3',.78,{map:floorWood}),tile:mat('#d6d9ce',.8,{map:tiletex}),stone:mat('#e3dfd3',.5),dark:mat('#394338',.6),metal:mat('#4c594e',.38,{metalness:.55}),brass:mat('#ad8e54',.28,{metalness:.65}),white:mat('#eeede5',.72),linen:mat('#f0e9dc',.94,{map:fabrictex}),olive:mat('#78876a',.96,{map:fabrictex}),terracotta:mat('#aa7256',.95),glass:mat('#d3e9dd',.1,{transparent:true,opacity:.19,metalness:.18,depthWrite:false,side:THREE.DoubleSide,clippingPlanes:[clipPlane]})};
finishes.extend(M,{mat,clipPlane});
const collisionBoxes=[],winSegments=[];
function box(x,y,z,w,h,d,m,parent=house,r=0){const g=metricBoxUV(r?new RoundedBoxGeometry(w,h,d,BEVEL.segments,Math.min(bevel(r,m),w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d));const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
// Edge radius by finish (material-kit.js BEVEL): casework 1–1.5 cm, upholstery 4–8 cm, cushions 5 cm unless asked otherwise.
function round(x,y,z,w,h,d,m,parent=furniture,r){return box(x,y,z,w,h,d,m,parent,bevel(r,m));}
function cyl(x,y,z,r,h,m,parent=furniture,rt=r){const q=new THREE.Mesh(new THREE.CylinderGeometry(rt,r,h,12),m);q.position.set(x,y+h/2,z);q.castShadow=true;q.receiveShadow=true;parent.add(q);return q;}
function sphere(x,y,z,sx,sy,sz,m,parent=furniture){const o=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
function shape(points){const s=new THREE.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();return s;}
function slab(points,y,h,m,parent=house,holes=[]){const s=shape(points);for(const h of holes){const p=new THREE.Path();h.forEach(([x,z],i)=>i?p.lineTo(x,-z):p.moveTo(x,-z));p.closePath();s.holes.push(p);}const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:1,UVGenerator:WALL_UV});g.rotateX(-Math.PI/2);const q=new THREE.Mesh(g,m);q.position.y=y;q.castShadow=true;q.receiveShadow=true;parent.add(q);return q;}
function rod(a,b,r,m,parent=furniture){const av=V(...a),bv=V(...b),delta=bv.clone().sub(av);const q=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),6),m);q.position.copy(av.add(bv).multiplyScalar(.5));q.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());q.castShadow=true;parent.add(q);return q;}
function collide(x0,z0,x1,z1){collisionBoxes.push([x0,z0,x1,z1]);}
const unitBFootprint=[[6.35,0],[8.95,0],[8.95,1],[10.75,1],[10.75,13.45],[3.35,13.45],[3.35,12.25],[2.8,12.25],[.6,12.25],[.6,11.65],[-.1,11.65],[-.1,2.25],[6.35,2.25]];
const footprint=data.footprint, floorHoles=data.floorHoles;
slab(footprint,-.18,.18,M.floor,house,floorHoles);
// Paving follows room boundaries; geometry stays in CAD metres.
box(7.675,.001,1.7,2.65,.012,3.4,M.tile);box(6.2,.002,4.55,1.6,.012,2.8,M.tile);box(5.875,.002,2.85,.95,.012,.6,M.tile);box(.95,.002,7.02,1.9,.012,2.16,M.tile);box(6.95,.001,12.45,7.2,.012,1.8,M.outdoor);const northwestTile=box(1.4,.002,3.1,2.8,.012,1.65,M.tile);northwestTile.name='northwest-balcony-tile';
const structuralPolys=data.wallPolygons.map((points,i)=>({points,holes:data.wallHoles[i]||[]}));
const layoutWalls={};
for(const [id,plan] of [['original',originalData],['redesign',redesignData],['central',centralWallData]]){const group=new THREE.Group(),caps=new THREE.Group();arch.add(group);group.add(caps);layoutWalls[id]={group,caps};group.visible=id==='original';for(let i=0;i<plan.wallPolygons.length;i++){slab(plan.wallPolygons[i],0,2.78,M.wall,group,plan.wallHoles[i]||[]);slab(plan.wallPolygons[i],0,.008,M.cap,caps,plan.wallHoles[i]||[]);}caps.position.y=1.28;wallCaps.push(caps);}
// Preserve upper bands as placeholders, not verified beam dimensions.
for(const id of ['original','redesign']){
 const g=layoutWalls[id].group;box(.95,2.30,3.9,1.7,.48,.1,M.wall,g);
 if(id==='redesign')box(2.9,2.30,4.45,.2,.48,2.4,M.wall,g);
}
// Owner-confirmed wall spans do not permit moving wet-zone services.
const layoutMarkup=new THREE.Group();house.add(layoutMarkup);layoutMarkup.visible=false;
for(const poly of redesignData.removedPolygons)slab(poly,.025,.015,mat('#cc8d4a',.8),layoutMarkup);
for(const poly of redesignData.addedPolygons||[])slab(poly,.026,.016,mat('#59958b',.8),layoutMarkup);
// The roof casts: it is only shown (and so only in the shadow map) when walking or in the tour's rooms.
slab(footprint,2.78,.17,M.white,roof,floorHoles);roof.visible=false;
function archBox(x,y,z,w,h,d,m=M.wall){return box(x,y,z,w,h,d,m,detailTarget);}
// Every doorway / slider / window records its spec for detail-layer.js (skirting gaps, thresholds, stops, sills).
const doorSpecs=[],windowSpecs=[];
// Windows: PC2018, PC1218, PC0718a, PC1214b, PC2718a and west-side openings.
function windowWall(a,b,bottom,height,segments=3,base=true){const [x1,z1]=a,[x2,z2]=b,dx=x2-x1,dz=z2-z1,L=Math.hypot(dx,dz),rotation=-Math.atan2(dz,dx);const g=new THREE.Group();g.position.set((x1+x2)/2,0,(z1+z2)/2);g.rotation.y=rotation;detailTarget.add(g);
 if(base){box(0,0,0,L,bottom,.16,M.wall,g);box(0,bottom+height,0,L,Math.max(.01,2.78-bottom-height),.16,M.wall,g);}
 const fmat=M.frame,side=windowSide(a,b,footprint);windowSpecs.push({a,b,bottom,height,base,side,target:detailTarget});
 // Frame 60 mm, mullions 50 mm, 100 mm deep. In the B units the first pane, if 0.6 m or wider, opens: its own 40 mm sash proud on the room side, handle at mid-height.
 box(0,bottom,0,L,.06,.1,fmat,g);box(0,bottom+height-.06,0,L,.06,.1,fmat,g);
 for(let i=0;i<=segments;i++)box(-L/2+L*i/segments,bottom,0,.05,height,.1,fmat,g);
 const q=box(0,bottom+.02,0,L-.03,height-.04,.018,M.glass,g);q.castShadow=false;
 const pane=L/segments;if(pane>=.6&&detailTarget===bDetails){const u0=-L/2+.025,u1=u0+pane-.05,y0=bottom+.06,y1=bottom+height-.06,v=side*.035,hy=bottom+height*.5;
  for(const y of [y0,y1-.04])box((u0+u1)/2,y,v,u1-u0,.04,.06,fmat,g);for(const u of [u0+.02,u1-.02])box(u,y0,v,.04,y1-y0,.06,fmat,g);
  box(u1-.02,hy-.04,side*.071,.028,.08,.012,fmat,g);box(u1-.02,hy-.13,side*.087,.018,.12,.02,fmat,g);}
 winSegments.push([x1,z1,x2,z2]);return g;}
windowWall([.4,2.45],[2.4,2.45],.5,1.8,2);windowWall([3.95,2.45],[5.2,2.45],.5,1.8,2);windowWall([5.45,2.45],[6.15,2.45],.5,1.8,1);windowWall([7.1,.15],[8.3,.15],.9,1.4,2);
windowWall([.7,12.15],[2.8,12.15],.5,1.8,3);windowWall([.7,11.6],[.7,12.15],.5,1.8,1);windowWall([2.85,11.6],[2.85,12.15],.5,1.8,1);
windowWall([0,5.95],[0,6.75],.9,1.4,1);windowWall([0,8.05],[0,9.15],.65,1.65,1);
// Bay-window seats are low, not full-height walls.
box(1.78,0,11.9,2.15,.48,.5,M.stone);box(4.56,0,2.73,1.25,.48,.48,M.stone);box(5.8,0,2.73,.7,.48,.48,M.stone);
function doorway(x,z,width,along='x',swing=1){const g=new THREE.Group();g.position.set(x,0,z);if(along==='z')g.rotation.y=Math.PI/2;detailTarget.add(g);const fm=mat('#a79274',.68,{clippingPlanes:[clipPlane]});
 // Lining as deep as the CAD wall (at least 0.14 m, 5 mm proud), posts 3 mm proud of the jambs (no face coplanar with a wall),
 // 65 mm casings on both wall faces; all in the cut frame finish.
 const {t,c}=doorReveal([originalData,centralWallData],x,z,width,along),d=Math.max(.14,t+.01),f=Math.max(t/2,.07)+.012-t/2;doorSpecs.push({x,z,w:width,along,swing,t,c,g,target:detailTarget,kind:'door'});
 box(-width/2-.0235,0,c,.053,2.3,d,fm,g);box(width/2+.0235,0,c,.053,2.3,d,fm,g);box(0,2.3,c,width+.1,.08,d,fm,g);box(0,2.38,c,width+.1,.4,d,M.wall,g);
 for(const s of [-1,1]){const v=c+s*(t/2+f/2);for(const u of [-1,1])box(u*(width/2+.0375),0,v,.065,2.37,f,fm,g);box(0,2.305,v,width+.14,.065,f,fm,g);}
 // Leaf clears the 16 mm threshold stone; lever handles with square roses on both faces.
 const hinge=new THREE.Group();hinge.userData.doorLeaf=true;hinge.position.x=-width/2;hinge.rotation.y=swing*Math.PI*.47;g.add(hinge);const dm=mat('#b7a282',.72,{clippingPlanes:[clipPlane]});box(width/2,.02,0,width,2.25,.038,dm,hinge);const lever=new THREE.Mesh(leverGeo(width),M.brass);lever.castShadow=true;hinge.add(lever);return g;}
function configuredDoor(d){const g=doorway(d.x,d.z,d.width,d.along,d.swing);if(d.mirror)g.scale.x=-1;return g;}
const childDoor=doorway(2.25,5.9,.9);childDoor.scale.x=-1;configuredDoor(NORTH_ENTRY);const originalMasterDoor=configuredDoor(MASTER_ENTRIES.original);
// The refuge doorset is retained at its original opening; not replaced with a decorative sliding door.
configuredDoor(REFUGE_ENTRY);
const southDoor=configuredDoor({x:6,z:7.1,width:.9,along:'x',swing:-1,mirror:true});doorway(5.85,4.9,.8);doorway(10.65,2,1.1,'z');
const centralSouthDoor=configuredDoor(CENTRAL_ENTRY);centralSouthDoor.visible=false;
// Door frames always remain; leaves can be hidden for viewing, not physically removed.
function slider(x,z,w){const g=new THREE.Group();detailTarget.add(g);const fm=M.frame;box(x,2.3,z,w,.06,.12,fm,g);box(x-w/2,0,z,.04,2.3,.12,fm,g);box(x+w/2,0,z,.04,2.3,.12,fm,g);const leaf=new THREE.Group();leaf.userData.doorLeaf=true;g.add(leaf);box(x-w*.35,0,z,w*.28,2.3,.025,M.glass,leaf);box(x-w*.21,0,z,.025,2.3,.07,fm,leaf);archBox(x,2.36,z,w,.42,.18);
 for(const s of [-1,1])box(x-w*.21,.85,z+s*.047,.016,.34,.024,fm,leaf);const {t,c}=doorReveal([originalData,centralWallData],x,z,w,'x');doorSpecs.push({x,z,w,along:'x',swing:0,t,c,g,target:detailTarget,kind:'slider'});return g;}
slider(8.6,11.55,2.7);slider(4.75,11.55,1.8);const studyDivider=slider(1.4,3.9,2.7);
// Balcony balustrade and columns; no fabricated outside view.
function rail(a,b){const [x1,z1]=a,[x2,z2]=b;const L=Math.hypot(x2-x1,z2-z1);rod([x1,1.1,z1],[x2,1.1,z2],.025,M.metal,detailTarget);for(let d=0;d<=L;d+=.16){const t=d/L;rod([x1+(x2-x1)*t,.08,z1+(z2-z1)*t],[x1+(x2-x1)*t,1.08,z1+(z2-z1)*t],.012,M.metal,detailTarget);}winSegments.push([x1,z1,x2,z2]);}
rail([3.4,13.35],[10.5,13.35]);rail([3.4,11.75],[3.4,13.35]);
// Contact shadows: every furniture footprint gets an eased patch (light-layer.js); one geometry per group, so after batchStatic
// each group adds at most one draw call. The same unlit material draws the fake AO along the walls (cut with them).
const shadeMat=shadeMaterial(clipPlane);function contacts(boxes,parent){const q=new THREE.Mesh(contactGeometry(boxes),shadeMat);parent.add(q);return q;}
const rugMaterials=new Set();
function rug(x,z,w,d,color='#c4c7b5'){const m=mat(color,.98,{map:fabrictex});rugMaterials.add(m);const q=round(x,.017,z,w,.018,d,m,furniture,.04);q.receiveShadow=true;for(let i=0;i<10;i++){const line=box(x-w/2+.08+i*.024,.038,z,.009,.002,d-.08,mat('#eeeee4',1),furniture);}}
function plant(x,z,h=1,parent=furniture){furnish.plant(x,z,h,parent);}
function vase(x,y,z,parent=furniture){cyl(x,y,z,.09,.19,M.terracotta,parent,.045);for(let i=0;i<4;i++){rod([x,y+.15,z],[x+(i-1.5)*.04,y+.45+(i%2)*.05,z+.03],.003,M.brass,parent);sphere(x+(i-1.5)*.04,y+.44+(i%2)*.05,z+.03,.045,.06,.02,M.olive,parent);}}
function book(x,y,z,color='#b1b69f',parent=furniture){box(x,y,z,.25,.035,.17,mat(color),parent,.006);}
// cut: hung above 1.28 m, so every part is cut with the walls; the frame keeps sharing oak's colour across presets.
let oakCut=null;function art(x,y,z,w,h,rotation=0,cut=false){const c=cut?{clippingPlanes:[clipPlane]}:{};if(cut&&!oakCut){oakCut=M.oak.clone();oakCut.clippingPlanes=[clipPlane];oakCut.color=M.oak.color;}const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;furniture.add(g);box(0,0,0,w,h,.035,cut?oakCut:M.oak,g);box(0,.035,.025,w-.07,h-.07,.012,mat('#ebe8db',.78,c),g);const a=cyl(0,.1,0,.01,.01,M.oak);furniture.remove(a);for(let i=0;i<3;i++){const q=new THREE.Mesh(new THREE.CircleGeometry(w*(.12+i*.03),24),new THREE.MeshBasicMaterial({color:['#657158','#c5ac80','#9d7d5b'][i],...c}));q.position.set((i-1)*w*.2,h*(.3+i*.17),.036+i*.002);g.add(q);}return g;}
function chair(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;furniture.add(g);round(0,.43,0,.45,.07,.43,M.linen,g,.05);round(0,.53,.19,.44,.36,.055,M.oak,g,.025);for(let a of [-1,1])for(let b of [-1,1])rod([a*.17,0,b*.16],[a*.15,.46,b*.14],.023,M.walnut,g);return g;}
// Soft furnishings and accessories (furnish-layer.js): cushions, throw, made beds, lamps, prints, entry joinery, balcony rack.
const furnish=createFurnishing({box,cyl,rod,mat,M,clipPlane,rug,vase,contacts,oakCut:()=>oakCut,soft:renderTier==='soft'});
const livingStart=new Set(furniture.children);
// Living room, placed to match the furniture orientation in the CAD plan.
rug(8.45,9.25,2.95,3.25,'#c3c8b9');
round(7.3,.10,9.05,.98,.29,2.62,M.linen);round(6.9,.38,9.05,.17,.55,2.65,M.linen);round(7.3,.33,7.8,1,.42,.16,M.linen);round(7.3,.33,10.3,1,.42,.16,M.linen);
for(let i=0;i<3;i++)round(7.38,.39,8.19+i*.83,.72,.18,.77,M.linen);furnish.sofa(furniture);
const loungeExtrasStart=new Set(furniture.children);
round(8.55,.1,7.65,1.65,.25,.8,M.linen);round(8.55,.38,7.32,1.65,.46,.14,M.linen);round(8.55,.36,7.68,1.5,.14,.59,M.linen);round(8.24,.52,7.5,.46,.28,.18,M.olive);
cyl(8.8,.29,9.38,.55,.045,M.stone);cyl(8.8,.04,9.38,.21,.26,M.walnut);cyl(9.25,.36,9.08,.32,.04,M.walnut);cyl(9.25,.04,9.08,.12,.32,M.walnut);vase(8.84,.34,9.38);book(8.59,.34,9.25);
const originalLoungeExtras=new THREE.Group();for(const q of [...furniture.children])if(!loungeExtrasStart.has(q))originalLoungeExtras.add(q);furniture.add(originalLoungeExtras);
round(10.17,.11,9.05,.43,.34,2.55,M.oak);box(10.43,.72,9.05,.035,1.08,1.9,mat('#1d2827',.21,{clippingPlanes:[clipPlane]}),furniture);box(10.405,.77,9.05,.006,.96,1.78,mat('#313f3b',.23,{clippingPlanes:[clipPlane]}),furniture);art(6.82,1.35,9.1,1.5,.82,Math.PI/2,true);plant(9.98,10.72,1.45);cyl(7.18,.0,10.82,.22,.42,M.walnut);vase(7.18,.42,10.82);
collide(6.82,7.72,7.82,10.38);collide(7.7,7.2,9.4,8.03);collide(9.95,7.75,10.4,10.35);collide(8.33,8.86,9.3,9.9);
const oldLivingMeshes=[...furniture.children].filter(q=>!livingStart.has(q));
// Dining area and pendant cluster.
round(8.05,.72,4.6,1.75,.07,.86,M.oak);for(let a of [-1,1])for(let b of [-1,1])box(8.05+a*.65,0,4.6+b*.3,.06,.72,.06,M.walnut,furniture);for(let x of [7.45,8.05,8.65]){chair(x,3.85,Math.PI);chair(x,5.36,0);}vase(8.0,.79,4.6);for(let x of [7.5,8.55])cyl(x,.795,4.62,.12,.015,M.white);collide(7.12,4.1,8.97,5.08);
const lamps=new THREE.Group();roof.add(lamps);for(let i=0;i<3;i++){rod([7.45+i*.6,2.78,4.6],[7.45+i*.6,2.1+i*.08,4.6],.006,M.dark,lamps);sphere(7.45+i*.6,2.05+i*.08,4.6,.17,.12,.17,M.white,lamps);}const diningLight=new THREE.PointLight('#ffe3b1',3,4,2);diningLight.position.set(8,2.3,4.6);roof.add(diningLight);
// Kitchen: sink, cabinets, hob, tall fridge.
round(6.91,0,1.67,.6,.86,2.7,M.oak);round(7.61,0,.59,1.85,.86,.58,M.oak);box(6.91,.86,1.67,.66,.035,2.7,M.stone,furniture);box(7.61,.86,.59,1.85,.035,.64,M.stone,furniture);box(6.6,.91,1.65,.035,.48,2.55,mat('#d2d3be',.78,{clippingPlanes:[clipPlane]}),furniture);box(6.9,.902,1.55,.49,.012,.62,mat('#25312a',.3),furniture);for(let z of [1.37,1.72])cyl(6.92,.915,z,.12,.015,M.metal);
box(7.6,.9,.59,.66,.02,.42,M.metal,furniture,.05);box(7.6,.918,.59,.53,.01,.3,mat('#82908c'),furniture,.06);rod([7.65,.91,.36],[7.65,1.18,.36],.016,M.metal);rod([7.65,1.18,.36],[7.65,1.18,.58],.016,M.metal);
round(8.48,0,2.65,.62,1.94,.63,mat('#a9b2a3',.4));box(8.145,1.1,2.65,.017,.02,.57,M.dark,furniture);round(6.73,1.51,2.32,.26,.76,1.14,M.whiteCut);for(let z of [.6,1.2,1.9,2.6])box(7.224,.65,z,.016,.04,.18,M.brass,furniture);collide(6.57,.2,7.24,3.08);collide(7.25,.25,8.68,.91);collide(8.17,2.33,8.79,2.98);
// Entry bench and slim storage, without shrinking the entry passage.
const entryCabinet=furnish.entry(furniture);vase(10.25,.955,3.64,entryCabinet);const entryCabinetFootprint=[10.03,3.06,10.5,4.16];collide(...entryCabinetFootprint);furnish.smartLock(doorSpecs.find(d=>d.x===10.65&&d.z===2).g);
// Bedroom furniture. The master bed can be measured and resized.
function bed(cx,cz,width,length=2,rot=0,master=false){if(master){const g=createOwnerMasterBed({cx,cz,width,length,rotation:rot},{box,materials:M,parent:furniture});contacts([[-width/2-.04,-length/2-.05,width/2+.04,length/2+.05]],g);return g;}const g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=rot;furniture.add(g);round(0,.13,0,width+.12,.19,length+.12,M.oak,g,.04);round(0,.32,0,width,.2,length,M.white,g,.08);round(0,.16,-length/2-(master?.055:.06),width+.2,.92,master?.11:.12,M.olive,g,.06);bedding(g,{width,length,top:.52,M});if(master)contacts([[-width/2-.1,-length/2-.11,width/2+.1,length/2+.06]],g);return g;}
const masterStart=new Set(furniture.children);
let masterBed=bed(1.15,9.8,1.8,2,Math.PI/2,true);
// Width is along the CAD bedroom's long side; foot lies toward the wardrobe.
function nightstand(x,z){round(x,.05,z,.42,.42,.42,M.oak);cyl(x,.47,z,.1,.21,M.stone);cyl(x,.68,z,.16,.2,M.linen,furniture,.12);}
nightstand(.45,8.68);nightstand(.45,11.11);rug(1.69,9.95,2.65,2.9,'#c6c6af');
function wardrobe(x,z,w,d,h=2.38){const g=new THREE.Group();furniture.add(g);box(x,0,z,w,h,d,M.oak,g);for(let i=1;i<Math.ceil(w/.55);i++)box(x-w/2+i*w/Math.ceil(w/.55),.05,z+d/2+.001,.009,h-.1,.004,M.walnut,g);return g;}
wardrobe(3.1,9.75,.56,3.1);collide(2.82,8.2,3.38,11.3);art(.145,1.3,9.95,1.3,.72,Math.PI/2);round(1.7,.5,11.9,1.9,.09,.42,M.olive);book(2.3,.59,11.91);
const originalMaster=new THREE.Group();for(const q of [...furniture.children])if(!masterStart.has(q)&&q!==masterBed)originalMaster.add(q);furniture.add(originalMaster);
// South bedroom and north bedroom.
const southStart=new Set(furniture.children);
bed(4.52,9.78,1.5,2,Math.PI/2);wardrobe(4.48,7.65,1.98,.58);nightstand(3.65,8.72);rug(4.95,9.88,2.35,2.65,'#d0c6b1');collide(3.5,7.35,5.48,7.95);collide(3.46,9,5.58,10.55);
const originalSouth=new THREE.Group();for(const q of [...furniture.children])if(!southStart.has(q))originalSouth.add(q);furniture.add(originalSouth);
const northStart=new Set(furniture.children);
bed(4.12,3.92,1.5,2,Math.PI/2);round(3.52,.69,5.04,.65,.06,1.1,M.oak);box(3.52,0,4.6,.5,.7,.06,M.oak,furniture);box(3.52,0,5.5,.5,.7,.06,M.oak,furniture);chair(4.13,5.03,-Math.PI/2);book(3.5,.75,5.08);collide(3.1,3.15,5.18,4.68);collide(3.19,4.5,3.85,5.6);
const originalNorth=new THREE.Group();for(const q of [...furniture.children])if(!northStart.has(q))originalNorth.add(q);furniture.add(originalNorth);
const childStart=new Set(furniture.children);const childCollisionStart=collisionBoxes.length;
bed(1.15,4.57,1.1,2,Math.PI/2);wardrobe(.49,5.45,.62,.62,1.6);rug(1.45,5.13,1.8,1.2,'#b5c6b1');collide(.1,4,2.2,5.15);collide(.17,5.13,.81,5.77);
const oldChildFurniture=new THREE.Group();for(const q of [...furniture.children])if(!childStart.has(q))oldChildFurniture.add(q);furniture.add(oldChildFurniture);const oldChildCollisions=collisionBoxes.slice(childCollisionStart);
// Bathrooms are not reassigned to bedrooms or expanded.
function toilet(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;furniture.add(g);round(0,0,0,.35,.35,.48,M.white,g,.14);round(0,.34,0,.39,.055,.53,M.white,g,.15);round(0,.16,-.22,.37,.48,.16,M.white,g,.05);}
function basin(x,z,w=.65,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;furniture.add(g);round(0,0,0,w,.75,.46,M.oak,g);round(0,.75,0,w+.03,.09,.49,M.white,g);rod([0,.83,-.15],[0,1.03,-.15],.012,M.metal,g);rod([0,1.03,-.15],[0,1.03,-.04],.012,M.metal,g);} // rot turns the cistern / faucet (local −z) to the wall the CAD fixture backs onto; x, z stay put.
toilet(1.37,6.35);basin(.43,7.55,.5,Math.PI/2);box(.78,.01,6.49,.018,2,.92,M.glass,furniture);rod([.25,1.2,6.08],[.25,2.1,6.08],.012,M.metalCut);cyl(.25,2.08,6.2,.085,.02,M.metalCut);
toilet(6.6,4.48,-Math.PI/2);basin(6.68,5.37,.5,-Math.PI/2);box(6.05,.01,3.99,1.5,2,.018,M.glass,furniture);rod([6.83,1.25,3.38],[6.83,2.05,3.38],.012,M.metalCut);cyl(6.73,2.03,3.38,.085,.02,M.metalCut);collide(6.4,5.09,6.97,5.65);collide(.15,7.3,.73,7.8);
// Outdoor seating is removable with the furnishing layer.
const balconyStart=new Set(furniture.children);
cyl(5.3,.64,12.48,.39,.04,M.stone);cyl(5.3,0,12.48,.15,.64,M.metal);chair(4.55,12.5,-Math.PI/2);chair(5.95,12.5,Math.PI/2);vase(5.3,.68,12.48);plant(9.82,12.97,1.35);plant(3.8,12.95,.8);round(9.45,0,12.43,.65,.88,1.38,M.white);box(9.45,.88,12.43,.67,.035,1.4,M.stone,furniture);collide(9.1,11.72,9.8,13.15);
// Enclosed balcony retained for the proposed study, not filled with permanent joinery yet.
const oldBalconyMeshes=[...furniture.children].filter(q=>!balconyStart.has(q));
// The two B units mirror one another; A units use their own CAD walls and layout.
const leftB=furniture, bCollisions=collisionBoxes.map(b=>b.slice()),bWindows=winSegments.map(a=>a.slice());
const mirrorBox=b=>[41.8-b[2],b[1],41.8-b[0],b[3]];
const mirrorSegment=b=>[41.8-b[0],b[1],41.8-b[2],b[3]];
const rightB=leftB.clone(true);rightB.position.x=41.8;rightB.scale.x=-1;allFurnishings.add(rightB);
const rightBDetails=bDetails.clone(true);rightBDetails.position.x=41.8;rightBDetails.scale.x=-1;arch.add(rightBDetails);
collisionBoxes.push(...bCollisions.map(mirrorBox),mirrorBox([.16,9.0,2.28,10.9]));winSegments.push(...bWindows.map(mirrorSegment));
// Remove only the owner's cabinet after cloning: every owner layout shares this clear entry.
leftB.remove(entryCabinet);const entryCabinetCollision=collisionBoxes.findIndex(b=>b.every((v,i)=>v===entryCabinetFootprint[i]));if(entryCabinetCollision>=0)collisionBoxes.splice(entryCabinetCollision,1);
// The moved bedroom door is owner-only; neighbours retain their original entries.
const redesignMasterDoor=new THREE.Group(); // Entry already exists as southDoor; do not duplicate its frame.
// Change only the owner's old children's room into the requested office/guest room.
leftB.remove(oldChildFurniture);for(const b of oldChildCollisions){const i=collisionBoxes.indexOf(b);if(i>=0)collisionBoxes.splice(i,1);}
const gaming=createGamingRoom({box,cyl,rod,woodTexture:woodtex,fabricTexture:fabrictex,clipPlane,materials:M});
const study=gaming.room,studyDay=gaming.day,studyGuest=gaming.guest,studyChair=gaming.chair;leftB.add(study);furnish.desk(study,{cx:1.4,cz:2.95,rot:0,length:2,depth:.7,top:.76});
const studyCollisions=STUDY_COLLISIONS;
studyChair.position.z=.05;studyDivider.visible=false;let doorView=DOOR_VIEW_DEFAULT,guestMode=false,gamingMode='focus';
// Owner's restrained timber detail remains; both entry/dining cabinets and their decor are removed in every layout.
box(6.78,.15,9.05,.028,.94,2.7,M.oak,leftB);
const ownerExtraCollisions=[];
// Remove ONLY owner furniture after cloning the opposite B unit. Locked wet geometry above is unchanged.
for(const q of [...oldLivingMeshes,...oldBalconyMeshes])leftB.remove(q);
for(let i=collisionBoxes.length-1;i>=0;i--)if(LEGACY_LIVING_BOXES.some(b=>b.every((v,k)=>Math.abs(v-collisionBoxes[i][k])<1e-8)))collisionBoxes.splice(i,1);
const ownerLiving=createLivingBalcony({parent:leftB,box,round,cyl,rod,M,clipPlane,furnish,rug,art,chair});
ownerExtraCollisions.push(...ownerLiving.boxes);
// Coffee table with its tray, cup and books, the same in every layout (owner only; collision and contact patch per layout).
furnish.table(leftB);
const originalFitout=new THREE.Group(),redesignFurnishings=new THREE.Group();leftB.add(originalFitout,redesignFurnishings);redesignFurnishings.visible=false;
const expandedGaming=createGamingRoom({box,cyl,rod,woodTexture:woodtex,fabricTexture:fabrictex,clipPlane,materials:M,south:true});redesignFurnishings.add(expandedGaming.room);
function fittedWardrobe(spec){return createFittedWardrobe(spec,{box,materials:M,parent:furniture});}
// Owner bedroom decor (ROOM_DECOR) is built into each layout's own fit-out, so applyLayout shows exactly one set; the master headboard stands 1 cm off the wall, in front of the wainscot.
function roomDecor(id){const D=ROOM_DECOR[id];if(!D)return;for(const d of [D,...(D.also||[])]){const [a,b,A,B,y,Y]=d.wainscot;box((a+A)/2,y,(b+B)/2,A-a,Y-y,B-b,M.oak,furniture);const [p,q,P,Q,u,U]=d.art,e=d.head==='east';art(e?P-.0175:p+.0175,u,(q+Q)/2,Q-q,U-u,e?-Math.PI/2:Math.PI/2,true);}const [r,t,R,T]=D.rug.box;rug((r+R)/2,(t+T)/2,R-r,T-t,D.rug.color);}
for(const id of ['original','redesign']){furniture=id==='original'?originalFitout:redesignFurnishings;
 for(const w of WARDROBES[id])fittedWardrobe(w);
 // Compact north-bedroom bed: a 1.2 × 2.0 mattress with an independently sized
 // 1.26 × 2.08 frame, rather than the generic bed's oversized upholstered headboard.
 const nbSpec=id==='original'?NORTH_BED:NORTHWEST_BED;const nb=new THREE.Group();nb.position.set(nbSpec.cx,0,nbSpec.cz);nb.rotation.y=nbSpec.rotation;furniture.add(nb);
 round(0,.08,0,nbSpec.width+.06,.22,2.08,M.oak,nb,.02);round(0,.30,0,nbSpec.width,.18,2,M.white,nb,.03);
 box(0,.12,-1.02,nbSpec.width+.06,.70,.04,M.oak,nb);bedding(nb,{width:nbSpec.width,length:2,top:.48,M,fit:[nbSpec.width/2+.03,1.04]});
 if(id==='original')bed(SOUTH_BED.cx,SOUTH_BED.cz,SOUTH_BED.width,2,SOUTH_BED.rotation);
 else{round(4.5,.71,3.47,1.4,.04,.6,M.oak);for(const x of [3.85,5.15])box(x,0,3.47,.035,.71,.52,M.oak,furniture);chair(4.5,4.2);book(4,.75,3.45);art(5.24,1.0,4.2,.75,1.05,-Math.PI/2);}
 rug(id==='original'?1.35:1.75,9.8,id==='original'?2.4:2.9,2.7,'#c6c6af');
 if(id==='original'){
  // Northeast writing desk replaces the wardrobe; footprint 1.20 x 0.60 m.
  const [x,z,X,Z]=NORTH_DESK.box;box((x+X)/2,.71,(z+Z)/2,X-x,.04,Z-z,M.oak,furniture);
  for(const zz of [z+.08,Z-.08])box((x+X)/2,0,zz,.50,.71,.035,M.metal,furniture);
  const [cx,cz]=NORTH_DESK.chair;box(cx,.42,cz,.46,.06,.46,M.linen,furniture);box(cx+.21,.48,cz,.04,.42,.46,M.linen,furniture);
  for(const xx of [cx-.20,cx+.20])for(const zz of [cz-.20,cz+.20])box(xx,0,zz,.035,.42,.035,M.oak,furniture);
  book(3.32,.75,4.77);
 }
 // Wall-mounted reading lights, not bulky bedside tables filling the narrow side lanes.
 furnish.readingLights(MASTER_PLACEMENTS[id].cz,furniture);
 roomDecor(id);furnish.rooms(id,furniture);
}
// All new layouts share the exact original architectural group and only swap owner furniture.
const conceptScenes=Object.fromEntries(['balanced','family','central'].map(id=>{
 const scene=createConceptRoom(id,conceptData.layouts[id],{box,materials:M});
 leftB.add(scene.group);scene.group.visible=false;furniture=scene.group;roomDecor(id);furnish.rooms(id,scene.group);for(const q of conceptData.layouts[id].furniture.filter(q=>q.kind==='desk')){const [x,z,X,Z]=q.box,lx=X-x>Z-z;furnish.desk(scene.group,{cx:(x+X)/2,cz:(z+Z)/2,rot:q.face==='west'?-Math.PI/2:lx?0:Math.PI/2,length:Math.max(X-x,Z-z),depth:Math.min(X-x,Z-z),top:.76});}return [id,scene];
}));
furniture=leftB;
// Same master bed and bay in every layout, so the bay joinery sits outside the per-layout fit-outs.
const fullBay=createBayWindow({box,cyl,book,vase,materials:M,parent:leftB,clipPlane});
const compactBay=createBayWindow({box,cyl,book,vase,materials:M,parent:leftB,clipPlane,compact:true});fullBay.visible=false;
const ownerOldBoxRefs=OWNER_REPLACED_BOXES.map(b=>collisionBoxes.find(q=>q.every((v,i)=>v===b[i])));
// A units: three bedrooms, living/dining and two bathrooms, not copies of B.
const leftA=new THREE.Group();allFurnishings.add(leftA);furniture=leftA;
const aDetails=new THREE.Group();arch.add(aDetails);detailTarget=aDetails;
const aCollisionStart=collisionBoxes.length,aWindowStart=winSegments.length;
windowWall([15.15,3.45],[15.15,4.65],.9,1.4,2);windowWall([15.4,5.5],[16.1,5.5],.9,1.4,1);windowWall([16.65,5.5],[18.45,5.5],.9,1.4,3);windowWall([18.85,5.5],[19.55,5.5],.9,1.4,1);windowWall([18.2,14.05],[20.0,14.05],.5,1.8,3);
slider(12.85,13.45,2.7);slider(15.85,13.45,1.8);doorway(11.45,3.7,1.1,'z');
rail([10.95,15.05],[17.35,15.05]);rail([10.95,13.7],[10.95,15.05]);rail([17.35,13.7],[17.35,15.05]);
rug(12.75,11.4,2.65,2.9,'#c6c7b8');round(13.95,.12,11.27,.85,.29,2.5,M.linen);round(14.28,.4,11.27,.14,.55,2.5,M.linen);for(let z of [10.45,11.27,12.09])round(13.9,.41,z,.65,.16,.75,M.linen);round(13.95,.4,10.05,.85,.34,.15,M.olive);round(13.95,.4,12.49,.85,.34,.15,M.olive);
round(11.16,.12,11.2,.42,.34,2.4,M.oak);box(10.97,.82,11.2,.035,.9,1.6,M.dark,leftA);cyl(12.65,.32,11.45,.45,.05,M.stone);cyl(12.65,.05,11.45,.15,.27,M.walnut);vase(12.65,.37,11.45);plant(11.7,12.95,1.0);collide(13.5,10,14.4,12.6);collide(10.95,10,11.4,12.4);collide(12.2,11,13.1,11.9);
round(13.0,.73,7.3,1.5,.065,.8,M.oak);for(let x of [12.5,13.5])for(let z of [7.05,7.55])box(x,0,z,.05,.73,.05,M.walnut,leftA);chair(12.6,6.6);chair(13.35,6.6);chair(12.6,8,Math.PI);chair(13.35,8,Math.PI);vase(13,.8,7.3);collide(12.2,6.9,13.8,7.7);
round(12.8,0,4.2,.58,.86,1.8,M.oak);round(13.65,0,3.55,1.7,.86,.6,M.oak);box(12.8,.86,4.2,.62,.035,1.8,M.stone,leftA);box(13.65,.86,3.55,1.7,.035,.64,M.stone,leftA);box(14,.9,3.55,.6,.025,.4,M.metal,leftA);cyl(12.8,.9,4.5,.12,.015,M.dark);round(14.6,0,5.05,.6,1.9,.6,M.white);collide(12.48,3.3,13.12,5.1);collide(13.1,3.25,14.5,3.88);collide(14.3,4.75,14.9,5.35);
bed(19.5,11.45,1.8);wardrobe(20.5,9.4,.55,1.6);nightstand(18.3,10.8);nightstand(20.65,10.8);rug(19.4,11.8,2.8,2.7);collide(18.54,10.39,20.46,12.51);collide(20.225,8.6,20.775,10.2);
bed(16.0,11.65,1.5);wardrobe(16.1,9.92,1.8,.55);collide(15.19,10.59,16.81,12.71);collide(15.2,9.65,17.0,10.2);
bed(17.45,6.75,1.35);round(17.0,.71,8.1,.8,.04,.35,M.oak);collide(16.71,5.69,18.19,7.81);
toilet(15.5,5.95);basin(15.0,8.05,.5);toilet(19.15,6.2);basin(20.3,7.4,.6);collide(14.75,7.8,15.25,8.3);collide(20,7.15,20.6,7.65);
cyl(13.5,.64,14.4,.36,.04,M.stone);cyl(13.5,.05,14.4,.12,.59,M.walnut);chair(12.8,14.4,-Math.PI/2);chair(14.2,14.4,Math.PI/2);plant(16.85,14.7,1.0);furnish.neighbourA(leftA);
const aCollisions=collisionBoxes.slice(aCollisionStart),aWindows=winSegments.slice(aWindowStart);
const rightA=leftA.clone(true);rightA.position.x=41.8;rightA.scale.x=-1;allFurnishings.add(rightA);
const rightADetails=aDetails.clone(true);rightADetails.position.x=41.8;rightADetails.scale.x=-1;arch.add(rightADetails);collisionBoxes.push(...aCollisions.map(mirrorBox));winSegments.push(...aWindows.map(mirrorSegment));
furniture=leftB;detailTarget=bDetails;
// Service cores and the bridge are common property; fit-out here is only illustrative.
const common=new THREE.Group();allFurnishings.add(common);const commonDetails=new THREE.Group();arch.add(commonDetails);detailTarget=commonDetails;
function commonTile(x,z,w,d){box(x,.002,z,w,.012,d,M.tile,house);}
commonTile(20.9,1.8,12.7,1.4);
for(const mirror of [false,true]){const X=x=>mirror?41.8-x:x;
 commonTile(X(11.7),-.65,5.5,3.3);commonTile(X(11.05),2.2,.6,2.1);commonTile(X(7.675),1.7,2.65,3.4);commonTile(X(13.7),4.3,2.5,2.2);commonTile(X(13.8),14.3,6.9,1.5);
 box(X(12.85),0,-1.56,1.55,2.25,.07,M.metal,common);box(X(12.85),.08,-1.51,.015,2.1,.008,M.dark,common);box(X(13.9),1.2,-1.5,.15,.24,.03,M.dark,common);
 for(let i=0;i<8;i++){box(X(9.65),i*.184,-.45-i*.27,1.05,.184,.28,M.stone,common);box(X(10.78),1.475+i*.184,-2.35+i*.27,1.05,.184,.28,M.stone,common);}
 box(X(10.2),1.475,-3.23,2.3,.15,1.4,M.stone,common);rod([X(10.2),1.0,-.5],[X(10.2),2.35,-2.6],.025,M.metal,common);
 windowWall([X(14.45),-1.2],[X(14.45),.5],.6,1.7,2);windowWall([X(9.8),-4.2],[X(11.3),-4.2],.7,1.6,2);
}
rail([14.6,1.0],[27.2,1.0]);rail([14.6,2.6],[27.2,2.6]);detailTarget=bDetails;furnish.lobby(common);
// Hard finish (detail-layer.js): skirting, thresholds, door stops and sills per wall set, ceiling downlights, owner's curtains.
const details=createDetailLayer({mat,M,clipPlane,footprint,floorHoles,wallSets:{original:originalData,central:centralWallData},groups:{original:layoutWalls.original.group,central:layoutWalls.central.group},doors:doorSpecs,windows:windowSpecs,mirrored:[bDetails,aDetails],hidden:[studyDivider],roof,owner:leftB,layouts:{original:originalFitout,...Object.fromEntries(Object.entries(conceptScenes).map(([k,v])=>[k,v.group]))}});
furnish.balcony(roof,details.materials.glow);
const furnishingZones=[{id:'bl',group:leftB,bounds:[-.1,.1,10.75,13.45]},{id:'al',group:leftA,bounds:[11.4,3.15,20.9,15.15]},{id:'ar',group:rightA,bounds:[20.9,3.15,30.4,15.15]},{id:'br',group:rightB,bounds:[31.05,.1,41.9,13.45]},{id:'common',group:common,bounds:[8.85,-4.3,32.95,3.15]}];

// Whole-floor display plinth, outside the real apartment dimensions.
round(20.9,-.7,5.55,45,.38,22.6,M.stone,stage,.15);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),mat('#e7e4db',1));ground.rotation.x=-Math.PI/2;ground.position.y=-.79;ground.receiveShadow=true;stage.add(ground);
const grid=new THREE.GridHelper(80,80,'#c7cebc','#dce0d3');grid.position.set(5.2,-.785,6.85);grid.material.transparent=true;grid.material.opacity=.32;stage.add(grid);
// Abstract landscape and outlook (scene-env.js): generic massing on a far ring, not real neighbouring buildings or a river view.
// The land runs past the far plane, so wherever it shows it fogs out before its edge.
const land=new THREE.Mesh(new THREE.CircleGeometry(900,48),mat('#b7c1a4',1));land.rotation.x=-Math.PI/2;land.position.set(20.9,0,5.5);landscape.add(land);const sky=createSky({center:[20.9,5.5]});landscape.add(sky);
const lrng=seeded(480);for(let i=0;i<28;i++){const x=(lrng()-.5)*180,z=20+lrng()*120;const h=3+lrng()*5;const g=new THREE.Group();g.position.set(x,0,z);landscape.add(g);cyl(0,0,0,.12,h*.4,M.walnut,g);sphere(0,h*.65,0,h*.35,h*.5,h*.35,mat('#8d9e77'),g);}
const unusedOldBuildingFootprint=[[-.1,2.35],[6.35,2.35],[6.35,0],[8.9,0],[8.9,-6.4],[13.75,-6.4],[13.75,-.6],[28.05,-.6],[28.05,-6.4],[32.9,-6.4],[32.9,0],[35.45,0],[35.45,2.35],[41.9,2.35],[41.9,11.65],[35.2,11.65],[35.2,13.45],[31.15,13.45],[31.15,15.25],[10.65,15.25],[10.65,13.45],[6.6,13.45],[6.6,11.65],[-.1,11.65]];
const buildingFootprint=footprint;
const bmat=mat('#c6c6b4',.82),bglass=mat('#869d96',.28,{metalness:.25});
for(let floor=1;floor<=26;floor++){let elevation=floor===1?0:floor===2?5.2:8.5+(floor-3)*2.95;const h=floor===1?5.2:floor===2?3.3:2.95;slab(buildingFootprint,elevation,.16,bmat,building);for(const [x,w,z,d] of [[20.9,41.8,7.2,8.9],[11.3,4.8,-3.45,5.9],[30.5,4.8,-3.45,5.9]])box(x,elevation+.16,z,w,h-.3,d,bglass,building);for(let x=.25;x<42;x+=3.5){box(x,elevation+.16,11.68,.15,h-.2,.15,bmat,building);box(x,elevation+.16,2.7,.15,h-.2,.15,bmat,building);}for(let x of [8.7,12.7,29.1,33.1])box(x,elevation+.16,-3.4,.2,h-.2,5.5,bmat,building);}
slab(buildingFootprint,79.3,.25,M.stone,building);box(11.3,79.55,-3.6,5.4,4.55,6.1,M.stone,building);box(30.5,79.55,-3.6,5.4,4.55,6.1,M.stone,building);
const activeFloor=new THREE.Group();scene.add(activeFloor);activeFloor.visible=false;const highlight=slab(unitBFootprint,.18,2.65,mat('#b7cf7c',.5,{emissive:'#769c36',emissiveIntensity:.4,transparent:true,opacity:.42,depthTest:false,depthWrite:false,fog:false}),activeFloor);highlight.renderOrder=4;const outline=new THREE.LineSegments(new THREE.EdgesGeometry(highlight.geometry,20),new THREE.LineBasicMaterial({color:'#425a27',depthTest:false,transparent:true,opacity:1,fog:false}));outline.position.y=.18;outline.renderOrder=5;activeFloor.add(outline);
// CAD-based measures, kept distinct from illustrative styling.
function textSprite(text,size=.25,color='#465f3d'){const c=document.createElement('canvas');c.width=512;c.height=100;const ctx=c.getContext('2d');ctx.fillStyle='rgba(248,249,239,.94)';ctx.roundRect(5,5,502,90,14);ctx.fill();ctx.fillStyle=color;ctx.font='500 36px -apple-system,"PingFang SC",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,53);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false});const s=new THREE.Sprite(m);s.scale.set(size*5.12,size,1);s.renderOrder=10;annotations.add(s);return s;}
function dimension(a,b,label){rod(a,b,.009,mat('#71875b'),annotations);for(const p of [a,b])rod([p[0]-.07,p[1],p[2]-.07],[p[0]+.07,p[1],p[2]+.07],.013,M.dark,annotations);const s=textSprite(label,.3);s.position.set((a[0]+b[0])/2,a[1]+.18,(a[2]+b[2])/2);return s;}
dimension([-.0,.1,14.5],[10.65,.1,14.5],'轴线跨度 10.65 m');dimension([6.7,.055,10.9],[10.55,.055,10.9],'客厅净宽 3.85 m');dimension([11.55,.1,0],[11.55,.1,13.35],'测点跨度 13.35 m');
let bedDimension=dimension([.22,.7,9.05],[2.22,.7,9.05],'床长 2.00 m');bedDimension.visible=false;

const fitoutDimensions={};
for(const [id,list] of Object.entries(FITOUT_DIMENSIONS)){
 const g=new THREE.Group();g.name='fitout-dimensions-'+id;house.add(g);g.visible=false;fitoutDimensions[id]=g;
 for(const {a,b,label,metres} of list){const y=1.32,pts=[[...a],[...b]].map(p=>new THREE.Vector3(p[0],y,p[1]));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:metres<.6?'#ac583e':'#476c53',depthTest:false}));line.renderOrder=9;g.add(line);const t=textSprite(label,.21,metres<.6?'#ac583e':'#36543f');t.position.set((a[0]+b[0])/2,y+.04,(a[1]+b[1])/2);g.add(t);}
}
function syncFitoutDimensions(){for(const [id,g] of Object.entries(fitoutDimensions))g.visible=mode==='plan'&&focusUnit==='bl'&&activeLayout===id;}
const rooms=[
 {id:'living',name:'客厅',x:8.65,z:9.2,pos:[8.3,1.62,8.0],look:[10.35,1.25,9.05],desc:'2.35米直排沙发；3.10×0.40米电视收纳墙，电视嵌入留空。茶几东侧通道0.99米；东南角柜式空调为机型占位。',rect:[6.7,7.05,10.55,11.45]},
 {id:'dining',name:'餐厅',x:8.15,z:4.6,pos:[9.5,1.62,5.7],look:[8.03,1.25,4.6],desc:'厨房、餐厅、客厅相连；沿通道走向阳台。',rect:[7.2,3.15,10.55,7.05]},
 {id:'master',name:'主卧',x:1.55,z:9.9,pos:[2.48,1.62,8.6],look:[1.1,1.1,9.95],desc:'切换 1.5 / 1.8 / 2.0 m 床垫，对照床尾与两侧的留白。',rect:[.1,8.05,3.4,11.45]},
 {id:'south',name:'卧室 · 阳台侧',x:4.85,z:9.9,pos:[6.02,1.62,8.4],look:[4.5,1.2,9.7],desc:'按图纸保留独立房间，以及通向阳台的推拉门。',rect:[3.4,7.05,6.45,11.45]},
 {id:'north',name:'卧室 · 内侧',x:4.2,z:4.5,pos:[4.85,1.62,5.4],look:[4.0,1.2,3.9],desc:'卧室、书桌与凸窗按图纸关系布置，软装仅供体验。',rect:[3,3.15,5.2,5.85]},
 {id:'child',name:'儿童房',x:1.4,z:4.8,pos:[2.3,1.62,5.5],look:[1.1,1,4.5],desc:'保留图纸中的儿童房与封闭阳台，不合并扩大空间。',rect:[.1,3.95,2.8,5.85]},
 {id:'kitchen',name:'厨房',x:7.7,z:1.7,pos:[7.8,1.62,2.1],look:[7.35,1.1,.6],desc:'厨房位置和边界取自 CAD；橱柜与电器为设计示意。',rect:[6.55,.3,8.8,3.15]},
 {id:'balcony',name:'阳台',x:7.4,z:12.5,pos:[6.6,1.62,12.05],look:[8.65,1.0,12.75],desc:'西侧洗烘并排：1.40×0.75米连续台面；东侧两人茶桌0.80×0.55米，北侧通道0.85米。西侧接口由屋主确认，具体接管现场核；东侧接口保留检修。',rect:[3.4,11.65,10.55,13.35]},
 {id:'bath1',name:'卫生间 · 避难间',x:1,z:6.8,pos:[1.25,1.62,7.45],look:[.7,1.1,6.35],desc:'按原图保留卫生间及避难间用途，不改动墙体。',rect:[.1,5.95,1.8,8.05]},
 {id:'bath2',name:'卫生间 · 内侧',x:5.85,z:4.4,pos:[5.85,1.62,5.35],look:[6.4,1.25,4.3],desc:'干区与湿区的位置来自图纸；洁具高度与材质为示意。',rect:[5.3,3.15,7,5.85]}
];
rooms.forEach(r=>r.unit='bl');
Object.assign(rooms.find(r=>r.id==='child'),{name:'电竞书房 · 沙发与藏品',x:1.45,z:4.45,pos:STUDY_VIEWS.desk.pos,look:STUDY_VIEWS.desk.look,desc:'2.00×0.70米桌配ROG笔记本、27寸显示器、夜魔X键鼠。无衣柜；进门左侧沙发收起0.86×1.94米，展开外廓1.24×1.94米，床垫1.20×1.90米。西、南、东三面上墙展示，底高1.45米、顶高2.45米，不设落地柜。展开后东侧通路截面1.44米。墙端及承重墙不动；展示锚固、阳台条件及实物尺寸须复核。',rect:[.1,2.5,2.8,5.85]});
const aRooms=[
 {id:'living',name:'客厅',x:12.7,z:11.5,pos:[11.95,1.62,10],look:[13.9,1.1,11.4],rect:[10.85,9.5,14.5,13.35]},
 {id:'dining',name:'餐厅',x:13,z:7.4,pos:[11.9,1.62,8.5],look:[13,1.1,7.3],rect:[11.5,5.5,14.5,9.5]},
 {id:'kitchen',name:'厨房',x:13.8,z:4.4,pos:[13.9,1.62,4.55],look:[12.9,1.1,4.2],rect:[12.35,3.15,15.1,5.4]},
 {id:'master',name:'主卧',x:19.3,z:11.6,pos:[17.95,1.62,10],look:[19.5,1.0,11.45],rect:[17.5,8.6,20.8,13.4]},
 {id:'south',name:'卧室 · 阳台侧',x:16,z:11.7,pos:[14.95,1.62,10.65],look:[16,1.1,11.65],rect:[14.5,9.6,17.4,13.35]},
 {id:'north',name:'卧室 · 内侧',x:17.4,z:6.8,pos:[16.9,1.62,8.2],look:[17.45,1.1,6.7],rect:[16.5,5.6,18.4,8.5]},
 {id:'balcony',name:'阳台',x:14.8,z:14.5,pos:[15.5,1.62,14.45],look:[13.5,1.3,15.2],rect:[10.9,13.6,17.35,15.05]},
 {id:'bath1',name:'卫生间',x:15.5,z:6.7,pos:[15.75,1.62,6.9],look:[15.5,1.1,6],rect:[14.65,5.6,16.4,8.4]},
 {id:'bath2',name:'卫生间 · 避难间',x:19.8,z:6.7,pos:[19.3,1.62,7.7],look:[19.2,1.1,6.2],rect:[18.5,5.6,20.8,8.5]}
].map(r=>({...r,desc:'A户型按本层CAD墙线复建；家具与装饰为示意，不属于你家装修范围。'}));
const mirrorRoom=(r,prefix,unit)=>({...r,id:prefix+r.id,unit,x:41.8-r.x,pos:[41.8-r.pos[0],r.pos[1],r.pos[2]],look:[41.8-r.look[0],r.look[1],r.look[2]],rect:mirrorBox(r.rect)});
const originalBRooms=rooms.slice();rooms.push(...originalBRooms.map(r=>mirrorRoom(r,'br_','br')));
Object.assign(rooms.find(r=>r.id==='br_living'),{pos:[32.15,1.62,8.5],look:[34.4,1.25,9.05],desc:'右侧B户型保留原示意客厅，未套用业主小沙发和电视收纳墙。'});
Object.assign(rooms.find(r=>r.id==='br_balcony'),{pos:[33.4,1.62,12.4],look:[35.8,1.3,13.4],desc:'右侧B户型保留原阳台示意家具，未套用业主洗烘和茶区。'});
Object.assign(rooms.find(r=>r.id==='br_child'),{name:'儿童房',pos:[39.5,1.62,5.5],look:[40.7,1,4.5],desc:'右侧B户型维持原儿童房布局，未套用你的电竞房改造。'});
rooms.push(...aRooms.map(r=>({...r,id:'al_'+r.id,unit:'al'})),...aRooms.map(r=>mirrorRoom(r,'ar_','ar')));
rooms.push(
 {id:'lobbyL',unit:'common',name:'左侧电梯前室',x:12.6,z:-.5,pos:[12.6,1.62,-.25],look:[12.85,1.2,-1.6],rect:[8.9,-1.5,14.45,1.05],desc:'电梯与楼梯间的位置来自CAD。门厅、走廊为公共区域，不纳入私人改造；不跨层模拟电梯运行。'},
 {id:'bridge',unit:'common',name:'连廊',x:20.9,z:1.8,pos:[20.9,1.62,1.8],look:[12.6,1.4,1.8],rect:[14.45,1,27.35,2.6],desc:'沿图纸中的走道连接左右前室。下方“上空”保留挑空，不虚填成室内面积。'},
 {id:'lobbyR',unit:'common',name:'右侧电梯前室',x:29.2,z:-.5,pos:[29.2,1.62,-.25],look:[28.95,1.2,-1.6],rect:[27.35,-1.5,32.9,1.05],desc:'右侧核心筒：电梯、楼梯、前室均按对应平面位置示意；公共区域只作参观。'}
);
const unitNames={bl:'我的 B 户型',al:'左侧 A 户型',ar:'右侧 A 户型',br:'右侧 B 户型',common:'公共区域'};
const unitCenters={bl:[5.2,6.7],al:[15.8,9],ar:[26,9],br:[36.6,6.7],common:[20.9,1]};
const unitEntry={bl:[[9.6,1.62,2.15],[9.2,1.4,6]],al:[[11.9,1.62,4.6],[13,1.3,7.5]],ar:[[29.9,1.62,4.6],[28.8,1.3,7.5]],br:[[32.2,1.62,2.15],[32.6,1.4,6]],common:[[12.6,1.62,-.25],[14.5,1.4,1.8]]};

for(const [id,r] of Object.entries(OWNER_ROOMS.original))Object.assign(rooms.find(q=>q.id===id),r);Object.assign(rooms.find(q=>q.id==='north'),NORTH_ROOM);
let focusUnit='floor',activeUnit='bl';
let mode='dollhouse',currentRoom='',yaw=0,pitch=0,keys={},drag=null,transition=null,bedWidth=1.5,lightMode=0,floor=4,tourTime=0,tourPaused=false,lastTourPhase=-1;
const EYE=1.62;
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),3500);}
const layoutNavigators={};
for(const id of ['original','redesign','balanced','family','central'])layoutNavigators[id]=createNavigator({data:{...data,...(id==='redesign'?redesignData:id==='central'?centralWallData:originalData)},windows:winSegments.filter(s=>!(id==='central'&&Math.abs(s[1]-7.1)<.001&&Math.abs(s[3]-7.1)<.001&&s[0]>=5.5&&s[2]<=6.5)),furniture:collisionBoxes.filter(b=>!ownerOldBoxRefs.includes(b)),furnitureEnabled:()=>allFurnishings.visible,dynamicBoxes:furn=>{
 if(!furn)return [];
 if(['balanced','family','central'].includes(id))return [...ownerExtraCollisions,...bayBoxesForLayout(id),COFFEE,...conceptData.layouts[id].furniture.filter(q=>q.kind!=='guest'&&q.kind!=='sofa'||(guestMode?q.kind==='guest':q.kind==='sofa')).flatMap(q=>q.footprints||[q.box]),conceptData.layouts[id].chairBox||(id==='balanced'?[4.92,8.17,5.48,8.73]:[4.27,8.37,4.83,8.93])];
 const studyCollisions=studyBoxes(id);return [...ownerExtraCollisions,masterBox(id,layoutBedWidths[id]),...layoutBoxes(id),guestMode?studyCollisions.guest:studyCollisions.day,...studyWalkBoxes(id)];
}});
const canWalk=(...args)=>layoutNavigators[activeLayout](...args);
const activeGaming=()=>conceptScenes[activeLayout]||gaming;
const conceptStudyViews={balanced:{desk:{pos:[5.65,1.62,8.95],look:[4.45,1.1,7.9]},guest:{pos:[5.55,1.62,10.65],look:[4.12,1.0,10.15]}},family:{desk:{pos:[5.05,1.62,8.75],look:[3.75,1.1,8.35]},guest:{pos:[5.05,1.62,10.35],look:[3.8,1.1,10.2]}},central:{desk:{pos:[4.75,1.62,8.25],look:[6.3,1.1,8.10]},guest:{pos:[3.82,1.62,9.72],look:[5.7,1.1,9.7]}}};
const activeStudyViews=()=>conceptStudyViews[activeLayout]||STUDY_VIEWS;

// Software tier: three draws a transparent DoubleSide material twice (back faces, then front); one pass for the glass saves ~2% of a
// living-room frame there and changes at most 7/255 on the pixels seen through two panes.
if(renderTier==='soft')M.glass.forceSinglePass=true;
// Eye-level fov follows the aspect ratio (scene-env.js eyeFov); overviews keep their fixed vertical fov.
const ui=createPanels({canvas:renderer.domElement,viewport:$('viewport'),toggle:$('uiToggle'),dock:$('uiDock'),chips:$('uiChips')});createLandscape({button:$('landBtn'),exit:$('exitFsBtn'),hint:$('rotateHint')});let fovBase=[42,false];function setFov(v,eye=false){fovBase=[v,eye];camera.fov=eye?eyeFov(v,camera.aspect,renderTier):v;}
// Head turn shared by the mouse drag and the phone's right-thumb drag; touch-walk.js is the phone's walking stick (left thumb).
const turn=(dx,dy)=>{yaw-=dx*.004;pitch=clamp(pitch-dy*.003,-1.05,1.05);camera.rotation.set(pitch,yaw,0,'YXZ');invalidate(200);},touchWalk=createTouchWalk({canvas:renderer.domElement,pad:$('touchPad'),look:turn});
function setViewOffset(){camera.clearViewOffset();if(['dollhouse','building'].includes(mode)){if(innerWidth>700)camera.setViewOffset(innerWidth,innerHeight,-innerWidth*.1,0,innerWidth,innerHeight);else camera.setViewOffset(innerWidth,innerHeight,0,-innerHeight*.08,innerWidth,innerHeight);}camera.updateProjectionMatrix();}
function setArchitecturalCut(h){clipPlane.constant=h;wallCaps.forEach(q=>{q.position.y=h;q.visible=h<2.77;});}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function tween(pos,target,seconds=1.4){transition={start:performance.now(),duration:seconds*1000,from:camera.position.clone(),to:V(...pos),tf:controls.target.clone(),tt:V(...target)};}
function overviewPos(){return frameForFocus();}
function prepare(modeNew){mode=modeNew;syncFitoutDimensions();document.body.dataset.mode=mode;ui.setMode(mode);keys={};transition=null;
 $('intro').hidden=mode!=='dollhouse';$('roomLabel').hidden=!['walk','plan'].includes(mode);$('miniPanel').hidden=!['walk','tour'].includes(mode);$('bedPanel').hidden=true;document.body.classList.remove('bed-visible');$('walkHint').hidden=mode!=='walk';touchWalk.setMode(mode);$('crosshair').hidden=mode!=='walk';$('studyControls').hidden=true;$('tourCaption').hidden=mode!=='tour';$('floorPanel').hidden=mode!=='building';
 document.querySelectorAll('[data-mode]').forEach(b=>{if(b.tagName==='BUTTON'){b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));}});
 controls.enabled=!['walk','tour'].includes(mode);controls.enableRotate=mode!=='plan';controls.enablePan=true;controls.maxDistance=mode==='building'?220:110;controls.minDistance=mode==='building'?30:8;
 roof.visible=mode==='walk';stage.visible=!['walk','tour','building'].includes(mode);landscape.visible=['walk','building'].includes(mode);building.visible=mode==='building';activeFloor.visible=mode==='building';house.visible=mode!=='building';
 setArchitecturalCut(['dollhouse','plan','tour'].includes(mode)?(mode==='plan'?.35:1.28):2.79);
 scene.background.set(['walk','building'].includes(mode)?'#d8e2d9':'#e7e4db');scene.fog=mode==='building'?new THREE.Fog('#d8e2d9',240,600):mode==='walk'?new THREE.Fog('#d8e2d9',65,225):null;
 annotations.visible=$('measureBtn').getAttribute('aria-pressed')==='true'&&mode!=='building';bedDimension.visible=false;
 $('orientation').hidden=['walk','tour','building'].includes(mode);$('navHint').textContent=mode==='plan'?'拖动平移 / 滚轮缩放':mode==='walk'?'拖动环顾 / W A S D 行走':mode==='tour'?'自动导览 · 可暂停':'拖动旋转 / 滚轮缩放';
 $('tourFade').style.opacity='0';setFov(mode==='walk'?64:42,mode==='walk');setViewOffset();updateFloor();
 updateScopeUI();if(['walk','tour'].includes(mode))setDoorView(walkDoorView!=='hidden',walkDoorView);else setDoorView(doorView!=='hidden');invalidate(1800,true);
}
function changeMode(m){prepare(m);if(m==='dollhouse'){const c=focusedCenter();tween(overviewPos(),[c[0],.1,c[1]]);currentRoom='';}
 else if(m==='plan'){const c=focusedCenter();tween([c[0],focusUnit==='floor'?(innerWidth<700?100:62):29,c[1]],[c[0],0,c[1]-.01]);$('roomTitle').textContent='图纸里的每一寸';$('roomDesc').textContent=activeLayout==='original'?'原四房家具摆位；北侧承重墙、门洞和原水点保留。':LAYOUTS[activeLayout].summary+(activeLayout==='central'?'北墙按橙色原门洞线拉直，左侧门洞0.90米；属于新增条件改墙示意。':'墙体与原四房相同。');$('roomKicker').textContent='PLAN VIEW · 1:1';}
 else if(m==='building'){tween([120,95-floorElevation(floor),140],[20.9,40-floorElevation(floor),4.6],2);toast('楼栋为体量示意；高亮为当前选择的 B 户型');}
 else if(m==='walk'){placeWalker(...unitEntry[focusUnit==='floor'?'bl':focusUnit]);currentRoom='';updateRoom();$('viewport').focus({preventScroll:true});toast('拖动环顾，W A S D 或方向键行走；也可点右侧房间定位');}
 else if(m==='tour'){focusUnit='bl';activeUnit='bl';updateScopeUI();tourTime=0;tourPaused=false;lastTourPhase=-1;$('pauseTour').textContent='Ⅱ 暂停';controls.enabled=false;setFov(48);camera.updateProjectionMatrix();}
}
function placeWalker(pos,look){camera.position.set(...pos);camera.rotation.order='YXZ';camera.lookAt(...look);yaw=camera.rotation.y;pitch=camera.rotation.x;}
function goRoom(id,immediate=false){const room=rooms.find(r=>r.id===id);if(!room)return;activeUnit=room.unit;focusUnit=room.unit;rebuildShortcuts();if(mode!=='walk')prepare('walk');transition=null;const p=room.pos;
 // Validate room teleports against the same collision mesh used by free walking.
 if(!canWalk(p[0],p[2],.12)){let best=null;for(let dx=-.4;dx<=.4;dx+=.1)for(let dz=-.4;dz<=.4;dz+=.1)if(canWalk(p[0]+dx,p[2]+dz,.12)&&(!best||Math.hypot(dx,dz)<best.dist))best={pos:[p[0]+dx,EYE,p[2]+dz],dist:Math.hypot(dx,dz)};if(best)placeWalker(best.pos,room.look);else placeWalker(p,room.look);}else placeWalker(p,room.look);
 currentRoom='';updateRoom(room);$('viewport').focus({preventScroll:true});invalidate(600,true);}
function updateRoom(force){let room=force||rooms.find(r=>camera.position.x>=r.rect[0]&&camera.position.x<=r.rect[2]&&camera.position.z>=r.rect[1]&&camera.position.z<=r.rect[3]);const id=room?.id||'hall';const unit=room?.unit||(camera.position.z<3.2&&camera.position.x>10.7&&camera.position.x<31.1?'common':camera.position.x<10.75?'bl':camera.position.x<20.9?'al':camera.position.x<31.05?'ar':'br');if(activeUnit!==unit){activeUnit=unit;rebuildShortcuts();}if(currentRoom===id)return;currentRoom=id;document.body.dataset.room=id;
 $('roomTitle').textContent=room?.name||'过道与玄关';$('roomDesc').textContent=room?.desc||'可以穿过入户门，沿公共连廊走到同层其它户型。';$('roomKicker').textContent=unitNames[unit]+' · '+(unit==='bl'?'我的装修预览':'整层参观');$('miniTitle').textContent=unitNames[unit]+' / 整层定位';const bedPanelVisible=activeLayout!=='central'&&id==='master'&&mode==='walk';$('bedPanel').hidden=!bedPanelVisible;document.body.classList.toggle('bed-visible',bedPanelVisible);$('studyControls').hidden=id!==(activeLayout==='original'?'child':'south')||mode!=='walk';
 document.querySelectorAll('[data-room]').forEach(b=>b.classList.toggle('selected',b.dataset.room===id));
}
function focusedCenter(){return focusUnit==='floor'?[20.9,5.5]:unitCenters[focusUnit];}
function frameForFocus(){const [x,z]=focusedCenter();return focusUnit==='floor'?(innerWidth<700?[53,64,75]:[48,48,55]):[x+15,24,z+20];}
function updateScopeUI(){
 document.querySelectorAll('[data-unit]').forEach(b=>{const selected=b.dataset.unit===focusUnit;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 $('introTitle').innerHTML=focusUnit==='floor'?'一整层，<br>都可以走进去。':focusUnit==='bl'?'家的下一步，<br>先在这里看见。':unitNames[focusUnit]+'<br>看见空间的尺度。';
 $('introSubtitle').textContent=focusUnit==='floor'?'四户住宅、左右前室与连廊。你的家，仍然在左侧。':LAYOUTS[activeLayout].summary;
 $('introCount').textContent=focusUnit==='floor'?'4':focusUnit==='bl'?(activeLayout==='balanced'?'2':'3'):'1';$('introCountUnit').textContent=focusUnit==='floor'?'户':focusUnit==='bl'?'卧＋电竞':'户';$('introCountCaption').textContent=focusUnit==='floor'?'B · A · A · B':focusUnit==='bl'?LAYOUTS[activeLayout].program:'CAD 平面复建';
 $('enterBtnText').textContent=focusUnit==='floor'?'走进我的 B 户型':focusUnit==='common'?'走进公共区域':'走进'+unitNames[focusUnit];
 $('overviewLabel').textContent=focusUnit==='floor'?'整层全景':'户型全景';
 for(const p of pins)p.el.hidden=!['dollhouse','plan'].includes(mode)||(p.unitPin?focusUnit!=='floor':p.unit!==focusUnit);
}
function selectUnit(id,walk=false){focusUnit=id;activeUnit=id==='floor'?'bl':id;updateScopeUI();if(walk||mode==='walk'){if(id==='floor'){changeMode('dollhouse');return;}prepare('walk');placeWalker(...unitEntry[id]);currentRoom='';updateRoom();}else changeMode(mode==='building'?'dollhouse':mode==='plan'?'plan':'dollhouse');invalidate(1600,true);}
function updateZones(){const interior=mode==='walk'||(mode==='tour'&&!TOUR.find(s=>tourTime>=s.start&&tourTime<s.end)?.overview);for(const q of furnishingZones){const b=q.bounds;const near=camera.position.x>b[0]-2&&camera.position.x<b[2]+2&&camera.position.z>b[1]-2&&camera.position.z<b[3]+2;const on=!interior||near;if(q.group.visible!==on){q.group.visible=on;renderer.shadowMap.needsUpdate=true;}}}
function rebuildShortcuts(){const container=$('roomShortcuts');container.replaceChildren();for(const r of rooms.filter(q=>q.unit===activeUnit)){const b=document.createElement('button');b.textContent=r.name.replace('卧室 · 阳台侧','阳台侧卧室').replace('卧室 · 内侧','内侧卧室').replace('卫生间 · 避难间','避难间卫生间').replace('卫生间 · 内侧','内侧卫生间').replace('书房 · 兼客房','电竞书房');b.dataset.room=r.id;b.onclick=()=>goRoom(r.id);container.appendChild(b);}}
const pins=[];
for(const r of rooms){if(r.id.includes('bath'))continue;const el=document.createElement('button');el.className='room-pin';el.textContent=r.name;el.setAttribute('aria-label',`进入${unitNames[r.unit]}${r.name}`);el.onclick=()=>goRoom(r.id);$('roomPins').appendChild(el);pins.push({el,pos:V(r.x,.35,r.z),unit:r.unit,roomId:r.id});}
for(const [id,label]of Object.entries(unitNames)){const c=unitCenters[id],el=document.createElement('button');el.className='room-pin unit-pin';el.textContent=label;el.onclick=()=>selectUnit(id);$('roomPins').appendChild(el);pins.push({el,pos:V(c[0],.7,c[1]),unit:id,unitPin:true});}
const ns='http://www.w3.org/2000/svg';function svgEl(name,attrs,parent=$('minimap')){const e=document.createElementNS(ns,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.appendChild(e);return e;}
const svgPath=points=>'M'+points.map(p=>p.join(',')).join('L')+'Z';svgEl('path',{d:svgPath(footprint)+floorHoles.map(svgPath).join(''),fill:'#eef0e3',stroke:'#aab69a','stroke-width':'.06','fill-rule':'evenodd'});const miniWalls=svgEl('g',{});for(const w of structuralPolys)svgEl('path',{d:svgPath(w.points)+w.holes.map(svgPath).join(''),fill:'#7c8b70','fill-rule':'evenodd'},miniWalls);
for(const [id,label] of [['bl','我的B'],['al','A'],['ar','A'],['br','B'],['common','连廊']]){const c=unitCenters[id];const t=svgEl('text',{x:c[0],y:c[1],'text-anchor':'middle','font-size':'.9',fill:'#687b5b'});t.textContent=label;}
const viewCone=svgEl('path',{d:'M0,0 L-1,-2 L1,-2Z',fill:'#678655',opacity:'.4'});const dot=svgEl('circle',{cx:8,cy:6,r:'.38',fill:'#37542c',stroke:'#faffed','stroke-width':'.12'});rebuildShortcuts();

function floorElevation(f){return 11.45+(f-4)*2.95;}
for(let f=4;f<=22;f++){const o=document.createElement('option');o.value=f;o.textContent=f+' 层';$('floorSelect').appendChild(o);}
function updateFloor(){const elevation=floorElevation(floor);building.position.y=-elevation;landscape.position.y=-elevation;activeFloor.position.y=0;$('floorElevation').textContent='+'+elevation.toFixed(3)+' m';}
$('floorSelect').onchange=e=>{floor=Number(e.target.value);updateFloor();if(mode==='building')tween([120,95-floorElevation(floor),140],[20.9,40-floorElevation(floor),4.6],.8);toast(`演示楼层 ${floor}F · 建筑标高 +${floorElevation(floor).toFixed(3)} m`);};
$('floorEnter').onclick=()=>changeMode('walk');
const TOUR=[
 {start:0,end:7,phase:0,title:'从图纸，到家。',text:'左侧 B 户型。墙线来自 CAD，家具按真实尺度摆放。',a:[22,22,27],b:[18,19,23],la:[5.2,.1,6.8],lb:[5.2,.3,6.8],overview:true},
 {start:7,end:17,phase:1,title:'进门，是日常的开始。',text:'从玄关走到餐厅。厨房就在身边，客厅在前方。',a:[9.65,1.62,2.2],b:[9.55,1.62,6.35],la:[8.1,1.3,4.6],lb:[8.6,1.3,8.6]},
 {start:17,end:29,phase:2,title:'把生活，放进客厅。',text:'两侧墙面净距约 3.85 米；布置不靠视觉放大。',a:[9.55,1.62,6.35],b:[9.6,1.62,10.55],la:[8.0,1.25,9],lb:[8.2,1.2,9.1]},
 {start:29,end:39,phase:3,title:'再往前，就是阳台。',text:'保留图纸里的阳台尺度。窗外是氛围示意，不是实际江景。',a:[9.6,1.62,10.55],b:[8.45,1.62,12.5],la:[8.8,1.4,13.8],lb:[5.0,1.2,13.1]},
 {start:39,end:51,phase:4,title:'卧室的尺度，亲自看看。',text:'左下主卧，床头仍朝西；4.30米柜改40厘米浅柜，薄床架保留1.8×2米床垫，柜前0.80米。收纳深度减少，不能当普通60厘米柜。',a:[2.54,1.62,8.5],b:[2.54,1.62,10.9],la:[1.22,.9,9.8],lb:[1.22,.9,9.8]},
 {start:51,end:60,phase:5,title:'原来，家一直在这里。',text:'回到沙盘。也可以选择自由漫游，自己走遍每个房间。',a:[17,18,22],b:[23,24,29],la:[5.2,0,6.7],lb:[5.2,0,6.7],overview:true}
];
function tourFrame(dt){if(!tourPaused)tourTime+=dt;if(tourTime>=60){changeMode('dollhouse');toast('导览结束，点击“自由漫游”继续探索');return;}
 let s=TOUR.find(s=>tourTime>=s.start&&tourTime<s.end)||TOUR[0];if(s.phase===4&&activeLayout==='central')s={...s,title:'两间 1.8 米床，南侧主卧兼电竞。',text:'两张1.8×2米床垫，薄床架外廓2.12×1.88米；床尾各1.03米。东墙1.8米直桌，北墙按原门洞线拉直；走廊墙面间1.10米，改墙仍待书面复核。',a:[4.75,1.62,8.25],b:[3.85,1.62,10.25],la:[6.3,1.1,8.1],lb:[5.85,1,9.9]};else if(s.phase===4&&activeLayout!=='original')s={...s,title:'原墙不变，主卧床尾更松。',text:'1.8米床保留，床尾大长柜分配到别的房间；床尾至原墙1.12米。',a:[2.55,1.62,8.55],b:[2.55,1.62,10.9],la:[1.22,1,9.8],lb:[1.22,1,9.8]};const u=clamp((tourTime-s.start)/(s.end-s.start),0,1),k=ease(u);
 if(s.phase!==lastTourPhase){lastTourPhase=s.phase;$('tourNumber').textContent=String(s.phase+1).padStart(2,'0')+' / 06';$('tourTitle').textContent=s.title;$('tourText').textContent=s.text;roof.visible=!s.overview;stage.visible=!!s.overview;landscape.visible=!s.overview;scene.background.set(s.overview?'#e7e4db':'#d8e2d9');scene.fog=s.overview?null:new THREE.Fog('#d8e2d9',65,225);setArchitecturalCut(s.overview?1.28:2.79);setFov(s.overview?42:64,!s.overview);camera.updateProjectionMatrix();}
 camera.position.lerpVectors(V(...s.a),V(...s.b),k);const look=V(...s.la).lerp(V(...s.lb),k);camera.lookAt(look);
 let opacity=0;if([1,4,5].includes(s.phase)&&tourTime-s.start<.5)opacity=1-(tourTime-s.start)/.5;if([0,3,4].includes(s.phase)&&s.end-tourTime<.5)opacity=1-(s.end-tourTime)/.5;$('tourFade').style.opacity=String(opacity);
 $('tourProgress').style.width=(tourTime/60*100)+'%';}
$('pauseTour').onclick=()=>{tourPaused=!tourPaused;$('pauseTour').textContent=tourPaused?'▶ 继续':'Ⅱ 暂停';$('pauseTour').setAttribute('aria-label',tourPaused?'继续导览':'暂停导览');};$('stopTour').onclick=()=>changeMode('dollhouse');
$('enterBtn').onclick=()=>changeMode('walk');$('introTourBtn').onclick=()=>changeMode('tour');document.querySelectorAll('button[data-mode]').forEach(b=>b.onclick=()=>changeMode(b.dataset.mode));
$('furnitureBtn').onclick=()=>{allFurnishings.visible=!allFurnishings.visible;$('furnitureBtn').setAttribute('aria-pressed',String(allFurnishings.visible));$('furnitureBtn').title=allFurnishings.visible?'隐藏家具':'显示家具';toast(allFurnishings.visible?'家具已显示 · 设计摆位示意':'家具已隐藏 · 只看建筑空间');};
$('measureBtn').onclick=()=>{if(mode==='building')changeMode('dollhouse');const active=$('measureBtn').getAttribute('aria-pressed')!=='true';$('measureBtn').setAttribute('aria-pressed',String(active));annotations.visible=active&&mode!=='building';toast(active?'尺寸取自 CAD 墙线与轴线；不等于不动产登记面积':'尺寸标注已隐藏');};
$('lightBtn').onclick=()=>{const ids=Object.keys(LIGHTING),next=ids[(ids.indexOf(studio.getLighting())+1)%ids.length];studio.patchHome({lighting:next});toast(LIGHTING[next].label+'氛围 · 不是实际朝向或日照模拟');};
$('resetBtn').onclick=()=>{if(mode==='walk')selectUnit(activeUnit,true);else changeMode(mode==='tour'?'dollhouse':mode);};
// The master bed is rebuilt with its width; once batchStatic() exists (below) every rebuild is batched like the rest.
let batchBed=()=>{};function rebuildMasterBed(){if(activeLayout!=='original'){masterBed.visible=false;bedWidth=1.8;syncBedDimensions();return;}leftB.remove(masterBed);masterBed.traverse(o=>{if(o.isMesh)o.geometry.dispose();});bedWidth=layoutBedWidths.original;const p=MASTER_PLACEMENTS.original;masterBed=bed(p.cx,p.cz,bedWidth,2,p.rotation,true);batchBed(masterBed);masterBed.visible=true;syncBedDimensions();}
function syncBedDimensions(){const concept=activeLayout!=='original',c=concept?{sides:[.65,.65],foot:1.12,label:'床架尾至原墙',caution:'床架外廓2.18×2.00米；床尾增宽来自移走长柜，其他衣物放在别的房间。阳台与门五金条件还需现场核验。'}:masterClearance('original',bedWidth);document.querySelectorAll('[data-bed]').forEach(b=>{b.disabled=concept||Number(b.dataset.bed)===2;b.title=concept?'新布局床位已按平面固定建模':b.disabled?'本轮不推荐2米床，优先保留通道':'';const on=Number(b.dataset.bed)===bedWidth;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});$('bedDims').textContent=bedWidth.toFixed(2)+' × 2.00 m';$('bedSide').textContent=c.sides.map(n=>n.toFixed(2)).join(' / ')+' m';$('bedFootLabel').textContent=c.label;$('bedFoot').textContent=c.foot.toFixed(2)+' m';$('bedCaution').textContent=c.caution;}
document.querySelectorAll('[data-bed]').forEach(b=>b.onclick=()=>{if(activeLayout!=='original')return;layoutBedWidths.original=Number(b.dataset.bed);rebuildMasterBed();invalidate(700,true);if(mode==='walk'&&!canWalk(camera.position.x,camera.position.z,.12))goRoom('master');toast('已按床架外廓更新通道尺寸；家具仍需现场实测');});

$('sourceBtn').onclick=()=>{$('sources').showModal();keys={};};$('closeSource').onclick=()=>$('sources').close();$('sources').addEventListener('click',e=>{if(e.target===$('sources')){const r=$('sources').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('sources').close();}});
const sources={unit:['cad-unit.png?v=7f1b142156','DWG 四～二十二层平面图 · 左侧 B 户型 · CAD 矢量重绘'],full:['cad-full.png?v=36e2c28133','DWG 四～二十二层平面图 · 整层矢量重绘'],audit:['dwg-fitout-review.png?v=0b718e1072','直接从DWG分层读取：墙线、衣柜、北卧床桌；图纸尺寸不等于现场完成面尺寸'],pdf:['source-plan.png?v=0393167e76','PDF仅供外观对照，不用于本轮墙体判断或尺寸测量'],levels:['cad-levels.png?v=afc7c0d390','DWG 楼层标高表 · 标准层层高 2.950 m'],section:['cad-section.png?v=e57a5e4eda','DWG 6#楼1-1剖面局部 · 标准层 2,950 mm']};
document.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-source]').forEach(q=>q.classList.toggle('selected',q===b));const n=b.dataset.source;$('drawingArea').hidden=n==='notes';$('sourceNotes').hidden=n!=='notes';if(n!=='notes'){$('sourceImage').src='./assets/'+sources[n][0];$('sourceImage').alt=sources[n][1];$('sourceCaption').textContent=sources[n][1];}});
const motionKeys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'];
window.addEventListener('keydown',e=>{if(e.target instanceof Element&&e.target.closest('input,textarea,select,[contenteditable="true"],[role=tablist]'))return;if($('sources').open||$('designGuide').open)return;if(e.code==='Escape'){if(mode==='walk'||mode==='tour')changeMode('dollhouse');return;}if(mode==='walk'&&motionKeys.includes(e.code)){e.preventDefault();keys[e.code]=true;}});window.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>{keys={};drag=null;});
renderer.domElement.addEventListener('pointerdown',e=>{if(mode!=='walk')return;$('viewport').focus({preventScroll:true});if(touchWalk.owns(e))return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(mode!=='walk'||e.pointerId!==drag?.id)return;turn(e.clientX-drag.x,e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY;});for(const type of ['pointerup','pointercancel'])renderer.domElement.addEventListener(type,e=>{if(e.pointerId===drag?.id)drag=null;});
const moveMapping={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD'};document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[moveMapping[b.dataset.move]]=true;};b.onpointerup=b.onpointercancel=()=>{keys[moveMapping[b.dataset.move]]=false;};});
function walkFrame(dt){let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);if(f||s){const len=Math.hypot(f,s);f/=len;s/=len;}else({f,s}=touchWalk.vector(dt));if(f||s){const speed=(keys.ShiftLeft||keys.ShiftRight?2.5:1.45)*dt;let dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)*speed,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)*speed;
 // Axis-separated collision response, sub-stepped to prevent tunnelling.
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.045));for(let i=0;i<count;i++){if(canWalk(camera.position.x+dx/count,camera.position.z))camera.position.x+=dx/count;if(canWalk(camera.position.x,camera.position.z+dz/count))camera.position.z+=dz/count;}}
 camera.position.y=EYE;updateRoom();}
function updateMini(){dot.setAttribute('cx',camera.position.x.toFixed(2));dot.setAttribute('cy',camera.position.z.toFixed(2));const dir=V(0,0,-1).applyQuaternion(camera.quaternion);const angle=Math.atan2(-dir.x,-dir.z)*180/Math.PI;viewCone.setAttribute('transform',`translate(${camera.position.x} ${camera.position.z}) rotate(${-angle})`);}
// The camera may have moved since the last render (tween, walk step): refresh its matrices before projecting.
function updatePins(){camera.updateMatrixWorld();for(const p of pins){if(p.el.hidden)continue;const q=p.pos.clone().project(camera);p.el.style.left=(q.x*.5+.5)*innerWidth+'px';p.el.style.top=(-q.y*.5+.5)*innerHeight+'px';p.el.style.opacity=q.z>1||q.z<0?'0':'1';}}
const qualityConfigs={auto:{label:'自动'},smooth:{label:'流畅'},fine:{label:'精细'}};
function resizeRenderer(){ratios=tierSettings(renderTier,quality,devicePixelRatio,innerWidth*innerHeight,pixelBudget);sizeDirty=true;camera.aspect=innerWidth/innerHeight;setFov(...fovBase);setViewOffset();invalidate(900,true);}
// Resizing clears the drawing buffer, so the canvas only changes size inside animate(), right before a render.
function setRatio(r){if(sizeDirty){renderer.setPixelRatio(r);renderer.setSize(innerWidth,innerHeight);sizeDirty=false;}else if(r!==renderer.getPixelRatio())renderer.setPixelRatio(r);}
function renderStats(){$('renderStats').textContent=`${renderer.domElement.width} × ${renderer.domElement.height}${hiRes?' · 静止高清':''} · ${renderer.info.render.calls} 次绘制 · ${Math.round(renderer.info.render.triangles/1000)}k 三角面`;}
function applyQuality(q){quality=q;pixelBudget=tierBudget(renderTier,q);resizeRenderer();renderer.shadowMap.enabled=ratios.shadows;renderer.shadowMap.needsUpdate=true;$('qualitySelect').value=q;document.body.dataset.quality=q;try{localStorage.setItem('xiyuan-quality-v2',q);}catch{}}
window.addEventListener('resize',resizeRenderer);controls.addEventListener('change',()=>invalidate(120));
document.addEventListener('click',()=>invalidate(700,true));document.addEventListener('visibilitychange',()=>{keys={};drag=null;last=performance.now();invalidate(700);});
let last=performance.now(),lastDraw=0,frame=0,fpsFrames=0,fpsSince=performance.now(),lastUi=0,slowWindows=0;let quality='auto',pixelBudget=tierBudget(renderTier,'auto'),targetFPS=60;
function animate(now){requestAnimationFrame(animate);if(document.hidden){last=now;return;}const frameInterval=1000/targetFPS,elapsed=now-lastDraw;if(elapsed<frameInterval-.5)return;const dt=Math.min((now-last)/1000,.06);last=now;lastDraw=now-Math.max(0,elapsed%frameInterval);
 const moving=mode==='walk'&&(Object.values(keys).some(Boolean)||touchWalk.moving),touring=mode==='tour'&&!tourPaused;
 if(touring)tourFrame(dt);else if(moving)walkFrame(dt);else if(transition){const u=clamp((now-transition.start)/transition.duration,0,1),e=ease(u);camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.tf,transition.tt,e);controls.update();if(u===1){transition=null;invalidate(1);}}else if(!['walk','tour'].includes(mode)&&now<dirtyUntil)controls.update();
 const active=moving||touring||!!transition||now<dirtyUntil;
 // Settled for 250 ms: draw one sharper frame. Any activity drops back to the moving ratio in the same callback.
 if(!active){if(!idleAt){idleAt=now;updatePins();}if(!hiRes&&now-idleAt>250&&ratios.still>ratios.move+.01){setRatio(ratios.still);hiRes=true;renderer.render(scene,camera);renderStats();}if(now-lastUi>1000){$('fpsLabel').textContent='静止省电';lastUi=now;}fpsFrames=0;fpsSince=now;return;}
 idleAt=0;if(hiRes||sizeDirty){hiRes=false;setRatio(ratios.move);}
 updateZones();updateGamingLighting();fitSun();if(now-lastUi>90){updatePins();if(['walk','tour'].includes(mode))updateMini();lastUi=now;}renderer.render(scene,camera);fpsFrames++;
 if(now-fpsSince>2000){const fps=Math.round(fpsFrames*1000/(now-fpsSince));$('fpsLabel').textContent=fps+' FPS · '+qualityConfigs[quality].label;renderStats();if(((quality==='auto'&&fps<40)||(renderTier==='phone'&&fps<30))&&(moving||touring)){slowWindows++;if(slowWindows>=2&&ratios.move>ratios.floor+.01){pixelBudget=Math.round(innerWidth*innerHeight*ratios.move**2*.8);resizeRenderer();slowWindows=0;toast('已自动降低三维分辨率，优先保持操作流畅');}}else slowWindows=0;fpsFrames=0;fpsSince=now;}
}
function applyHomeDesign(home,preset){
 restoreGlobalLighting();for(const[k,v]of Object.entries(home.colors)){if(M[k])M[k].color.set(v);}M.cap.color.set(home.colors.wall);M.walnut.color.copy(M.oak.color).multiplyScalar(.53);for(const m of rugMaterials)m.color.set(home.colors.rug);
 // The preset's finish detail (walls, floor lay, cabinet doors, handles, window frames) is not part of the home: material-kit.js.
 finishes.apply(M,home,preset?.detail);
 const light=homeLight=LIGHTING[home.lighting];sun.color.set(light.color);sun.intensity=light.sun;sunDir.set(...light.pos).sub(SUN_HOME);sunVersion++;fitSun();skyColor.set(light.sky);groundColor.set(light.ground);fill.intensity=light.fill;setAmbient(light.hemi,light.env);renderer.toneMappingExposure=light.exposure*home.brightness/100;$('lightName').textContent=light.label;invalidate(700,true);
}
let gamingPreferences={strength:100};
let lightSnapshot=null,roomLightKey='';
// A zero-intensity light still costs every shader a light loop; hide it instead. A lit accent takes the far dining light's
// slot, so the point-light count, and with it every compiled shader, stays the same on entering the gaming room.
// GPU tier (round 4, room-lights.js): two room lights that are always there instead: the ceiling light of the owner's room you
// are in, and a copy of the dining pendant or the lit accent. The pendant and the accents themselves stay hidden, so the count
// is two in every room, layout, mood and mode (fitSun() syncs them each active frame, with its own indoor test).
const roomLights=renderTier==='gpu'?createRoomLights(scene):null;if(roomLights)diningLight.visible=false;
function syncRoomLights(inside){if(!roomLights)return;const c=camera.position,lit=[gaming,expandedGaming,...Object.values(conceptScenes)].find(g=>g.accent.intensity>0);
 roomLights.sync({inside,room:ownerRoomAt(rooms,c.x,c.z),layout:activeLayout,mood:roomLightKey,at:[c.x,c.z],lamps:homeLight.lamps,second:lit?lit.accent:diningLight});}
function setAccent(g,v){g.accent.intensity=v;g.accent.visible=v>0&&!roomLights;if(v>0)diningLight.visible=false;}
// Rest / soft-light mood in the gaming room, as fractions of the current home lighting (exposure without the brightness slider).
// ×0.93 in round 2: the indoor factors lift the bounce light, and the desk views keep their round-1 brightness.
const REST={hemi:.42,sun:.079,fill:.353,env:.725};
function restoreGlobalLighting(){if(lightSnapshot){setAmbient(lightSnapshot.hemi,lightSnapshot.env);sun.intensity=lightSnapshot.sun;fill.intensity=lightSnapshot.fill;renderer.toneMappingExposure=lightSnapshot.exposure;lightSnapshot=null;}for(const g of [gaming,expandedGaming,...Object.values(conceptScenes)])setAccent(g,0);diningLight.visible=!roomLights;roomLightKey='';}
function updateGamingLighting(){const c=camera.position,inRoom=mode==='walk'&&allFurnishings.visible&&(activeLayout==='original'?(c.x>.1&&c.x<2.8&&c.z>2.5&&c.z<5.85):(c.x>3.5&&c.x<6.5&&c.z>7.15&&c.z<11.45));const key=inRoom?gamingMode:'';if(key===roomLightKey)return;
 restoreGlobalLighting();const gaming=activeGaming();roomLightKey=key;if(!key){renderer.shadowMap.needsUpdate=true;return;}
 lightSnapshot={...ambient,sun:sun.intensity,fill:fill.intensity,exposure:renderer.toneMappingExposure};renderer.toneMappingExposure=homeLight.exposure;
 if(key==='game'){gaming.accent.intensity=.65;}
 else if(key==='rest'){setAmbient(homeLight.hemi*REST.hemi,homeLight.env*REST.env);sun.intensity=homeLight.sun*REST.sun;fill.intensity=homeLight.fill*REST.fill;gaming.accent.intensity=.35;}
 else gaming.accent.intensity=.65;
 setAccent(gaming,gaming.accent.intensity*gamingPreferences.strength/100);
 renderer.shadowMap.needsUpdate=true;
}
function syncGamingModeLabels(){const noGuest=['family','central'].includes(activeLayout);document.querySelector('button[data-gaming="rest"]').textContent=noGuest?'柔光':'留宿';$('gamingMoodName').textContent=noGuest&&gamingMode==='rest'?'柔光模式':GAMING_MODES[gamingMode].label+'模式';}
function renderGamingPreferences(settings){gamingPreferences=settings;gamingMode=settings.mode;restoreGlobalLighting();for(const g of [gaming,expandedGaming,...Object.values(conceptScenes)])g.setMood(gamingMode,settings);document.querySelectorAll('[data-gaming]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gaming===gamingMode)));syncGamingModeLabels();document.body.dataset.gaming=gamingMode;invalidate(700,true);}
function setGamingMode(id){studio.setGaming({mode:id});}

$('designBtn').onclick=()=>{const open=$('designPanel').hidden;$('designPanel').hidden=!open;document.body.classList.toggle('design-open',open);$('designBtn').setAttribute('aria-expanded',String(open));if(open){keys={};if(focusUnit!=='bl')selectUnit('bl');$('designPanel').scrollTop=0;}};
$('closeDesign').onclick=()=>{$('designPanel').hidden=true;document.body.classList.remove('design-open');$('designBtn').setAttribute('aria-expanded','false');};
document.querySelectorAll('[data-gaming]').forEach(b=>b.onclick=()=>setGamingMode(b.dataset.gaming));
$('studyPreview').onclick=()=>{goRoom(activeLayout==='original'?'child':'south');if(ui.phone)$('closeDesign').click();};
$('guideBtn').onclick=()=>{$('designGuide').showModal();keys={};};$('closeGuide').onclick=()=>$('designGuide').close();
$('qualitySelect').onchange=e=>{applyQuality(e.target.value);toast(e.target.value==='smooth'?'流畅模式：减少三维像素与阴影，文字界面保持清晰':'画质已切换，静止时仍会停止重复绘制');};
document.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>selectUnit(b.dataset.unit));
const doorLeaves=[];arch.traverse(q=>{if(q.userData.doorLeaf)doorLeaves.push(q);});
// Overviews keep their own door view (hidden unless toggled). Walk and tour open on DOOR_VIEW_WALK: hinged leaves half open, sliding
// leaves stowed as before; switching doors back on there shows every leaf ('all'). Angles are set on the hinge, so doorway() is
// untouched; a hinged leaf that would cross a default view (room, unit entry, study and entry views) at 45° opens fully instead.
// Leaves never block walking either way.
let walkDoorView=DOOR_VIEW_WALK;const leafSwing=g=>g.userData.swing??=g.rotation.y/(Math.PI*DOOR_OPEN.open);
function defaultViews(){return [...rooms.map(r=>[r.pos,r.look]),...Object.values(unitEntry),...Object.values(activeStudyViews()).map(v=>[v.pos,v.look]),[ENTRY_VIEWS[activeLayout]?.pos,ENTRY_VIEWS[activeLayout]?.look]].filter(v=>v[0]&&v[1]);}
function setDoorView(show,want){const eye=['walk','tour'].includes(mode),state=!show?'hidden':eye?(want==='all'?'all':'half'):'open';if(eye)walkDoorView=state;else doorView=state;const views=eye&&show?defaultViews():[];
 for(const g of doorLeaves){const swing=leafSwing(g);g.visible=show&&(swing!==0||state!=='half');if(!g.visible||!swing)continue;const full=activeLayout==='original'&&g.parent===originalMasterDoor?MASTER_ENTRIES.original.openFraction:DOOR_OPEN.open;g.rotation.y=swing*Math.PI*(eye?DOOR_OPEN.half:full);if(views.length){g.updateWorldMatrix(true,true);if(views.some(([p,q])=>crosses(g,p,q)))g.rotation.y=swing*Math.PI*full;}}
 for(const id of ['doorsBtn','studioDoors','studyDoor']){const b=$(id);b.setAttribute('aria-pressed',String(show));if(id==='doorsBtn'){b.querySelector('small').textContent=show?(eye?'门半开':'门扇开'):'门扇藏';b.title=show?'收起门扇，清楚看房':eye?'显示全部门扇（含推拉门）':'显示开启的门扇，检查开门方向';}else b.textContent=show?'收起门扇 · 清楚看房':eye?'显示门扇 · 含推拉门':'显示门扇 · 检查开启';}
 $('doorViewNote').textContent=show?(state==='half'?'漫游与导览默认铰链门半开约45°、推拉门收起 · ':state==='all'?'已显示全部门扇（铰链门半开约45°） · ':'已显示开启门扇 · ')+'门叶不参与行走碰撞；开启方向示意，非门五金施工图':'看房模式：仅收起门叶供观看；原儿童房门洞与北侧承重墙保留';invalidate(650,true);
}
for(const id of ['doorsBtn','studioDoors','studyDoor'])$(id).onclick=()=>{const eye=['walk','tour'].includes(mode),on=(eye?walkDoorView:doorView)==='hidden';setDoorView(on,'all');toast(!on?'仅为看房收起门扇；实际房门、门洞和消防要求仍保留。':(eye?'铰链门半开约45°，推拉门一并显示':'正在查看开启门扇')+'。门叶不作为行走碰撞，开启净距需施工深化。');};
$('masterEntryView').onclick=()=>{if(activeLayout==='central'){goRoom('south');const v=ENTRY_VIEWS.central;placeWalker(v.pos,v.look);$('closeDesign').click();$('viewport').focus({preventScroll:true});invalidate(1000);return;}focusUnit='bl';activeUnit='bl';rebuildShortcuts();prepare('walk');const v=ENTRY_VIEWS[activeLayout];placeWalker(v.pos,v.look);currentRoom='';updateRoom();if(activeLayout==='original'){setDoorView(true,'all');for(const g of doorLeaves)if(g.parent===originalMasterDoor){g.visible=true;g.rotation.y=leafSwing(g)*Math.PI/2;}}$('roomTitle').textContent=activeLayout==='original'?'主卧 · 90°开门与收纳':'主卧 · 进出与收纳';$('roomDesc').textContent=activeLayout==='original'?'左下主卧：原门及把手真实打开90°，不靠限位。1.80×2.00米床垫、2.10×1.88米薄床架；3.30×0.60米连续深柜，门后北端1米留空。柜前0.60米仍偏窄，比旧版仅加宽8厘米；不是0.80米宽过道。':'原主卧门和床向保留；移走床尾长柜后留1.12米，床架尺寸仍为2.18×2.00米。';$('closeDesign').click();$('viewport').focus({preventScroll:true});invalidate(1000);};
function setGuestMode(on){guestMode=on;for(const g of [gaming,expandedGaming,...Object.values(conceptScenes)]){g.guest.visible=on;g.day.visible=!on;}studyChair.position.z=.05;expandedGaming.chair.position.z=4.95+(on?-.15:-.05);$('guestToggle').textContent=on?'收起沙发床':'展开沙发床';$('guestToggle').setAttribute('aria-pressed',String(on));}
$('guestToggle').onclick=()=>{if(['family','central'].includes(activeLayout))return;setGuestMode(!guestMode);setGamingMode(guestMode?'rest':'game');placeWalker(...Object.values(activeStudyViews().guest));updateRoom();invalidate(600,true);};
$('studyDeskView').onclick=()=>{placeWalker(...Object.values(activeStudyViews().desk));updateRoom();invalidate();};
$('studyBedView').onclick=()=>{placeWalker(...Object.values(activeStudyViews().guest));updateRoom();invalidate();};
const originalRoomRecords=Object.fromEntries(rooms.filter(r=>['master','south','north','child'].includes(r.id)).map(r=>[r.id,{...r}]));
function applyLayout(id){const next=resolveLayout(id),changed=next!==activeLayout;activeLayout=next;northwestTile.visible=next!=='central';const original=next==='original';syncFitoutDimensions();compactBay.visible=['original','central'].includes(next);fullBay.visible=!compactBay.visible;layoutWalls.original.group.visible=next!=='central';layoutWalls.central.group.visible=next==='central';layoutWalls.redesign.group.visible=false;southDoor.visible=next!=='central';centralSouthDoor.visible=next==='central';originalMaster.visible=false;originalNorth.visible=false;originalSouth.visible=false;originalLoungeExtras.visible=false;originalFitout.visible=original;originalMasterDoor.visible=true;redesignMasterDoor.visible=false;childDoor.visible=true;studyDivider.visible=false;study.visible=original;redesignFurnishings.visible=false;layoutMarkup.visible=false;for(const [key,g]of Object.entries(conceptScenes))g.group.visible=key===next;masterBed.visible=original;if(['original','family','central'].includes(next))setGuestMode(false);restoreGlobalLighting();
 for(const [key,value]of Object.entries(originalRoomRecords))Object.assign(rooms.find(r=>r.id===key),value);
 for(const [key,value]of Object.entries(original?OWNER_ROOMS.original:CONCEPT_ROOMS[next]))Object.assign(rooms.find(r=>r.id===key),value);
 for(const p of pins){if(!p.roomId)continue;const r=rooms.find(r=>r.id===p.roomId);p.pos.set(r.x,.35,r.z);p.el.textContent=r.name;p.el.setAttribute('aria-label','进入'+unitNames[r.unit]+r.name);}
 const shownWalls=next==='central'?centralWallData:originalData;miniWalls.replaceChildren();for(let i=0;i<shownWalls.wallPolygons.length;i++)svgEl('path',{d:svgPath(shownWalls.wallPolygons[i])+(shownWalls.wallHoles[i]||[]).map(svgPath).join(''),fill:'#7c8b70','fill-rule':'evenodd'},miniWalls);
 document.querySelectorAll('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===next)));$('layoutSummary').textContent=LAYOUTS[next].summary;$('storageSummary').textContent=original?'衣柜合计5.30米：左下主卧3.30×0.60米连续深柜，门后北端1米留空；右下南次卧北侧2.00×0.60米柜。主卧柜前0.60米仍偏窄，南次卧柜前0.80米。':next==='balanced'?'衣柜合计7.00米：主卧1.10＋北西卧1.60＋衣帽间4.30':next==='family'?'衣柜合计6.50米：主卧1.10＋北西卧1.60＋小北卧1.20＋南侧2.60':'衣柜集中北东房：2.60＋1.70＝4.30米；比A少2.70米，藏品改为桌上方展示墙';$('layoutWarning').textContent=LAYOUTS[next].warning;$('layoutFlag').textContent=LAYOUTS[next].name+' · 承重墙保留';$('layoutFlag').classList.toggle('conditional',!original);$('scaleNote').textContent=next==='central'?'1 单位 = 1 米 · C为条件移墙试摆，水点不动':'1 单位 = 1 米 · 原墙体与水点不变';$('guestToggle').hidden=['family','central'].includes(next);$('studyBedView').hidden=['family','central'].includes(next);$('studyBedView').textContent='看沙发床与展示墙';$('masterEntryView').textContent=next==='central'?'看直墙、门位与电脑桌 ↗':original?'看左下主卧90°开门 ↗':'看主卧进出动线 ↗';syncGamingModeLabels();
 rebuildMasterBed();rebuildShortcuts();updateScopeUI();if(changed){currentRoom='';focusUnit='bl';activeUnit='bl';if(mode==='walk'){prepare('walk');placeWalker(...unitEntry.bl);updateRoom();}else changeMode(mode==='plan'?'plan':'dollhouse');}invalidate(1500,true);
}
$('layoutPlanView').onclick=()=>{focusUnit='bl';selectUnit('bl');changeMode('plan');};
const studio=createDesignStudio({applyLayout,applyHome:applyHomeDesign,applyGaming:renderGamingPreferences,previewRoom:id=>{goRoom(id==='master'&&activeLayout==='central'?'south':id==='child'&&activeLayout!=='original'?'south':id);if(ui.phone)$('closeDesign').click();},toast});

// Contact shadows by group: the owner's shared furniture (not the pieces the layouts replace), the neighbours' full original sets
// (the mirrored units are built in their own unmirrored frame), each layout's fit-out. Fake AO along each wall set's faces,
// its ceiling bands as their own mesh (own material, so batchStatic keeps it apart; clone() copies the cut plane, so it is
// shared again) that setIndoor() only shows under the roof.
// Software rasterisers skip the wall bands (fill-bound: +3–5% a frame in the entry and bathroom); contact shadows stay.
{const same=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-6),gone=[...OWNER_REPLACED_BOXES,...oldChildCollisions,entryCabinetFootprint,...LEGACY_LIVING_BOXES];contacts([...bCollisions.filter(b=>!gone.some(q=>same(b,q))),...ownerExtraCollisions],leftB);contacts(bCollisions,rightB);contacts(aCollisions,leftA);contacts(aCollisions,rightA);contacts(layoutFootprints('original'),originalFitout);for(const [id,g] of Object.entries(conceptScenes))contacts(layoutFootprints(id,conceptData.layouts[id]),g.group);
 const ceilMat=shadeMat.clone();ceilMat.clippingPlanes=[clipPlane];for(const [id,plan] of [['original',originalData],['central',centralWallData]]){const ao=wallAOGeometry(plan,{footprint,floorHoles,windows:winSegments}),top=new THREE.Mesh(ao.ceiling,ceilMat);top.visible=indoor!==OUTDOOR;aoCeilings.push(top);if(renderTier!=='soft')layoutWalls[id].group.add(new THREE.Mesh(ao.foot,shadeMat),top);}}
// Batch static architectural meshes without changing their metre-scale transforms.
function batchStatic(group,exclude=null){group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert();const buckets=new Map(),original=[];group.traverse(o=>{if(!o.isMesh||!o.visible||Array.isArray(o.material))return;let a=o;while(a&&a!==group){if((Array.isArray(exclude)?exclude:[exclude]).includes(a))return;a=a.parent;}const key=o.material.uuid+'|'+o.castShadow+'|'+o.receiveShadow;if(!buckets.has(key))buckets.set(key,{material:o.material,cast:o.castShadow,receive:o.receiveShadow,geos:[]});let g=o.geometry.clone();if(g.index)g=g.toNonIndexed();const transform=new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld);g.applyMatrix4(transform);if(transform.determinant()<0){for(const attr of Object.values(g.attributes)){const a=attr.array,k=attr.itemSize;for(let i=0;i<attr.count;i+=3)for(let j=0;j<k;j++){const u=(i+1)*k+j,v=(i+2)*k+j,t=a[u];a[u]=a[v];a[v]=t;}}}buckets.get(key).geos.push(g);original.push(o);});for(const o of original){o.parent.remove(o);o.geometry.dispose();}for(const b of buckets.values()){const geometry=mergeGeometries(b.geos,false);b.geos.forEach(g=>g.dispose());if(!geometry)continue;const mesh=new THREE.Mesh(geometry,b.material);mesh.castShadow=b.cast;mesh.receiveShadow=b.receive;group.add(mesh);}}
// Merge the moving cut caps into a single draw call; preserve editable groups.
for(const v of Object.values(layoutWalls)){batchStatic(v.caps);batchStatic(v.group,[v.caps]);}
batchStatic(arch,[...Object.values(layoutWalls).map(v=>v.group),studyDivider,childDoor,originalMasterDoor,redesignMasterDoor,southDoor,centralSouthDoor,...doorLeaves]);
for(const g of [studyDivider,childDoor,originalMasterDoor,redesignMasterDoor,southDoor,centralSouthDoor])batchStatic(g,doorLeaves);
for(const g of doorLeaves)batchStatic(g);
setDoorView(false);
batchBed=batchStatic;batchBed(masterBed);batchStatic(leftB,[masterBed,study,originalMaster,originalNorth,originalSouth,originalLoungeExtras,originalFitout,redesignFurnishings,...Object.values(conceptScenes).map(g=>g.group)]);batchStatic(originalMaster);batchStatic(originalNorth);batchStatic(originalSouth);batchStatic(originalLoungeExtras);batchStatic(originalFitout);
for(const g of Object.values(conceptScenes)){batchStatic(g.group,[g.day,g.guest]);batchStatic(g.day);g.guest.visible=true;batchStatic(g.guest);g.guest.visible=guestMode;}
batchStatic(rightB);batchStatic(leftA);batchStatic(rightA);batchStatic(common);
batchStatic(redesignFurnishings,[expandedGaming.room]);
for(const g of [gaming,expandedGaming]){batchStatic(g.room,[g.day,g.guest,g.chair,g.shade]);batchStatic(g.day);g.guest.visible=true;batchStatic(g.guest);g.guest.visible=guestMode;batchStatic(g.chair);batchStatic(g.shade);}
batchStatic(roof);batchStatic(stage);batchStatic(building);batchStatic(landscape,sky);
details.fixtures();
// Kitchen and bathroom fit-out (wet-rooms.js), after the locked water points: cabinets, hood, mirror cabinets, wall tiles.
const wet=createWetRooms({M,clipPlane,envMap,owner:leftB,arch,walls:layoutWalls,plans:[originalData,centralWallData],neighbours:{rightB,leftA,rightA},collisions:ownerExtraCollisions,batch:batchStatic,soft:renderTier==='soft',materials:{door:M.door,handles:{bar:M.handleBar,knob:M.handleKnob,pull:M.handlePull}}});
// GPU tier: normal maps on every material drawn with a wood-floor, tile or fabric map (material-kit.js relief); nothing elsewhere.
finishes.relief(scene);
let savedQuality='auto';try{savedQuality=localStorage.getItem('xiyuan-quality-v2')||'auto';}catch{}if(!qualityConfigs[savedQuality])savedQuality='auto';
if(renderTier==='soft')scene.traverse(o=>{for(const m of o.isMesh?[].concat(o.material):[])if(m.isMeshStandardMaterial&&(m.metalness>0||m.roughness<.3)&&!reflective.includes(m)){m.envMap=envMap;m.envMapIntensity=ambient.env;m.needsUpdate=true;reflective.push(m);}});
// Round 4, GPU tier only: ambient occlusion (GTAO) at eye level, i.e. walking and the tour's rooms, never in the cut overviews;
// off at quality 流畅. Phones and software rendering never load gtao-layer.js. A/B switch: ?ao=0 in the address, or
// xiyuanAO(false) / xiyuanAO(true) in the console (xiyuanAO() reports the state).
if(renderTier==='gpu')import('./gtao-layer.js?v=1b75d82cc4').then(({installGTAO})=>{const ao=installGTAO({renderer,scene,camera,enabled:new URLSearchParams(location.search).get('ao')!=='0',active:()=>quality!=='smooth'&&(mode==='walk'||(mode==='tour'&&!TOUR.find(s=>tourTime>=s.start&&tourTime<s.end)?.overview))});
 window.xiyuanAO=Object.assign(on=>{if(on!==undefined){ao.enabled=on;invalidate(300);}return {enabled:ao.enabled,on:ao.on,size:ao.size(),draws:ao.draws};},{layer:ao});invalidate(300);}).catch(e=>console.warn('GTAO unavailable',e));
camera.position.set(...overviewPos());const c=focusedCenter();controls.target.set(c[0],.1,c[1]);controls.update();prepare('dollhouse');applyQuality(savedQuality);requestAnimationFrame(animate);
$('loading').style.opacity='0';setTimeout(()=>$('loading').hidden=true,850);
// Visible diagnostics assist layout and accessibility QA without exposing CAD application state.
const diag=document.createElement('span');diag.id='renderStatus';diag.style.cssText='position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);';diag.setAttribute('aria-live','polite');diag.textContent='整层三维已就绪；39组CAD墙轮廓已加载';document.body.appendChild(diag);

// Local comparison links select a layout without overwriting saved colour preferences.
{const chosen=new URLSearchParams(location.search).get('layout');if(['original','central'].includes(chosen))document.querySelector(`[data-layout="${chosen}"]`)?.click();}
