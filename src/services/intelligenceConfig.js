export const MATCH_WEIGHTS = { skills: .5, education: .2, experience: .15, certifications: .15 }
export const TRAINING_WEIGHTS = { gaps: .5, career: .25, eligibility: .1, availability: .1, fit: .05 }
export const RULES = { requiredSkillWeight: 4, preferredSkillWeight: 1, relevantMatch: 40, highGap: 50, mediumGap: 15, highDemand: 30, alignmentCompletions: 20, lowPlacementShare: .25 }
export const LEVELS = { None: 0, Beginner: 1, Intermediate: 2, Advanced: 3 }
export const SKILLS = {
  network: ['Network Configuration', 'Basic Networking', 'Networking', 'Network Fundamentals'],
  directory: ['Active Directory'], security: ['Cybersecurity Fundamentals'],
  excel: ['Microsoft Excel', 'Excel'], marketing: ['Digital Marketing'],
  diagnostics: ['Computer Diagnostics', 'Computer Troubleshooting', 'Troubleshooting'],
  hardware: ['Hardware Installation', 'Hardware Repair'], support: ['Technical Support', 'IT Support'],
  service: ['Customer Service', 'Customer Management'], linux: ['Linux Administration'],
  bookkeeping: ['Bookkeeping'], costing: ['Pricing / Costing', 'Service Costing'],
}
export const normalize = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
export function skillId(value) {
  const name = normalize(typeof value === 'object' ? value.name : value).replace(/ (beginner|intermediate|advanced)$/, '')
  return Object.keys(SKILLS).find(id => id === name || SKILLS[id].some(alias => normalize(alias) === name)) || name.replaceAll(' ', '-')
}
export const skillName = id => SKILLS[id]?.[0] || String(id).replaceAll('-', ' ')
export const skillLevel = (profile, id) => Math.max(0, ...(profile.skills || []).filter(s => skillId(s) === id).map(s => LEVELS[s.level] || 1))
export const levelName = number => Object.keys(LEVELS).find(k => LEVELS[k] === number) || 'Intermediate'
export const available = (record, date) => ['Active', 'Upcoming', 'Full'].includes(record.status) && (!record.deadline || record.deadline >= date)
export const percent = n => Math.round(Math.max(0, Math.min(1, n)) * 100)
export const categoryOf = text => {
  const s = normalize(text)
  if (/computer|network|technical|information technology|\bit\b|linux|server/.test(s)) return 'technology'
  if (/market|design|content|social media/.test(s)) return 'marketing'
  if (/office|admin|excel|record|data entry/.test(s)) return 'administration'
  if (/food|cook|baking/.test(s)) return 'food'
  return s
}
