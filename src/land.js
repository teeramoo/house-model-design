import * as T from 'three';
export const LAND_DEFAULT={width:20,depth:20,x:8.4,z:4.4};
export function validLand(c){return c&&['width','depth','x','z'].every(k=>Number.isFinite(c[k]))&&c.width>=5&&c.width<=80&&c.depth>=5&&c.depth<=80&&Math.abs(c.x)<=50&&Math.abs(c.z)<=50;}
export function landFits(c){return c.x-c.width/2<=-1.2&&c.x+c.width/2>=17.95&&c.z-c.depth/2<=-2.6&&c.z+c.depth/2>=11.6;}
export function updateLand(house,c){if(!validLand(c))throw new Error('Use plot dimensions from 5 to 80 m and offsets within 50 m.');const g=house.groups.site;let plot=g.getObjectByName('Estimated plot boundary');if(plot){plot.geometry.dispose();plot.material.dispose();g.remove(plot);}const base=g.getObjectByName('Illustrative site base');if(base){base.position.x=c.x;base.position.z=c.z;base.scale.set(c.width/24.2,1,c.depth/19.5);base.material.color.set('#b9c6a5');}
const a=c.x-c.width/2,b=c.x+c.width/2,d=c.z-c.depth/2,e=c.z+c.depth/2;
plot=new T.LineLoop(new T.BufferGeometry().setFromPoints([[a,.055,d],[b,.055,d],[b,.055,e],[a,.055,e]].map(p=>new T.Vector3(...p))),new T.LineBasicMaterial({color:landFits(c)?'#425b42':'#b45d37'}));plot.name='Estimated plot boundary';plot.userData={...c,areaSquareMetres:c.width*c.depth,areaSquareWah:c.width*c.depth/4,estimated:true};g.add(plot);house.root.userData.land={...plot.userData};}
