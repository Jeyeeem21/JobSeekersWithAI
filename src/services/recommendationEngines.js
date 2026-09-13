import { RULES, TRAINING_WEIGHTS, available, categoryOf, skillId, skillName, skillLevel, percent, normalize } from './intelligenceConfig.js'
import { matchJob, requirementsFor } from './matchingEngine.js'

export function skillGapsFor(profile, jobs, programs, asOf) {
  const interests = (profile.careerInterests || []).map(categoryOf)
  const relevant = jobs.filter(j => available(j, asOf) && (interests.includes(categoryOf(`${j.title} ${j.category || ''}`)) || matchJob(profile, j, asOf).matchScore >= 60))
  const grouped = new Map()
  relevant.forEach(job => matchJob(profile, job, asOf).skills.filter(s => s.status !== 'Matched').forEach(s => {
    const row = grouped.get(s.id) || { id: s.id, skillId: s.id, skill: s.name, currentLevel: s.currentLevel, targetLevel: s.level, status: s.status, relatedJobs: [], requiredCount: 0 }
    row.relatedJobs.push(job.title); row.requiredCount += s.required ? 1 : 0
    if (s.level === 'Advanced') row.targetLevel = s.level
    grouped.set(s.id, row)
  }))
  return [...grouped.values()].map(g => {
    const slots = programs.filter(p => available(p, asOf) && (p.skillIds || []).includes(g.id)).reduce((n, p) => n + p.slots, 0)
    const priority = g.requiredCount && (g.currentLevel === 'None' || g.requiredCount >= 2 || slots === 0) ? 'High' : g.requiredCount ? 'Medium' : 'Low'
    return { ...g, priority, jobDemand: g.relatedJobs.length, employerDemand: g.relatedJobs.length, trainingSlots: slots, description: `${g.status} in ${g.relatedJobs.length} relevant vacancy/ies; ${g.requiredCount} require this skill. ${slots} related seats available.`, residentsMissing: 1 }
  }).sort((a, b) => ['High', 'Medium', 'Low'].indexOf(a.priority) - ['High', 'Medium', 'Low'].indexOf(b.priority) || b.jobDemand - a.jobDemand || a.skill.localeCompare(b.skill))
}

export function trainingRecommendations(profile, programs, jobs, gaps, registrations, asOf) {
  return programs.filter(p => available(p, asOf)).map(p => {
    const skills = p.skillIds || []
    const covered = gaps.filter(g => skills.includes(g.skillId))
    const related = jobs.filter(j => available(j, asOf) && requirementsFor(j).some(r => skills.includes(r.id)))
    const prerequisiteGaps = (p.prerequisiteSkills || []).filter(s => skillLevel(profile, skillId(s)) < 1)
    const eligible = !prerequisiteGaps.length
    const completed = registrations.some(r => r.programId === p.id && r.residentId === profile.id && r.status === 'Completed')
    const registered = registrations.some(r => r.programId === p.id && r.residentId === profile.id && r.status !== 'Cancelled')
    const careerFit = related.some(j => (profile.careerInterests || []).map(categoryOf).includes(categoryOf(`${j.title} ${j.category || ''}`)))
    const local = normalize(profile.location).includes('san jose') && normalize(p.location).includes('san jose') || normalize(p.location).includes('online')
    const scheduleFits = !p.schedule || p.schedule.slice(0, 10) >= asOf || p.status === 'Active'
    const values = { gaps: skills.length ? covered.length / skills.length : 0, career: careerFit ? 1 : related.length ? .5 : 0, eligibility: eligible ? 1 : 0, availability: p.slots > 0 ? 1 : 0, fit: (Number(local) + Number(scheduleFits)) / 2 }
    const relevanceScore = completed ? 0 : percent(Object.entries(values).reduce((n, [key, value]) => n + TRAINING_WEIGHTS[key] * value, 0))
    const whyRecommended = `${p.name} addresses ${covered.map(g => g.skill).join(', ') || 'no currently identified job skill gaps'}${related.length ? ` for ${related.map(j => j.title).join(', ')}` : ''}. ${p.slots} seats available. ${eligible ? 'No recorded skill prerequisites are missing' : `Prerequisites to develop: ${prerequisiteGaps.join(', ')}`}. ${local ? 'Location aligns with your profile.' : 'Check travel or delivery arrangements.'} ${scheduleFits ? 'Review the published schedule.' : 'This batch has already started; confirm availability.'}`
    return { ...p, relevanceScore, eligible, registered, completed, relevance: completed ? 'Completed' : relevanceScore >= 70 ? 'Highly Relevant' : relevanceScore >= 40 ? 'Recommended' : 'Explore', coveredGaps: covered.map(g => g.skill), skillGapAddressed: covered.map(g => g.skill).join(', ') || 'No current gap', relatedJobs: related.map(j => j.title), whyRecommended, suggestedNextStep: completed ? 'Completed training is in your profile history.' : !eligible ? 'Develop the prerequisite skills first.' : p.slots ? 'Review the schedule and register if it fits your goals.' : 'This batch is full. Review other available programs.' }
  }).sort((a, b) => b.relevanceScore - a.relevanceScore || a.id.localeCompare(b.id))
}

// Pathway requirements are a catalog, not a second set of residents/jobs or precomputed scores.
export const BUSINESS_PATHWAYS = [
  { id: 'computer-repair', title: 'Computer Repair & Technical Support Service', category: 'Computer Repair', skills: ['diagnostics', 'hardware', 'support', 'service'], businessSkills: ['bookkeeping', 'costing', 'marketing'], resource: 'tool', capital: 15000, certification: 'css', targetMarket: 'Local households and small businesses', description: 'Computer diagnostics, repairs, setup, and user support.' },
  { id: 'digital-services', title: 'Digital Marketing & Content Service', category: 'Digital Services', skills: ['marketing', 'excel', 'service'], businessSkills: ['bookkeeping', 'costing'], resource: 'computer', capital: 5000, certification: 'marketing', targetMarket: 'Local businesses seeking digital promotion', description: 'Basic campaign support and digital content services.' },
  { id: 'office-services', title: 'Document & Office Support Service', category: 'Business Services', skills: ['excel', 'service'], businessSkills: ['bookkeeping', 'costing', 'marketing'], resource: 'printer', capital: 10000, certification: 'office', targetMarket: 'Students, residents, and small offices', description: 'Document preparation and basic office support.' },
]
export function entrepreneurshipRecommendations(profile, programs) {
  const info = profile.entrepreneurship || {}
  return BUSINESS_PATHWAYS.map(path => {
    const strengths = path.skills.filter(id => skillLevel(profile, id) >= 1).map(skillName)
    const developmentAreas = [...path.skills, ...path.businessSkills].filter(id => skillLevel(profile, id) < 2).map(skillName)
    const resources = normalize(info.availableResources).includes(path.resource)
    const capital = Math.max(0, Number(info.estimatedCapital) || 0)
    const interest = Boolean(info.interested) && (categoryOf(info.businessIdea) === categoryOf(path.title) || (profile.careerInterests || []).some(i => categoryOf(i) === categoryOf(path.title)))
    const experience = (profile.experience || []).some(e => categoryOf(e.position) === categoryOf(path.title))
    const certification = (profile.certifications || []).some(c => normalize(c.name).replace('computer systems servicing', 'css').includes(path.certification))
    const compatibilityScore = percent(.35 * strengths.length / path.skills.length + .15 * Number(experience) + .1 * Number(certification) + .15 * Number(interest) + .15 * Number(resources) + .1 * Math.min(1, capital / path.capital))
    const relatedTraining = programs.filter(p => p.slots > 0 && ['Active', 'Upcoming'].includes(p.status) && p.skillIds.some(id => developmentAreas.map(skillId).includes(id)))
    const assistance = (info.assistanceNeeded || []).join(', ')
    const whyRecommended = `${compatibilityScore}% compatibility from ${strengths.length}/${path.skills.length} practical skills, ${experience ? 'relevant' : 'no recorded relevant'} experience, ${certification ? 'related certification' : 'no recorded related certification'}, ${interest ? 'aligned interests' : 'limited interest alignment'}, ${resources ? 'relevant resources' : 'resources to confirm'}, and PHP ${capital.toLocaleString('en-US')} available capital versus an illustrative PHP ${path.capital.toLocaleString('en-US')} starting budget. ${assistance ? `Requested support: ${assistance}.` : ''} This is preparation guidance, not a promise of business success.`
    return { ...path, compatibilityScore, compatibility: compatibilityScore >= 70 ? 'High' : compatibilityScore >= 40 ? 'Medium' : 'Low', businessName: info.businessName || path.title, whyRecommended, existingStrengths: [...strengths, ...(resources ? [info.availableResources] : []), ...(certification ? ['Related certification in your profile'] : [])], developmentAreas, suggestedNextSteps: [...developmentAreas.map(s => `Develop ${s}.`), ...relatedTraining.map(p => `Consider ${p.name}.`), ...(assistance ? [`Discuss ${assistance} with the LGU.`] : []), 'Review costs and requirements with the LGU before submitting an application.'], estimatedStartup: { min: path.capital, max: path.capital * 2, note: 'Illustrative planning range, not a financial forecast.' }, preparationProgress: percent((strengths.length + Number(resources)) / (path.skills.length + path.businessSkills.length + 1)) }
  }).sort((a, b) => b.compatibilityScore - a.compatibilityScore || a.id.localeCompare(b.id))
}

export const insightPriority = (demand, gap) => demand >= RULES.highDemand && gap >= RULES.highGap ? 'High' : gap >= RULES.mediumGap ? 'Medium' : 'Low'
export function prescriptiveInsights(skills, programs) {
  const capacity = skills.map(s => {
    const gap = Math.max(0, s.missing - s.slots), priority = insightPriority(s.demand, gap)
    return { id: `CAP-${s.id}`, skillId: s.id, priority, gap, title: `${s.name}: ${gap ? 'training capacity gap' : 'capacity covers current needs'}`, explanation: `${s.demand} related vacancies, ${s.missing} residents needing development, and ${s.slots} available seats produce a capacity gap of ${gap}. High priority requires demand ≥ ${RULES.highDemand} and a gap ≥ ${RULES.highGap}; medium requires a gap ≥ ${RULES.mediumGap}.`, action: gap ? `Consider coordinating ${s.name} training capacity with participating agencies or sponsors; review the ${gap}-seat gap and current enrollment before deciding.` : 'Monitor enrollment and review capacity before adding another batch.', actions: ['View Affected Residents', 'View Training Supply'] }
  })
  const alignment = programs.filter(p => p.completed >= RULES.alignmentCompletions && p.placements / p.completed < RULES.lowPlacementShare && p.skillIds.length).map(p => ({ id: `ALIGN-${p.id}`, skillId: p.skillIds[0], programId: p.id, priority: 'Medium', title: `${p.name}: review employment alignment`, explanation: `${p.completed} historical completions and ${p.placements} tracked related placements (${percent(p.placements / p.completed)}%). Review is suggested below ${RULES.lowPlacementShare * 100}% with at least ${RULES.alignmentCompletions} completions. Cohort association does not establish causation.`, action: 'Review curriculum, employer needs and follow-up data with the agency. LGU staff decide the next action.', actions: ['View Related Employment Outcomes'] }))
  return [...capacity, ...alignment].sort((a, b) => ['High', 'Medium', 'Low'].indexOf(a.priority) - ['High', 'Medium', 'Low'].indexOf(b.priority) || (b.gap || 0) - (a.gap || 0) || a.id.localeCompare(b.id))
}

export function workforceSkills(state, programs, catalog, asOf) {
  const ids = [...new Set([...catalog.map(s => s.id), ...state.jobs.flatMap(j => requirementsFor(j).map(r => r.id)), ...programs.flatMap(p => p.skillIds)])]
  const tally = (jobs, profiles, id) => ({ demand: jobs.filter(j => available(j, asOf) && requirementsFor(j).some(r => r.id === id)).length, missing: Object.values(profiles).filter(p => jobs.some(j => available(j, asOf) && (p.careerInterests || []).map(categoryOf).includes(categoryOf(`${j.title} ${j.category || ''}`)) && matchJob(p, j, asOf).skills.some(r => r.id === id && r.status !== 'Matched'))).length, qualified: Object.values(profiles).filter(p => skillLevel(p, id) >= 2).length })
  return ids.map(id => {
    const seed = catalog.find(s => s.id === id)
    const now = tally(state.jobs, state.profiles, id)
    const base = state.intelligenceBaseline ? tally(state.intelligenceBaseline.jobs, state.intelligenceBaseline.profiles, id) : { demand: 0, missing: 0, qualified: 0 }
    const demand = Math.max(0, (seed?.demand || 0) + now.demand - (seed ? base.demand : 0))
    const missing = Math.max(0, (seed?.missing || 0) + now.missing - (seed ? base.missing : 0))
    const slots = programs.filter(p => available(p, asOf) && p.skillIds.includes(id)).reduce((n, p) => n + p.slots, 0)
    return { ...seed, id, name: skillName(id), category: seed?.category || 'Career Skills', demand, missing, qualified: Math.max(0, (seed?.qualified || 0) + now.qualified - (seed ? base.qualified : 0)), slots, priority: insightPriority(demand, Math.max(0, missing - slots)), scope: seed ? 'Historical workforce cohort plus changes in shared demo records' : 'Current shared demo records' }
  })
}
