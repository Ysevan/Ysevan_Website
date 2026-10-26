// Owner-only v21 fit-out. Plan coordinates/metres; original architecture and services are immutable.
// West water/drain presence is OWNER-REPORTED (2026-10-26), not surveyed coordinates.
// The legacy water-points laundry.cabinet record is a furniture centre, not a pipe coordinate.
import * as THREE from 'three';
import {sofaParts,tvWallParts,tvScribe,acParts,applianceParts,laundryCounterParts,teaTableParts,tierSegments} from './living-kit.js?v=8eb64615a6';
export const LEGACY_LIVING_BOXES=[[6.82,7.72,7.82,10.38],[7.7,7.2,9.4,8.03],[9.95,7.75,10.4,10.35],[8.33,8.86,9.3,9.9],[9.1,11.72,9.8,13.15]];
export const LIVING_BOXES={sofa:[6.8,8.03,7.8,10.38],tv:[10.1,7.25,10.5,10.35],ac:[9.91,10.56,10.39,11.04],laundry:[4.48,11.85,5.23,13.25],tea:[8.0,12.50,8.8,13.05],teaWest:[7.375,12.505,7.825,12.955],teaEast:[8.975,12.505,9.425,12.955],lamp:[6.93,7.27,7.23,7.57]};
export const LIVING_NOTES={sofa:'2.35×1.00米直排沙发',tv:'3.10×0.40×2.55米电视收纳墙；电视留空散热，尺寸待机型',laundry:'1.40×0.75米连续台面，高0.94米；两台0.60×0.65×0.85米占位',tea:'0.80×0.55米活动茶桌＋两椅；北侧通道0.85米',services:'屋主确认西侧已有给水/洗衣排水，坐标待现场核；东侧原接口保留检修，不改管线',clearances:{coffeeEast:0.99,sofaCoffee:0.59,teaNorth:0.85,laundryOperating:1.2}};
export function createLivingBalcony({parent,box,round,cyl,rod,M,clipPlane,furnish,rug,art,chair}){
 const g=new THREE.Group();g.name='owner-living-balcony';parent.add(g);
 const oak=M.oak.clone();oak.color=M.oak.color;oak.clippingPlanes=[clipPlane];
 const darkCut=M.dark.clone();darkCut.color=M.dark.color;darkCut.clippingPlanes=[clipPlane];
 const group=name=>{const q=new THREE.Group();q.name=name;g.add(q);return q;},seg=tierSegments(box,M.oak);
 const part=(name,b,y,h,m,p=g)=>{const [x,z,X,Z]=b;const q=box((x+X)/2,y,(z+Z)/2,X-x,h,Z-z,m,p);q.name=name;return q;};
 // 2.35 m long straight sofa (living-kit.js: legs, arms, back frame, seat and back cushions); the south arm hosts the throw.
 const sofa=group('compact-sofa');sofaParts(sofa,M,seg);
 furnish.sofa(g,{compact:true});
 // Shared helpers append to owner furniture, outside this named group; still captured by normal material batching.
 // The print hangs on the wall face (x 6.70), not 0.10 m in front of it.
 rug(8.43,9.25,2.85,2.9,'#c3c8b9');art(6.7175,1.35,9.2,1.5,.82,Math.PI/2,true);
 // Built-in TV wall (living-kit.js tvWallParts): carcass, toe kick, fronts with 3 mm joints, handles, open AV cell, the
 // television on the niche's back panel. Cabinet fronts face west; the recess stays open behind and around the set.
 const tv=group('tv-storage-wall');tvWallParts(tv,M,{oak,darkCut,seg});tvScribe(g,oak);
 // Round column indoor unit, Ø0.48 × 1.80; no fabricated ventilation or electrical route.
 const ac=group('floor-standing-ac');acParts(ac,M,seg);
 // West equipment platform (x<4.45) stays empty; appliances sit INSIDE the balcony, face east.
 const laundry=group('west-parallel-laundry');
 for(const [i,z] of [12.205,12.895].entries()){
  const machine=group(i?'dryer':'washer');machine.position.set(4.83,0,z);machine.rotation.y=-Math.PI/2;laundry.add(machine);applianceParts(machine,M,seg,{washer:!i});
 }
 laundryCounterParts(laundry,M,{oak,seg,box:LIVING_BOXES.laundry});
 // No pipes/faucets/drains fabricated at assumed coordinates. No full-height enclosure over service access.
 const tea=group('east-tea-zone');teaTableParts(tea,M,seg,{box:LIVING_BOXES.tea,oak});
 for(const [name,x,rot] of [['tea-chair-west',7.6,-Math.PI/2],['tea-chair-east',9.2,Math.PI/2]]){const q=chair(x,12.73,rot);q.name=name;tea.add(q);}
 // A third stool is intentionally not left in the walking route: bring it in occasionally.
 return {group:g,sofa,tv,ac,laundry,tea,boxes:Object.values(LIVING_BOXES),notes:LIVING_NOTES};
}
