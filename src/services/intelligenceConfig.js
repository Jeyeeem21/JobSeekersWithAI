export const MATCH_WEIGHTS = { skills: .5, education: .2, experience: .15, certifications: .15 }
export const TRAINING_WEIGHTS = { gaps: .5, career: .25, eligibility: .1, availability: .1, fit: .05 }
export const RULES = { requiredSkillWeight: 4, preferredSkillWeight: 1, relevantMatch: 40, highGap: 50, mediumGap: 15, highDemand: 30, alignmentCompletions: 20, lowPlacementShare: .25 }
export const LEVELS = { None: 0, Beginner: 1, Intermediate: 2, Advanced: 3 }
export const SKILLS = {
  'water-quality': ['Water Quality Monitoring', 'Water Quality Management'],
  feeding: ['Fish Feeding Management', 'Feeding Management'],
  'fish-health': ['Fish Health Management', 'Fish Health'],
  aquaculture: ['Aquaculture Operations', 'Aquaculture Production'],
  handling: ['Fish Handling and Post-Harvest', 'Fish Handling', 'Post-Harvest Handling'],
  'food-safety': ['Food Safety for Fisheries Products', 'Food Safety'],
  hatchery: ['Hatchery Operations'], processing: ['Fish Processing'],
  marketing: ['Fisheries Marketing', 'Fish Marketing'],
  bookkeeping: ['Bookkeeping'], costing: ['Fisheries Costing and Pricing', 'Costing and Pricing'],
  service: ['Customer Service', 'Customer Management'],
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
  if (/aquaculture|tilapia|milkfish|catfish|fishpond|water quality|feeding|fish health/.test(s)) return 'aquaculture'
  if (/hatchery|nursery/.test(s)) return 'hatchery'
  if (/process|handling|post harvest|food safety|smoked|dried|debon/.test(s)) return 'processing'
  if (/market|vendor|trading|retail|delivery/.test(s)) return 'marketing'
  return s
}
