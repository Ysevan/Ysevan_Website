// V9: redesign placement records below are historical only; layout-policy.js blocks them.
// Metres from DWG; proposed clearances include furniture frames, not site finishes.
export const LAYOUTS={original:{name:'01 原四房优化',program:'三卧，北侧电竞书房',summary:'01主卧仍在左下，1.80×2.00米床垫、床头朝西，薄床架2.10×1.88米，3.30×0.60米深柜，柜前0.60米。原门及把手可开90°。右下南次卧恢复北侧2.00×0.60米横柜，床头朝西。西北沙发床与三面上墙展示、东北书桌保留。',warning:'按屋主要求保留60厘米柜深，门后北端1米柜段撤去，余下3.30米连续柜。柜前0.60米仍偏窄，不是0.80米宽过道。阳台条件及实物尺寸仍需复核。'},balanced:{name:'02 收纳均衡',program:'两卧，南侧电竞兼客房，衣帽间',summary:'北西房1.5米床，北东房为双排衣柜。南侧为电竞与临时留宿。主卧床尾留1.12米，全屋衣柜7.00米。',warning:'北西房墙垛处局部仅0.50米，阳台条件开口和居住用途需核实。第三间仅临时留宿。'},family:{name:'03 三卧电竞',program:'三卧，独立南侧电竞房',summary:'主卧1.8米、北西房1.5米、小北房1.2米床。南侧独立电竞并有2.60米家庭衣柜，全屋衣柜6.50米。',warning:'仍有四间独立房。小北房床尾仅0.20米，北西房墙垛处0.50米。阳台条件开口需核实。'},central:{name:'04 集中收纳加主卧电竞',program:'三卧，南侧主卧电竞，衣帽间',summary:'两张1.80×2.00米床垫，薄床架外廓2.12×1.88米，床尾各1.03米。北墙按橙色原门洞线拉直，左侧门洞0.90米，东墙1.80×0.65米一字桌，椅背朝室内。衣柜集中北东房4.30米，桌上方防尘展示。',warning:'北墙新增向走廊侧拉齐40厘米，15厘米隔墙整段平移拉直，门外墙面间1.10米，均须书面复核。1.03米仅指床尾，南窗侧0.50米（窗帘另扣），不是全屋一米通道。北西阳台条件仍需核验。'},redesign:{name:'旧三房已撤回',program:'北侧承重墙不可拆',summary:'不可选择，旧北侧合并房间方案失效。',warning:'儿童房与北卧之间承重墙不可拆。',available:false}};
export const OWNER_REPLACED_BOXES=[[7.7,7.2,9.4,8.03],[8.33,8.86,9.3,9.9],[2.82,8.2,3.38,11.3],[3.1,3.15,5.18,4.68],[3.19,4.5,3.85,5.6],[3.5,7.35,5.48,7.95],[3.46,9,5.58,10.55]];
// Wardrobes go to the slab (2.76 of 2.78 m) with a separate 0.50 m upper band, after the owner's reference videos (2026-10-20).
export const WARDROBE_FULL={height:2.76,topBand:.5,slab:2.78};
export const WARDROBES={original:[{name:'主卧3.30米深柜（门后留空）',box:[2.8,8.15,3.4,11.45],face:'west',length:3.3,depth:.6,height:2.76,topBand:.5},{name:'南次卧北侧横柜',box:[3.5,7.55,5.5,8.15],face:'south',length:2,depth:.6,height:2.76,topBand:.5}],redesign:[{name:'主卧长柜',box:[3.35,8.55,3.95,11.45],face:'west',length:2.9,depth:.6},{name:'主卧入口柜',box:[2.8,7.15,3.4,8.45],face:'west',length:1.3,depth:.6},{name:'北侧宽卧长柜',box:[.1,5.25,2.75,5.85],face:'north',length:2.65,depth:.6},{name:'北侧宽卧补充柜',box:[3.05,5.25,4.25,5.85],face:'north',length:1.2,depth:.6}]};
export const NORTH_BED={cx:4.06,cz:3.8,width:1.2,length:2,rotation:Math.PI/2,box:[3.02,3.17,5.1,4.43]};
export const NORTH_DESK={box:[3.02,4.50,3.62,5.70],length:1.2,depth:.6,height:.75,chair:[4.01,5.08]};
export const NORTHWEST_BED={cx:1.24,cz:3.8,width:1.5,length:2,rotation:Math.PI/2,box:[.2,3.02,2.28,4.58]};
export const SOUTH_BED={cx:4.62,cz:9.8,width:1.5,rotation:Math.PI/2,box:[3.5,8.95,5.68,10.65]};
export const MASTER_PLACEMENTS={original:{cx:1.15,cz:9.8,width:1.8,rotation:Math.PI/2},redesign:{cx:1.22,cz:9.8,width:1.8,rotation:Math.PI/2}};
export const ROOM_FURNITURE={original:{northBed:NORTH_BED.box,northDesk:NORTH_DESK.box,northChair:[3.77,4.84,4.25,5.32],southBed:SOUTH_BED.box,coffee:[8.39,8.99,9.11,9.71]},redesign:{northwestBed:NORTHWEST_BED.box,northwestDesk:[3.8,3.17,5.2,3.77],coffee:[8.39,8.99,9.11,9.71]}};
// Master bay window after the owner's reference video (2026-10-20). Sill and wall below it are kept; joinery sits on top.
// Shown in every layout (original, balanced, family): the master bed and bay are the same in all three.
// opening/head/sill from the DWG-derived model; desk, shelf and curtain box are proposed outer dimensions, not site-measured.
export const BAY={opening:{x0:.8,x1:2.8,face:11.45,glass:12.105,sill:.5,head:2.3},desk:{top:.72,thick:.04,niche:[.8,11.45,2.8,12.08],knee:[.8,11.15,1.5,11.45]},stool:{diameter:.32,seat:.45,use:[1.15,10.97],tucked:[1.15,11.29]},shelf:{box:[.12,11.15,.52,11.45],height:2.0,levels:[0,.46,.86,1.26,1.66]},curtain:{box:[.8,11.925,2.8,12.105],bottom:2.3,height:.1,tracks:2,stopAboveDesk:.01}};
export const BAY_BOXES=[BAY.desk.niche,BAY.desk.knee,BAY.shelf.box];
// Slim open side cabinet on the south-bedroom wardrobe's east end (scarves, bags), clear of the south door sweep.
export const SOUTH_SIDE_CABINET={box:[5.5,7.55,5.65,8.15],height:2.76,levels:[.06,.5,.9,1.3,1.7,2.1]};
// Owner-only bedroom decor per layout (2026-10-21); [x0,z0,x1,z1,y0,y1] in metres. Wall pieces sit on the main bed's headboard wall, centred on the bed:
// the 8 mm timber wainscot behind the headboard and above the bed plinth (which runs to the wall), the art above it (cut with the walls above 1.28 m). The rug runs under a bed foot only, clear of desks, chairs, cabinets and door sweeps.
// C (central, v13) puts the main bed in the south room with its head on the east wall, so the wall pieces face west there and the rug runs under its west foot.
// `also`: further headboard walls in the same layout (C keeps a second 1.8 m bed in the former master, 2026-10-22).
const MASTER_WALL={bed:'master',room:'master',head:'west',wainscot:[.1,8.54,.108,11.06,.32,1.17],art:[.1,9.3,.158,10.3,1.32,1.98]};
export const ROOM_DECOR={original:{...MASTER_WALL,rug:{room:'south',box:[4.25,9.05,6.2,11.05],color:'#c6c6af'}},balanced:{...MASTER_WALL,rug:{room:'south',box:[4.94,9.25,5.94,11.25],color:'#c6c6af'}},family:{...MASTER_WALL,rug:{room:'south',box:[4.35,9.05,5.75,11.15],color:'#c6c6af'}},central:{bed:'southMaster',room:'south',head:'east',wainscot:[6.492,8.75,6.5,11.27,.32,1.17],art:[6.442,9.51,6.5,10.51,1.32,1.98],rug:{room:'south',box:[3.6,8.7,5.8,11.1],color:'#c6c6af'},also:[{...MASTER_WALL,bed:'formerMaster'}]}};
export const layoutBoxes=id=>[...Object.values(ROOM_FURNITURE[id]),...WARDROBES[id].map(w=>w.box),...(id==='original'?[BAY.desk.niche]:BAY_BOXES)];
export const REDESIGN_VIEWS={desk:{pos:[5.7,1.62,8.9],look:[4.6,1.1,7.9]},guest:{pos:[5.7,1.62,11.1],look:[5.3,1.1,9.7]},master:{pos:[2.85,1.62,10.9],look:[1.4,1,9.5]}};
export const NORTH_ROOM={name:'北卧',rect:[3,3.15,5.3,5.85],pos:[4.75,1.62,5.45],look:[3.9,1,3.95],desc:'单人房。DWG 墙线间约2.30×2.70米，不含凸窗。1.20×2.00米床垫，薄床架1.26×2.08米。西侧1.20×0.60米写字桌，不设衣柜。桌前椅后到东墙1.05米。床尾0.20米只是缝隙，从床南侧进出。尺寸不是现场实测。'};
export const OWNER_ROOMS={original:{master:{name:'左下主卧',x:1.3,z:9.5,pos:[2.54,1.62,8.5],look:[1.1,1.05,9.8],rect:[.1,8.05,3.4,11.45],desc:'1.80×2.00米床垫不缩，薄床架2.10×1.88米，床头朝西。原4.30米柜撤去门后北端1米，保留3.30×0.60米连续深柜。柜前0.60米，南北两侧各0.71米。原门轴不变，门扇和把手按0至90°复核。少了1米柜段，保留普通柜深，柜前0.60米仍偏窄。飘窗不外挑。'},south:{name:'南次卧',x:5.4,z:9.7,pos:[6.05,1.62,8.7],look:[4.5,1,9.8],rect:[3.5,7.15,6.5,11.45],desc:'恢复原图的床头朝西和北侧横柜。1.50×2.00米床垫，床架2.18×1.70米。北侧2.00×0.60米横柜，柜前0.80米，床尾0.82米，南侧0.80米。这间不是主卧，不再沿两房共墙做纵向柜。'}},redesign:{master:{name:'主卧',x:1.7,z:9.5,pos:REDESIGN_VIEWS.master.pos,look:REDESIGN_VIEWS.master.look,rect:[.1,8.05,3.95,11.45],desc:'适度加宽，不吞掉整间次卧，只研究干区隔墙东移0.55米。柜前约1.07米，主卧柜共4.20米。原入口、卫1门不动，不另加门厅。移墙尚待专业确认。'},south:{name:'南向电竞书房',x:5.3,z:9.7,pos:REDESIGN_VIEWS.desk.pos,look:REDESIGN_VIEWS.desk.look,rect:[3.5,7.15,6.5,11.45],desc:'2米桌配ROG笔记本、27寸显示器、夜魔X和鼠标。1.5米展示立柜沿东侧，西侧沙发可作1.9×1.2米客床。展开后柜前约0.68米（含把手）。南阳台不动。'},north:{name:'北卧收纳学习区',x:4.1,z:4.5,pos:[3.7,1.62,4.7],look:[4.5,1.1,3.4],rect:NORTH_ROOM.rect,desc:'与西侧睡眠区连通，原小北房不再单独塞床。窗前1.4×0.6米书桌。南侧柜分成2.65米和1.20米两段，共3.85米，不挡北窗。仍从原北卧门进出，旧儿童房门洞拟轻质封闭。'},child:{name:'北侧宽卧',x:1.4,z:3.8,pos:[2.65,1.62,4.7],look:[1.1,1,3.65],rect:[.1,2.5,3,5.85],desc:'睡眠区。按业主转述的专业可拆意见打通两处墙体中段。1.50×2.00米床垫，1.56×2.08米薄床架，床头朝图左。北侧窗下墙前约0.49米，墙端局部0.47米，南侧到柜约0.67米。床尾通向收纳学习区，墙端和上部构件仍保留。'}}};
export const CONCEPT_ROOMS={
 balanced:{
  master:{name:'主卧',x:1.3,z:9.5,pos:[2.55,1.62,8.55],look:[1.1,1.05,9.8],rect:[.1,8.05,3.4,11.45],desc:'1.8×2米床垫和原床向保留。床尾长柜移走后，床尾到原墙1.12米，两侧仍各0.65米。主卧保留1.10米常用衣柜。南窗飘窗做成书桌兼梳妆台，西头外拉0.30米。'},
  child:{name:'北西卧',x:1.45,z:4.3,pos:[1.8,1.62,4.9],look:[1.2,1.05,3.6],rect:[.1,2.5,2.8,5.85],desc:'床垫1.50×2.00米，床架2.08×1.56米，南侧1.60米长柜。床尾通常0.60米，墙垛处0.50米，封闭阳台的使用条件要复核。'},
  north:{name:'衣帽间',x:4.15,z:4.5,pos:[4.15,1.62,4.5],look:[3.25,1.15,4.3],rect:[3,3.15,5.3,5.85],desc:'北东独立衣帽间，西柜2.60米，东柜1.70米，柜间1.10米。从原北卧门进出，隔壁承重墙完整保留。'},
  south:{name:'电竞客房',x:5.0,z:9.7,pos:[5.65,1.62,9.2],look:[4.3,1.1,8],rect:[3.5,7.15,6.5,11.45],desc:'南侧房间，电竞兼临时留宿。2.00×0.70米电脑桌、1.50米藏品柜。日常柜前1.53米，客床展开后约1.18米。第三间只用于临时留宿。'}
 },
 family:{
  master:{name:'主卧',x:1.3,z:9.5,pos:[2.55,1.62,8.55],look:[1.1,1.05,9.8],rect:[.1,8.05,3.4,11.45],desc:'1.8×2米床垫和原床向保留。床尾到原墙1.12米，两侧各0.65米。主卧保留1.10米常用衣柜。南窗飘窗做成书桌兼梳妆台，西头外拉0.30米。'},
  child:{name:'北西卧',x:1.45,z:4.3,pos:[1.8,1.62,4.9],look:[1.2,1.05,3.6],rect:[.1,2.5,2.8,5.85],desc:'1.50米床和1.60米长柜，墙垛处仍只有0.50米，封闭阳台条件要复核。'},
  north:{name:'小北卧',x:4.2,z:4.5,pos:[4.4,1.62,5.15],look:[4.1,1.1,3.8],rect:[3,3.15,5.3,5.85],desc:'单人房。1.20×2.00米床垫，床尾仍只有0.20米缝隙，改用1.20米衣柜，不放书桌。'},
  south:{name:'电竞房',x:5.0,z:9.7,pos:[5.05,1.62,9.6],look:[3.8,1.1,8.5],rect:[3.5,7.15,6.5,11.45],desc:'南侧独立电竞房。西墙2米电脑桌和1.5米藏品柜，东墙2.60米家庭长柜。椅后到柜约1.07米，三张常住床分别在另外三间房。'}
 },
 central:{
  master:{name:'原主卧',x:1.3,z:9.5,pos:[2.7,1.62,8.45],look:[1.15,1.05,9.8],rect:[.1,8.05,3.25,11.45],desc:'1.8×2米床垫，床头仍朝西，床架外廓2.12×1.88米。南北两侧各0.71米，床尾到条件隔墙1.03米。衣柜集中在北东房。隔墙全长拉直，端部和梁仍要原设计单位确认。'},
  child:{name:'北西卧',x:1.45,z:4.3,pos:[1.8,1.62,4.9],look:[1.2,1.05,3.6],rect:[.1,2.5,2.8,5.85],desc:'1.5×2米床垫，独立居住。收藏展示改到南主卧电竞桌上方，不占这间的地面。封闭阳台的开口和居住条件要专项核验。'},
  north:{name:'衣帽间',x:4.15,z:4.5,pos:[4.15,1.62,4.5],look:[3.25,1.15,4.3],rect:[3,3.15,5.3,5.85],desc:'北东集中衣帽间，西柜2.60米，东柜1.70米，柜间1.10米。柜高2.76米含0.50米顶柜，要现场核对梁和风管。全屋衣柜只有4.30延米，容量要按实际衣量核算。'},
  south:{name:'南侧主卧',x:5.15,z:9.55,pos:[4.75,1.62,8.25],look:[6.25,1.1,8.10],rect:[3.35,7.15,6.5,11.45],desc:'1.80×2.00米床垫，薄床架2.12×1.88米，床头朝东。床尾1.03米，南窗侧0.50米（窗帘另扣）。东墙1.80×0.65米一字桌，上方1.72米防尘展示柜。椅背朝室内，到西侧隔墙截面1.87米。床与椅侧纵向间隔0.67米。北墙沿原封门线拉直，门位在左侧，门外墙面间1.10米。北墙和两南卧间隔墙都是直线，隔墙全长平移15厘米，待书面复核。'}
 }
};
export function masterBox(layout,width){const p=MASTER_PLACEMENTS[layout];return layout==='original'?[p.cx-1.05,p.cz-width/2-.04,p.cx+1.05,p.cz+width/2+.04]:[p.cx-1.12,p.cz-width/2-.1,p.cx+1.06,p.cz+width/2+.1];}
export function masterClearance(layout,width){const p=MASTER_PLACEMENTS[layout],b=masterBox(layout,width),front=layout==='original'?WARDROBES.original[0].box[0]:3.35;return {foot:front-b[2],sides:[b[1]-8.15,11.45-b[3]],label:layout==='original'?'床尾至整排衣柜':'床尾至衣柜前沿',caution:layout==='original'?'左下主卧保持床头朝西。床垫1.80×2.00米，薄床架2.10×1.88米。保留60厘米柜深，撤去门后北端1米柜段，余3.30米连续柜。柜前0.60米仍偏窄，两侧各0.71米。柜前比旧版0.52米多8厘米，不能标成0.80米。原门和把手可开到90°，门后不设柜。以上是图上数值，现场要复尺':'只研究干区隔墙东移0.55米，床尾约1.07米。主卧柜4.20米，北侧宽卧另有3.85米。没有合并南卧，主卧原入口不动。北墙按业主转述的专业意见研究打通，南侧移墙另待核验'};}

export const bayBoxesForLayout=id=>['original','central'].includes(id)?[BAY.desk.niche]:BAY_BOXES;
