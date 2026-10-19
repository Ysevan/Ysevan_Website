// Metres. Display cabinet depth includes casework, not clear internal shelf depth.
export const STUDY_COLLISIONS={desk:[.4,2.6,2.4,3.3],storage:[.4,2.6,.72,3.24],display:[.2,5.416,1.7,5.85],day:[.18,4,2.12,4.89],guest:[.18,4,2.12,5.24]};
export const STUDY_VIEWS={desk:{pos:[2.5,1.62,3.63],look:[1.3,1.05,2.85]},guest:{pos:[2.5,1.62,4.35],look:[.95,1.1,5.65]}};
export const GAMING_MODES={game:{label:'游戏',primary:'#ffe5b7',secondary:'#ffedcf',screen:'game'},focus:{label:'办公',primary:'#fff1cf',secondary:'#ffe0a3',screen:'focus'},rest:{label:'留宿',primary:'#eab778',secondary:'#eab778',screen:'off'}};

export const SOUTH_STUDY_COLLISIONS={desk:[3.5,7.55,5.5,8.25],storage:[3.5,7.55,3.82,8.19],display:[6.016,8.65,6.45,10.15],day:[4.1,9.38,4.99,11.32],guest:[4.1,9.38,5.34,11.32]};
export const studyBoxes=id=>id==='redesign'?SOUTH_STUDY_COLLISIONS:STUDY_COLLISIONS;
