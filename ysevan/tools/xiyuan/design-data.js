// Metres. Display cabinet depth includes casework, not clear internal shelf depth.
export const STUDY_COLLISIONS={desk:[.4,2.6,2.4,3.3],storage:[.4,2.6,.72,3.24],day:[.12,3.89,.98,5.83],guest:[.12,3.89,1.36,5.83],chair:[1.89,3.31,2.47,3.89]};
export const STUDY_VIEWS={desk:{pos:[2.5,1.62,3.63],look:[1.3,1.05,2.85]},guest:{pos:[2.2,1.62,5.3],look:[.55,1.3,4.65]}};
export const GAMING_MODES={game:{label:'游戏',primary:'#ffe5b7',secondary:'#ffedcf',screen:'game'},focus:{label:'办公',primary:'#fff1cf',secondary:'#ffe0a3',screen:'focus'},rest:{label:'留宿',primary:'#eab778',secondary:'#eab778',screen:'off'}};

export const SOUTH_STUDY_COLLISIONS={desk:[3.5,7.55,5.5,8.25],storage:[3.5,7.55,3.82,8.19],display:[6.016,8.65,6.45,10.15],day:[4.1,9.38,4.99,11.32],guest:[4.1,9.38,5.34,11.32]};
export const studyBoxes=id=>id==='redesign'?SOUTH_STUDY_COLLISIONS:STUDY_COLLISIONS;

// Elevated displays are NOT floor obstacles. Actual cabinet envelopes, bottom/top from finished floor.
export const STUDY_UPPER_DISPLAYS=[{id:'west',box:[.12,3.94,.42,5.50],bottom:1.45,top:2.45,face:'east'},{id:'south',box:[.47,5.55,1.72,5.83],bottom:1.45,top:2.45,face:'north'},{id:'east',box:[2.49,3.95,2.77,4.87],bottom:1.45,top:2.45,face:'west'}];
export const studyFloorBoxes=id=>{const s=studyBoxes(id);return [s.desk,s.storage,...(s.display?[s.display]:[]),...(s.chair?[s.chair]:[])];};

// Upper cases do not occupy floor area, but project into the eye/head-height walking envelope.
export const studyWalkBoxes=id=>[...studyFloorBoxes(id),...(id==='original'?STUDY_UPPER_DISPLAYS.map(q=>q.box):[])];
