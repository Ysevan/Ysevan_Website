// DWG 480E8D: master door east hinge [2.75,7.1], opens south. All current layouts share it.
export const MASTER_ENTRIES={original:{x:2.3,z:7.1,width:.9,along:'x',swing:-1,mirror:true,openFraction:.5},redesign:{x:2.3,z:7.1,width:.9,along:'x',swing:-1,mirror:true}};
export const REFUGE_ENTRY={x:1.75,z:7.6,width:.8,along:'z',swing:1};
// 04 conditional study: orange-line alignment selected by owner on 2026-10-25.
export const CENTRAL_ENTRY={x:4.1,z:7.1,width:.9,along:'x',swing:-1,mirror:false};
// DWG insert 480E80: east hinge, leaf opens north along the east wall.
export const NORTH_ENTRY={x:4.75,z:5.9,width:.9,along:'x',swing:1,mirror:true};
export const ENTRY_VIEWS={original:{pos:[2.25,1.62,8.5],look:[2.6,1.2,7.45]},balanced:{pos:[2.3,1.62,7.7],look:[2.45,1.1,9.1]},family:{pos:[2.3,1.62,7.7],look:[2.45,1.1,9.1]},central:{pos:[3.85,1.62,9.55],look:[5,1.35,7.1]},redesign:{pos:[2.3,1.62,7.7],look:[2.9,1.15,9.1]}};
export const DOOR_VIEW_DEFAULT='hidden';
// Walk and tour open on hinged leaves half open (owner, 2026-10-21) and sliding leaves stowed; the overviews keep DOOR_VIEW_DEFAULT.
// Hinge angles as fractions of π: doorway() builds every leaf at `open`; setDoorView() turns the hinge to `half` (45°).
// Leaves never take part in walking collisions.
export const DOOR_VIEW_WALK='half';
export const DOOR_OPEN={open:.47,half:.25};
