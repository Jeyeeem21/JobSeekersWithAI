// One September 12, 2026 demonstration snapshot. Directory rows are representative
// records; aggregate counts describe the wider fictional tracked population.
export const snapshot = {
  date: '2026-09-12', registered: 1248, active: 842, vacancies: 186,
  employers: 73, agencies: 12, applications: 1486, shortlisted: 642,
  interviews: 391, hired: 214, trainingRegistrations: 420, trainingCompleted: 336,
  exploring: 148, pathways: 96, preparing: 48, registrationStarted: 40, registeredBusinesses: 24,
}
export const periods = {
  'This Month': { label: 'September 1–12, 2026', applications: 286, shortlisted: 132, interviews: 81, hired: 42, trend: [['Week 1', 24], ['Week 2', 18]] },
  'This Quarter': { label: 'July 1–September 12, 2026', applications: 786, shortlisted: 342, interviews: 201, hired: 112, trend: [['Jul', 32], ['Aug', 38], ['Sep', 42]] },
  'This Year': { label: 'January 1–September 12, 2026', applications: 1486, shortlisted: 642, interviews: 391, hired: 214, trend: [['Jan', 12], ['Feb', 14], ['Mar', 15], ['Apr', 17], ['May', 20], ['Jun', 24], ['Jul', 32], ['Aug', 38], ['Sep', 42]] },
}
export const placementRate = (hires) => `${(hires / snapshot.active * 100).toFixed(1)}%`
export const skills = [
  { id: 'network', name: 'Network Configuration', category: 'IT Infrastructure', demand: 75, qualified: 46, missing: 120, slots: 40, priority: 'High' },
  { id: 'excel', name: 'Microsoft Excel', category: 'Office Productivity', demand: 68, qualified: 130, missing: 96, slots: 70, priority: 'Medium' },
  { id: 'directory', name: 'Active Directory', category: 'IT Infrastructure', demand: 42, qualified: 21, missing: 78, slots: 25, priority: 'High' },
  { id: 'marketing', name: 'Digital Marketing', category: 'Marketing', demand: 35, qualified: 82, missing: 61, slots: 50, priority: 'Low' },
  { id: 'security', name: 'Cybersecurity Fundamentals', category: 'IT Infrastructure', demand: 28, qualified: 16, missing: 54, slots: 15, priority: 'High' },
]
export const residents = [
  { id: 'R-001', name: 'Juan Dela Cruz', interest: 'IT Support', employment: 'Seeking Employment', skills: ['Computer Diagnostics', 'Customer Service'], gaps: ['network', 'directory'], completion: 92, pathway: 'Entrepreneurship', training: 'In Progress', status: 'Active', education: 'BS Information Technology', experience: 'Computer shop assistant · 2 years', certifications: 'Computer Systems Servicing NC II', location: 'Poblacion', applications: '2 submitted · 1 interview', activity: 'JD Computer Repair Services · Under Review' },
  { id: 'R-002', name: 'Maria Santos', interest: 'Administration', employment: 'Employed', skills: ['Microsoft Excel', 'Communication'], gaps: [], completion: 100, pathway: 'Employment', training: 'Completed', status: 'Active', education: 'BS Business Administration', experience: 'Office assistant · 1 year', certifications: 'Advanced Excel certificate', location: 'San Vicente', applications: 'Hired · Administrative Assistant', activity: 'No business pathway started' },
  { id: 'R-003', name: 'Carlo Reyes', interest: 'IT Support', employment: 'Seeking Employment', skills: ['Hardware Repair'], gaps: ['network', 'security'], completion: 75, pathway: 'Skills Development', training: 'Registered', status: 'Active', education: 'Senior High School · ICT', experience: 'Technical intern · 6 months', certifications: 'None submitted', location: 'Poblacion', applications: '3 submitted · 1 shortlisted', activity: 'Exploring computer repair' },
  { id: 'R-004', name: 'Ana Mendoza', interest: 'Administration', employment: 'Seeking Employment', skills: ['Communication', 'Data Entry'], gaps: ['excel'], completion: 65, pathway: 'Skills Development', training: 'Registered', status: 'Active', education: 'AB Communication', experience: 'Receptionist · 1 year', certifications: 'None submitted', location: 'San Jose', applications: '2 submitted', activity: 'No business pathway started' },
  { id: 'R-005', name: 'Paolo Garcia', interest: 'Digital Services', employment: 'Self-employed', skills: ['Digital Marketing', 'Graphic Design'], gaps: [], completion: 88, pathway: 'Entrepreneurship', training: 'Completed', status: 'Active', education: 'BS Entrepreneurship', experience: 'Freelance designer · 3 years', certifications: 'Digital Marketing certificate', location: 'San Vicente', applications: 'No active applications', activity: 'Garcia Creative Studio · Registered' },
  { id: 'R-006', name: 'Liza Ramos', interest: 'Food Services', employment: 'Seeking Employment', skills: ['Food Preparation'], gaps: ['marketing'], completion: 48, pathway: 'Entrepreneurship', training: 'Not Started', status: 'Inactive', education: 'Senior High School · Home Economics', experience: 'Home catering · 1 year', certifications: 'Food Safety certificate', location: 'San Jose', applications: 'No active applications', activity: 'Ramos Kitchen · Preparing' },
]
const org = (id, name, type, status, contact, industry, vacancies = 0, hires = 0) => ({ id, name, type, status, contact, industry, vacancies, hires, location: 'San Jose, Occidental Mindoro', registered: '2026-08-18', submitted: '2026-09-10', email: `${id.toLowerCase()}@example.test`, documents: ['Business Registration.pdf', 'Valid ID.pdf', 'Company Profile.pdf'], notes: '', history: ['Documents submitted · Sep 10, 2026'] })
export const organizations = [
  org('E-001', 'ABC Solutions Inc.', 'Employer', 'Pending Review', 'Andrea Cruz', 'Information Technology'),
  org('E-002', 'Mindoro Digital Services', 'Employer', 'Verified', 'Ramon Diaz', 'Information Technology', 24, 49),
  org('E-003', 'San Jose Business Center', 'Employer', 'Verified', 'Elena Lim', 'Business Services', 18, 68),
  org('E-004', 'Island Retail Group', 'Employer', 'Under Review', 'Paula Tan', 'Retail'),
  org('E-005', 'Coastal Logistics', 'Employer', 'Needs Additional Documents', 'Miguel Yu', 'Logistics'),
  org('E-006', 'Green Valley Farms', 'Employer', 'Pending Review', 'Rosa Alba', 'Agriculture'),
  org('E-007', 'Harbor Hospitality', 'Employer', 'Pending Review', 'Ben Torres', 'Hospitality'),
  org('E-008', 'Pacific Services', 'Employer', 'Rejected', 'Luis Perez', 'Business Services'),
  { ...org('T-001', 'Mindoro Technical Training Center', 'Training Agency', 'Pending Review', 'Grace Flores', 'Technical Education'), programs: 0, slots: 0, participants: 0, completed: 0 },
  { ...org('T-002', 'Skills Development Institute', 'Training Agency', 'Verified', 'Jose Rivera', 'Technical Education'), programs: 5, slots: 180, participants: 360, completed: 286 },
  { ...org('T-003', 'Community Enterprise Academy', 'Training Agency', 'Verified', 'Lea Castro', 'Entrepreneurship'), programs: 1, slots: 20, participants: 60, completed: 50 },
  { ...org('T-004', 'Southern Skills Center', 'Training Agency', 'Under Review', 'Mila Gomez', 'Technical Education'), programs: 0, slots: 0, participants: 0, completed: 0 },
  { ...org('T-005', 'Island Learning Hub', 'Training Agency', 'Pending Review', 'Eric Cruz', 'Technical Education'), programs: 0, slots: 0, participants: 0, completed: 0 },
]
export const vacancies = [
  { id: 'J-001', name: 'IT Support Technician', employer: 'Mindoro Digital Services', industry: 'Information Technology', category: 'IT Support', openings: 12, applicants: 84, skillIds: ['network', 'directory', 'security'], published: '2026-09-01', deadline: '2026-09-30', status: 'Active', salary: 'PHP 22,000–28,000 / month', description: 'Support workstations, troubleshoot local networks, and manage user accounts.' },
  { id: 'J-002', name: 'Administrative Assistant', employer: 'San Jose Business Center', industry: 'Business Services', category: 'Administration', openings: 8, applicants: 112, skillIds: ['excel'], published: '2026-09-03', deadline: '2026-09-28', status: 'Active', salary: 'PHP 18,000–23,000 / month', description: 'Maintain spreadsheets, prepare reports, and coordinate office records.' },
  { id: 'J-003', name: 'Digital Marketing Associate', employer: 'Mindoro Digital Services', industry: 'Information Technology', category: 'Marketing', openings: 4, applicants: 38, skillIds: ['marketing', 'excel'], published: '2026-08-20', deadline: '2026-09-20', status: 'Active', salary: 'PHP 20,000–26,000 / month', description: 'Prepare campaigns and monitor audience engagement.' },
  { id: 'J-004', name: 'Office Coordinator', employer: 'San Jose Business Center', industry: 'Business Services', category: 'Administration', openings: 2, applicants: 0, skillIds: ['excel'], published: '2026-09-12', deadline: '2026-10-01', status: 'Pending Publication', salary: 'PHP 20,000–25,000 / month', description: 'Coordinate schedules and administrative support.' },
  { id: 'J-005', name: 'Junior Network Technician', employer: 'Mindoro Digital Services', industry: 'Information Technology', category: 'IT Support', openings: 3, applicants: 46, skillIds: ['network'], published: '2026-07-01', deadline: '2026-08-01', status: 'Closed', salary: 'PHP 20,000–24,000 / month', description: 'Assist with network installation and maintenance.' },
  { id: 'J-006', name: 'Records Assistant', employer: 'San Jose Business Center', industry: 'Business Services', category: 'Administration', openings: 1, applicants: 19, skillIds: ['excel'], published: '2026-08-01', deadline: '2026-09-01', status: 'Expired', salary: 'PHP 18,000–21,000 / month', description: 'Maintain digital and physical records.' },
]
export const programs = [
  { id: 'TR-001', name: 'Network Administration Training', agency: 'Skills Development Institute', skillIds: ['network'], slots: 30, registrations: 20, capacity: 50, fee: 2500, schedule: '2026-09-20', status: 'Upcoming', completed: 86, placements: 49 },
  { id: 'TR-002', name: 'Network Configuration Lab', agency: 'Skills Development Institute', skillIds: ['network'], slots: 10, registrations: 20, capacity: 30, fee: 1800, schedule: '2026-09-08', status: 'Active', completed: 0, placements: 0 },
  { id: 'TR-003', name: 'Microsoft Excel for Work', agency: 'Skills Development Institute', skillIds: ['excel'], slots: 70, registrations: 30, capacity: 100, fee: 1500, schedule: '2026-09-22', status: 'Upcoming', completed: 120, placements: 68 },
  { id: 'TR-004', name: 'Windows Server & Active Directory', agency: 'Skills Development Institute', skillIds: ['directory'], slots: 25, registrations: 15, capacity: 40, fee: 2800, schedule: '2026-09-25', status: 'Upcoming', completed: 0, placements: 0 },
  { id: 'TR-005', name: 'Digital Marketing Essentials', agency: 'Community Enterprise Academy', skillIds: ['marketing'], slots: 20, registrations: 10, capacity: 30, fee: 1800, schedule: '2026-09-18', status: 'Upcoming', completed: 100, placements: 15 },
  { id: 'TR-006', name: 'Digital Campaign Workshop', agency: 'Skills Development Institute', skillIds: ['marketing'], slots: 30, registrations: 10, capacity: 40, fee: 1500, schedule: '2026-10-01', status: 'Upcoming', completed: 0, placements: 0 },
  { id: 'TR-007', name: 'Cybersecurity Fundamentals', agency: 'Skills Development Institute', skillIds: ['security'], slots: 15, registrations: 15, capacity: 30, fee: 2200, schedule: '2026-09-24', status: 'Upcoming', completed: 30, placements: 12 },
  { id: 'TR-008', name: 'Youth Entrepreneurship Development', agency: 'Community Enterprise Academy', skillIds: [], slots: 0, registrations: 30, capacity: 30, fee: 0, schedule: '2026-09-10', status: 'Full', completed: 0, placements: 0 },
]
export const placements = [
  { id: 'PL-001', resident: 'Maria Santos', job: 'Administrative Assistant', employer: 'San Jose Business Center', match: 94, hired: '2026-09-09', status: 'Employed' },
  { id: 'PL-002', resident: 'Mark Villanueva', job: 'IT Support Technician', employer: 'Mindoro Digital Services', match: 92, hired: '2026-09-08', status: 'Employed' },
  { id: 'PL-003', resident: 'Jessa Aquino', job: 'Digital Marketing Associate', employer: 'Mindoro Digital Services', match: 89, hired: '2026-08-28', status: 'Employed' },
  { id: 'PL-004', resident: 'Rico Bautista', job: 'Junior Network Technician', employer: 'Mindoro Digital Services', match: 90, hired: '2026-07-24', status: 'Employed' },
]
export const pathways = [
  { id: 'EP-001', resident: 'Juan Dela Cruz', business: 'Computer Repair Services', category: 'Computer Repair', stage: 'Under LGU Review', training: 'In Progress', registration: 'Under Review' },
  { id: 'EP-002', resident: 'Paolo Garcia', business: 'Creative Studio', category: 'Digital Services', stage: 'Registered', training: 'Completed', registration: 'Approved' },
  { id: 'EP-003', resident: 'Liza Ramos', business: 'Home Catering', category: 'Food Services', stage: 'Preparing', training: 'Not Started', registration: 'Not Started' },
  { id: 'EP-004', resident: 'Carlo Reyes', business: 'Computer Repair Kiosk', category: 'Computer Repair', stage: 'Exploring', training: 'Registered', registration: 'Not Started' },
  { id: 'EP-005', resident: 'Nina Lopez', business: 'Community Store', category: 'Retail', stage: 'Training', training: 'In Progress', registration: 'Not Started' },
  { id: 'EP-006', resident: 'Ben Domingo', business: 'Vegetable Trading', category: 'Agriculture', stage: 'Registration Started', training: 'Completed', registration: 'Needs Requirements' },
]
export const businesses = [
  { id: 'BR-2026-00124', applicant: 'Juan Dela Cruz', name: 'JD Computer Repair Services', type: 'Computer Repair', activity: 'Computer diagnostics, repairs, and maintenance', location: 'Poblacion, San Jose', submitted: '2026-09-10', status: 'Under Review', documents: ['Business Application.pdf', 'Location Sketch.pdf', 'Owner ID.pdf'], notes: '', history: ['Application submitted · Sep 10, 2026', 'Assigned to LGU reviewer · Sep 11, 2026'] },
  { id: 'BR-2026-00125', applicant: 'Ben Domingo', name: 'Domingo Fresh Produce', type: 'Agriculture', activity: 'Local vegetable trading', location: 'San Vicente, San Jose', submitted: '2026-09-11', status: 'Needs Requirements', documents: ['Business Application.pdf'], notes: 'Please provide the location sketch.', history: ['Application submitted · Sep 11, 2026', 'Additional requirements requested · Sep 12, 2026'] },
  { id: 'BR-2026-00126', applicant: 'Sofia Cruz', name: 'Sofia Community Store', type: 'Retail', activity: 'Neighborhood retail store', location: 'San Jose', submitted: '2026-09-12', status: 'New Application', documents: ['Business Application.pdf', 'Location Sketch.pdf'], notes: '', history: ['Application submitted · Sep 12, 2026'] },
  { id: 'BR-2026-00120', applicant: 'Paolo Garcia', name: 'Garcia Creative Studio', type: 'Digital Services', activity: 'Graphic design and digital content', location: 'San Vicente, San Jose', submitted: '2026-09-01', status: 'Approved', documents: ['Business Application.pdf', 'Location Sketch.pdf'], notes: 'Mock review completed.', history: ['Application submitted · Sep 1, 2026', 'Approved by LGU staff · Sep 5, 2026'] },
  { id: 'BR-2026-00119', applicant: 'Leo Flores', name: 'Flores Food Cart', type: 'Food Services', activity: 'Prepared food vending', location: 'Poblacion, San Jose', submitted: '2026-08-28', status: 'Rejected', documents: ['Business Application.pdf'], notes: 'Duplicate application in this demonstration.', history: ['Application submitted · Aug 28, 2026', 'Rejected · Sep 2, 2026'] },
]
export const transactions = [
  { id: 'JP-2026-001', kind: 'job', organization: 'Mindoro Digital Services', item: 'IT Support Technician', amount: 500, date: '2026-09-01', status: 'Paid', publication: 'Published' },
  { id: 'JP-2026-002', kind: 'job', organization: 'San Jose Business Center', item: 'Administrative Assistant', amount: 500, date: '2026-09-03', status: 'Paid', publication: 'Published' },
  { id: 'JP-2026-003', kind: 'job', organization: 'San Jose Business Center', item: 'Office Coordinator', amount: 500, date: '—', status: 'Pending', publication: 'Pending Payment' },
  { id: 'JP-2026-004', kind: 'job', organization: 'Mindoro Digital Services', item: 'Network Engineer', amount: 500, date: '—', status: 'Failed', publication: 'Pending Payment' },
  { id: 'JP-2026-005', kind: 'job', organization: 'Mindoro Digital Services', item: 'Junior Network Technician', amount: 500, date: '2026-07-01', status: 'Refunded', publication: 'Closed' },
  { id: 'TL-2026-001', kind: 'training', organization: 'Skills Development Institute', item: 'Network Administration Training', amount: 300, date: '2026-09-02', status: 'Paid', publication: 'Published' },
  { id: 'TL-2026-002', kind: 'training', organization: 'Skills Development Institute', item: 'Microsoft Excel for Work', amount: 300, date: '2026-09-03', status: 'Paid', publication: 'Published' },
  { id: 'TL-2026-003', kind: 'training', organization: 'Community Enterprise Academy', item: 'Business Planning Workshop', amount: 300, date: '—', status: 'Pending', publication: 'Pending Payment' },
  { id: 'TL-2026-004', kind: 'training', organization: 'Skills Development Institute', item: 'Advanced Server Lab', amount: 300, date: '—', status: 'Failed', publication: 'Pending Payment' },
]
export const sponsors = [
  { id: 'SP-001', name: 'XYZ Bank', program: 'Network Administration Training', slots: 20, total: 30, supported: 18, support: 'Training fee assistance', status: 'Active' },
  { id: 'SP-002', name: 'ABC Corporation', program: 'Youth Entrepreneurship Development', slots: 30, total: 30, supported: 30, support: 'Training + Mentoring', status: 'Active' },
]
export const initialUsers = [
  ...residents.map(r => ({ id: r.id, name: r.name, role: 'Resident', status: r.status, verification: 'Not Required', registered: '2026-08-12' })),
  ...organizations.map(o => ({ id: o.id, name: o.name, role: o.type, status: 'Active', verification: o.status, registered: o.registered })),
  { id: 'LGU-002', name: 'Patricia Lopez', role: 'LGU Staff', status: 'Active', verification: 'Verified', registered: '2026-01-05' },
]
export const lguNotifications = [
  { id: 'LN-1', type: 'verification', title: 'Employer verification request', message: 'ABC Solutions Inc. submitted an employer verification request.', date: '10 minutes ago', link: '/lgu/people?tab=Verification%20Requests', read: false },
  { id: 'LN-2', type: 'verification', title: 'Training agency verification', message: 'Mindoro Technical Training Center submitted documents for verification.', date: '35 minutes ago', link: '/lgu/people?tab=Training%20Agencies', read: false },
  { id: 'LN-3', type: 'business', title: 'Business registration', message: 'A new business registration application has been submitted for review.', date: '1 hour ago', link: '/lgu/entrepreneurship?tab=Business%20Registration%20%2F%20Permits', read: false },
  { id: 'LN-4', type: 'insight', title: 'High Networking skill gap', message: '120 interested residents have an identified Networking skill gap.', date: '2 hours ago', link: '/lgu/analytics?tab=Prescriptive%20Insights', read: false },
  { id: 'LN-5', type: 'training', title: 'Training capacity gap', message: '40 Networking training slots are available for 120 residents with identified needs.', date: '3 hours ago', link: '/lgu/opportunities?tab=Training%20Opportunities', read: true },
  { id: 'LN-6', type: 'job_match', title: 'New job vacancy', message: 'An IT Support Technician vacancy has been published.', date: 'Yesterday', link: '/lgu/opportunities?tab=Job%20Vacancies', read: true },
]
export const insights = [
  { id: 'I-1', title: 'High Networking Skill Gap', priority: 'High', skillId: 'network', explanation: 'Employer demand exceeds the pool of residents with the required skill and current training capacity.', action: 'Consider recommending available Networking training to affected residents and coordinating with participating Training Agencies or sponsors to increase training capacity.', actions: ['View Affected Residents', 'View Training Supply'] },
  { id: 'I-2', title: 'High Excel Demand for Administrative Roles', priority: 'Medium', skillId: 'excel', explanation: '68 Administrative Assistant vacancies require Excel; 96 interested residents lack the expected skill level.', action: 'Consider prioritizing Excel-related training opportunities for residents interested in administrative positions.', actions: ['View Demand', 'View Relevant Training'] },
  { id: 'I-3', title: 'Training Capacity Gap', priority: 'High', skillId: 'network', explanation: '120 residents need Networking training, with only 40 available slots: a capacity gap of 80.', action: 'Consider coordinating with verified Training Agencies or potential sponsors to increase available training capacity.', actions: ['View Training Supply'] },
  { id: 'I-4', title: 'Low Related Employment Outcome After Digital Marketing Training', priority: 'Review Recommended', skillId: 'marketing', explanation: '100 residents completed training; 15 have tracked placements related to the training area. This pattern warrants review and does not establish causation.', action: 'Consider reviewing the alignment of future Digital Marketing training initiatives with current employer demand before prioritizing additional programs.', actions: ['View Related Employment Outcomes'] },
]
export const reports = ['Workforce Overview', 'Employment Summary', 'Job Vacancy & Employer Demand', 'Skills Gap Report', 'Training Participation', 'Training Outcomes', 'Entrepreneurship', 'Business Registration']
