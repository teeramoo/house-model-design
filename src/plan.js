// Metres. X follows drawing grids 1–6. Z runs from grid A (rear) to D (front).
// Source: supplied PDF, A-01/A-02; elevations A-04/A-05.
export const LEVELS = [.6,4];
export const ROOMS = [
 {id:'living',label:'Living & dining',thai:'รับแขก · ทานอาหาร',floor:0,x:5.4,z:6.7,yaw:Math.PI/2,area:'Open front living, hall and dining area',note:'10.60 × 4.175 m front bay, including the entrance hall.',icon:'sofa'},
 {id:'kitchen',label:'Kitchen',thai:'ห้องครัว',floor:0,x:12,z:1.7,yaw:0,area:'Kitchen & rear service rooms',note:'Kitchen bay approximately 3.10 m wide. Rear wash area and two service bathrooms are included.',icon:'kitchen'},
 {id:'bed1',label:'Bedroom 1',thai:'ห้องนอน 1',floor:1,x:3.2,z:4.2,yaw:2.75,area:'Primary bedroom · Upper floor',note:'4.20 m wide front-left bay, with a dressing area, en-suite bathroom and balcony.',icon:'bed'},
 {id:'bed2',label:'Bedroom 2',thai:'ห้องนอน 2',floor:1,x:11.8,z:6.8,yaw:-Math.PI/2,area:'Front-right bedroom · Upper floor',note:'5.20 m wide structural bay; en-suite bathroom occupies the rear-right corner.',icon:'bed'},
 {id:'bed3',label:'Bedroom 3',thai:'ห้องนอน 3',floor:1,x:12,z:1.95,yaw:-.45,area:'Rear-right bedroom · Upper floor',note:'5.20 m wide bay with a dedicated en-suite bathroom.',icon:'bed'},
 {id:'bed4',label:'Bedroom 4',thai:'ห้องนอน 4',floor:0,x:2.7,z:1.25,yaw:Math.PI/2,area:'Rear-left bedroom · Ground floor',note:'4.20 m wide bay with bathroom 4. Access follows the opening beside the office.',icon:'bed'},
 {id:'lounge',label:'Family lounge',thai:'พักผ่อน',floor:1,x:7.8,z:6.4,yaw:Math.PI,area:'Family lounge & central balcony',note:'Open central upper-floor lounge, connected to the stair hall.',icon:'sofa'},
 {id:'office',label:'Office',thai:'ทำงาน',floor:0,x:5.5,z:1.75,yaw:0,area:'Office beside the staircase',note:'Work area in the 2.60 m bay between grids 2 and 3.',icon:'desk'},
 {id:'bath1',label:'Primary bathroom',thai:'ห้องน้ำ 1',floor:1,x:1.6,z:1.2,yaw:0,area:'Bath, shower & double vanity',note:'Fixture arrangement follows A-02; detailed fixtures and finish choices are illustrative.',icon:'bath'},
 {id:'carport',label:'Carport',thai:'จอดรถ',floor:0,x:14,z:7.5,yaw:0,area:'Covered carport · +0.20 m',note:'7.00 m front opening is dimensioned on A-01. Bedroom 2 projects above part of the carport.',icon:'car'},
];
export const SOURCES = [
 ['Ground floor','A-01 · PDF page 2'],['Upper floor','A-02 · PDF page 3'],['Roof plan','A-03 · PDF page 4'],['Front elevation','A-04 · PDF page 5'],['Right elevation','A-05 · PDF page 6']
];
