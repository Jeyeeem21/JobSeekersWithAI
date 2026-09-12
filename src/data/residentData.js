// Mock data for consistent demo Resident: Juan Dela Cruz (R-001)
// MUST stay consistent with lguData.js, employerData.js, trainingData.js

export const demoResident = {
  id: 'R-001', // Matches LGU residents
  name: 'Juan Dela Cruz',
  email: 'juan.delacruz@email.com',
  phone: '+63 912 345 6789',
  location: 'Poblacion, San Jose, Occidental Mindoro', // Matches LGU data
  employmentStatus: 'Seeking Employment', // Matches LGU data
  availability: 'Immediate',
  profileCompletion: 92, // Matches LGU data
  
  education: {
    level: 'Bachelor\'s Degree',
    course: 'BS Information Technology', // Matches LGU data
    school: 'Sample State University',
    yearCompleted: '2025'
  },
  
  skills: [
    { id: 1, name: 'Computer Diagnostics', level: 'Intermediate', category: 'IT' }, // Matches LGU data
    { id: 2, name: 'Customer Service', level: 'Intermediate', category: 'Soft Skills' }, // Matches LGU data
    { id: 3, name: 'Hardware Installation', level: 'Intermediate', category: 'IT' },
    { id: 4, name: 'Basic Networking', level: 'Beginner', category: 'IT' },
    { id: 5, name: 'Technical Support', level: 'Intermediate', category: 'IT' }
  ],
  
  experience: [
    {
      id: 1,
      position: 'IT Support Intern',
      organization: 'Computer shop assistant', // Matches LGU data
      duration: '2 years', // Matches LGU data
      startDate: 'June 2023',
      endDate: 'August 2025',
      responsibilities: 'Assisted with computer troubleshooting, hardware setup, and basic user support'
    }
  ],
  
  certifications: [
    {
      id: 1,
      name: 'Computer Systems Servicing NC II', // Matches LGU data
      issuingOrganization: 'TESDA',
      dateIssued: 'May 2025',
      expiryDate: null
    }
  ],
  
  careerInterests: [
    'IT Support', // Matches LGU data
    'Technical Support',
    'Computer Technician'
  ],
  
  entrepreneurship: {
    interested: true,
    businessIdea: 'Computer Repair Services', // Matches LGU pathways data
    businessName: 'JD Computer Repair Services', // Matches LGU businesses data
    availableResources: 'Basic computer repair toolkit',
    estimatedCapital: 15000,
    previousExperience: 'None',
    assistanceNeeded: ['Business training', 'Startup capital guidance', 'Business permit assistance']
  },
  
  documents: [
    { id: 1, name: 'Resume.pdf', type: 'Resume', uploadDate: '2026-01-15' },
    { id: 2, name: 'CSS_NCII_Certificate.pdf', type: 'Certification', uploadDate: '2025-05-20' }
  ]
}

export const skillGaps = [
  {
    id: 1,
    skillId: 'network', // Matches LGU skills data
    skill: 'Network Configuration', // Matches LGU skills data
    priority: 'High',
    currentLevel: 'None',
    targetLevel: 'Intermediate',
    employerDemand: 75, // Matches LGU skills.demand
    residentsMissing: 120, // Matches LGU skills.missing
    trainingSlots: 40, // Matches LGU skills.slots
    jobDemand: 7,
    description: 'Required by 7 of your current recommended jobs',
    relatedJobs: ['IT Support Technician', 'Technical Support Associate', 'Junior Network Support']
  },
  {
    id: 2,
    skillId: 'directory', // Matches LGU skills data
    skill: 'Active Directory', // Matches LGU skills data
    priority: 'High',
    currentLevel: 'None',
    targetLevel: 'Beginner',
    employerDemand: 42, // Matches LGU skills.demand
    residentsMissing: 78, // Matches LGU skills.missing
    trainingSlots: 25, // Matches LGU skills.slots
    jobDemand: 5,
    description: 'Required by 5 recommended jobs',
    relatedJobs: ['IT Support Technician', 'Technical Support Associate']
  },
  {
    id: 3,
    skillId: 'security', // Matches LGU skills data
    skill: 'Cybersecurity Fundamentals',
    priority: 'High',
    currentLevel: 'None',
    targetLevel: 'Beginner',
    employerDemand: 28,
    residentsMissing: 54,
    trainingSlots: 15,
    jobDemand: 3,
    description: 'Required by 3 recommended jobs',
    relatedJobs: ['IT Support Technician', 'Junior System Support']
  }
]

// MUST match employerData.js candidateMatches
export const recommendedJobs = [
  {
    id: 'J-001', // Matches employerData.js and lguData.js
    title: 'IT Support Technician',
    company: 'Mindoro Digital Services', // Matches employerData.js
    employer: 'Mindoro Digital Services',
    location: 'San Jose, Occidental Mindoro',
    matchScore: 92, // MUST match employerData candidateMatches M-001
    salary: '₱22,000 – ₱28,000', // Matches employerData.js
    employmentType: 'Full-time',
    openings: 12,
    deadline: '2026-09-30',
    postedDate: '2026-09-01',
    description: 'Support workstations, troubleshoot local networks, and manage user accounts. Ideal for candidates with basic networking knowledge and customer service skills.',
    responsibilities: [
      'Provide technical support for workstation issues',
      'Troubleshoot local network connectivity problems',
      'Manage user accounts in Active Directory',
      'Install and configure hardware and software',
      'Document technical issues and solutions'
    ],
    requiredEducation: 'Bachelor\'s degree in Information Technology or related field',
    requiredSkills: ['Network Configuration', 'Active Directory', 'Cybersecurity Fundamentals'],
    preferredSkills: ['Customer Service', 'Computer Diagnostics'],
    certifications: ['Computer Systems Servicing NC II or equivalent'],
    matchedRequirements: [
      'Has relevant IT educational background',
      'Practical computer repair experience',
      'Currently upskilling in Network Configuration',
      'Lives in Poblacion (close to workplace)',
      'Strong profile completion and activity'
    ],
    missingRequirements: [
      'Needs to complete Network Configuration training (92% complete)',
      'Would benefit from Active Directory certification'
    ],
    whyRecommended: 'Strong candidate with solid IT foundation. Currently enrolled in Network Configuration training with 92% completion. Practical experience in computer repair demonstrates hands-on technical ability.',
    suggestedAction: 'Recommend interview upon training completion.',
    aiRecommendation: 'You match the employer\'s education requirement and have experience in computer troubleshooting and technical support. Your CSS NC II certification meets the preferred qualifications.'
  },
  {
    id: 'J-003', // Matches employerData.js
    title: 'Digital Marketing Associate',
    company: 'Mindoro Digital Services',
    employer: 'Mindoro Digital Services',
    location: 'San Jose, Occidental Mindoro',
    matchScore: 64, // Lower match (not IT-focused)
    salary: '₱20,000 – ₱26,000',
    employmentType: 'Full-time',
    openings: 4,
    deadline: '2026-09-20',
    postedDate: '2026-08-20',
    description: 'Prepare campaigns and monitor audience engagement. Work with our marketing team to develop and execute digital marketing strategies.',
    responsibilities: [
      'Develop and execute digital marketing campaigns',
      'Monitor and analyze campaign performance',
      'Manage social media accounts',
      'Create engaging content for various platforms'
    ],
    requiredEducation: 'Business, Marketing, or related field',
    requiredSkills: ['Digital Marketing', 'Microsoft Excel'],
    preferredSkills: ['Graphic Design', 'Content Writing'],
    certifications: [],
    matchedRequirements: [
      'Basic computer skills',
      'Microsoft Office proficiency'
    ],
    missingRequirements: [
      'Digital Marketing experience',
      'Social media management',
      'Content creation skills'
    ],
    whyRecommended: 'Your computer skills may transfer to digital marketing tools. Consider if you want to explore marketing career path.',
    suggestedAction: 'This role requires marketing-specific skills. Consider digital marketing training if interested in this career direction.',
    aiRecommendation: 'Limited match to current IT career focus. Consider only if exploring alternative career paths.'
  },
  {
    id: 'J-002', // Matches lguData.js
    title: 'Administrative Assistant',
    company: 'San Jose Business Center',
    employer: 'San Jose Business Center',
    location: 'San Jose, Occidental Mindoro',
    matchScore: 58, // Lower match
    salary: '₱18,000 – ₱23,000',
    employmentType: 'Full-time',
    openings: 8,
    deadline: '2026-09-28',
    postedDate: '2026-09-03',
    description: 'Maintain spreadsheets, prepare reports, and coordinate office records.',
    responsibilities: [
      'Maintain spreadsheets',
      'Prepare reports',
      'Coordinate office records',
      'General administrative support'
    ],
    requiredEducation: 'Business Administration or related',
    requiredSkills: ['Microsoft Excel', 'Communication'],
    preferredSkills: [],
    certifications: [],
    matchedRequirements: [
      'Microsoft Office proficiency'
    ],
    missingRequirements: [
      'Administrative experience',
      'Business administration background',
      'Advanced Excel skills'
    ],
    whyRecommended: 'Your Office skills partially match. Consider if interested in administrative work.',
    suggestedAction: 'This role is outside your IT career focus. Consider only if exploring administrative positions.',
    aiRecommendation: 'Limited alignment with IT Support career interest. May consider as alternative option.'
  }
]

// MUST match employerData.js applications
export const applications = [
  {
    id: 'APP-001', // Matches employerData
    jobId: 'J-001',
    jobTitle: 'IT Support Technician',
    company: 'Mindoro Digital Services',
    matchScore: 92,
    status: 'Applied', // Matches employerData status
    appliedDate: '2026-09-03', // Matches employerData
    lastUpdate: '2026-09-03',
    notes: 'Application successfully submitted.',
    coverLetter: 'I am excited to apply for the IT Support Technician position. With my background in IT and hands-on computer repair experience, I am confident I can contribute to your team while continuing to develop my networking skills.'
  }
]

// Training registrations - MUST match trainingData.js participants
export const myTraining = [
  {
    id: 'TR-001',
    trainingId: 'TR-002', // Matches lguData programs
    programId: 'TR-002',
    title: 'Network Configuration Lab',
    provider: 'Skills Development Institute',
    status: 'In Progress', // Matches LGU pathways
    progress: 92, // Matches LGU residents completion
    enrollmentDate: '2026-09-08',
    expectedCompletion: '2026-10-08',
    schedule: '2026-09-08',
    skillsDeveloped: ['Network Configuration', 'Router Setup', 'Switch Configuration'],
    attendance: 92,
    assessmentScore: null
  }
]

export const recommendedTraining = [
  {
    id: 'TR-001', // Matches lguData programs
    trainingId: 'TR-001',
    title: 'Network Administration Training',
    provider: 'Skills Development Institute',
    relevance: 'Highly Recommended',
    duration: '40 Hours',
    schedule: '2026-09-20 to 2026-10-05',
    timeSlot: '1:00 PM - 5:00 PM',
    location: 'San Jose, Occidental Mindoro',
    availableSlots: 30, // Matches lguData programs
    totalSlots: 50,
    registrations: 20,
    fee: 2500,
    skillsDeveloped: ['Network Configuration', 'Network Administration', 'Basic Server'],
    skillGapAddressed: 'Network Configuration',
    description: 'Learn essential network configuration concepts, router and switch setup, and network troubleshooting for IT professionals.',
    eligibility: 'Basic computer knowledge required',
    requirements: ['Valid ID', 'Notebook and pen', 'Laptop (optional)'],
    deadline: '2026-09-18',
    whyRecommended: 'Network Configuration is your highest priority skill gap and is required by 7 of your recommended job opportunities. This training directly addresses your identified development area.',
    relatedJobs: ['IT Support Technician', 'Technical Support Associate', 'Junior Network Support']
  },
  {
    id: 'TR-004', // Matches lguData programs
    trainingId: 'TR-004',
    title: 'Windows Server & Active Directory',
    provider: 'Skills Development Institute',
    relevance: 'Highly Recommended',
    duration: '32 Hours',
    schedule: '2026-09-25 to 2026-10-12',
    timeSlot: '9:00 AM - 1:00 PM',
    location: 'San Jose, Occidental Mindoro',
    availableSlots: 25,
    totalSlots: 40,
    registrations: 15,
    fee: 2800,
    skillsDeveloped: ['Active Directory', 'User Management', 'Windows Server'],
    skillGapAddressed: 'Active Directory',
    description: 'Master Windows Server and Active Directory management including user accounts, groups, and policies.',
    eligibility: 'Basic IT knowledge',
    requirements: ['Valid ID', 'Notebook'],
    deadline: '2026-09-23',
    whyRecommended: 'Active Directory is a high-priority skill gap required by 5 of your recommended jobs. This training will strengthen your IT Support qualifications.',
    relatedJobs: ['IT Support Technician', 'Technical Support Associate']
  },
  {
    id: 'TR-007', // Matches lguData programs
    trainingId: 'TR-007',
    title: 'Cybersecurity Fundamentals',
    provider: 'Skills Development Institute',
    relevance: 'Recommended',
    duration: '24 Hours',
    schedule: '2026-09-24 to 2026-10-01',
    timeSlot: '2:00 PM - 6:00 PM',
    location: 'San Jose, Occidental Mindoro',
    availableSlots: 15,
    totalSlots: 30,
    registrations: 15,
    fee: 2200,
    skillsDeveloped: ['Cybersecurity Fundamentals', 'Security Basics', 'Threat Prevention'],
    skillGapAddressed: 'Cybersecurity Fundamentals',
    description: 'Learn essential cybersecurity concepts, threat prevention, and security best practices.',
    eligibility: 'Basic IT knowledge',
    requirements: ['Valid ID', 'Notebook'],
    deadline: '2026-09-22',
    whyRecommended: 'Cybersecurity knowledge enhances your IT Support profile and addresses a skill gap relevant to 3 job opportunities.',
    relatedJobs: ['IT Support Technician']
  }
]

export const entrepreneurshipRecommendations = [
  {
    id: 'ENT-001',
    title: 'Computer Repair & Technical Support Service',
    businessName: 'JD Computer Repair Services', // Matches LGU businesses
    suitability: 'High Potential',
    category: 'Computer Repair', // Matches LGU pathways
    compatibility: 'High',
    existingStrengths: [
      'Computer Diagnostics', // Matches skills
      'Hardware Installation',
      'CSS NC II Certification',
      'Technical Support experience',
      'Basic Repair Toolkit available',
      'Estimated capital ₱15,000'
    ],
    skillsToImprove: [
      'Basic Accounting',
      'Pricing & Costing',
      'Digital Marketing',
      'Business Management',
      'Customer Service'
    ],
    estimatedStartup: {
      min: 10000,
      max: 25000,
      note: 'Illustrative estimate only for prototype demonstration'
    },
    whyRecommended: 'You already have computer troubleshooting, hardware installation, technical support skills, CSS NC II certification, and access to basic repair tools. Your IT education provides strong technical foundation.',
    description: 'Provide computer repair, troubleshooting, and technical support services to local residents and small businesses.',
    targetMarket: 'Local residents, home users, small businesses',
    requiredSkills: ['Computer Repair', 'Technical Support', 'Customer Service', 'Basic Business Management'],
    developmentAreas: ['Basic bookkeeping', 'Service costing', 'Digital marketing', 'Customer management'],
    trainingRecommendations: ['Basic Entrepreneurship', 'Financial Literacy', 'Digital Marketing Fundamentals'],
    suggestedNextSteps: [
      'Review the business pathway requirements',
      'Complete Business Management training',
      'Prepare initial business plan',
      'Start business registration application'
    ],
    preparationProgress: 60 // Matches LGU entrepreneurship stage
  }
]

// Business registration - MUST match lguData.js businesses
export const businessApplication = {
  id: 'BR-2026-00124', // Matches LGU businesses exactly
  applicant: 'Juan Dela Cruz',
  businessName: 'JD Computer Repair Services',
  businessType: 'Computer Repair',
  activity: 'Computer diagnostics, repairs, and maintenance',
  location: 'Poblacion, San Jose',
  address: 'Poblacion, San Jose, Occidental Mindoro',
  contactNumber: '+63 912 345 6789',
  submitted: '2026-09-10',
  status: 'Under Review', // Matches LGU businesses status
  documents: ['Business Application.pdf', 'Location Sketch.pdf', 'Owner ID.pdf'], // Matches LGU
  notes: '',
  history: [
    'Application submitted · Sep 10, 2026',
    'Assigned to LGU reviewer · Sep 11, 2026'
  ],
  timeline: [
    { stage: 'Application Submitted', date: '2026-09-10', status: 'Completed' },
    { stage: 'Under LGU Review', date: '2026-09-11', status: 'In Progress' },
    { stage: 'Additional Requirements', date: null, status: 'Pending' },
    { stage: 'Approved / Rejected', date: null, status: 'Pending' }
  ]
}

export const notifications = [
  { id: 'NOT-001', type: 'application', title: 'Application submitted', message: 'Your application for IT Support Technician has been submitted to Mindoro Digital Services.', date: '2026-09-03', read: false, link: '/resident/employment?tab=My%20Applications' },
  { id: 'NOT-002', type: 'job_match', title: 'New job match', message: 'IT Support Technician at Mindoro Digital Services is a 92% match for your profile.', date: '2026-09-01', read: true, link: '/resident/employment?tab=Recommended%20Jobs' },
  { id: 'NOT-003', type: 'training', title: 'Training recommendation', message: 'Network Administration Training may help address your Network Configuration skill gap.', date: '2026-09-01', read: true, link: '/resident/training?tab=Recommended%20Training' },
  { id: 'NOT-004', type: 'training_progress', title: 'Training in progress', message: 'Your Network Configuration Lab training is 92% complete.', date: '2026-09-12', read: false, link: '/resident/training?tab=My%20Training' },
  { id: 'NOT-005', type: 'business', title: 'Business application under review', message: 'Your business registration for JD Computer Repair Services is currently under LGU review.', date: '2026-09-11', read: false, link: '/resident/entrepreneurship?tab=Business%20Registration' }
]

export const progressTimeline = [
  { id: 1, title: 'Career Assessment Completed', date: '2026-08-12', type: 'assessment', description: 'Profile analyzed with 92% completion' },
  { id: 2, title: '12 Job Matches Found', date: '2026-08-12', type: 'jobs', description: 'AI-powered job matching completed' },
  { id: 3, title: '3 Skill Gaps Identified', date: '2026-08-12', type: 'skills', description: 'Network Configuration, Active Directory, Cybersecurity' },
  { id: 4, title: 'Registered for Network Training', date: '2026-09-08', type: 'training', description: 'Network Configuration Lab - Skills Development Institute' },
  { id: 5, title: 'Applied to IT Support Technician', date: '2026-09-03', type: 'application', description: 'Application submitted to Mindoro Digital Services' },
  { id: 6, title: 'Started Entrepreneurship Pathway', date: '2026-09-10', type: 'entrepreneurship', description: 'Computer Repair & Technical Support Service' },
  { id: 7, title: 'Business Registration Submitted', date: '2026-09-10', type: 'business', description: 'JD Computer Repair Services - Under LGU Review' }
]

// TESDA suggestions (external reference only)
export const tesdaSuggestions = [
  {
    id: 'TESDA-001',
    title: 'Computer Systems Servicing NC II',
    organization: 'TESDA',
    type: 'National Certification',
    description: 'You already hold this certification. Consider NC III or NC IV for advanced qualifications.',
    note: 'Already completed.',
    reference: 'https://www.tesda.gov.ph'
  },
  {
    id: 'TESDA-002',
    title: 'Computer Systems Servicing NC III',
    organization: 'TESDA',
    type: 'National Certification',
    description: 'Advanced computer servicing qualification covering network administration and server management.',
    note: 'Please verify current availability, eligibility, schedules, and enrollment directly with TESDA or an appropriate accredited provider.',
    reference: 'https://www.tesda.gov.ph'
  }
]
