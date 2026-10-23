import * as THREE from 'three';
// Room lights (scene detail round 4, GPU tier only; app.js creates them only when renderTier==='gpu').
// Two point lights that never cast shadows and are never hidden or added, so every shader is compiled once with them and
// walking from room to room only moves them and changes their intensity and colour:
//  - lamp: the ceiling light of the owner's room you are in (walking, and the tour's rooms). Off (intensity 0) in the overviews,
//    the plan, the building and the other units, so those views look exactly as before.
//  - second: the dining pendant (8, 2.3, 4.6) the rooms had before, or the lit gaming accent in its place (round 1: the accent
//    took the far dining light's slot); app.js copies whichever of the two the other tiers would show.
// Plan metres. Positions are the owner's downlights (detail-layer.js DOWNLIGHTS; one fitting in the middle of a room stands for
// its ceiling light), the kitchen and bathroom ceiling lights (wet-rooms.js, ceiling 2.40 m) and the balcony lamp (furnish-layer.js).
// i: intensity in candela (decay 2), calibrated on desk 2040 (ji, day lighting). The owner's rule is to keep each view's
// brightness from before the roof cast (round 2). Living, master, kitchen, south and the inner bathroom were at +0.15% to +3.29%
// of it and get +1.2% to +1.6% (a pool of light, no more); the entry (−5.35%) and C's desk (−3.35%) were below that band and are
// lifted into it, the other desks kept in it. Those lamps' intensities depend on the lighting preset (design-presets.js
// LIGHTING[id].lamps); check:roomlight holds the calibrated ranges.
export const ROOM_LIGHT={color:'#fff2e0',distance:4.5,decay:2,below:.3,rest:{scale:.1,color:'#eab778'}};
export const ROOM_LAMPS={
 living:{at:[8.62,9.25],i:2.5},
 // The dining room's own light is its pendant (the second light); its room lamp is the entry's inner downlight, which also
 // lights the hall when you stand in it. Decay 1: the lift the entry needs, without blowing out the door and the hall's
 // plant and cabinet next to it (decay 2 needs twice the intensity and turns the door peach).
 dining:{at:[9.75,2.65],distance:6,decay:1,lift:'entry'},hall:{at:[9.75,2.65],distance:6,decay:1,lift:'entry'},
 corridor:{at:[[2.75,6.5],[4.1,6.5],[5.45,6.5]],i:.8},
 master:{at:[1.5,9.83],i:1.25},
 south:{at:[5,9.7],i:2},
 north:{at:[4.15,4.53],i:1},
 child:{at:[1.45,4.07],i:1},
 kitchen:{at:[7.7,1.7],ceiling:2.4,i:.5},
 bath1:{at:[.95,7],ceiling:2.4,i:.8},
 bath2:{at:[6.2,4.4],ceiling:2.4,i:1},
 balcony:{at:[5.3,12.5],i:.8}
};
// The gaming desk's room: the downlight over the desk front, per layout (the original's gaming room is 'child', the others' 'south').
// In the rest / soft-light mood the lamp dims to ROOM_LIGHT.rest and turns amber.
// The entry's and the desks' intensities depend on the lighting preset (how much light the roof took): design-presets.js
// LIGHTING[id].lamps = {entry, desk:{layout: cd}}.
export const DESK_LAMPS={original:{room:'child',at:[1.45,3.2]},balanced:{room:'south',at:[4,8.45]},family:{room:'south',at:[4,8.45]},central:{room:'south',at:[6,8.45]}};
const CEILING=2.78;
// Which owner room a plan point is in: a room rect of the B unit, 'hall' (entry hall, east of the kitchen), 'corridor' (the
// passage between the bedrooms), or null outside the owner's unit (neighbours, lobbies, bridge).
export function ownerRoomAt(rooms,x,z){
 const r=rooms.find(q=>q.unit==='bl'&&x>=q.rect[0]&&x<=q.rect[2]&&z>=q.rect[1]&&z<=q.rect[3]);if(r)return r.id;
 if(x<-.1||x>10.75||z<0||z>13.45||(z<2.25&&x<6.35)||(z<1&&x>8.95))return null;
 return x>=7.2||z<3.15?'hall':'corridor';
}
// The lamp for a room: position (x, y, z), intensity and colour; mood is the gaming room's lighting key ('' outside it), lamps
// the lighting preset's entry and desk intensities.
export function roomLamp(room,layout,mood='',at=[0,0],lamps={}){
 const desk=DESK_LAMPS[layout],isDesk=!!desk&&desk.room===room,q=isDesk?desk:ROOM_LAMPS[room];if(!q)return null;
 const i=isDesk?lamps.desk?.[layout]??0:q.lift?lamps[q.lift]??0:q.i;
 let [x,z]=q.at;if(Array.isArray(x)){[x,z]=q.at.reduce((a,b)=>Math.hypot(b[0]-at[0],b[1]-at[1])<Math.hypot(a[0]-at[0],a[1]-at[1])?b:a);}
 const rest=isDesk&&mood==='rest';
 return {pos:[x,(q.ceiling||CEILING)-(q.below??ROOM_LIGHT.below),z],intensity:i*(rest?ROOM_LIGHT.rest.scale:1),color:rest?ROOM_LIGHT.rest.color:ROOM_LIGHT.color,distance:q.distance||ROOM_LIGHT.distance,decay:q.decay??ROOM_LIGHT.decay};
}
export function createRoomLights(scene){
 const make=name=>{const l=new THREE.PointLight(ROOM_LIGHT.color,0,ROOM_LIGHT.distance,ROOM_LIGHT.decay);l.name=name;l.castShadow=false;l.userData.roomLight=true;scene.add(l);return l;};
 const lamp=make('room-lamp'),second=make('room-second'),w=new THREE.Vector3();
 // inside: walking or in a tour room. room: ownerRoomAt() of the camera. second: the dining pendant or the lit accent to copy.
 function sync({inside,room,layout,mood,at,lamps,second:from}){
  const p=inside&&room?roomLamp(room,layout,mood,at,lamps):null;
  if(p){lamp.position.set(...p.pos);lamp.color.set(p.color);lamp.intensity=p.intensity;lamp.distance=p.distance;lamp.decay=p.decay;}else lamp.intensity=0;
  from.updateWorldMatrix(true,false);second.position.copy(from.getWorldPosition(w));second.color.copy(from.color);second.distance=from.distance;second.decay=from.decay;second.intensity=inside?from.intensity:0;
 }
 return {lights:[lamp,second],lamp,second,sync};
}
