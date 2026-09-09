import {validateBuildings} from './buildings';
import {validatePlacements} from './furniture';
import {validColor} from './paint';
import {validLand,LAND_DEFAULT,updateLand} from './land';
export const MODEL_VERSION='2026-09-08';
export function captureDesign(viewer){return {format:'supharat-interior',version:1,modelVersion:MODEL_VERSION,paint:viewer.paint.document(),moulding:viewer.rail.document(),land:{...viewer.land},furniture:!!viewer.state.furniture,placements:viewer.furnitureScene?.document()||[],buildings:viewer.buildings?.document()||[]};}
export function validateDesign(viewer,doc){
 if(!doc||doc.format!=='supharat-interior'||doc.version!==1||doc.modelVersion!==MODEL_VERSION)throw new Error('This design uses a different house model version. Your current draft has not changed.');
 if(!doc.paint||doc.paint.format!=='supharat-wall-colors'||doc.paint.version!==1||!doc.paint.colors||typeof doc.paint.colors!=='object'||Array.isArray(doc.paint.colors))throw new Error('Invalid saved wall colors.');
 for(const[id,color]of Object.entries(doc.paint.colors))if(!viewer.house.paintRegistry.entities.has(id)||!validColor(color))throw new Error('This design contains walls that do not match this house.');
 validateBuildings(doc.buildings||[]);
 validatePlacements(doc.placements||[]);
 viewer.rail.validateDocument(doc.moulding);
 if(!validLand(doc.land)||typeof doc.furniture!=='boolean')throw new Error('Invalid saved land or furniture settings.');
 if(JSON.stringify(doc).length>500000)throw new Error('This design is too large.');
}
export function applyDesign(viewer,doc){validateDesign(viewer,doc);viewer.paint.importDocument(doc.paint);viewer.rail.importDocument(doc.moulding);viewer.setLand(doc.land);viewer.toggle('furniture',doc.furniture);viewer.furnitureScene?.set(doc.placements||[]);viewer.buildings?.set(doc.buildings||[]);}
export function switchDraftWorkspace(viewer,userId){
 if(viewer.draftOwner===userId)return;
 let base=null;try{base=window.localStorage;}catch{}
 const prefix=userId?`supharat-user:${userId}:`:'';
 const storage=base?{getItem:k=>base.getItem(prefix+k),setItem:(k,v)=>base.setItem(prefix+k,v)}:null;
 const read=(key,fallback)=>{try{return JSON.parse(storage?.getItem(key))||fallback;}catch{return fallback;}};
 const blank={format:'supharat-interior',version:1,modelVersion:MODEL_VERSION,paint:{format:'supharat-wall-colors',version:1,colors:{}},moulding:{format:'supharat-chair-rails',version:1,rails:{}},land:{...LAND_DEFAULT},furniture:false};
 let draft={...blank,paint:read('supharat-wall-colors-v1',blank.paint),moulding:read('supharat-chair-rails-v1',blank.moulding),land:read('supharat-land-v1',blank.land)};
 try{validateDesign(viewer,draft);}catch{draft=blank;}
 // Change storage scope before any later editing can persist this account's data.
 viewer.draftOwner=userId;viewer.draftStorage=storage;viewer.paint.storage=storage;viewer.rail.storage=storage;
 for(const e of viewer.house.paintRegistry.entities.values())e.material.color.set(draft.paint.colors[e.id]||e.original);
 viewer.rail.configs=new Map(Object.entries(draft.moulding.rails));viewer.rail.rebuild();viewer.land={...draft.land};updateLand(viewer.house,draft.land);viewer.state.furniture=false;
 for(const c of [viewer.paint,viewer.rail]){c.past=[];c.future=[];c.message=userId?'Your private browser draft.':'Guest browser draft.';c.saved=!!storage;c.emit();}
 viewer.applyVisibility();viewer.emit();
}
