import * as T from 'three';
import {box,mat,polygon,surface,beam,texture} from './geometry';
import {furnish} from './interiors';
import {PaintRegistry} from './paint';
import {wallCuts} from './paintRooms';

export function buildHouse(){
 const root=new T.Group();root.name='Supharat_T_R_from_A01_A07_metres';root.userData={source:'แบบบ้าน ศุภราช (T) EX.pdf, pages 2–8',units:'metres',groundFloor:.6,upperFloor:4,roofRidge:9.2,notice:'Architectural visualization reconstructed from raster drawings. Wall thickness, concealed details and finishes are approximate.'};
 const groups={site:new T.Group(),ground:new T.Group(),upper:new T.Group(),roof:new T.Group(),stairs:new T.Group(),ceiling0:new T.Group(),ceiling1:new T.Group(),furniture0:new T.Group(),furniture1:new T.Group()};Object.entries(groups).forEach(([k,g])=>{g.name=k;root.add(g);});
 const tile=texture('tile');tile.repeat.set(1,1);const rooftex=texture('roof');const woodtex=texture('wood');woodtex.repeat.set(2,1);const stone=texture('stone');stone.repeat.set(1,3);
 const M={wall:mat('#f3f0e8'),trim:mat('#fbfaf4'),base:mat('#ccc9bf'),floor:mat('#fffaf1',.45,{map:tile}),wood:mat('#cdb38c',.6,{map:woodtex}),darkwood:mat('#685541',.65),metal:mat('#4b4940',.35,{metalness:.55}),glass:mat('#a5c4ce',.15,{transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false}),roof:mat('#929898',.85,{map:rooftex,side:T.DoubleSide}),stone:mat('#c2b9ab',.9,{map:stone}),paving:mat('#c2c1b9'),ground:mat('#d9d9ce'),green:mat('#71816b'),white:mat('#faf9f1'),black:mat('#262b2a')};
 const paintRegistry=new PaintRegistry();
 const walls=[],doors=[];const unitHeight=[3.15,3.2];
 function slab(g,x0,x1,z0,z1,y,m=M.floor,t=.18,name='Floor slab'){let o=box(g,name,(x0+x1)/2,y-t/2,(z0+z1)/2,x1-x0,t,z1-z0,m);if(m===M.floor){const uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)*(x1-x0)/.6,uv.getY(i)*(z1-z0)/.6);}}return o;}
 function wall(f,axis,fixed,a,b,openings=[],options={}){const g=f?groups.upper:groups.ground;const y=f?4:.6;const height=options.h||unitHeight[f],th=options.t||.16,m=options.m||M.wall;
 const sorted=[...openings].sort((a,b)=>a.c-b.c);let from=a;
 const key=`wall:${f}:${axis}:${fixed}:${a}:${b}`;
 const segment=(l,r,bottom,top)=>{if(r-l<.005||top-bottom<.005)return;const cuts=wallCuts(f,axis,l,r);
 for(let i=0;i<cuts.length-1;i++){const left=cuts[i],right=cuts[i+1],middle=(left+right)/2;let x=axis==='x'?middle:fixed,z=axis==='x'?fixed:middle,w=axis==='x'?right-left:th,d=axis==='x'?th:right-left;const o=box(g,options.name||'Plastered wall',x,y+(top+bottom)/2,z,w,top-bottom,d,m);
 if(m===M.wall){o.userData.railOpenings={axis,fixed,openings};paintRegistry.wall(o,{key,floor:f,axis,fixed,middle,thickness:th},m);}
 walls.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y+bottom,y1:y+top,f,axis});if(bottom===0)box(g,'Skirting',x,y+.065,z,w+.012,.13,d+.012,M.base);}};
 for(const op of sorted){const left=op.c-op.w/2,right=op.c+op.w/2;segment(from,left,0,height);segment(left,right,0,op.s||0);segment(left,right,(op.s||0)+op.h,height);const og=new T.Group();og.position.set(axis==='x'?op.c:fixed,y+(op.s||0),axis==='x'?fixed:op.c);if(axis==='z')og.rotation.y=Math.PI/2;g.add(og);
 const t=.055;box(og,'Opening frame left',-op.w/2+t/2,op.h/2,0,t,op.h,.21,M.metal);box(og,'Opening frame right',op.w/2-t/2,op.h/2,0,t,op.h,.21,M.metal);box(og,'Opening frame head',0,op.h-t/2,0,op.w,t,.21,M.metal);
 if(op.type==='door'){
 // Door leaves are shown open, so the doorway remains traversable.
 const count=op.w>1.5?2:1, leafWidth=op.w/count-.06;
 for(let leafIndex=0;leafIndex<count;leafIndex++){let leaf=new T.Group();const side=leafIndex===0?1:-1;leaf.position.x=side<0?op.w/2-t:-op.w/2+t;leaf.rotation.y=side*-Math.PI*.48;og.add(leaf);const material=op.glass?M.glass:M.darkwood;box(leaf,'Open door leaf',side*leafWidth/2,op.h/2,0,leafWidth,op.h-.05,.045,material);for(const yy of [.1,op.h-.1])box(leaf,'Door rail',side*leafWidth/2,yy,0,leafWidth,.07,.06,M.metal);box(leaf,'Door stile',side*leafWidth,op.h/2,0,.06,op.h-.05,.065,M.metal);box(leaf,'Door handle',side*(leafWidth-.12),1.05,.07,.035,.24,.055,M.metal);}
 doors.push({f,axis,fixed,c:op.c,w:op.w});
 }else{
 walls.push({x0:axis==='x'?left:fixed-.04,x1:axis==='x'?right:fixed+.04,z0:axis==='x'?fixed-.04:left,z1:axis==='x'?fixed+.04:right,y0:y+(op.s||0),y1:y+(op.s||0)+op.h,f,glazing:true});
 box(og,'Glazing',0,op.h/2,0,op.w-.10,op.h-.10,.025,M.glass);box(og,'Window sill',0,0,0,op.w+.16,.07,.3,M.trim);const n=op.n||Math.max(2,Math.round(op.w/.7));for(let j=1;j<n;j++)box(og,'Window mullion',-op.w/2+j*op.w/n,op.h/2,0,.045,op.h,.075,M.metal);if(op.h>1.7)box(og,'Window transom',0,.46,0,op.w,.045,.075,M.metal);
 // Slightly raised surrounds on both faces of the wall.
 for(const zz of [-.125,.125]){box(og,'Window surround',0,op.h+.08,zz,op.w+.3,.12,.08,M.trim);for(const xx of [-op.w/2-.09,op.w/2+.09])box(og,'Window surround',xx,op.h/2,zz,.12,op.h+.25,.08,M.trim);}}
 from=right;}
 segment(from,b,0,height);
 }
 const W=(c,w,s=.9,h=1.5,n)=>({c,w,s,h,n,type:'window'}),D=(c,w=.9,h=2.25,glass=false)=>({c,w,h,type:'door',glass});
 // Site, finished levels and service court.
 slab(groups.site,-3.2,21,-4.4,15.1,.025,M.ground,.16,'Illustrative site base');
 slab(groups.site,10.7,17.8,4.2,12.3,.2,M.paving,.18,'Carport +0.20m');
 slab(groups.site,10.6,15.8,-2.6,-1,.5,M.paving,.12,'Rear wash court +0.50m');
 for(let x=4;x<11;x+=1.5)slab(groups.site,x,x+1.2,11.25,12.45,.30,M.paving,.12,'1.20m stepping slab');
 slab(groups.ground,0,10.6,0,8.375,.6);slab(groups.ground,0,4.2,-1,0,.6);slab(groups.ground,10.6,15.8,-1,4.2,.6);
 slab(groups.ground,4.0,7.2,8.375,10.7,.5,M.paving);for(let i=0;i<3;i++)slab(groups.site,4.12,7.08,10.7+i*.30,11.6,.35-i*.15,M.paving,.14,'Entry step');
 // Ground floor exterior; the street/front is +Z.
 wall(0,'x',8.375,0,10.6,[W(2.15,2.65,.15,2.3,3),D(5.5,2.4,2.8,true),W(8.55,2.65,.15,2.3,3)]);
 wall(0,'z',0,-1,8.375,[W(.75,1.8,.9,1.5),W(3.15,.7,1.7,.65),W(6.2,2.8,.15,2.3,3)]);
 wall(0,'x',-1,0,4.2,[W(2.25,2.2,1.05,1.4)]);wall(0,'z',4.2,-1,0);
 wall(0,'x',0,4.2,6.8,[W(5.3,1.1,1,1.4)]);
 wall(0,'x',-1,10.6,15.8,[W(11.1,.65,1.1,1.2),D(11.85,.9),W(13.0,.65,1.1,1.2),D(14.8,.85)]);wall(0,'z',10.6,-1,0);
 wall(0,'z',15.8,-1,4.2,[D(.7,.78),W(1.85,.65,1.0,1.3),W(3.4,.6,1.8,.6)]);
 wall(0,'x',4.2,10.6,15.8,[D(11.45,1,2.25)]);wall(0,'z',10.6,4.2,8.375,[W(6.3,2.3,.25,2.4)]);
 // Bedroom 4, en-suite and office. Office opens to hall.
 wall(0,'z',4.2,0,4.2,[D(3.4,.9)]);wall(0,'x',4.2,0,4.2);
 wall(0,'x',2.4,0,2.75,[D(2.12,.8)]);wall(0,'z',2.75,2.4,4.2);
 // Kitchen, store, powder bathroom, rear bathroom / wash area.
 wall(0,'z',10.6,0,3.2,[D(2.88,.65)]);wall(0,'x',2.65,10.6,13.7,[D(12.0,.9)]);
 wall(0,'z',13.7,-1,2.65);wall(0,'x',2.65,13.7,15.8);
 wall(0,'x',2.65,13.15,13.7);wall(0,'z',13.15,2.65,4.2,[D(3.22,.8)]);
 wall(0,'x',0,13.7,15.8);wall(0,'z',13.7,-2.6,-1,[D(-1.75,.85)]);wall(0,'x',-2.6,10.6,15.8,[],{h:1.0});
 // Under-stair store, door from office.
 wall(0,'z',6.8,1.05,3.2,[D(1.65,.8,1.95)]);wall(0,'x',3.2,6.8,9.25,[],{h:2.15});
 // Upper slab has an actual stair opening and the rear recess.
 slab(groups.upper,0,6.8,0,8.375,4);slab(groups.upper,0,4.2,-1,0,4);slab(groups.upper,6.8,10.6,3.2,8.375,4);slab(groups.upper,10.6,15.8,-1,9.3,4);
 slab(groups.upper,.75,3.25,8.375,9.25,3.9,M.paving);slab(groups.upper,4,7.2,8.375,10.7,3.9,M.paving);
 // Upper external envelope.
 wall(1,'x',8.375,0,10.6,[D(2.0,2.15,2.4,true),D(5.5,2.4,2.6,true),W(8.65,2.4,.25,2.15,3)]);
 wall(1,'z',0,-1,8.375,[W(-.25,.55,1.75,.7),W(4.1,1.7,1,1.4),W(6.6,1.0,.9,1.6)]);
 wall(1,'x',-1,0,4.2,[W(2.0,1.25,1.8,.65),W(3.7,.55,1.8,.65)]);wall(1,'z',4.2,-1,0);wall(1,'x',0,4.2,6.8,[W(5.4,1.15,1.1,1.3)]);
 wall(1,'x',-1,10.6,15.8,[W(12.9,2.1,1.05,1.4)]);wall(1,'z',10.6,-1,0);
 wall(1,'z',15.8,-1,9.3,[W(.6,1.9,1.1,1.35),W(3.35,1.0,1.85,.6),W(5.05,1.,1.85,.6),W(7.25,.85,.75,1.65)]);
 wall(1,'x',9.3,10.6,15.8,[W(13,1.6,.65,1.65),W(15.35,.55,.65,1.65)]);wall(1,'z',10.6,8.375,9.3);
 // Primary bedroom, dressing, and bathroom 1.
 wall(1,'z',4.2,2.65,8.375,[D(3.4,.9)]);
 // A-02: dressing access is the open 1.25 m passage inside Bedroom 1.
 wall(1,'x',2.65,0,2.95);wall(1,'x',2.65,4.2,6.8);
 wall(1,'z',2.95,-1,2.65,[D(1.9,.85)]);wall(1,'z',6.8,0,2.65);
 // Right bedrooms and their bathrooms.
 wall(1,'z',10.6,0,8.375,[D(3.1,.9),D(4.7,.95)]);
 // Bedroom divider is 0.45 m behind grid B; bathroom divider stays on B.
 wall(1,'x',3.75,10.6,13);wall(1,'x',4.2,13,15.8);
 wall(1,'x',2.6,13,15.8);wall(1,'z',13,2.6,4.2,[D(3.15,.8)]);
 wall(1,'x',5.8,13,15.8);wall(1,'z',13,4.2,5.8,[D(5.25,.8)]);
 // Curved staircase enclosure, matching the semicircular rear bay.
 const cx=8.7,cz=1.05,outer=1.85;
 for(let i=0;i<20;i++){let a=-Math.PI*i/20,b=-Math.PI*(i+1)/20;let x1=cx+outer*Math.cos(a),z1=cz+outer*Math.sin(a),x2=cx+outer*Math.cos(b),z2=cz+outer*Math.sin(b);let len=Math.hypot(x2-x1,z2-z1);const g=groups.stairs;const angle=-Math.atan2(z2-z1,x2-x1);for(const [bottom,top,material] of [[.6,1.5,M.wall],[1.5,6.6,M.glass],[6.6,7.2,M.wall]]){let o=box(g,'Curved stair bay',(x1+x2)/2,(bottom+top)/2,(z1+z2)/2,len+.015,top-bottom,.13,material);o.rotation.y=angle;if(material===M.wall)paintRegistry.curved(o,bottom>4?1:0,M.wall);}
 beam(g,'Stair bay mullion',[x1,1.5,z1],[x1,6.6,z1],.035,M.metal);for(let y=2.4;y<6.7;y+=1.4)beam(g,'Stair bay transom',[x1,y,z1],[x2,y,z2],.027,M.metal);
 walls.push({x0:Math.min(x1,x2)-.07,x1:Math.max(x1,x2)+.07,z0:Math.min(z1,z2)-.07,z1:Math.max(z1,z2)+.07,y0:.6,y1:7.2});}
 // 20 risers: 6 straight, 8 winders, 6 straight. 3.40 m total rise.
 const path=[],n=20;for(let i=0;i<=n;i++){let x,z;if(i<=6){x=9.95;z=3.2-i*2.15/6;}else if(i<=14){const a=-(i-6)*Math.PI/8;x=cx+1.25*Math.cos(a);z=cz+1.25*Math.sin(a);}else{x=7.45;z=1.05+(i-14)*2.15/6;}path.push({x,z,y:.6+3.4*i/n});}
 for(let i=0;i<n;i++){let p=path[i],q=path[i+1],verts;if(i>=6&&i<14){const a=-(i-6)*Math.PI/8,b=-(i-5)*Math.PI/8;verts=[[cx+1.85*Math.cos(a),cz+1.85*Math.sin(a)],[cx+1.85*Math.cos(b),cz+1.85*Math.sin(b)],[cx+.65*Math.cos(b),cz+.65*Math.sin(b)],[cx+.65*Math.cos(a),cz+.65*Math.sin(a)]];}else verts=[[p.x-.6,Math.min(p.z,q.z)],[p.x+.6,Math.min(p.z,q.z)],[p.x+.6,Math.max(p.z,q.z)],[p.x-.6,Math.max(p.z,q.z)]];polygon(groups.stairs,'Stair tread '+(i+1),verts,q.y,.16,M.wood);
 const dx=q.x-p.x,dz=q.z-p.z,len=Math.hypot(dx,dz);const sx=-dz/len*.59,sz=dx/len*.59;
 for(const side of [1,-1]){let a=[p.x+sx*side,p.y+1,p.z+sz*side],b=[q.x+sx*side,q.y+1,q.z+sz*side];beam(groups.stairs,'Stair handrail',a,b,.035,M.darkwood);beam(groups.stairs,'Stair baluster',[a[0],p.y,a[2]],a,.017,M.metal);}}
 // Upper landing guard, around the central well.
 rail(groups.upper,8.08,3.2,9.28,3.2,4,M);rail(groups.upper,8.08,1.25,8.08,3.2,4,M);rail(groups.upper,9.28,1.25,9.28,3.2,4,M);
 // Ceiling slabs, hidden in floor cutaways.
 slab(groups.ceiling0,0,6.8,0,8.375,3.78,M.trim,.08);slab(groups.ceiling0,0,4.2,-1,0,3.78,M.trim,.08);slab(groups.ceiling0,6.8,10.6,3.2,8.375,3.78,M.trim,.08);slab(groups.ceiling0,10.6,15.8,-1,4.2,3.78,M.trim,.08);
 slab(groups.ceiling1,0,6.8,0,8.375,7.12,M.trim,.08);slab(groups.ceiling1,0,4.2,-1,0,7.12,M.trim,.08);slab(groups.ceiling1,6.8,10.6,3.2,8.375,7.12,M.trim,.08);slab(groups.ceiling1,10.6,15.8,-1,9.3,7.12,M.trim,.08);
 // Exterior floor bands, entry columns, balconies and carport edge beam.
 for(const [y,h] of [[.54,.18],[3.85,.2],[7.08,.16]]){box(groups[y<3? 'ground':'upper'],'Front horizontal cornice',5.3,y,8.39,10.85,h,.28,M.trim);box(groups[y<3?'ground':'upper'],'Left cornice',-.03,y,3.7,.25,h,9.5,M.trim);}
 for(const x of [3.9,7.15]){box(groups.ground,'Stone entrance pier',x,2.15,10.45,.47,4.3,.48,M.stone);box(groups.upper,'Portico column',x,5.5,10.45,.32,3,.32,M.trim);box(groups.ground,'Pier foot',x,.30,10.45,.60,.60,.60,M.base);box(groups.ground,'Pier coping',x,3.15,10.45,.59,.14,.6,M.trim);box(groups.ground,'Wall lamp',x,2.85,10.72,.16,.36,.10,M.metal);box(groups.ground,'Lamp diffuser',x,2.85,10.78,.09,.24,.035,mat('#ffe6b0',.3,{emissive:'#ffd997',emissiveIntensity:.6}));}
 rail(groups.upper,4.1,10.6,7,10.6,3.9,M);rail(groups.upper,4.1,8.5,4.1,10.6,3.9,M);rail(groups.upper,7,8.5,7,10.6,3.9,M);
 rail(groups.upper,.8,9.23,3.25,9.23,3.9,M);rail(groups.upper,.8,8.4,.8,9.23,3.9,M);rail(groups.upper,3.25,8.4,3.25,9.23,3.9,M);
 box(groups.ground,'Carport front beam',14.25,3.62,9.3,7.45,.3,.25,M.trim);box(groups.ground,'Carport outer post',17.8,1.93,9.3,.28,3.46,.28,M.wall);box(groups.ground,'Carport outer side beam',17.8,3.62,6.75,.26,.3,5.35,M.trim);slab(groups.ground,15.8,17.95,4.2,9.45,3.78,M.paving,.15,'Carport side flat roof');
 box(groups.upper,'Right facade cornice',13.2,4.02,9.32,5.5,.22,.3,M.trim);for(let x=10.9;x<15.6;x+=.60)box(groups.upper,'Facade vertical reveal',x,5.55,9.389,.012,2.80,.01,M.base);
 // Hipped tile roof: 25 degree slope, ridge at +9.20. Drawing A-03.
 const x0=-1.2,x1=17,z0=-1.2,z1=9.60,r0=4.2,r1=11.6,rz=4.2,ey=9.2-5.4*Math.tan(25*Math.PI/180),ry=9.2;
 const a=[x0,ey,z0],b=[x1,ey,z0],c=[x1,ey,z1],d=[x0,ey,z1],e=[r0,ry,rz],f=[r1,ry,rz];
 for(const [name,v] of [['Rear roof',[a,e,f,b]],['Front roof',[d,c,f,e]],['Left hip',[a,d,e]],['Right hip',[b,f,c]]])surface(groups.roof,name,v,M.roof);
 for(const [p,q] of [[a,b],[b,c],[c,d],[d,a]])beam(groups.roof,'Eaves fascia',p,q,.07,M.trim);
 for(const [p,q] of [[a,e],[d,e],[b,f],[c,f],[e,f]])beam(groups.roof,'Roof ridge cap',p,q,.075,M.roof);
 // Horizontal tile courses follow each roof plane.
 for(let i=1;i<19;i++){const t=i/19,y=ey+(ry-ey)*t+.009;for(const side of [-1,1]){const z=side<0?z0+(rz-z0)*t:z1+(rz-z1)*t;beam(groups.roof,'Tile course',[x0+(r0-x0)*t,y,z],[x1+(r1-x1)*t,y,z],.010,M.metal);}}
 // Small hipped portico roof integrated into the main front slope.
 const pa=[3.2,ey,11.60],pb=[7.8,ey,11.60],pc=[7.8,ey,9.0],pd=[3.2,ey,9.0],pe=[5.5,ey+1.08,9.3],pf=[5.5,ey+1.08,10.1];
 surface(groups.roof,'Portico left roof',[pa,pd,pe,pf],M.roof);surface(groups.roof,'Portico right roof',[pb,pf,pe,pc],M.roof);surface(groups.roof,'Portico front hip',[pa,pf,pb],M.roof);for(const [p,q]of[[pa,pf],[pf,pb],[pe,pf]])beam(groups.roof,'Portico ridge cap',p,q,.065,M.roof);beam(groups.roof,'Portico fascia',pa,pb,.065,M.trim);
 // Trim the upper envelope to the sloping eaves, including the projected right bedroom.
 root.updateMatrixWorld(true);
 const world=new T.Vector3(),local=new T.Vector3();
 for(const gg of [groups.upper,groups.ceiling1])gg.traverse(o=>{if(!o.isMesh)return;const inv=o.matrixWorld.clone().invert(),pos=o.geometry.attributes.position;
 for(let i=0;i<pos.count;i++){world.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);let cap=9.2-Math.tan(25*Math.PI/180)*Math.max(Math.abs(world.z-4.2),4.2-world.x,world.x-11.6)-.025;
 if(world.x>3.2&&world.x<7.8&&world.z>8.8)cap=Math.max(cap,ey+1.08-Math.max(Math.abs(world.x-5.5)/2.3,Math.max(0,world.z-10.1)/1.5)*1.08-.025);
 if(world.y>cap&&world.y>6.6){world.y=cap;local.copy(world).applyMatrix4(inv);pos.setXYZ(i,local.x,local.y,local.z);}}
 pos.needsUpdate=true;o.geometry.computeVertexNormals();});
 furnish(groups,M);
 for(const f of [0,1]){const cap=new T.Group();cap.name='Section caps';groups['caps'+f]=cap;root.add(cap);cap.visible=false;const y=(f?4:.6)+1.14;for(const w of walls){if(!w.glazing&&w.y0<y&&w.y1>y)box(cap,'Wall section', (w.x0+w.x1)/2,y,(w.z0+w.z1)/2,w.x1-w.x0,.015,w.z1-w.z0,M.base);}}
 root.updateMatrixWorld(true);
 return {root,groups,walls,doors,stairPath:path,materials:M,slab,paintRegistry};
}
function rail(g,x1,z1,x2,z2,y,M){beam(g,'Balcony top rail',[x1,y+1.02,z1],[x2,y+1.02,z2],.029,M.metal);beam(g,'Balcony lower rail',[x1,y+.10,z1],[x2,y+.10,z2],.023,M.metal);const n=Math.ceil(Math.hypot(x2-x1,z2-z1)/.13);for(let i=0;i<=n;i++){let x=x1+(x2-x1)*i/n,z=z1+(z2-z1)*i/n;beam(g,'Balcony baluster',[x,y+.1,z],[x,y+1.02,z],.014,M.metal);}}
