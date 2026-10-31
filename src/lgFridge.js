import * as T from 'three';
export const LG_FRIDGE={id:'builtin-lg-gc-b50fpgam',name:'LG GC-B50FPGAM fridge',category:'Appliances',width:.830,height:1.920,depth:.595,source:'https://www.lg.com/th/refrigerators/multi-door-refrigerator/gc-b50fpgam/',note:'830 W × 1920 H × 595 D mm. Simplified exterior; door swing and installation clearance not included. Keep size at 1 for actual dimensions.'};
export function makeLGFridge(){
 const root=new T.Group();root.name=LG_FRIDGE.name;
 const body=new T.MeshStandardMaterial({color:'#b8aa94',roughness:.45,metalness:.35});
 const glass=new T.MeshPhysicalMaterial({color:'#d8c9b1',roughness:.22,metalness:.15,clearcoat:1});
 const dark=new T.MeshStandardMaterial({color:'#111214',roughness:.65});
 function box(name,w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);}
 // Overall closed-door envelope is 0.830 × 1.920 × 0.595 m; front faces +Z.
 box('Cabinet',.830,1.880,.555,0,.980,-.020,body);
 box('Recessed plinth',.770,.040,.500,0,.020,-.020,dark);
 const doorWidth=.407,front=.2775;
 for(const x of [-.2075,.2075]){
  box('Upper glass door',doorWidth,1.110,.040,x,1.357,front,glass);
  box('Lower glass door',doorWidth,.735,.040,x,.4195,front,glass);
  box('Recessed grip',.350,.012,.010,x,.794,.270,dark);
 }
 box('Control panel',.045,.170,.001,.035,1.460,.298, dark);
 // Keep details inside the published envelope.
 root.children.at(-1).position.z=.297;
 root.userData={manufacturer:'LG',model:'GC-B50FPGAM',source:LG_FRIDGE.source,approximation:true};return root;
}
