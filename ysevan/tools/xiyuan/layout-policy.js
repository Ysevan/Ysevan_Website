// Latest owner constraint supersedes the earlier reported demolition clearance.
// Keep this gate shared by stored designs, imported designs, UI and scene selection.
export const LAYOUT_POLICY = Object.freeze({revision:'11-wall-preserving-3d',date:'2026-10-20',northWallLocked:true,available:['original','balanced','family'],withdrawn:['redesign']});
export const WITHDRAWAL_NOTICE='儿童房与北卧间承重墙锁定保留；依赖打通的旧三房方案已撤回。旧三房存档仅保留搭配，自动退回四房。';
export const isLayoutAvailable=id=>LAYOUT_POLICY.available.includes(id);
export const resolveLayout=id=>isLayoutAvailable(id)?id:'original';
