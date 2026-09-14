// Fisheries-focused September 2026 demonstration snapshot. Values are mock tracked-platform data.
export const snapshot = { date:'2026-09-12', registered:486, active:318, vacancies:42, employers:18, agencies:5, applications:394, shortlisted:126, interviews:72, hired:54, trainingRegistrations:176, trainingCompleted:121, exploring:62, pathways:44, preparing:21, registrationStarted:17, registeredBusinesses:12 }
export const periods = {
  'This Month': { label:'September 1–12, 2026 (mock tracked users)', applications:76, shortlisted:25, interviews:14, hired:9, trend:[['Week 1',5],['Week 2',4]] },
  'This Quarter': { label:'July 1–September 12, 2026 (mock tracked users)', applications:221, shortlisted:73, interviews:43, hired:31, trend:[['Jul',10],['Aug',12],['Sep',9]] },
  'This Year': { label:'January 1–September 12, 2026 (mock tracked users)', applications:394, shortlisted:126, interviews:72, hired:54, trend:[['Jan',4],['Feb',5],['Mar',6],['Apr',7],['May',8],['Jun',9],['Jul',10],['Aug',12],['Sep',9]] },
}
export const placementRate = hires => `${(hires / snapshot.active * 100).toFixed(1)}%`
export const skills = [
  {id:'water-quality',name:'Water Quality Monitoring',category:'Aquaculture',demand:34,qualified:91,missing:138,slots:32,priority:'High'},
  {id:'feeding',name:'Fish Feeding Management',category:'Aquaculture',demand:29,qualified:110,missing:96,slots:45,priority:'High'},
  {id:'fish-health',name:'Fish Health Management',category:'Aquaculture',demand:22,qualified:64,missing:104,slots:24,priority:'High'},
  {id:'aquaculture',name:'Aquaculture Operations',category:'Aquaculture',demand:31,qualified:104,missing:86,slots:52,priority:'Medium'},
  {id:'handling',name:'Fish Handling and Post-Harvest',category:'Post-Harvest',demand:27,qualified:124,missing:73,slots:40,priority:'Medium'},
  {id:'food-safety',name:'Food Safety for Fisheries Products',category:'Processing',demand:19,qualified:77,missing:82,slots:30,priority:'Medium'},
  {id:'marketing',name:'Fisheries Marketing',category:'Enterprise',demand:14,qualified:68,missing:61,slots:25,priority:'Medium'},
]
export const residents = [
  {id:'R-001',name:'Juan Dela Cruz',interest:'Aquaculture',employment:'Seeking Employment',skills:['Aquaculture Operations','Fish Feeding Management'],gaps:['water-quality','fish-health'],completion:92,pathway:'Employment and entrepreneurship',training:'Not Started',status:'Active',education:'BS Fisheries',experience:'Tilapia farm assistant · 2 years',certifications:'Aquaculture NC II',location:'Poblacion',applications:'No active applications',activity:'Juan’s Tilapia Grow-out · Under Review'},
  {id:'R-002',name:'Maria Santos',interest:'Fish Processing',employment:'Employed',skills:['Fish Handling and Post-Harvest','Food Safety for Fisheries Products'],gaps:[],completion:100,pathway:'Employment',training:'Completed',status:'Active',education:'Senior High School',experience:'Fish processing worker · 3 years',certifications:'Food Processing NC II',location:'San Vicente',applications:'Hired · Fish Processing Worker',activity:'No business pathway started'},
  {id:'R-003',name:'Carlo Reyes',interest:'Aquaculture',employment:'Seeking Employment',skills:['Fish Feeding Management'],gaps:['water-quality','fish-health'],completion:75,pathway:'Skills Development',training:'Registered',status:'Active',education:'Senior High School',experience:'Fishpond helper · 8 months',certifications:'None submitted',location:'Poblacion',applications:'1 submitted · 1 shortlisted',activity:'Exploring catfish farming'},
]
const org = (id,name,type,status,contact,industry,vacancies=0,hires=0) => ({id,name,type,status,contact,industry,vacancies,hires,location:'San Jose, Occidental Mindoro',registered:'2026-08-18',submitted:'2026-09-10',email:`${id.toLowerCase()}@example.test`,phone:'+63 918 000 0000',documents:['Business Registration.pdf','Valid ID.pdf','Fisheries Permit.pdf'],notes:'',history:['Documents submitted · Sep 10, 2026']})
export const organizations = [
  org('E-001','San Jose Fisherfolk Cooperative','Employer','Verified','Andrea Cruz','Fisherfolk Cooperative',8,16),
  org('E-002','Mindoro Aquaculture Farm','Employer','Verified','Ramon Diaz','Aquaculture Farm',12,24),
  org('E-003','San Jose Fish Processing Center','Employer','Verified','Elena Lim','Fish Processing',9,18),
  org('E-004','Occidental Mindoro Hatchery','Employer','Pending Review','Paula Tan','Fish Hatchery'),
  {...org('T-001','Mindoro Fisheries Training Center','Training Agency','Verified','Grace Flores','Fisheries Skills Development'),programs:2,slots:62,participants:40,completed:26},
  {...org('T-002','Coastal Livelihood Institute','Training Agency','Verified','Jose Rivera','Fisheries Enterprise'),programs:3,slots:95,participants:112,completed:95},
]
export const vacancies = [
  {id:'J-001',name:'Aquaculture Technician',employer:'Mindoro Aquaculture Farm',industry:'Aquaculture Farm',category:'Aquaculture',openings:4,applicants:0,skillIds:['water-quality','feeding','fish-health','aquaculture'],published:'2026-09-01',deadline:'2026-12-30',status:'Active',salary:'PHP 18,000–24,000 / month',description:'Monitor water quality, feeding schedules, fish health and daily aquaculture operations.'},
  {id:'J-002',name:'Fish Processing Worker',employer:'San Jose Fish Processing Center',industry:'Fish Processing',category:'Fish Processing',openings:6,applicants:12,skillIds:['handling','food-safety'],published:'2026-09-03',deadline:'2026-12-28',status:'Active',salary:'PHP 14,000–18,000 / month',description:'Handle, process and package fisheries products following food-safety procedures.'},
  {id:'J-003',name:'Fish Vendor and Retail Assistant',employer:'San Jose Fisherfolk Cooperative',industry:'Fisherfolk Cooperative',category:'Fisheries Marketing',openings:3,applicants:6,skillIds:['handling','marketing'],published:'2026-09-05',deadline:'2026-12-20',status:'Active',salary:'PHP 13,000–16,000 / month',description:'Support cooperative fish retail, product handling and customer service.'},
]
export const programs = [
  {id:'TR-001',name:'Water Quality Management for Aquaculture',agency:'Mindoro Fisheries Training Center',skillIds:['water-quality'],slots:32,registrations:18,capacity:50,fee:0,schedule:'2026-10-20',status:'Upcoming',completed:26,placements:13,duration:'40 Hours',location:'San Jose, Occidental Mindoro'},
  {id:'TR-002',name:'Basic Aquaculture Production',agency:'Mindoro Fisheries Training Center',skillIds:['feeding','aquaculture','fish-health'],slots:30,registrations:20,capacity:50,fee:0,schedule:'2026-10-15',status:'Upcoming',completed:0,placements:0,duration:'48 Hours',location:'San Jose, Occidental Mindoro'},
  {id:'TR-003',name:'Fish Handling and Processing',agency:'Coastal Livelihood Institute',skillIds:['handling','food-safety'],slots:40,registrations:30,capacity:70,fee:0,schedule:'2026-10-10',status:'Upcoming',completed:69,placements:28,duration:'36 Hours',location:'San Jose, Occidental Mindoro'},
]
export const placements=[{id:'PL-001',resident:'Maria Santos',job:'Fish Processing Worker',employer:'San Jose Fish Processing Center',match:91,hired:'2026-09-09',status:'Employed'}]
export const pathways=[{id:'EP-001',resident:'Juan Dela Cruz',business:'Juan’s Tilapia Grow-out',category:'Aquaculture',stage:'Under LGU Review',training:'Not Started',registration:'Under Review'}]
export const businesses=[{id:'BR-2026-00124',applicant:'Juan Dela Cruz',name:'Juan’s Tilapia Grow-out',type:'Aquaculture',activity:'Small-scale tilapia culture',location:'Poblacion, San Jose',submitted:'2026-09-10',status:'Under Review',documents:['Business Application.pdf','Location Sketch.pdf','Owner ID.pdf'],notes:'',history:['Application submitted · Sep 10, 2026','Assigned to LGU reviewer · Sep 11, 2026']}]
export const transactions=[]
export const sponsors=[{id:'SP-001',name:'San Jose Fisherfolk Cooperative',program:'Water Quality Management for Aquaculture',slots:20,total:50,supported:18,support:'Training materials and farm exposure',status:'Active'}]
export const initialUsers=[...residents.map(r=>({id:r.id,name:r.name,role:'Resident',status:r.status,verification:'Not Required',registered:'2026-08-12'})),...organizations.map(o=>({id:o.id,name:o.name,role:o.type,status:'Active',verification:o.status,registered:o.registered})),{id:'LGU-002',name:'Patricia Lopez',role:'LGU Staff',status:'Active',verification:'Verified',registered:'2026-01-05'}]
export const lguNotifications=[{id:'LN-1',type:'verification',title:'Fisheries employer verification request',message:'Occidental Mindoro Hatchery submitted a fisheries employer verification request.',date:'2026-09-12',link:'/lgu/people?tab=Verification%20Requests',read:false},{id:'LN-2',type:'insight',title:'Water quality training capacity gap',message:'Registered fisheries job seekers need more Water Quality Monitoring training seats.',date:'2026-09-12',link:'/lgu/analytics?tab=Prescriptive%20Insights',read:false}]
export const insights=[{id:'I-1',title:'Water Quality Monitoring capacity gap',priority:'High',skillId:'water-quality',explanation:'Aquaculture vacancies require water quality monitoring and available training seats are limited.',action:'Consider coordinating Water Quality Management training with participating fisheries training agencies and the fisherfolk cooperative.',actions:['View Affected Residents','View Training Supply']}]
export const reports=['Fisheries Workforce Overview','Fisheries Employment Summary','Fisheries Vacancy and Employer Demand','Fisheries Skills Gap Report','Fisheries Training Participation','Fisheries Entrepreneurship','Business Registration']
