import { MATCH_WEIGHTS, RULES, LEVELS, normalize, skillId, skillName, skillLevel, levelName, categoryOf, percent } from './intelligenceConfig.js'

export function requirementsFor(job) {
  const make = (value, required) => {
    const text = typeof value === 'object' ? value.name : value
    const suffix = String(text).match(/(?:—|:|\()\s*(Beginner|Intermediate|Advanced)\)?$/i)?.[1]
    const id = skillId(String(text).replace(/\s*(?:—|:|\()\s*(Beginner|Intermediate|Advanced)\)?$/i, ''))
    const level = typeof value === 'object' ? value.level : suffix || job.requiredSkillLevel || 'Intermediate'
    return { id, name: skillName(id), required, level: Object.keys(LEVELS).find(k => k.toLowerCase() === String(level).toLowerCase()) || 'Intermediate' }
  }
  const required = (job.requiredSkills || []).map(v => make(v, true))
  return [...new Map([...required, ...(job.preferredSkills || []).map(v => make(v, false)).filter(v => !required.some(r => r.id === v.id))].map(r => [r.id, r])).values()]
}
const certKey = value => normalize(value).replace(/computer systems servicing/g, 'css')
const educationKey = value => normalize(value).replace(/\bbs\b/g, 'bachelor').replace(/\bcs\b/g, 'computer science').replace(/\bit\b/g, 'information technology')
export function experienceMonths(profile, job, asOf) {
  const category = categoryOf(`${job.title} ${job.category || ''}`)
  // Merge overlapping relevant periods so simultaneous roles aren't double counted.
  const ranges = (profile.experience || []).filter(e => categoryOf(`${e.position} ${e.responsibilities || ''}`) === category).map(e => {
    const start = Date.parse(e.startDate), end = Date.parse(e.endDate || asOf)
    if (Number.isFinite(start) && Number.isFinite(end)) return [start, Math.min(end, Date.parse(asOf))]
    return null
  }).filter(r => r && r[1] >= r[0]).sort((a, b) => a[0] - b[0])
  const merged = []
  ranges.forEach(r => { const last = merged.at(-1); if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push([...r]) })
  return Math.floor(merged.reduce((n, r) => n + (r[1] - r[0]) / (86400000 * 30.4375), 0))
}
export function matchJob(profile, job, asOf) {
  const skills = requirementsFor(job).map(r => {
    const actual = skillLevel(profile, r.id), target = LEVELS[r.level]
    return { ...r, currentLevel: levelName(actual), coverage: Math.min(1, actual / target), status: actual >= target ? 'Matched' : actual ? 'Partial Gap' : 'Missing Skill' }
  })
  const weight = r => r.required ? RULES.requiredSkillWeight : RULES.preferredSkillWeight
  const skillFit = skills.length ? skills.reduce((n, r) => n + r.coverage * weight(r), 0) / skills.reduce((n, r) => n + weight(r), 0) : 1
  const education = profile.educationEntries || (profile.education ? [profile.education] : [])
  const accepted = (job.acceptedEducation || []).filter(Boolean)
  const actualEducation = education.map(e => `${e.level || ''} ${e.course || ''}`)
  const eduFit = !accepted.length ? 1 : accepted.some(a => actualEducation.some(e => educationKey(e).includes(educationKey(a)) || (normalize(a) === 'related field' && categoryOf(e) === categoryOf(job.title)))) ? 1 : 0
  const months = experienceMonths(profile, job, asOf), expected = Math.max(0, Number(job.minimumExperienceMonths) || 0)
  const expFit = expected ? Math.min(1, months / expected) : 1
  const certifications = [...(job.requiredCertifications || []).map(name => ({ name, required: true })), ...(job.preferredCertifications || []).map(name => ({ name, required: false }))]
  const certs = certifications.map(c => ({ ...c, matched: (profile.certifications || []).some(p => certKey(p.name) === certKey(c.name) && (!p.expiryDate || p.expiryDate >= asOf)) }))
  const certFit = certs.length ? certs.reduce((n, c) => n + (c.matched ? (c.required ? 4 : 1) : 0), 0) / certs.reduce((n, c) => n + (c.required ? 4 : 1), 0) : 1
  const values = { skills: skillFit, education: eduFit, experience: expFit, certifications: certFit }
  const components = Object.entries(values).map(([key, value]) => ({ key, score: percent(value), weight: MATCH_WEIGHTS[key], contribution: +(value * MATCH_WEIGHTS[key] * 100).toFixed(2) }))
  const matchScore = percent(Object.entries(values).reduce((n, [k, v]) => n + v * MATCH_WEIGHTS[k], 0))
  const matchedRequirements = [...skills.filter(s => s.status === 'Matched').map(s => `${s.name} (${s.currentLevel}${s.required ? '' : ', preferred'})`), ...(eduFit && accepted.length ? actualEducation : []), ...certs.filter(c => c.matched).map(c => c.name), ...(expected && months >= expected ? [`${months} months of relevant experience`] : [])]
  const missingRequirements = [...skills.filter(s => s.status !== 'Matched').map(s => `${s.name}: ${s.currentLevel} → ${s.level}${s.required ? '' : ' (preferred)'}`), ...(!eduFit ? [`Education: ${accepted.join(' or ')}`] : []), ...(expFit < 1 ? [`Relevant experience: ${months} of ${expected} months`] : []), ...certs.filter(c => !c.matched).map(c => `${c.name} (${c.required ? 'required' : 'preferred'})`)]
  const suggestedAction = missingRequirements.length ? `Review the role's requirements before applying. Develop ${skills.filter(s => s.status !== 'Matched').map(s => s.name).join(', ') || 'the listed qualifications'} to strengthen relevant parts of your profile.` : 'Your recorded qualifications cover the listed requirements. Review the role and apply if it fits your goals.'
  return { matchScore, components, skills, matchedRequirements, missingRequirements, suggestedAction, explanation: `${matchScore}% weighted match. ${components.map(c => `${c.key}: ${c.score}% × ${Math.round(c.weight * 100)}%`).join('; ')}. Unspecified criteria receive full credit; this is qualification fit, not a probability of hiring.`, experienceMonths: months }
}
