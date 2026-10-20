// V9: redesign placement records below are historical only; layout-policy.js blocks them.
// Metres from DWG; proposed clearances include furniture frames, not site finishes.
export const LAYOUTS={original:{name:'01 · 原四房',program:'三卧＋北侧电竞书房',summary:'儿童房与北卧之间承重墙、原门洞和厨卫水点保留。北侧电竞书房的客床展开时会碰到儿童房门扇扫掠范围。',warning:'旧拆墙三房已撤回。书房与封闭阳台之间的条件开口、保温及居住用途仍须单独复核。'},balanced:{name:'02 · A 收纳均衡',program:'两卧＋南侧电竞兼客房＋衣帽间',summary:'北西房1.5米床；北东房为双排衣柜。南侧为电竞与临时留宿。主卧床尾留1.12米，全屋衣柜7.00米。',warning:'北西房墙垛处局部仅0.50米；阳台条件开口和居住用途需核实。第三间仅临时留宿。'},family:{name:'03 · B 三卧电竞',program:'三卧＋独立南侧电竞房',summary:'主卧1.8米、北西房1.5米、小北房1.2米床。南侧独立电竞并有2.60米家庭衣柜，全屋衣柜6.50米。',warning:'仍有四间独立房。小北房床尾仅0.20米；北西房墙垛处0.50米。阳台条件开口需核实。'},central:{name:'04 · C 双大床＋L桌试摆',program:'三卧＋南侧主卧电竞＋衣帽间',summary:'南主卧和原主卧均为1.8×2米床；干区隔墙条件西移15厘米，两边床尾各约0.97米。南主卧利用原门洞凹位做1.8米L形电竞桌，衣柜集中北东房4.30延米。',warning:'隔墙西移、南卧新门及原门封口均待原设计单位复核；0.97米是床尾净距，不代表桌椅后方和南窗侧也有1米。北西卧阳台条件仍需核验。'},redesign:{name:'旧三房已撤回',program:'北侧承重墙不可拆',summary:'不可选择：旧北侧合并房间方案失效。',warning:'儿童房与北卧之间承重墙不可拆。',available:false}};
export const OWNER_REPLACED_BOXES=[[7.7,7.2,9.4,8.03],[8.33,8.86,9.3,9.9],[2.82,8.2,3.38,11.3],[3.1,3.15,5.18,4.68],[3.19,4.5,3.85,5.6],[3.5,7.35,5.48,7.95],[3.46,9,5.58,10.55]];
// Wardrobes go to the slab (2.76 of 2.78 m) with a separate 0.50 m upper band, after the owner's reference videos (2026-10-20).
export const WARDROBE_FULL={height:2.76,topBand:.5,slab:2.78};
export const WARDROBES={original:[{name:'主卧长衣柜',box:[2.8,7.15,3.4,11.45],face:'west',length:4.3,depth:.6,height:2.76,topBand:.5},{name:'南卧衣柜',box:[3.5,7.55,5.5,8.15],face:'south',length:2,depth:.6,height:2.76,topBand:.5}],redesign:[{name:'主卧长柜',box:[3.35,8.55,3.95,11.45],face:'west',length:2.9,depth:.6},{name:'主卧入口柜',box:[2.8,7.15,3.4,8.45],face:'west',length:1.3,depth:.6},{name:'北侧宽卧长柜',box:[.1,5.25,2.75,5.85],face:'north',length:2.65,depth:.6},{name:'北侧宽卧补充柜',box:[3.05,5.25,4.25,5.85],face:'north',length:1.2,depth:.6}]};
export const NORTH_BED={cx:4.06,cz:3.8,width:1.2,length:2,rotation:Math.PI/2,box:[3.02,3.17,5.1,4.43]};
export const NORTH_DESK={box:[3.02,4.50,3.62,5.70],length:1.2,depth:.6,height:.75,chair:[4.01,5.08]};
export const NORTHWEST_BED={cx:1.24,cz:3.8,width:1.5,length:2,rotation:Math.PI/2,box:[.2,3.02,2.28,4.58]};
export const SOUTH_BED={cx:4.62,cz:9.75,width:1.5,rotation:Math.PI/2,box:[3.5,8.9,5.68,10.6]};
export const MASTER_PLACEMENTS={original:{cx:1.22,cz:9.8,width:1.8,rotation:Math.PI/2},redesign:{cx:1.22,cz:9.8,width:1.8,rotation:Math.PI/2}};
export const ROOM_FURNITURE={original:{northBed:NORTH_BED.box,northDesk:NORTH_DESK.box,southBed:SOUTH_BED.box,coffee:[8.39,8.99,9.11,9.71]},redesign:{northwestBed:NORTHWEST_BED.box,northwestDesk:[3.8,3.17,5.2,3.77],coffee:[8.39,8.99,9.11,9.71]}};
// Master bay window after the owner's reference video (2026-10-20). Sill and wall below it are kept; joinery sits on top.
// Shown in every layout (original, balanced, family): the master bed and bay are the same in all three.
// opening/head/sill from the DWG-derived model; desk, shelf and curtain box are proposed outer dimensions, not site-measured.
export const BAY={opening:{x0:.8,x1:2.8,face:11.45,glass:12.105,sill:.5,head:2.3},desk:{top:.72,thick:.04,niche:[.8,11.45,2.8,12.08],knee:[.8,11.15,1.5,11.45]},stool:{diameter:.32,seat:.45,use:[1.15,10.97],tucked:[1.15,11.29]},shelf:{box:[.12,11.15,.52,11.45],height:2.0,levels:[0,.46,.86,1.26,1.66]},curtain:{box:[.8,11.925,2.8,12.105],bottom:2.3,height:.1,tracks:2,stopAboveDesk:.01}};
export const BAY_BOXES=[BAY.desk.niche,BAY.desk.knee,BAY.shelf.box];
// Slim open side cabinet on the south-bedroom wardrobe's east end (scarves, bags), clear of the south door sweep.
export const SOUTH_SIDE_CABINET={box:[5.5,7.55,5.65,8.15],height:2.76,levels:[.06,.5,.9,1.3,1.7,2.1]};
export const layoutBoxes=id=>[...Object.values(ROOM_FURNITURE[id]),...WARDROBES[id].map(w=>w.box),...BAY_BOXES,...(id==='original'?[SOUTH_SIDE_CABINET.box]:[])];
export const REDESIGN_VIEWS={desk:{pos:[5.7,1.62,8.9],look:[4.6,1.1,7.9]},guest:{pos:[5.7,1.62,11.1],look:[5.3,1.1,9.7]},master:{pos:[2.85,1.62,10.9],look:[1.4,1,9.5]}};
export const NORTH_ROOM={name:'北卧 · 单人房',rect:[3,3.15,5.3,5.85],pos:[4.75,1.62,5.45],look:[3.9,1,3.95],desc:'DWG墙线间约2.30×2.70米，不含凸窗。1.20×2.00米床垫，薄床架1.26×2.08米；西侧1.20×0.60米书桌。床尾0.20米不作通道，东侧进出；尺寸非现场实测。'};
export const OWNER_ROOMS={original:{master:{name:'主卧 · 原床向',x:1.3,z:9.5,pos:[2.54,1.62,8.5],look:[1.1,1.05,9.8],rect:[.1,8.05,3.4,11.45],desc:'床头朝图左，与DWG一致；南窗在床侧。1.8米床两侧约0.65/0.65米，床尾至4.30米长柜约0.52米，仍偏紧；移门不占柜前开门空间。南窗飘窗做成书桌兼梳妆台，只在西头外拉0.30米，1.8米床边到桌沿约0.35米，只够Ø0.32圆凳。'},south:{name:'南卧 · 原床向',x:4.85,z:9.7,pos:[6,1.62,8.6],look:[4.6,1,9.75],rect:[3.5,7.15,6.5,11.45],desc:'1.5米床头朝图左，不面向南阳台；北侧衣柜2.0米，床架至东墙约0.82米，至北柜约0.75米。'}},redesign:{master:{name:'主卧 · 适度加宽',x:1.7,z:9.5,pos:REDESIGN_VIEWS.master.pos,look:REDESIGN_VIEWS.master.look,rect:[.1,8.05,3.95,11.45],desc:'不吞掉整间次卧，只研究干区隔墙东移0.55米；柜前约1.07米，主卧柜共4.20米。原入口、卫1门不动，不另加门厅。移墙尚待专业确认。'},south:{name:'南向电竞书房',x:5.3,z:9.7,pos:REDESIGN_VIEWS.desk.pos,look:REDESIGN_VIEWS.desk.look,rect:[3.5,7.15,6.5,11.45],desc:'2米桌＋ROG笔记本、27寸显示器、夜魔X和鼠标；1.5米展示立柜沿东侧，西侧沙发可作1.9×1.2米客床。展开后柜前约0.68米（含把手）；南阳台及原水点不动。'},north:{name:'北卧 · 收纳学习区',x:4.1,z:4.5,pos:[3.7,1.62,4.7],look:[4.5,1.1,3.4],rect:NORTH_ROOM.rect,desc:'与西侧睡眠区连通，原小北房不再单独塞床。窗前1.4×0.6米书桌；南侧柜分为2.65＋1.20米，共3.85米，不挡北窗。仍通过原北卧门进出，旧儿童房门洞拟轻质封闭。'},child:{name:'北侧宽卧 · 睡眠区',x:1.4,z:3.8,pos:[2.65,1.62,4.7],look:[1.1,1,3.65],rect:[.1,2.5,3,5.85],desc:'按业主转述的专业可拆意见打通两处墙体中段。1.50×2.00米床垫、1.56×2.08米薄床架，床头朝图左；北侧窗下墙前约0.49米、墙端局部0.47米，南侧至柜约0.67米。床尾通向收纳学习区，墙端和上部构件仍保留。'}}};
export const CONCEPT_ROOMS={
 balanced:{
  master:{name:'主卧 · 床尾更开阔',x:1.3,z:9.5,pos:[2.55,1.62,8.55],look:[1.1,1.05,9.8],rect:[.1,8.05,3.4,11.45],desc:'1.8×2米床垫与原床向保留；床尾长柜转移后至原墙1.12米，两侧仍各0.65米。主卧保留1.10米常用衣柜。南窗飘窗做成书桌兼梳妆台，西头外拉0.30米。'},
  child:{name:'北西卧 · 1.5米床',x:1.45,z:4.3,pos:[1.8,1.62,4.9],look:[1.2,1.05,3.6],rect:[.1,2.5,2.8,5.85],desc:'床垫1.50×2.00米，床架2.08×1.56米；南侧1.60米长柜。床尾通常0.60米，墙垛处0.50米，封闭阳台的使用条件须复核。'},
  north:{name:'北东 · 独立衣帽间',x:4.15,z:4.5,pos:[4.15,1.62,4.5],look:[3.25,1.15,4.3],rect:[3,3.15,5.3,5.85],desc:'西柜2.60米＋东柜1.70米，柜间1.10米。由原北卧门进出，隔壁承重墙完整保留。'},
  south:{name:'南侧 · 电竞兼临住',x:5.0,z:9.7,pos:[5.65,1.62,9.2],look:[4.3,1.1,8],rect:[3.5,7.15,6.5,11.45],desc:'2.00×0.70米电脑桌、1.50米藏品柜。日常柜前1.53米；客床展开后约1.18米。第三间仅用于临时留宿。'}
 },
 family:{
  master:{name:'主卧 · 床尾更开阔',x:1.3,z:9.5,pos:[2.55,1.62,8.55],look:[1.1,1.05,9.8],rect:[.1,8.05,3.4,11.45],desc:'1.8×2米床垫与原床向保留；床尾至原墙1.12米，两侧各0.65米。主卧保留1.10米常用衣柜。南窗飘窗做成书桌兼梳妆台，西头外拉0.30米。'},
  child:{name:'北西卧 · 1.5米床',x:1.45,z:4.3,pos:[1.8,1.62,4.9],look:[1.2,1.05,3.6],rect:[.1,2.5,2.8,5.85],desc:'1.50米床与1.60米长柜；墙垛处仍仅0.50米，封闭阳台条件须复核。'},
  north:{name:'小北卧 · 单人房',x:4.2,z:4.5,pos:[4.4,1.62,5.15],look:[4.1,1.1,3.8],rect:[3,3.15,5.3,5.85],desc:'1.20×2.00米床垫，床尾仍只有0.20米缝隙；改用1.20米衣柜，不放书桌。'},
  south:{name:'南侧 · 独立电竞房',x:5.0,z:9.7,pos:[5.05,1.62,9.6],look:[3.8,1.1,8.5],rect:[3.5,7.15,6.5,11.45],desc:'西墙2米电脑桌与1.5米藏品柜，东墙2.60米家庭长柜。椅后至柜约1.07米；三张常住床分别在另外三间房。'}
 },
 central:{
  master:{name:'原主卧 · 1.8米床',x:1.3,z:9.5,pos:[2.7,1.62,8.45],look:[1.15,1.05,9.8],rect:[.1,8.05,3.25,11.45],desc:'1.8×2米床垫，床头仍朝西；床架南北两侧各约0.65米，床尾至条件移后隔墙约0.97米。衣柜集中北东房。隔墙端部和梁须原设计单位确认。'},
  child:{name:'北西卧 · 1.5米床',x:1.45,z:4.3,pos:[1.8,1.62,4.9],look:[1.2,1.05,3.6],rect:[.1,2.5,2.8,5.85],desc:'1.5×2米床垫，独立居住；收藏展示改到南主卧电竞桌上方，不占此房地面。封闭阳台的开口与居住条件需专项核验。'},
  north:{name:'北东 · 集中衣帽间',x:4.15,z:4.5,pos:[4.15,1.62,4.5],look:[3.25,1.15,4.3],rect:[3,3.15,5.3,5.85],desc:'西柜2.60米＋东柜1.70米，柜间1.10米；柜高2.76米含0.50米顶柜，须现场核验梁及风管。全屋衣柜延米仅4.30米，容量需按实际衣量核算。'},
  south:{name:'南侧主卧 · 1.8米床＋L桌',x:5.15,z:9.55,pos:[5.25,1.62,8.52],look:[5.95,1.08,7.36],rect:[3.35,7.15,6.5,11.45],desc:'1.8×2米床垫，床头朝东、南窗在侧。隔墙条件西移15厘米后，床尾约0.97米；L形桌跨度1.80米、两段各0.90米，桌上方浅展示墙。椅背至床约0.51米、南窗侧仍约0.55米，并非四周都有1米。原门洞封口与新门位置待原设计单位复核。'}
 }
};
export function masterBox(layout,width){const p=MASTER_PLACEMENTS[layout];return [p.cx-1.12,p.cz-width/2-.1,p.cx+1.06,p.cz+width/2+.1];}
export function masterClearance(layout,width){const p=MASTER_PLACEMENTS[layout],b=masterBox(layout,width),front=layout==='original'?2.8:3.35;return {foot:front-b[2],sides:[b[1]-8.15,11.45-b[3]],label:'床尾至衣柜前沿',caution:layout==='original'?'床头朝图左，南窗在侧面。床尾约0.52米仍偏紧；1.5米床只增加南北两侧空间，不能增加床尾。长柜4.30米、深0.60米，须实测后选薄床架与柜门系统。':'仅研究干区隔墙东移0.55米，床尾约1.07米；主卧柜4.20米，北侧宽卧另3.85米。未合并南卧，主卧原入口和水点不动。北墙按业主转述专业确认研究打通，南侧移墙另待核验。'};}
