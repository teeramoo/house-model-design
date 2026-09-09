import * as T from 'three';
import {PaintController,validColor} from './paint';
import {PANEL_DEFAULT,validPanels,panelRectangles,addPanelFrames} from './panelMoulding';
import {MOULDING_MODELS,MODEL_FIELDS} from './mouldingPresets';
const KEY='supharat-chair-rails-v1';
export const RAIL_DEFAULT={height:.9,size:.075,depth:.028,profile:'classic',color:'#fbfaf4'};
export const interior=e=>!e.room.startsWith('exterior')&&!['wash','carport'].includes(e.room);
export const validRail=c=>c&&Number.isFinite(c.height)&&c.height>=.6&&c.height<=1.4&&Number.isFinite(c.size)&&c.size>=.04&&c.size<=.12&&Number.isFinite(c.depth)&&c.depth>=.015&&c.depth<=.04&&['classic','flat','beaded'].includes(c.profile)&&validColor(c.color)&&validPanels(c);
// Measure the actual plaster faces: a rail only exists where its full profile is supported.
export function railRuns(entity,config){const runs=[],up=new T.Vector3(0,1,0),y=(entity.floor?4:.6)+config.height;
 for(const {mesh,slot} of entity.faces){mesh.updateWorldMatrix(true,false);const pos=mesh.geometry.attributes.position;const pts=[0,1,2,3].map(i=>new T.Vector3().fromBufferAttribute(pos,slot*4+i).applyMatrix4(mesh.matrixWorld));const n=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.normal,slot*4).transformDirection(mesh.matrixWorld);const u=new T.Vector3().crossVectors(up,n).normalize();const ys=pts.map(p=>p.y);if(y-config.size/2<Math.min(...ys)+.001||y+config.size/2>Math.max(...ys)-.001)continue;
 let spans=[[Math.min(...pts.map(p=>p.dot(u))),Math.max(...pts.map(p=>p.dot(u)))]];const info=mesh.userData.railOpenings;
 for(const op of info?.openings||[]){const base=entity.floor?4:.6,margin=op.type==='window'?.16:.035;if(y+config.size/2<base+(op.s||0)-margin||y-config.size/2>base+(op.s||0)+op.h+margin)continue;const v=info.axis==='x'?u.x:u.z;const offset=(info.axis==='x'?u.z:u.x)*info.fixed;const ends=[(op.c-op.w/2-margin)*v+offset,(op.c+op.w/2+margin)*v+offset].sort((a,b)=>a-b);spans=spans.flatMap(([a,b])=>b<=ends[0]||a>=ends[1]?[[a,b]]:[[a,Math.min(b,ends[0])],[Math.max(a,ends[1]),b]].filter(([l,r])=>r-l>.005));}
 for(const [a,b]of spans)if(b-a>.01)runs.push({a,b,y,n:n.clone(),u:u.clone(),plane:pts[0].dot(n)});
 }return runs;}
export function buildRail(entity,config){const group=new T.Group();group.name='Wall moulding · '+entity.label;group.userData={wallId:entity.id,chairRail:{...config}};const material=new T.MeshStandardMaterial({color:config.color,roughness:.48});const up=new T.Vector3(0,1,0);
 for(const r of config.layout==='full'?[]:railRuns(entity,config)){const run=new T.Group();run.position.copy(r.u).multiplyScalar((r.a+r.b)/2).addScaledVector(r.n,r.plane+.001);run.position.y=r.y;run.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(r.u,up,r.n));group.add(run);const length=r.b-r.a;
 const strip=(size,depth,offset=0)=>{const o=new T.Mesh(new T.BoxGeometry(length,size,depth),material);o.position.set(0,offset,depth/2);o.castShadow=true;o.receiveShadow=true;o.name='Chair rail moulding';o.userData.railWallId=entity.id;run.add(o);};
 strip(config.size,config.depth*.45);
 if(config.profile==='flat')strip(config.size,config.depth);
 if(config.profile==='classic'){strip(config.size*.58,config.depth*.75);strip(config.size*.17,config.depth,config.size*.32);strip(config.size*.14,config.depth*.9,-config.size*.32);}
 if(config.profile==='beaded'){strip(config.size*.65,config.depth*.7);const radius=Math.min(config.size*.2,config.depth*.5);for(const sign of[-1,1]){const o=new T.Mesh(new T.CylinderGeometry(radius,radius,length,12),material);o.rotation.z=Math.PI/2;o.position.set(0,sign*config.size*.3,config.depth-radius);o.castShadow=true;o.receiveShadow=true;o.userData.railWallId=entity.id;o.name='Rounded chair rail bead';run.add(o);}}
 }addPanelFrames(group,entity,config,material);return group;}
export const supportsMoulding=(entity,config)=>config.layout==='full'?panelRectangles(entity,config).length>0:railRuns(entity,config).length>0;
function dispose(group){const mats=new Set();group.traverse(o=>{o.geometry?.dispose();if(o.material)mats.add(o.material);});mats.forEach(m=>m.dispose());group.removeFromParent();}
export class ChairRailController extends PaintController{
 constructor(house,{storage=null,onChange=()=>{}}={}){super(house.paintRegistry);this.house=house;this.storage=storage;this.onChange=onChange;this.config={...RAIL_DEFAULT,...PANEL_DEFAULT};this.color=this.config.color;this.configs=new Map();this.models=new Map();this.message='Choose interior walls, then add moulding.';try{const raw=storage?.getItem(KEY);if(raw){const doc=JSON.parse(raw);this.validateDocument(doc);this.configs=new Map(Object.entries(doc.rails));this.rebuild();}this.saved=!!storage;}catch{this.saved=false;}}
 targets(){return super.targets().filter(interior);}
 snapshot(){const base=super.snapshot(),targets=this.targets(),eligible=targets.filter(e=>supportsMoulding(e,this.settings()));return {...base,...this.settings(),current:`${targets.filter(e=>this.configs.has(e.id)).length} with moulding`,panels:targets.reduce((n,e)=>n+panelRectangles(e,this.settings()).length,0),eligible:eligible.length,installed:this.configs.size};}
 settings(){return {...this.config,color:this.color};}
 setModel(id){const model=MOULDING_MODELS.find(m=>m.id===id);if(!model)return;this.config={...this.config,...Object.fromEntries(MODEL_FIELDS.map(k=>[k,model[k]]))};this.message=model.name+' selected. Apply to update your walls.';this.emit();}
 setSetting(key,value){const next={...this.config,[key]:['profile','layout'].includes(key)?value:key==='doubleFrame'?!!value:Number(value),color:this.color};if(validRail(next)){this.config=next;this.message='Settings ready. Add / update moulding to apply.';this.emit();}else{this.message='Check the allowed dimensions: panel 500–1500, spacing 100–350, frame 25–70, rail height 600–1400, profile 40–120, projection 15–40 mm.';this.emit();}}
 rebuild(){for(const group of this.models.values())dispose(group);this.models.clear();for(const[id,config]of this.configs){const e=this.registry.entities.get(id),group=buildRail(e,config);this.house.groups[e.floor?'upper':'ground'].add(group);this.models.set(id,group);}}
 commit(changes,message){const actual=changes.filter(c=>JSON.stringify(c.before)!==JSON.stringify(c.after));if(!actual.length){this.message='No change for this target.';this.emit();return false;}for(const c of actual)c.after?this.configs.set(c.id,{...c.after}):this.configs.delete(c.id);this.past.push(actual);if(this.past.length>50)this.past.shift();this.future=[];this.rebuild();this.message=message;this.persist();this.emit();return true;}
 apply(){const config=this.settings();const targets=this.targets().filter(e=>supportsMoulding(e,config));const eligible=new Set(targets.map(e=>e.id));return this.commit(this.targets().map(e=>({id:e.id,before:this.configs.get(e.id)||null,after:eligible.has(e.id)?{...config}:null})),`Moulding added / updated on ${targets.length} wall faces.`);}
 reset(){return this.commit(this.targets().map(e=>({id:e.id,before:this.configs.get(e.id)||null,after:null})),'Moulding removed from this target.');}
 undo(){const a=this.past.pop();if(!a)return;for(const c of a)c.before?this.configs.set(c.id,{...c.before}):this.configs.delete(c.id);this.future.push(a);this.rebuild();this.message='Undid moulding change.';this.persist();this.emit();}
 redo(){const a=this.future.pop();if(!a)return;for(const c of a)c.after?this.configs.set(c.id,{...c.after}):this.configs.delete(c.id);this.past.push(a);this.rebuild();this.message='Redid moulding change.';this.persist();this.emit();}
 document(){return {format:'supharat-chair-rails',version:1,rails:Object.fromEntries(this.configs)};}
 validateDocument(doc){if(!doc||doc.format!=='supharat-chair-rails'||doc.version!==1||!doc.rails||Array.isArray(doc.rails)||typeof doc.rails!=='object')throw new Error('Choose a Supharat chair-rail JSON file.');for(const[id,c]of Object.entries(doc.rails)){const e=this.registry.entities.get(id);if(!e||!interior(e)||!validRail(c)||!supportsMoulding(e,c))throw new Error('Invalid chair rail settings or wall in this file.');}}
 importDocument(doc){this.validateDocument(doc);return this.commit([...this.registry.entities.values()].map(e=>({id:e.id,before:this.configs.get(e.id)||null,after:doc.rails[e.id]||null})),'Loaded chair rail design.');}
 persist(){try{if(!this.storage)throw new Error();this.storage.setItem(KEY,JSON.stringify(this.document()));this.saved=true;}catch{this.saved=false;}}
}
