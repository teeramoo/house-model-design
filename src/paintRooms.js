// Interior regions reconstructed from the existing model's partition coordinates.
// A wall's two broad faces are assigned independently using points just outside it.
export const PAINT_ROOMS = [
 {id:'bath4',label:'Bathroom 4',floor:0,rects:[[0,2.75,2.4,4.2]]},
 {id:'bed4',label:'Bedroom 4',floor:0,nav:'bed4',rects:[[0,4.2,-1,2.4],[2.75,4.2,2.4,4.2]]},
 {id:'office',label:'Office',floor:0,nav:'office',rects:[[4.2,6.8,0,4.2]]},
 {id:'understairs',label:'Under-stair store',floor:0,rects:[[6.8,9.25,1.05,3.2]]},
 {id:'stair0',label:'Stair hall',floor:0,rects:[[6.8,10.6,-.81,3.2]]},
 {id:'kitchen',label:'Kitchen',floor:0,nav:'kitchen',rects:[[10.6,13.7,-1,2.65]]},
 {id:'bath6',label:'Bathroom 6',floor:0,rects:[[13.7,15.8,-1,0]]},
 {id:'store',label:'Service store',floor:0,rects:[[13.7,15.8,0,2.65]]},
 {id:'bath5',label:'Bathroom 5',floor:0,rects:[[13.15,15.8,2.65,4.2]]},
 {id:'service',label:'Service hall',floor:0,rects:[[10.6,13.15,2.65,4.2]]},
 {id:'living',label:'Living & dining',floor:0,nav:'living',rects:[[0,10.6,4.2,8.375],[6.8,10.6,3.2,4.2]]},
 {id:'wash',label:'Rear wash court',floor:0,rects:[[10.6,15.8,-2.6,-1]]},
 {id:'carport',label:'Carport',floor:0,nav:'carport',rects:[[10.6,18,4.2,9.45]]},
 {id:'bath1',label:'Primary bathroom',floor:1,nav:'bath1',rects:[[0,2.95,-1,2.65]]},
 {id:'dressing',label:'Dressing room',floor:1,rects:[[2.95,6.8,0,2.65]]},
 {id:'bed1',label:'Bedroom 1',floor:1,nav:'bed1',rects:[[0,4.2,2.65,8.375]]},
 {id:'bath3',label:'Bathroom 3',floor:1,rects:[[13,15.8,2.6,4.2]]},
 {id:'bath2',label:'Bathroom 2',floor:1,rects:[[13,15.8,4.2,5.8]]},
 {id:'bed3',label:'Bedroom 3',floor:1,nav:'bed3',rects:[[10.6,15.8,-1,2.6],[10.6,13,2.6,3.75]]},
 {id:'bed2',label:'Bedroom 2',floor:1,nav:'bed2',rects:[[10.6,13,3.75,5.8],[10.6,15.8,5.8,9.3]]},
 {id:'stair1',label:'Upper stair hall',floor:1,rects:[[6.8,10.6,-.81,3.2]]},
 {id:'lounge',label:'Family lounge & landing',floor:1,nav:'lounge',rects:[[4.2,6.8,2.65,8.375],[6.8,10.6,3.2,8.375]]},
];
export function roomAt(f,x,z){return PAINT_ROOMS.find(r=>r.floor===f&&r.rects.some(([a,b,c,d])=>x>a-1e-6&&x<b+1e-6&&z>c-1e-6&&z<d+1e-6))?.id||`exterior${f}`;}
export function roomLabel(id){return PAINT_ROOMS.find(r=>r.id===id)?.label||'Exterior';}
export function wallCuts(f,axis,a,b){const i=axis==='x'?0:2;return [...new Set([a,b,...PAINT_ROOMS.filter(r=>r.floor===f).flatMap(r=>r.rects.flatMap(q=>[q[i],q[i+1]])).filter(v=>v>a+.01&&v<b-.01)])].sort((x,y)=>x-y);}
