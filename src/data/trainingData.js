// Training Agency data for Phase 4 - Mindoro Technical Training Center
// Reuses LGU data structure for consistency across roles
import { programs, skills, sponsors } from './lguData'

// Current training agency profile (logged in as Mindoro Technical Training Center)
export const currentAgency = {
  id: 'T-001',
  name: 'Mindoro Technical Training Center',
  contact: 'Grace Flores',
  email: 't-001@example.test',
  phone: '+63 918 765 4321',
  type: 'Technical Education',
  businessType: 'Training Institute',
  location: 'San Jose, Occidental Mindoro',
  address: '456 Education Drive, Poblacion, San Jose',
  registered: '2026-08-18',
  verified: null,
  verificationStatus: 'Pending Review',
  logo: null,
  description: 'Leading technical training center in Occidental Mindoro, providing quality skills development programs in IT infrastructure, office productivity, and digital marketing.',
  website: 'https://mindorotechnical.example.test',
  tesda: 'TESDA Registration No: R4B-MINDORO-001',
  accreditations: ['TESDA Registered', 'ISO 9001:2015 Certified'],
  documents: [
    { id: 'DOC-001', name: 'Business Registration.pdf', type: 'Business Permit', uploaded: '2026-08-18', status: 'Under Review' },
    { id: 'DOC-002', name: 'TESDA Registration.pdf', type: 'TESDA Certificate', uploaded: '2026-08-18', status: 'Under Review' },
    { id: 'DOC-003', name: 'Valid ID.pdf', type: 'Owner ID', uploaded: '2026-08-18', status: 'Under Review' }
  ],
  facilities: ['Computer Laboratory (30 units)', 'Network Configuration Lab', 'Training Rooms (3)', 'Office Skills Training Center'],
  instructors: [
    { id: 'INS-001', name: 'Prof. Miguel Santos', specialty: 'Network Infrastructure', certifications: ['CCNA', 'CompTIA Network+'] },
    { id: 'INS-002', name: 'Ms. Ana Reyes', specialty: 'Office Productivity', certifications: ['Microsoft Office Specialist Master'] },
    { id: 'INS-003', name: 'Mr. Carlo Diaz', specialty: 'Digital Marketing', certifications: ['Google Digital Marketing Certificate'] }
  ],
  statistics: {
    totalPrograms: 0,
    activePrograms: 0,
    totalSlots: 0,
    totalParticipants: 0,
    totalCompletions: 0,
    currentBatch: {
      programs: 0,
      participants: 0,
      completions: 0
    }
  }
}

// Agency's training programs - will be empty initially (pending verification)
export const agencyPrograms = []

// Sample programs to show after verification (for reference)
export const samplePrograms = [
  {
    id: 'TR-NEW-001',
    name: 'Network Administration Fundamentals',
    skillIds: ['network'],
    duration: '40 Hours',
    schedule: '2026-10-15 to 2026-10-30',
    timeSlot: '1:00 PM - 5:00 PM',
    capacity: 30,
    fee: 2500,
    status: 'Draft',
    description: 'Comprehensive training on network configuration, router setup, switch configuration, and basic troubleshooting for entry-level IT professionals.',
    objectives: [
      'Configure routers and switches',
      'Implement IP addressing schemes',
      'Troubleshoot network connectivity issues',
      'Understand network security basics'
    ],
    requirements: [
      'Basic computer literacy',
      'Interest in IT networking',
      'Laptop (optional but recommended)'
    ],
    targetAudience: 'Job seekers with IT interest, career shifters, fresh graduates',
    instructor: 'Prof. Miguel Santos',
    registrations: 0,
    participants: [],
    completions: 0,
    paymentStatus: 'Unpaid',
    paymentId: null,
    publicationEligible: false
  },
  {
    id: 'TR-NEW-002',
    name: 'Microsoft Excel Mastery',
    skillIds: ['excel'],
    duration: '24 Hours',
    schedule: '2026-10-20 to 2026-10-27',
    timeSlot: '9:00 AM - 12:00 PM',
    capacity: 40,
    fee: 1500,
    status: 'Draft',
    description: 'Master Microsoft Excel from basic data entry to advanced formulas, pivot tables, and data visualization for workplace productivity.',
    objectives: [
      'Create and format professional spreadsheets',
      'Use advanced formulas and functions',
      'Create and customize pivot tables',
      'Build charts and dashboards'
    ],
    requirements: [
      'Basic computer knowledge',
      'Willingness to practice',
      'Laptop with Excel installed'
    ],
    targetAudience: 'Administrative staff, job seekers, students',
    instructor: 'Ms. Ana Reyes',
    registrations: 0,
    participants: [],
    completions: 0,
    paymentStatus: 'Unpaid',
    paymentId: null,
    publicationEligible: false
  }
]

// Participants (after programs are published)
export const participants = []

// Sample participants (for reference)
export const sampleParticipants = [
  {
    id: 'P-001',
    residentId: 'R-001',
    name: 'Juan Dela Cruz',
    programId: 'TR-NEW-001',
    programName: 'Network Administration Fundamentals',
    registrationDate: '2026-10-01',
    status: 'Registered',
    attendance: 0,
    progress: 0,
    assessmentScore: null,
    completionDate: null,
    certificateIssued: false,
    employmentStatus: 'Seeking Employment',
    skillGap: 'Network Configuration'
  }
]

// Completion records
export const completionRecords = []

// Analytics data
export const trainingAnalytics = {
  overview: {
    totalPrograms: 0,
    activePrograms: 0,
    totalSlots: 0,
    registrations: 0,
    completions: 0,
    completionRate: 0,
    averageAttendance: 0,
    averageAssessment: 0
  },
  programPerformance: [],
  skillDevelopment: [],
  employmentOutcomes: []
}

// Skill gap alignment (from LGU data)
export const skillGapAlignment = skills.map(skill => ({
  skillId: skill.id,
  skillName: skill.name,
  employerDemand: skill.demand,
  residentsMissingSkill: skill.missing,
  currentSlots: skill.slots,
  gap: Math.max(0, skill.missing - skill.slots),
  priority: skill.priority,
  agencyPrograms: 0 // Will update after agency creates programs
}))

// Transactions (listing fees)
export const trainingTransactions = []

// Sponsorship opportunities
export const trainingSponsors = sponsors.filter(s => s.program && programs.some(p => p.name === s.program))

// Training agency notifications
export const trainingNotifications = [
  { id: 'TN-1', type: 'verification', title: 'Verification pending', message: 'Your agency verification is under LGU review. You\'ll be able to publish programs once verified.', date: '2 hours ago', link: '/training/profile', read: false },
  { id: 'TN-2', type: 'training', title: 'Welcome to EntritifAI', message: 'Complete your agency profile and prepare training programs for publication.', date: '1 day ago', link: '/training/profile', read: false },
  { id: 'TN-3', type: 'insight', title: 'High demand for Network skills', message: '120 residents need Network Configuration training. Current supply: 40 slots.', date: '1 day ago', link: '/training/analytics', read: true }
]

