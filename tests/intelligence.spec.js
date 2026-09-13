import { test, expect } from '@playwright/test'
import { matchJob } from '../src/services/matchingEngine.js'
import { skillGapsFor, trainingRecommendations, entrepreneurshipRecommendations, prescriptiveInsights } from '../src/services/recommendationEngines.js'

const date = '2026-09-13'
const profile = { id: 'R', skills: [{ name: 'Basic Networking', level: 'Beginner' }], educationEntries: [{ course: 'BS Information Technology' }], experience: [], certifications: [{ name: 'Computer Systems Servicing NC II' }], careerInterests: ['IT Support'], location: 'San Jose', entrepreneurship: { interested: true, estimatedCapital: 15000, availableResources: 'repair toolkit', businessIdea: 'Computer Repair' } }
const job = { id: 'J', title: 'IT Support Technician', status: 'Active', requiredSkills: ['Network Configuration', 'Active Directory'], acceptedEducation: ['BS Information Technology'], preferredCertifications: ['CSS NC II'] }
test('deterministic qualification evidence, preferred weighting and reassessment', () => {
  const initial = matchJob(profile, job, date)
  expect(matchJob(profile, job, date)).toEqual(initial)
  expect(initial.skills[0].status).toBe('Partial Gap')
  expect(initial.skills[1].status).toBe('Missing Skill')
  expect(initial.components.find(c => c.key === 'certifications').score).toBe(100)
  const improved = { ...profile, skills: [...profile.skills, { name: 'Active Directory', level: 'Intermediate' }] }
  expect(matchJob(improved, job, date).matchScore).toBeGreaterThan(initial.matchScore)
  expect(skillGapsFor(improved, [job], [], date).some(g => g.skillId === 'directory')).toBe(false)
  const required = matchJob(profile, { ...job, requiredSkills: [...job.requiredSkills, 'Linux Administration'] }, date)
  const preferred = matchJob(profile, { ...job, preferredSkills: ['Linux Administration'] }, date)
  expect(preferred.matchScore).toBeGreaterThan(required.matchScore)
  expect(required.missingRequirements.join(' ')).toContain('Linux Administration')
})
test('ranking responds to skills, not payment, and business resources affect compatibility', () => {
  const programs = [{ id: 'P', name: 'Directory Basics', status: 'Upcoming', slots: 25, skillIds: ['directory'], location: 'San Jose', schedule: '2026-09-20' }]
  const rank = (p, records) => trainingRecommendations(p, records, [job], skillGapsFor(p, [job], records, date), [], date)[0]
  const before = rank(profile, programs)
  expect(rank(profile, programs.map(p => ({ ...p, paymentStatus: 'Paid', fee: 99999 }))).relevanceScore).toBe(before.relevanceScore)
  const improved = { ...profile, skills: [...profile.skills, { name: 'Active Directory', level: 'Intermediate' }] }
  expect(rank(improved, programs).relevanceScore).toBeLessThan(before.relevanceScore)
  const business = entrepreneurshipRecommendations(profile, programs).find(b => b.id === 'computer-repair')
  const depleted = entrepreneurshipRecommendations({ ...profile, entrepreneurship: { estimatedCapital: 0, availableResources: '' } }, programs).find(b => b.id === 'computer-repair')
  expect(business.compatibilityScore).toBeGreaterThan(depleted.compatibilityScore)
  expect(depleted.whyRecommended).toContain('PHP 0')
})
test('prescriptive thresholds regenerate explanation and priority', () => {
  const base = { id: 'network', name: 'Network Configuration', demand: 75, missing: 120, slots: 40 }
  const high = prescriptiveInsights([base], [])[0]
  const medium = prescriptiveInsights([{ ...base, slots: 100 }], [])[0]
  expect(high.priority).toBe('High'); expect(high.gap).toBe(80)
  expect(medium.priority).toBe('Medium'); expect(medium.gap).toBe(20)
  expect(medium.explanation).toContain('100 available seats')
})

async function go(page, route) {
  await page.goto(`/#/${route}`)
  await page.locator('main h1').first().waitFor()
}
async function models(page) {
  return page.evaluate(async () => {
    const { getDemoState } = await import('/src/data/demoStore.js')
    const { residentModel, employerModel, lguModel } = await import('/src/data/demoModels.js')
    const s = getDemoState()
    return { resident: residentModel(s), employer: employerModel(s), lgu: lguModel(s) }
  })
}
test('profile edit persists and Resident / Employer share score and gaps', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message))
  await go(page, 'resident/employment')
  const before = (await models(page)).resident.recommendedJobs.find(j => j.id === 'J-001').matchScore
  expect(before).toBeGreaterThanOrEqual(80); expect(before).toBeLessThanOrEqual(85)
  await go(page, 'resident/profile?tab=Skills%20%26%20Qualifications')
  await page.getByRole('button', { name: 'Add Skill', exact: true }).click()
  await page.getByLabel('Skill Name', { exact: true }).fill('Active Directory')
  await page.getByLabel('Proficiency', { exact: true }).selectOption('Intermediate')
  await page.getByRole('dialog').getByRole('button', { name: 'Save Changes' }).click()
  await page.getByRole('button', { name: 'Reassess Career Profile' }).click()
  await expect.poll(async () => (await models(page)).resident.recommendedJobs.find(j => j.id === 'J-001').matchScore).toBeGreaterThan(before)
  const result = await models(page)
  expect(result.resident.skillGaps.some(g => g.skillId === 'directory')).toBe(false)
  const score = result.resident.recommendedJobs.find(j => j.id === 'J-001').matchScore
  expect(result.employer.candidateMatches.find(m => m.residentId === 'R-001' && m.vacancyId === 'J-001').matchScore).toBe(score)
  await page.reload()
  expect((await models(page)).resident.recommendedJobs.find(j => j.id === 'J-001').matchScore).toBe(score)
  expect(errors).toEqual([])
})
test('employer requirement edit updates Resident gap and both scores', async ({ page }) => {
  await go(page, 'employer/vacancies')
  const before = (await models(page)).resident.recommendedJobs.find(j => j.id === 'J-001').matchScore
  await page.getByRole('row').filter({ hasText: 'IT Support Technician' }).getByRole('button', { name: 'Edit', exact: true }).click()
  const input = page.getByLabel('Required Skills')
  await input.fill(`${await input.inputValue()}, Linux Administration`)
  await page.getByRole('dialog').getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const result = await models(page)
  const jobResult = result.resident.recommendedJobs.find(j => j.id === 'J-001')
  expect(jobResult.matchScore).toBeLessThan(before)
  expect(jobResult.missingRequirements.join(' ')).toContain('Linux Administration')
  expect(result.resident.skillGaps.some(g => g.skillId === 'linux')).toBe(true)
  expect(result.employer.candidateMatches.find(m => m.residentId === 'R-001' && m.vacancyId === 'J-001').matchScore).toBe(jobResult.matchScore)
})
test('registration -> agency completion -> developed skills and actual before/after', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message))
  await go(page, 'resident/training?tab=Recommended%20Training')
  const before = await models(page)
  // Details identifies the exact program even when ranking changes card order.
  const card = page.locator('main').getByText('Network Administration Fundamentals', { exact: true }).first()
  await expect(card).toBeVisible()
  await page.evaluate(() => { window.location.hash = '/training/participants' })
  await page.getByLabel('Demo Organization', { exact: true }).selectOption('T-002')
  // Complete the existing Network Configuration Lab enrollment via the same completion action.
  await page.getByRole('row').filter({ hasText: 'Network Configuration Lab' }).getByRole('button', { name: 'Mark Completed' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Mark Completed' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const after = await models(page)
  expect(after.resident.state.myTraining.find(r => r.programId === 'TR-002').status).toBe('Completed')
  expect(after.resident.skillGaps.some(g => g.skillId === 'network')).toBe(false)
  expect(after.resident.recommendedJobs.find(j => j.id === 'J-001').matchScore).toBeGreaterThan(before.resident.recommendedJobs.find(j => j.id === 'J-001').matchScore)
  expect(after.lgu.snapshot.trainingCompleted).toBe(before.lgu.snapshot.trainingCompleted + 1)
  await page.reload()
  expect((await models(page)).resident.state.myTraining.find(r => r.programId === 'TR-002').status).toBe('Completed')
  expect(errors).toEqual([])
})
