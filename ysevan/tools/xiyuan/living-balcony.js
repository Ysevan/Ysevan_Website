// Owner-only v21 fit-out. Plan coordinates/metres; original architecture and services are immutable.
// West water/drain presence is OWNER-REPORTED (2026-10-26), not surveyed coordinates.
// The legacy water-points laundry.cabinet record is a furniture centre, not a pipe coordinate.
import * as THREE from 'three';
export const LEGACY_LIVING_BOXES=[[6.82,7.72,7.82,10.38],[7.7,7.2,9.4,8.03],[9.95,7.75,10.4,10.35],[8.33,8.86,9.3,9.9],[9.1,11.72,9.8,13.15]];
export const LIVING_BOXES={sofa:[6.8,8.03,7.8,10.38],tv:[10.1,7.25,10.5,10.35],ac:[9.91,10.56,10.39,11.04],laundry:[4.48,11.85,5.23,13.25],tea:[8.0,12.50,8.8,13.05],teaWest:[7.375,12.505,7.825,12.955],teaEast:[8.975,12.505,9.425,12.955],lamp:[6.93,7.27,7.23,7.57]};
export const LIVING_NOTES={sofa:'2.35×1.00米直排沙发',tv:'3.10×0.40×2.55米电视收纳墙；电视留空散热，尺寸待机型',laundry:'1.40×0.75米连续台面，高0.94米；两台0.60×0.65×0.85米占位',tea:'0.80×0.55米活动茶桌＋两椅；北侧通道0.85米',services:'屋主确认西侧已有给水/洗衣排水，坐标待现场核；东侧原接口保留检修，不改管线',clearances:{coffeeEast:0.99,sofaCoffee:0.59,teaNorth:0.85,laundryOperating:1.2}};
export function createLivingBalcony({parent,box,round,cyl,rod,M,clipPlane,furnish,rug,art,chair}){
 const g=new THREE.Group();g.name='owner-living-balcony';parent.add(g);
 const oak=M.oak.clone();oak.color=M.oak.color;oak.clippingPlanes=[clipPlane];
 const darkCut=M.dark.clone();darkCut.color=M.dark.color;darkCut.clippingPlanes=[clipPlane];
 const group=name=>{const q=new THREE.Group();q.name=name;g.add(q);return q;};
 const part=(name,b,y,h,m,p=g)=>{const [x,z,X,Z]=b;const q=box((x+X)/2,y,(z+Z)/2,X-x,h,Z-z,m,p);q.name=name;return q;};
 // 2.35 m long straight sofa; south arm retained to host the draped throw without floating cloth.
 const sofa=group('compact-sofa');
 round(7.3,.10,9.205,.98,.29,2.31,M.linen,sofa);
 round(6.9,.38,9.205,.17,.55,2.35,M.linen,sofa);
 for(const z of [8.11,10.3])round(7.3,.33,z,1,.42,.16,M.linen,sofa);
 for(let i=0;i<3;i++)round(7.38,.39,8.52+i*.69,.72,.18,.64,M.linen,sofa);
 furnish.sofa(g,{compact:true});
 // Shared helpers append to owner furniture, outside this named group; still captured by normal material batching.
 rug(8.43,9.25,2.85,2.9,'#c3c8b9');art(6.82,1.35,9.2,1.5,.82,Math.PI/2,true);
 const tv=group('tv-storage-wall');
 part('tv-plinth',[10.15,7.27,10.48,10.33],.04,.08,M.walnut,tv);
 part('tv-lower',[10.12,7.25,10.5,10.35],.12,.39,oak,tv);
 part('tv-upper',[10.12,7.25,10.5,10.35],1.99,.56,oak,tv);
 for(const [a,b] of [[7.25,7.8],[9.8,10.35]])part('tv-side',[10.12,a,10.5,b],.51,1.48,oak,tv);
 // Cabinet fronts face west. Central void is genuinely empty, not a television painted on a solid wall.
 for(let i=0;i<6;i++)for(const [y,h] of [[.125,.38],[2.0,.54]])part('tv-door',[10.1,7.26+i*.515,10.12,7.26+i*.515+.50],y,h,M.whiteCut,tv);
 for(const z of [7.26,9.81])part('tv-tall-door',[10.1,z,10.12,z+.53],.52,1.46,M.whiteCut,tv);
 part('tv-back',[10.47,7.80,10.49,9.80],.51,1.48,oak,tv);
 part('tv-screen',[10.125,8.07,10.165,9.53],.81,.83,darkCut,tv);
 part('tv-display',[10.119,8.09,10.125,9.51],.83,.79,M.metalCut,tv);
 // Visible recess/air gaps remain; no fabricated ventilation or electrical route.
 const ac=group('floor-standing-ac');
 const acBody=cyl(10.15,0,10.8,.24,1.8,M.white,ac);acBody.name='ac-body';
 part('ac-outlet',[9.907,10.69,9.925,10.91],.65,.88,M.dark,ac);
 for(let i=0;i<11;i++)part('ac-louvre',[9.900,10.695,9.91,10.905],.69+i*.073,.012,M.white,ac);
 part('ac-display',[9.902,10.75,9.913,10.85],1.62,.055,M.dark,ac);
 // West equipment platform (x<4.45) stays empty; appliances sit INSIDE the balcony, face east.
 const laundry=group('west-parallel-laundry');
 for(const [i,z] of [12.205,12.895].entries()){
  const machine=group(i?'dryer':'washer');machine.position.set(4.83,0,z);machine.rotation.y=-Math.PI/2;laundry.add(machine);
  round(0,.035,0,.60,.815,.65,M.white,machine,.025).name='appliance-case';
  box(0,.69,-.328,.54,.115,.018,M.stone,machine);
  box(-.11,.72,-.34,.17,.045,.014,M.dark,machine);
  const knob=cyl(.16,0,0,.025,.022,M.metal,machine);knob.rotation.x=Math.PI/2;knob.position.set(.16,.745,-.352);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.205,.025,8,32),M.metal);rim.position.set(0,.4,-.345);machine.add(rim);
  const door=new THREE.Mesh(new THREE.CircleGeometry(.18,32),M.dark);door.rotation.y=Math.PI;door.position.set(0,.4,-.358);machine.add(door);
  const glass=new THREE.Mesh(new THREE.CircleGeometry(.13,24),M.metal);glass.rotation.y=Math.PI;glass.position.set(0,.4,-.360);machine.add(glass);
  box(.21,.39,-.37,.025,.10,.024,M.white,machine);
 }
 part('continuous-laundry-counter',LIVING_BOXES.laundry,.90,.04,M.stone,laundry);
 for(const [a,b] of [[11.85,11.88],[13.22,13.25]])part('laundry-counter-support',[4.48,a,5.23,b],0,.90,oak,laundry);
 // No pipes/faucets/drains fabricated at assumed coordinates. No full-height enclosure over service access.
 const tea=group('east-tea-zone');
 part('tea-tabletop',LIVING_BOXES.tea,.70,.035,oak,tea);
 for(const x of [8.07,8.73])for(const z of [12.57,12.98])box(x,0,z,.035,.70,.035,M.oak,tea);
 for(const [name,x,rot] of [['tea-chair-west',7.6,-Math.PI/2],['tea-chair-east',9.2,Math.PI/2]]){const q=chair(x,12.73,rot);q.name=name;tea.add(q);}
 box(8.4,.738,12.78,.36,.018,.24,M.walnut,tea);
 for(const x of [8.27,8.53]){cyl(x,.756,12.78,.043,.07,M.white,tea);cyl(x,.827,12.78,.033,.002,M.walnut,tea);}
 // A third stool is intentionally not left in the walking route: bring it in occasionally.
 return {group:g,sofa,tv,ac,laundry,tea,boxes:Object.values(LIVING_BOXES),notes:LIVING_NOTES};
}
