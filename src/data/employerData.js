// Employer data for Phase 3 - Mindoro Digital Services
// Reuses LGU data structure for consistency across roles
import { vacancies, transactions, residents } from './lguData'

// Current employer profile (logged in as Mindoro Digital Services)
export const currentEmployer = {
  id: 'E-002',
  name: 'Mindoro Digital Services',
  contact: 'Ramon Diaz',
  email: 'e-002@example.test',
  phone: '+63 912 345 6789',
  industry: 'Information Technology',
  businessType: 'Corporation',
  location: 'San Jose, Occidental Mindoro',
  address: '123 Business District, Poblacion, San Jose',
  employees: '50-100',
  registered: '2026-08-18',
  verified: '2026-08-22',
  verificationStatus: 'Verified',
  logo: null,
  description: 'Leading IT services provider in Occidental Mindoro, specializing in network solutions, software development, and digital transformation services.',
  website: 'https://mindorodigital.example.test',
  documents: [
    { id: 'DOC-001', name: 'Business Registration.pdf', type: 'Business Permit', uploaded: '2026-08-18', status: 'Verified' },
    { id: 'DOC-002', name: 'Valid ID.pdf', type: 'Owner ID', uploaded: '2026-08-18', status: 'Verified' },
    { id: 'DOC-003', name: 'Company Profile.pdf', type: 'Company Profile', uploaded: '2026-08-18', status: 'Verified' }
  ],
  statistics: {
    totalVacancies: 24,
    activeVacancies: 3,
    totalHires: 49,
    currentMonth: {
      applications: 168,
      shortlisted: 84,
      interviewed: 42,
      hired: 7
    }
  }
}

// Employer's job vacancies - synced with LGU data
export const employerVacancies = [
  {
    id: 'J-001',
    title: 'IT Support Technician',
    category: 'IT Support',
    employmentType: 'Full-time',
    experienceLevel: 'Entry Level',
    openings: 12,
    filled: 0,
    status: 'Active',
    published: '2026-09-01',
    deadline: '2026-09-30',
    salary: { min: 22000, max: 28000, currency: 'PHP', period: 'month' },
    location: 'San Jose, Occidental Mindoro',
    description: 'Support workstations, troubleshoot local networks, and manage user accounts. Ideal for candidates with basic networking knowledge and customer service skills.',
    responsibilities: [
      'Provide technical support for workstation issues',
      'Troubleshoot local network connectivity problems',
      'Manage user accounts in Active Directory',
      'Install and configure hardware and software',
      'Document technical issues and solutions'
    ],
    requirements: [
      'Basic knowledge of computer hardware and software',
      'Understanding of network fundamentals',
      'Good customer service skills',
      'Ability to work in a team environment',
      'Willingness to learn new technologies'
    ],
    requiredSkills: ['Network Configuration', 'Active Directory', 'Cybersecurity Fundamentals'],
    preferredSkills: ['Customer Service', 'Computer Diagnostics'],
    applicants: 84,
    matched: 46,
    shortlisted: 28,
    interviewed: 12,
    offered: 3,
    paymentStatus: 'Paid',
    paymentId: 'JP-2026-001',
    paymentDate: '2026-09-01',
    paymentAmount: 500
  },
  {
    id: 'J-003',
    title: 'Digital Marketing Associate',
    category: 'Marketing',
    employmentType: 'Full-time',
    experienceLevel: 'Entry to Mid Level',
    openings: 4,
    filled: 1,
    status: 'Active',
    published: '2026-08-20',
    deadline: '2026-09-20',
    salary: { min: 20000, max: 26000, currency: 'PHP', period: 'month' },
    location: 'San Jose, Occidental Mindoro',
    description: 'Prepare campaigns and monitor audience engagement. Work with our marketing team to develop and execute digital marketing strategies.',
    responsibilities: [
      'Develop and execute digital marketing campaigns',
      'Monitor and analyze campaign performance',
      'Manage social media accounts',
      'Create engaging content for various platforms',
      'Track and report on marketing metrics'
    ],
    requirements: [
      'Experience with digital marketing platforms',
      'Strong written and verbal communication',
      'Analytical mindset and attention to detail',
      'Creative thinking and problem-solving',
      'Knowledge of social media trends'
    ],
    requiredSkills: ['Digital Marketing', 'Microsoft Excel'],
    preferredSkills: ['Graphic Design', 'Content Writing'],
    applicants: 38,
    matched: 22,
    shortlisted: 15,
    interviewed: 6,
    offered: 2,
    paymentStatus: 'Paid',
    paymentId: 'JP-2026-003',
    paymentDate: '2026-08-20',
    paymentAmount: 500
  },
  {
    id: 'J-005',
    title: 'Junior Network Technician',
    category: 'IT Support',
    employmentType: 'Full-time',
    experienceLevel: 'Entry Level',
    openings: 3,
    filled: 3,
    status: 'Closed',
    published: '2026-07-01',
    deadline: '2026-08-01',
    closedDate: '2026-08-05',
    salary: { min: 20000, max: 24000, currency: 'PHP', period: 'month' },
    location: 'San Jose, Occidental Mindoro',
    description: 'Assist with network installation and maintenance.',
    responsibilities: [
      'Install and configure network equipment',
      'Perform routine network maintenance',
      'Troubleshoot network connectivity issues',
      'Document network configurations',
      'Support senior technicians on projects'
    ],
    requirements: [
      'Basic networking knowledge',
      'Willingness to learn',
      'Good problem-solving skills',
      'Attention to detail'
    ],
    requiredSkills: ['Network Configuration'],
    preferredSkills: [],
    applicants: 46,
    matched: 28,
    shortlisted: 18,
    interviewed: 9,
    offered: 3,
    hired: 3,
    paymentStatus: 'Refunded',
    paymentId: 'JP-2026-005',
    paymentDate: '2026-07-01',
    paymentAmount: 500
  },
  {
    id: 'J-007',
    title: 'Network Engineer',
    category: 'IT Infrastructure',
    employmentType: 'Full-time',
    experienceLevel: 'Mid to Senior Level',
    openings: 2,
    filled: 0,
    status: 'Draft',
    created: '2026-09-10',
    salary: { min: 35000, max: 45000, currency: 'PHP', period: 'month' },
    location: 'San Jose, Occidental Mindoro',
    description: 'Design, implement, and maintain enterprise network infrastructure. Lead network projects and provide technical expertise.',
    responsibilities: [
      'Design and implement network solutions',
      'Manage enterprise network infrastructure',
      'Lead network upgrade projects',
      'Provide tier 3 technical support',
      'Mentor junior technicians'
    ],
    requirements: [
      '3+ years network engineering experience',
      'Strong knowledge of routing and switching',
      'Experience with enterprise firewalls',
      'Vendor certifications preferred (Cisco, CompTIA)',
      'Project management skills'
    ],
    requiredSkills: ['Network Configuration', 'Cybersecurity Fundamentals', 'Active Directory'],
    preferredSkills: ['Project Management', 'Cloud Services'],
    applicants: 0,
    matched: 0,
    shortlisted: 0,
    interviewed: 0,
    offered: 0,
    paymentStatus: 'Pending',
    paymentId: 'JP-2026-004',
    paymentAmount: 500
  }
]

// Candidate matches with AI explanations
export const candidateMatches = [
  {
    id: 'M-001',
    residentId: 'R-001',
    vacancyId: 'J-001',
    name: 'Juan Dela Cruz',
    matchScore: 92,
    status: 'Applied',
    matchDate: '2026-09-02',
    applicationDate: '2026-09-03',
    education: 'BS Information Technology',
    experience: 'Computer shop assistant · 2 years',
    location: 'Poblacion',
    skills: ['Computer Diagnostics', 'Customer Service'],
    missingSkills: ['Network Configuration', 'Active Directory'],
    inTraining: true,
    trainingProgress: 92,
    certifications: ['Computer Systems Servicing NC II'],
    whyMatched: [
      'Has relevant IT educational background',
      'Practical computer repair experience',
      'Currently upskilling in Network Configuration',
      'Lives in Poblacion (close to workplace)',
      'Strong profile completion and activity'
    ],
    whatsMissing: [
      'Needs to complete Network Configuration training (92% complete)',
      'Would benefit from Active Directory certification'
    ],
    aiRecommendation: 'Strong candidate with solid IT foundation. Currently enrolled in Network Configuration training with 92% completion. Practical experience in computer repair demonstrates hands-on technical ability. Recommend interview upon training completion.'
  },
  {
    id: 'M-002',
    residentId: 'R-003',
    vacancyId: 'J-001',
    name: 'Carlo Reyes',
    matchScore: 85,
    status: 'Shortlisted',
    matchDate: '2026-09-02',
    applicationDate: '2026-09-04',
    shortlistedDate: '2026-09-08',
    education: 'Senior High School · ICT',
    experience: 'Technical intern · 6 months',
    location: 'Poblacion',
    skills: ['Hardware Repair'],
    missingSkills: ['Network Configuration', 'Cybersecurity Fundamentals'],
    inTraining: true,
    trainingProgress: 75,
    certifications: [],
    whyMatched: [
      'ICT-focused education',
      'Hardware repair skills transferable to IT support',
      'Registered for Network Configuration training',
      'Close proximity to workplace',
      'Actively seeking employment'
    ],
    whatsMissing: [
      'Still building Network Configuration skills (75% progress)',
      'Lacks industry certifications',
      'Limited professional experience (internship only)'
    ],
    aiRecommendation: 'Promising entry-level candidate with basic technical skills. Currently building networking knowledge through training. Young and eager to learn. Good potential for development with proper mentorship.'
  },
  {
    id: 'M-003',
    residentId: 'R-008',
    vacancyId: 'J-001',
    name: 'Mark Villanueva',
    matchScore: 96,
    status: 'Interview Scheduled',
    matchDate: '2026-09-02',
    applicationDate: '2026-09-02',
    shortlistedDate: '2026-09-05',
    interviewDate: '2026-09-15',
    education: 'BS Computer Science',
    experience: 'Network technician · 3 years',
    location: 'San Vicente',
    skills: ['Network Configuration', 'Active Directory', 'Customer Service'],
    missingSkills: [],
    inTraining: false,
    certifications: ['CompTIA Network+', 'CCNA'],
    whyMatched: [
      'Exceeds all required skills',
      'Relevant 3-year professional experience',
      'Industry certifications (CompTIA Network+, CCNA)',
      'Strong Computer Science education',
      'No skill gaps identified'
    ],
    whatsMissing: [
      'No significant gaps identified'
    ],
    aiRecommendation: 'Excellent candidate with extensive qualifications. Professional experience directly aligns with role requirements. Industry certifications demonstrate commitment to field. Highly recommended for interview.'
  },
  {
    id: 'M-004',
    residentId: 'R-005',
    vacancyId: 'J-003',
    name: 'Paolo Garcia',
    matchScore: 94,
    status: 'Matched',
    matchDate: '2026-08-21',
    education: 'BS Entrepreneurship',
    experience: 'Freelance designer · 3 years',
    location: 'San Vicente',
    skills: ['Digital Marketing', 'Graphic Design'],
    missingSkills: [],
    inTraining: false,
    certifications: ['Digital Marketing certificate'],
    whyMatched: [
      'Strong digital marketing background',
      'Graphic design skills add value',
      'Entrepreneurial mindset',
      'Digital Marketing certification',
      '3 years freelance experience'
    ],
    whatsMissing: [
      'No corporate marketing experience',
      'Self-employed (may prefer entrepreneurship)'
    ],
    aiRecommendation: 'Highly qualified with creative and marketing skills. Currently self-employed with own business. May be exploring employment options or looking for stability. Strong portfolio expected given freelance background.'
  },
  {
    id: 'M-005',
    residentId: 'R-009',
    vacancyId: 'J-003',
    name: 'Jessa Aquino',
    matchScore: 89,
    status: 'Hired',
    matchDate: '2026-08-21',
    applicationDate: '2026-08-22',
    shortlistedDate: '2026-08-24',
    interviewDate: '2026-08-26',
    offerDate: '2026-08-27',
    hireDate: '2026-08-28',
    education: 'BA Communication',
    experience: 'Social media coordinator · 2 years',
    location: 'Poblacion',
    skills: ['Digital Marketing', 'Content Writing', 'Social Media Management'],
    missingSkills: [],
    certifications: ['Google Digital Marketing Certificate'],
    whyMatched: [
      'Relevant communication degree',
      'Professional social media experience',
      'Content creation skills',
      'Google certification in digital marketing',
      'Strong cultural fit'
    ],
    whatsMissing: [],
    aiRecommendation: 'Successfully hired. Strong performance in interview. Brings valuable social media and content creation experience to team.'
  }
]

// Applications for employer review
export const applications = [
  {
    id: 'APP-001',
    residentId: 'R-001',
    vacancyId: 'J-001',
    applicantName: 'Juan Dela Cruz',
    position: 'IT Support Technician',
    appliedDate: '2026-09-03',
    status: 'Applied',
    matchScore: 92,
    resume: 'Juan_Dela_Cruz_Resume.pdf',
    coverLetter: 'I am excited to apply for the IT Support Technician position. With my background in IT and hands-on computer repair experience, I am confident I can contribute to your team while continuing to develop my networking skills.',
    notes: '',
    reviewedBy: null,
    reviewedDate: null
  },
  {
    id: 'APP-002',
    residentId: 'R-003',
    vacancyId: 'J-001',
    applicantName: 'Carlo Reyes',
    position: 'IT Support Technician',
    appliedDate: '2026-09-04',
    status: 'Shortlisted',
    matchScore: 85,
    resume: 'Carlo_Reyes_Resume.pdf',
    coverLetter: 'As a recent graduate with ICT training and technical internship experience, I am eager to begin my career in IT support. I am currently enrolled in networking training to strengthen my skills.',
    notes: 'Good potential. Consider for interview after training completion.',
    reviewedBy: 'Ramon Diaz',
    reviewedDate: '2026-09-08',
    shortlistedDate: '2026-09-08'
  },
  {
    id: 'APP-003',
    residentId: 'R-008',
    vacancyId: 'J-001',
    applicantName: 'Mark Villanueva',
    position: 'IT Support Technician',
    appliedDate: '2026-09-02',
    status: 'Interview Scheduled',
    matchScore: 96,
    resume: 'Mark_Villanueva_Resume.pdf',
    coverLetter: 'With 3 years of network technician experience and industry certifications including CCNA, I am well-prepared to excel in this IT Support Technician role and contribute immediately to your technical team.',
    notes: 'Excellent candidate. Scheduled for interview.',
    reviewedBy: 'Ramon Diaz',
    reviewedDate: '2026-09-05',
    shortlistedDate: '2026-09-05',
    interviewScheduled: true,
    interviewDate: '2026-09-15',
    interviewTime: '10:00 AM'
  },
  {
    id: 'APP-004',
    residentId: 'R-010',
    vacancyId: 'J-003',
    applicantName: 'Lisa Fernandez',
    position: 'Digital Marketing Associate',
    appliedDate: '2026-09-01',
    status: 'Applied',
    matchScore: 81,
    resume: 'Lisa_Fernandez_Resume.pdf',
    coverLetter: 'My passion for digital marketing combined with my education in business administration makes me an ideal candidate for this role.',
    notes: '',
    reviewedBy: null,
    reviewedDate: null
  }
]

// Interview schedule
export const interviews = [
  {
    id: 'INT-001',
    applicationId: 'APP-003',
    residentId: 'R-008',
    vacancyId: 'J-001',
    applicantName: 'Mark Villanueva',
    position: 'IT Support Technician',
    date: '2026-09-15',
    time: '10:00 AM',
    duration: 60,
    location: 'Mindoro Digital Services Office',
    interviewers: ['Ramon Diaz', 'Technical Team Lead'],
    type: 'In-person',
    status: 'Scheduled',
    notes: 'Technical interview. Prepare network troubleshooting scenarios.',
    reminderSent: true
  },
  {
    id: 'INT-002',
    applicationId: 'APP-005',
    residentId: 'R-011',
    vacancyId: 'J-001',
    applicantName: 'Sarah Martinez',
    position: 'IT Support Technician',
    date: '2026-09-16',
    time: '2:00 PM',
    duration: 60,
    location: 'Virtual - Google Meet',
    interviewers: ['Ramon Diaz'],
    type: 'Virtual',
    status: 'Scheduled',
    notes: 'Initial screening interview.',
    reminderSent: false
  },
  {
    id: 'INT-003',
    applicationId: 'APP-006',
    residentId: 'R-009',
    vacancyId: 'J-003',
    applicantName: 'Jessa Aquino',
    position: 'Digital Marketing Associate',
    date: '2026-08-26',
    time: '3:00 PM',
    duration: 45,
    location: 'Mindoro Digital Services Office',
    interviewers: ['Ramon Diaz', 'Marketing Manager'],
    type: 'In-person',
    status: 'Completed',
    outcome: 'Hired',
    notes: 'Excellent interview. Portfolio impressive. Offered position.',
    completedDate: '2026-08-26'
  }
]

// Hiring decisions
export const hires = [
  {
    id: 'HIRE-001',
    applicationId: 'APP-006',
    residentId: 'R-009',
    vacancyId: 'J-003',
    hiree: 'Jessa Aquino',
    position: 'Digital Marketing Associate',
    offerDate: '2026-08-27',
    acceptedDate: '2026-08-28',
    startDate: '2026-09-05',
    salary: 24000,
    employmentType: 'Full-time',
    status: 'Active',
    notes: 'Successfully onboarded. Performing well in first week.'
  },
  {
    id: 'HIRE-002',
    applicationId: 'APP-007',
    residentId: 'R-012',
    vacancyId: 'J-005',
    hiree: 'Rico Bautista',
    position: 'Junior Network Technician',
    offerDate: '2026-07-20',
    acceptedDate: '2026-07-22',
    startDate: '2026-08-01',
    salary: 22000,
    employmentType: 'Full-time',
    status: 'Active',
    notes: 'Good progress. Showing strong technical aptitude.'
  },
  {
    id: 'HIRE-003',
    applicationId: 'APP-008',
    residentId: 'R-013',
    vacancyId: 'J-005',
    hiree: 'Ana Villegas',
    position: 'Junior Network Technician',
    offerDate: '2026-07-21',
    acceptedDate: '2026-07-23',
    startDate: '2026-08-01',
    salary: 21000,
    employmentType: 'Full-time',
    status: 'Active',
    notes: 'Reliable and detail-oriented.'
  }
]

// Analytics data
export const recruitmentAnalytics = {
  overview: {
    timeToFill: 18, // days average
    timeToHire: 24, // days from application to acceptance
    offerAcceptanceRate: 87, // percentage
    qualityOfHire: 4.2, // out of 5
    candidateExperience: 4.5, // out of 5
  },
  funnel: [
    { stage: 'Matched', count: 96, percentage: 100 },
    { stage: 'Applied', count: 168, percentage: 175 },
    { stage: 'Shortlisted', count: 84, percentage: 50 },
    { stage: 'Interviewed', count: 42, percentage: 25 },
    { stage: 'Offered', count: 12, percentage: 7 },
    { stage: 'Hired', count: 7, percentage: 4 }
  ],
  sourceEffectiveness: [
    { source: 'AI Matching', applications: 142, hires: 6, quality: 4.5 },
    { source: 'Direct Search', applications: 26, hires: 1, quality: 3.8 }
  ],
  monthlyTrend: [
    { month: 'Jul', applications: 52, hires: 3 },
    { month: 'Aug', applications: 64, hires: 4 },
    { month: 'Sep', applications: 52, hires: 0 }
  ]
}

// Skill gap analytics
export const skillGapAnalytics = [
  {
    skill: 'Network Configuration',
    demand: 75,
    qualified: 46,
    gap: 29,
    priority: 'High',
    trainingAvailable: 40,
    trainingEnrolled: 35,
    trend: 'Improving'
  },
  {
    skill: 'Active Directory',
    demand: 42,
    qualified: 21,
    gap: 21,
    priority: 'High',
    trainingAvailable: 25,
    trainingEnrolled: 15,
    trend: 'Improving'
  },
  {
    skill: 'Cybersecurity Fundamentals',
    demand: 28,
    qualified: 16,
    gap: 12,
    priority: 'High',
    trainingAvailable: 15,
    trainingEnrolled: 15,
    trend: 'Stable'
  },
  {
    skill: 'Digital Marketing',
    demand: 35,
    qualified: 82,
    gap: -47,
    priority: 'Low',
    trainingAvailable: 50,
    trainingEnrolled: 20,
    trend: 'Surplus'
  }
]

// Sponsorship opportunities
export const sponsorshipOpportunities = [
  {
    id: 'SPON-001',
    type: 'Training Sponsorship',
    program: 'Network Administration Training',
    slots: 20,
    costPerSlot: 2500,
    totalCost: 50000,
    benefit: 'Access to trained network technicians',
    status: 'Available',
    provider: 'Skills Development Institute'
  },
  {
    id: 'SPON-002',
    type: 'Training Sponsorship',
    program: 'Cybersecurity Fundamentals',
    slots: 10,
    costPerSlot: 2200,
    totalCost: 22000,
    benefit: 'Build local cybersecurity talent pool',
    status: 'Available',
    provider: 'Skills Development Institute'
  }
]

// Employer notifications
export const employerNotifications = [
  { id: 'EN-1', type: 'application', title: 'New application received', message: 'Juan Dela Cruz applied for IT Support Technician position.', date: '2 hours ago', link: '/employer/applicants', read: false },
  { id: 'EN-2', type: 'job_match', title: 'New candidate matches', message: '3 new candidates matched for IT Support Technician position.', date: '4 hours ago', link: '/employer/matches', read: false },
  { id: 'EN-3', type: 'interview', title: 'Interview reminder', message: 'Mark Villanueva interview scheduled for tomorrow at 10:00 AM.', date: '1 day ago', link: '/employer/interviews', read: false },
  { id: 'EN-4', type: 'training', title: 'Candidate completed training', message: 'Juan Dela Cruz completed Network Configuration training (92% score).', date: '1 day ago', link: '/employer/matches', read: true },
  { id: 'EN-5', type: 'application', title: 'Application update', message: 'Carlo Reyes updated his resume and certifications.', date: '2 days ago', link: '/employer/applicants', read: true },
  { id: 'EN-6', type: 'payment', title: 'Job posting fee due', message: 'Payment required to publish Network Engineer vacancy.', date: '2 days ago', link: '/employer/transactions', read: true }
]
