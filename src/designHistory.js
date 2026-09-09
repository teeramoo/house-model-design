import {captureDesign,applyDesign,validateDesign,MODEL_VERSION} from './designDocument';
import {LAND_DEFAULT} from './land';
const clone=value=>JSON.parse(JSON.stringify(value));
export const baselineDesign=()=>({format:'supharat-interior',version:1,modelVersion:MODEL_VERSION,paint:{format:'supharat-wall-colors',version:1,colors:{}},moulding:{format:'supharat-chair-rails',version:1,rails:{}},land:{...LAND_DEFAULT},furniture:false,placements:[],buildings:[]});
export class DesignHistory {
 constructor(viewer,onChange=()=>{}){this.viewer=viewer;this.onChange=onChange;this.lock=false;this.reset(captureDesign(viewer));
 for(const [target,method,label] of [[viewer.paint,'commit','Wall colors'],[viewer.rail,'commit','Moulding'],[viewer,'setLand','Land'],[viewer,'toggle','Furniture visibility']]){const original=target[method].bind(target);target[method]=(...args)=>{const result=original(...args);if(method!=='toggle'||args[0]==='furniture')this.record(label);return result;};}
 for(const controller of [viewer.paint,viewer.rail]){controller.undo=()=>this.go(this.cursor-1);controller.redo=()=>this.go(this.cursor+1);const snapshot=controller.snapshot?.bind(controller);if(snapshot)controller.snapshot=()=>({...snapshot(),canUndo:this.cursor>0,canRedo:this.cursor<this.entries.length-1});}
 }
 reset(document,label='Starting design'){this.entries=[{label,at:new Date().toISOString(),document:clone(document)}];this.cursor=0;}
 document(){return clone({version:1,cursor:this.cursor,entries:this.entries});}
 validate(history){if(!history||history.version!==1||!Array.isArray(history.entries)||!history.entries.length||history.entries.length>51||!Number.isInteger(history.cursor)||history.cursor<0||history.cursor>=history.entries.length||JSON.stringify(history).length>4000000)throw new Error('Invalid or oversized edit history.');for(const e of history.entries){if(typeof e.label!=='string'||e.label.length>200||typeof e.at!=='string')throw new Error('Invalid history entry.');validateDesign(this.viewer,e.document);}}
 load(document,history){validateDesign(this.viewer,document);if(history){this.validate(history);if(JSON.stringify(history.entries[history.cursor].document)!==JSON.stringify(document))throw new Error('Saved design does not match its history.');}this.lock=true;try{applyDesign(this.viewer,document);if(history){this.entries=clone(history.entries);this.cursor=history.cursor;}else this.reset(document);}finally{this.lock=false;}this.emit();}
 record(label){if(this.lock)return;const document=captureDesign(this.viewer);if(JSON.stringify(document)===JSON.stringify(this.entries[this.cursor].document))return;this.entries=this.entries.slice(0,this.cursor+1);this.entries.push({label,at:new Date().toISOString(),document:clone(document)});while(this.entries.length>51||JSON.stringify(this.entries).length>3500000&&this.entries.length>1)this.entries.shift();this.cursor=this.entries.length-1;this.emit();}
 go(cursor){if(!Number.isInteger(cursor)||cursor<0||cursor>=this.entries.length)return;this.lock=true;try{applyDesign(this.viewer,this.entries[cursor].document);this.cursor=cursor;}finally{this.lock=false;}this.emit();}
 emit(){for(const c of [this.viewer.paint,this.viewer.rail])c.emit();this.onChange();}
}
