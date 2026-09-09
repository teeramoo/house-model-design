export const MOULDING_TYPES=[
 {id:'panels',name:'Upper + lower',description:'Tall and short frames with a dividing rail.'},
 {id:'full',name:'Full height',description:'Tall frames without a dividing rail.'},
 {id:'lower',name:'Lower panels',description:'Short frames below a horizontal rail.'},
 {id:'rail',name:'Rail only',description:'A continuous horizontal trim.'},
];
export const MOULDING_MODELS=[
 {id:'classic',name:'Classic double',description:'Stepped trim with an inner frame.',profile:'classic',frameWidth:.045,depth:.028,size:.075,doubleFrame:true},
 {id:'minimal',name:'Minimal flat',description:'Slim, simple rectangular trim.',profile:'flat',frameWidth:.03,depth:.018,size:.05,doubleFrame:false},
 {id:'rounded',name:'Rounded bead',description:'Soft rounded edges and a beaded rail.',profile:'beaded',frameWidth:.04,depth:.025,size:.065,doubleFrame:false},
 {id:'bold',name:'Bold stepped',description:'Wider trim with stronger relief.',profile:'classic',frameWidth:.06,depth:.035,size:.10,doubleFrame:true},
];
export const MODEL_FIELDS=['profile','frameWidth','depth','size','doubleFrame'];
export const selectedModel=config=>MOULDING_MODELS.find(m=>MODEL_FIELDS.every(key=>config[key]===m[key]))?.id||null;
