import { useSyncExternalStore } from 'react'
import { skillId, skillName, skillLevel, levelName } from '../services/intelligenceConfig.js'
import { matchJob } from '../services/matchingEngine.js'
import * as lgu from './lguData'
import * as resident from './residentData'
import * as employer from './employerData'
import * as training from './trainingData'

export const DEMO_KEY = 'entritifai-shared-demo-v1'
export const today = () => new Date().toLocaleDateString('en-CA')
export const uid = prefix => `${prefix}-${crypto.randomUUID()}`
const copy = value => structuredClone(value)
const read = key => { try { return JSON.parse(localStorage.getItem(key)) } catch { return null } }
const merge = (rows, key = r => r.id) => [...new Map(rows.map(r => [key(r), r])).values()]
const skillIds = values => [...new Set((values || []).map(skillId).filter(Boolean))]
const asApplication = a => ({ ...a, residentId: a.residentId || 'R-001', jobId: a.jobId || a.vacancyId, status: a.status === 'Applied' ? 'Submitted' : a.status, lastUpdate: a.lastUpdate || a.appliedDate })
const asRegistration = r => ({ ...r, residentId: r.residentId || 'R-001', programId: r.programId || r.trainingId, status: r.status === 'In Progress' ? 'In Training' : r.status, registrationDate: r.registrationDate || r.enrollmentDate, progress: r.progress || 0, attendance: r.attendance || 0 })

function initialState() {
  const oldLGU = read('entritifai-lgu-phase2-v1') || {}
  const oldResident = read('entritifai-resident-phase5-v1') || {}
  const oldEmployer = read('entritifai-employer-phase3-v1') || {}
  const oldTraining = read('entritifai-training-phase4-v1') || {}
  const orgs = (oldLGU.orgs || lgu.organizations).map(o => ({ ...(o.id === employer.currentEmployer.id ? employer.currentEmployer : o.id === training.currentAgency.id ? training.currentAgency : {}), ...o }))
  let jobs = lgu.vacancies.map(v => ({ location: 'San Jose, Occidental Mindoro', employmentType: 'Full-time', experienceLevel: 'Entry Level', requiredSkills: v.skillIds.map(id => lgu.skills.find(s => s.id === id).name), preferredSkills: [], responsibilities: [], requirements: [], salary: { min: 14000, max: 24000 }, ...v, id: v.id, title: v.name, employerId: orgs.find(o => o.name === v.employer)?.id || 'E-002', baseApplicants: v.applicants, skillIds: v.skillIds }))
  jobs = merge([...jobs, ...(oldEmployer.vacancies || []).filter(v => !/IT Support|Network|Digital Marketing/i.test(v.title || '')).map(v => ({ ...v, employerId: 'E-002', skillIds: skillIds(v.requiredSkills), baseApplicants: 0 }))])
  let registrations = merge([...(oldResident.myTraining || []), ...(oldTraining.participants || [])].map(asRegistration), r => `${r.residentId}/${r.programId}`)
  const programs = merge([...lgu.programs.map(p => {
    const rec = resident.recommendedTraining.find(r => r.id === p.id) || {}
    return { description: 'Skills development for local residents.', duration: '40 Hours', location: 'San Jose, Occidental Mindoro', requirements: ['Basic computer literacy'], objectives: [], targetAudience: 'Interested residents', instructor: 'Agency training team', timeSlot: '09:00–12:00', paymentStatus: 'Paid', ...rec, ...p, agencyId: orgs.find(o => o.name === p.agency)?.id, baseRegistrations: p.registrations - registrations.filter(r => r.programId === p.id && r.status !== 'Cancelled').length, baseCompleted: p.completed }
  }), ...(oldTraining.programs || []).map(p => ({ ...p, agencyId: 'T-001', skillIds: skillIds(p.skillIds), baseRegistrations: Math.max(0, (p.registrations || 0) - registrations.filter(r => r.programId === p.id && r.status !== 'Cancelled').length), baseCompleted: p.completions || 0 }))])
  registrations = registrations.filter(r => programs.some(p => p.id === r.programId))
  const applications = merge([...(oldResident.applications || [])].filter(a => jobs.some(j => j.id === (a.jobId || a.vacancyId))).map(asApplication), a => `${a.residentId}/${a.jobId}`)
  const businesses = merge([...(oldLGU.businesses || lgu.businesses), ...(oldResident.businessApplication ? [{ ...oldResident.businessApplication, name: oldResident.businessApplication.businessName, type: oldResident.businessApplication.businessType }] : [])]).map(b => ({ ...b, residentId: b.residentId || (b.applicant === resident.demoResident.name ? 'R-001' : lgu.residents.find(r => r.name === b.applicant)?.id), documents: b.documents || [], history: b.history || [] }))
  const fisheriesSeed = { id: 'R-001', name: 'Juan Dela Cruz', email: 'juan.delacruz@email.com', phone: '+63 912 345 6789', location: 'Poblacion, San Jose, Occidental Mindoro', employmentStatus: 'Seeking Employment', availability: 'Immediate', profileCompletion: 92, educationEntries: [{ id: 'EDU-FISH-1', level: "Bachelor's Degree", course: 'BS Fisheries', school: 'Occidental Mindoro State College', yearCompleted: '2025' }], skills: [{ id: 'SKILL-FISH-1', name: 'Aquaculture Operations', level: 'Intermediate', category: 'Aquaculture' }, { id: 'SKILL-FISH-2', name: 'Fish Feeding Management', level: 'Intermediate', category: 'Aquaculture' }, { id: 'SKILL-FISH-3', name: 'Fish Handling and Post-Harvest', level: 'Beginner', category: 'Post-Harvest' }], experience: [{ id: 'EXP-FISH-1', position: 'Tilapia Farm Assistant', organization: 'San Jose Demonstration Farm', startDate: '2023-06-01', endDate: '2025-08-31', responsibilities: 'Supported feeding, pond preparation, harvesting and farm records.' }], certifications: [{ id: 'CERT-FISH-1', name: 'Aquaculture NC II', issuingOrganization: 'TESDA', dateIssued: '2025-05-01' }], careerInterests: ['Aquaculture', 'Fish Farming'], entrepreneurship: { interested: true, businessIdea: 'Small-scale Tilapia Farming', businessName: 'Juan’s Tilapia Grow-out', availableResources: 'Small fishpond access, nets and feeding tools', estimatedCapital: 30000, assistanceNeeded: ['Water quality training', 'Business permit assistance', 'Capital guidance'] } }
  const storedProfile = oldResident.profile
  const profile = copy(storedProfile && !/Information Technology|Computer Repair|Network/i.test(JSON.stringify(storedProfile)) ? storedProfile : fisheriesSeed)
  // Ensure educationEntries array exists (convert from single education object if needed)
  if (!profile.educationEntries && profile.education) {
    profile.educationEntries = [{ id: uid('EDU'), ...profile.education }]
  } else if (!profile.educationEntries) {
    profile.educationEntries = []
  }
  // Ensure all arrays exist
  profile.skills ||= []
  profile.experience ||= []
  profile.certifications ||= []
  // Normalize IDs and dates
  profile.skills = profile.skills.map((s) => ({ ...s, id: s.id?.toString() || uid('SKILL') }))
  profile.educationEntries = profile.educationEntries.map((e) => ({ ...e, id: e.id?.toString() || uid('EDU') }))
  profile.experience = profile.experience.map((e) => ({ ...e, id: e.id?.toString() || uid('EXP'), startDate: /^\d{4}-/.test(e.startDate) ? e.startDate : '2023-06-01', endDate: /^\d{4}-/.test(e.endDate) ? e.endDate : '2025-08-31' }))
  profile.certifications = profile.certifications.map((c) => ({ ...c, id: c.id?.toString() || uid('CERT'), dateIssued: /^\d{4}-/.test(c.dateIssued) ? c.dateIssued : '2025-05-01' }))
  const interviews = employer.interviews.filter(i => applications.some(a => a.id === i.applicationId)).map(i => ({ ...i, jobId: i.vacancyId }))
  const subscriptions = [{ id: 'SUB-E-002', organizationId: 'E-002', organizationType: 'Employer', plan: '1-Year Subscription', startDate: '2026-01-01', expiryDate: '2026-12-31', status: 'Active', amount: 6000, createdAt: '2026-01-01', renewedAt: '2026-01-01' }, { id: 'SUB-T-001', organizationId: 'T-001', organizationType: 'Training Agency', plan: '6-Month Subscription', startDate: '2026-07-01', expiryDate: '2026-12-31', status: 'Active', amount: 3600, createdAt: '2026-07-01', renewedAt: '2026-07-01' }]
  const state = { version: 2, orgs, profiles: { 'R-001': profile }, jobs, programs, applications, registrations, interviews, businesses, placements: copy(lgu.placements), transactions: copy(lgu.transactions), subscriptions, sponsors: copy(lgu.sponsors), users: copy(oldLGU.users || lgu.initialUsers), settings: { lgu: oldLGU.settings || { name: 'Municipality of San Jose', province: 'Occidental Mindoro', region: 'MIMAROPA', office: 'Fisheries and Employment Assistance Desk', email: 'peso@sanjose.example.test', phone: '043 555 0100', address: 'Municipal Hall, San Jose', density: 'Comfortable', period: 'This Year' }, resident: { emailNotifications: true }, employer: oldEmployer.settings || { emailNotifications: { matches: true, applications: true, interviews: true, summary: false } }, training: oldTraining.settings || { emailNotifications: { registrations: true, completions: true, payments: true, summary: false } } }, activeEmployerId: 'E-002', activeAgencyId: 'T-001', notifications: { resident: [], employer: [], training: [], lgu: copy(lgu.lguNotifications) }, invitations: [] }
  state.baseline = { applications: applications.length, shortlisted: applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length, interviews: interviews.length, placements: state.placements.length, registrations: registrations.filter(r => r.status !== 'Cancelled').length, completions: registrations.filter(r => r.status === 'Completed').length, activeJobs: jobs.filter(j => j.status === 'Active').length, verifiedEmployers: orgs.filter(o => o.type === 'Employer' && o.status === 'Verified').length, verifiedAgencies: orgs.filter(o => o.type === 'Training Agency' && o.status === 'Verified').length, jobs: jobs.map(j => ({ id: j.id, applicantCount: applications.filter(a => a.jobId === j.id).length })) }
  return state
}
function upgradeIntelligence(s) {
  if (s.intelligenceVersion === 2) return s
  const profiles = { ...s.profiles }
  for (const candidate of employer.candidateMatches) {
    if (profiles[candidate.residentId]) continue
    profiles[candidate.residentId] = { id: candidate.residentId, name: candidate.name, location: candidate.location || 'San Jose', skills: (candidate.skills || []).map((name, i) => ({ id: `SEED-${i}`, name, level: 'Intermediate' })), educationEntries: [{ id: 'EDU-1', course: candidate.education, level: '' }], experience: [{ id: 'EXP-1', position: candidate.experience || '', duration: candidate.experience || '' }], certifications: (candidate.certifications || []).map((name, i) => ({ id: `CERT-${i}`, name })), careerInterests: ['IT Support'], entrepreneurship: {}, profileCompletion: 0 }
  }
  const jobs = s.jobs.map(j => {
    const legacy = j.id === 'J-001' && JSON.stringify(j.requiredSkills) === JSON.stringify(['Network Configuration', 'Active Directory', 'Cybersecurity Fundamentals'])
    return { ...j, ...(legacy ? { requiredSkills: ['Computer Diagnostics', 'Hardware Installation', 'Technical Support', 'Network Configuration', 'Active Directory'], preferredSkills: ['Customer Service', 'Cybersecurity Fundamentals'] } : {}), acceptedEducation: j.acceptedEducation || (j.id === 'J-001' ? ['BS Information Technology', 'BS Computer Science', 'Related field'] : []), minimumExperienceMonths: j.minimumExperienceMonths ?? (j.id === 'J-001' ? 24 : 0), requiredCertifications: j.requiredCertifications || [], preferredCertifications: j.preferredCertifications || (j.id === 'J-001' ? ['CSS NC II'] : []), requiredSkillLevel: j.requiredSkillLevel || 'Intermediate' }
  }).map(j => ({ ...j, skillIds: skillIds(j.requiredSkills) }))
  const programs = s.programs.map(p => ({ ...p, name: p.id === 'TR-001' && p.name === 'Network Administration Training' ? 'Network Administration Fundamentals' : p.name, developedLevel: p.developedLevel || 'Intermediate', prerequisiteSkills: p.prerequisiteSkills || [] }))
  const transactions = s.transactions.map(t => { const org = s.orgs.find(o => o.name === t.organization); const item = (t.kind === 'job' ? jobs : programs).find(r => (r.title || r.name) === t.item || r.id === 'TR-001' && t.item === 'Network Administration Training'); return { ...t, organizationId: t.organizationId || org?.id, itemId: t.itemId || item?.id } })
  const notifications = Object.fromEntries(Object.entries(s.notifications).map(([role, rows]) => [role, rows.filter(n => !/92% match|completed Network Configuration|new candidate matches/i.test(n.message || '')).map(n => ({ ...n, message: (n.message || '').replaceAll('Network Administration Training', 'Network Administration Fundamentals') }))]))
  return { ...s, version: 2, jobs, programs, profiles, transactions, subscriptions: s.subscriptions || [], notifications, intelligenceVersion: 2, intelligenceBaseline: { jobs: copy(jobs), profiles: copy(profiles) }, reassessment: { previousProfile: copy(profiles['R-001']), date: today(), reason: 'Initial fisheries profile' } }
}
let state = read(DEMO_KEY)
if (state?.version !== 2 || !state?.baseline) state = initialState()
state = upgradeIntelligence(state)
const listeners = new Set()
const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn) }
export function getDemoState() { return state }
export function updateDemo(updater) {
  const next = typeof updater === 'function' ? updater(state) : updater
  state = next
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(state)) } catch { /* Session remains functional without persistence. */ }
  listeners.forEach(fn => fn())
}
export function useDemoStore() { return useSyncExternalStore(subscribe, getDemoState, getDemoState) }
window.addEventListener('storage', event => { if (event.key === DEMO_KEY && event.newValue) { const next = read(DEMO_KEY); if (next?.version === 2) { state = upgradeIntelligence(next); listeners.forEach(fn => fn()) } } })
export function setActor(role, id) { updateDemo(s => ({ ...s, [role === 'employer' ? 'activeEmployerId' : 'activeAgencyId']: id })) }
function notify(s, role, title, message, link, type = 'application') {
  return { ...s, notifications: { ...s.notifications, [role]: [{ id: uid('N'), type, title, message, date: today(), link: `/${role}/${link}`, read: false }, ...s.notifications[role]] } }
}
const ensure = (condition, message) => { if (!condition) throw new Error(message) }
const activeAccount = (s, id) => s.users.find(u => u.id === id)?.status !== 'Inactive'
export function applyForJob(jobId, note = '') {
  const s = state, job = s.jobs.find(j => j.id === jobId)
  ensure(activeAccount(s, 'R-001'), 'This account is inactive. Contact the LGU.')
  ensure(job?.status === 'Active' && (!job.deadline || job.deadline >= today()), 'This vacancy is already closed or expired.')
  ensure(!s.applications.some(a => a.jobId === jobId && a.residentId === 'R-001'), 'You already applied for this vacancy.')
  const app = { id: uid('APP'), residentId: 'R-001', jobId, matchScore: matchJob(s.profiles['R-001'], job, today()).matchScore, status: 'Submitted', appliedDate: today(), lastUpdate: today(), notes: note, coverLetter: note, resume: 'Resume.pdf', createdInDemo: true }
  updateDemo(notify({ ...s, applications: [...s.applications, app] }, 'employer', 'New application received', `${s.profiles['R-001'].name} applied for ${job.title}.`, 'applicants'))
}
export function updateApplication(id, status) {
  const s = state, app = s.applications.find(a => a.id === id), job = s.jobs.find(j => j.id === app?.jobId)
  ensure(app, 'Application not found.')
  ensure(!['Withdrawn', 'Rejected', 'Hired'].includes(app.status), 'This application already has a final outcome.')
  ensure(status === 'Withdrawn' ? app.residentId === 'R-001' : job.employerId === s.activeEmployerId, 'This action belongs to the record owner.')
  const updated = { ...app, status, lastUpdate: today(), ...(status === 'Shortlisted' ? { shortlistedDate: today() } : {}), ...(status === 'Hired' ? { hiredDate: today() } : {}) }
  let next = { ...s, applications: s.applications.map(a => a.id === id ? updated : a) }
  if (status === 'Hired') {
    ensure(job.status === 'Active', 'Reopen recruitment before recording a new hire.')
    ensure((job.filled || 0) < job.openings, 'All vacancy openings are already filled.')
    const name = s.profiles[app.residentId]?.name || app.applicantName || lgu.residents.find(r => r.id === app.residentId)?.name
    next.placements = [...s.placements, { id: uid('PL'), applicationId: id, residentId: app.residentId, jobId: job.id, resident: name, job: job.title, employer: s.orgs.find(o => o.id === job.employerId)?.name, match: matchJob(s.profiles[app.residentId], job, today()).matchScore, hired: today(), status: 'Employed', createdInDemo: true }]
    next.jobs = s.jobs.map(j => j.id === job.id ? { ...j, filled: (j.filled || 0) + 1 } : j)
    if (s.profiles[app.residentId]) next.profiles = { ...s.profiles, [app.residentId]: { ...s.profiles[app.residentId], employmentStatus: 'Employed' } }
  }
  if (['Withdrawn', 'Rejected', 'Hired'].includes(status)) next.interviews = s.interviews.map(i => i.applicationId === id && i.status === 'Scheduled' ? { ...i, status: status === 'Hired' ? 'Completed' : 'Cancelled' } : i)
  updateDemo(notify(next, status === 'Withdrawn' ? 'employer' : 'resident', 'Application status updated', `${job.title}: ${status}.`, status === 'Withdrawn' ? 'applicants' : 'employment?tab=My%20Applications'))
}
export function saveInterview(applicationId, draft, id) {
  const s = state, app = s.applications.find(a => a.id === applicationId), job = s.jobs.find(j => j.id === app?.jobId)
  ensure(app && job.employerId === s.activeEmployerId, 'This application belongs to another employer.')
  ensure(!['Hired', 'Rejected', 'Withdrawn'].includes(app.status), 'This application already has a final outcome.')
  ensure(draft.date >= today() && /^\d{2}:\d{2}$/.test(draft.time) && draft.location.trim(), 'Enter a future date, time, and meeting details.')
  ensure(id || !s.interviews.some(i => i.applicationId === applicationId && i.status === 'Scheduled'), 'An interview is already scheduled. Use Reschedule.')
  const record = { ...draft, id: id || uid('INT'), applicationId, residentId: app.residentId, jobId: job.id, status: 'Scheduled', duration: 60, interviewers: [s.orgs.find(o => o.id === job.employerId)?.contact || 'Hiring team'] }
  updateDemo(notify({ ...s, interviews: id ? s.interviews.map(i => i.id === id ? record : i) : [...s.interviews, record], applications: s.applications.map(a => a.id === applicationId ? { ...a, status: 'Interview Scheduled', lastUpdate: today(), shortlistedDate: a.shortlistedDate || today() } : a) }, 'resident', id ? 'Interview rescheduled' : 'Interview scheduled', `${job.title} · ${draft.date} ${draft.time} · ${draft.location}`, 'employment?tab=My%20Applications', 'interview'))
}
export function interviewAction(id, action) {
  const s = state, record = s.interviews.find(i => i.id === id)
  ensure(record?.status === 'Scheduled', 'This interview is no longer scheduled.')
  const status = action === 'Cancel' ? 'Cancelled' : action === 'Mark Complete' ? 'Completed' : record.status
  const next = { ...s, interviews: s.interviews.map(i => i.id === id ? { ...i, status, reminderSent: action === 'Send Reminder' || i.reminderSent } : i), applications: s.applications.map(a => a.id === record.applicationId && action !== 'Send Reminder' ? { ...a, status: action === 'Cancel' ? 'Shortlisted' : 'Interviewed', lastUpdate: today() } : a) }
  updateDemo(notify(next, 'resident', `Interview ${action === 'Send Reminder' ? 'reminder' : status.toLowerCase()}`, `${record.date} · ${record.time} · ${record.location}`, 'employment?tab=My%20Applications', 'interview'))
}
export function registerTraining(programId) {
  const s = state, p = s.programs.find(p => p.id === programId)
  ensure(activeAccount(s, 'R-001'), 'This account is inactive. Contact the LGU.')
  ensure(p && ['Upcoming', 'Active'].includes(p.status), 'This program is not accepting registrations.')
  ensure(!s.registrations.some(r => r.residentId === 'R-001' && r.programId === programId), 'You already registered for this program.')
  ensure(p.capacity > p.baseRegistrations + s.registrations.filter(r => r.programId === programId && r.status !== 'Cancelled').length, 'No training slots are currently available.')
  const record = { id: uid('REG'), residentId: 'R-001', programId, status: 'Registered', registrationDate: today(), progress: 0, attendance: 0, createdInDemo: true }
  updateDemo(notify({ ...s, registrations: [...s.registrations, record] }, 'training', 'New training registration', `${s.profiles['R-001'].name} registered for ${p.name}.`, 'participants', 'training'))
}
export function updateRegistration(id, status, values = {}) {
  const s = state, r = s.registrations.find(r => r.id === id), p = s.programs.find(p => p.id === r?.programId)
  ensure(r && !['Cancelled', 'Completed'].includes(r.status), 'This registration is already finalized.')
  ensure(status === 'Cancelled' ? r.residentId === 'R-001' && r.status === 'Registered' : p.agencyId === s.activeAgencyId, 'This action is not available for this registration.')
  ensure(status !== 'Completed' || r.status === 'In Training', 'Mark the participant In Training before completing the program.')
  const updated = { ...r, ...values, status, progress: status === 'Completed' ? 100 : values.progress ?? r.progress, completionDate: status === 'Completed' ? today() : null }
  let profiles = s.profiles, reassessment = s.reassessment
  if (status === 'Completed' && profiles[r.residentId]) {
    const previous = profiles[r.residentId], next = copy(previous)
    for (const developed of p.skillIds) {
      const target = p.developedLevel === 'Advanced' ? 3 : 2
      if (skillLevel(next, developed) >= target) continue
      const index = next.skills.findIndex(skill => skillId(skill) === developed)
      const entry = { ...(index >= 0 ? next.skills[index] : { id: uid('SKILL'), name: skillName(developed) }), level: levelName(target), source: `Completed ${p.name}`, trainingRegistrationId: id }
      if (index >= 0) next.skills[index] = entry; else next.skills.push(entry)
    }
    profiles = { ...profiles, [r.residentId]: next }
    if (r.residentId === 'R-001') reassessment = { previousProfile: copy(previous), date: today(), reason: `Completed ${p.name}` }
  }
  updateDemo(notify({ ...s, profiles, reassessment, registrations: s.registrations.map(row => row.id === id ? updated : row) }, status === 'Cancelled' ? 'training' : 'resident', 'Training status updated', `${p.name}: ${status}.`, status === 'Cancelled' ? 'participants' : 'training?tab=My%20Training', 'training'))
}
export function saveOwnedRecord(kind, draft) {
  const s = state, jobs = kind === 'job', key = jobs ? 'jobs' : 'programs', ownerKey = jobs ? 'employerId' : 'agencyId', owner = jobs ? s.activeEmployerId : s.activeAgencyId
  const old = s[key].find(r => r.id === draft.id)
  ensure(!old || old[ownerKey] === owner, 'Only the owner can edit this record.')
  const amount = Number(jobs ? draft.openings : draft.capacity)
  ensure(Number.isInteger(amount) && amount > 0, jobs ? 'Openings must be a positive whole number.' : 'Capacity must be a positive whole number.')
  if (!jobs) ensure(amount >= (old?.baseRegistrations || 0) + s.registrations.filter(r => r.programId === draft.id && r.status !== 'Cancelled').length, 'Capacity cannot be below current registrations.')
  const record = { baseApplicants: 0, baseRegistrations: 0, baseCompleted: 0, registrations: 0, objectives: [], requirements: [], responsibilities: [], preferredSkills: [], ...old, ...draft, id: old?.id || uid(jobs ? 'JOB' : 'PROG'), [ownerKey]: owner, skillIds: skillIds(jobs ? draft.requiredSkills : draft.skillIds), status: old?.status || 'Draft', paymentStatus: old?.paymentStatus || 'Unpaid' }
  updateDemo({ ...s, [key]: old ? s[key].map(r => r.id === old.id ? record : r) : [...s[key], record] })
}
export function recordLifecycle(kind, id, action) {
  const s = state, jobs = kind === 'job', key = jobs ? 'jobs' : 'programs', record = s[key].find(r => r.id === id), owner = jobs ? s.activeEmployerId : s.activeAgencyId
  ensure(record && record[jobs ? 'employerId' : 'agencyId'] === owner, 'Only the owner can change this record.')
  if (action === 'Delete Draft') { ensure(record.status === 'Draft', 'Only drafts can be deleted.'); updateDemo({ ...s, [key]: s[key].filter(r => r.id !== id) }); return }
  ensure(!['Closed', 'Completed', 'Expired'].includes(record.status), 'This record is already finalized.')
  let next = s
  if (action === 'Publish') {
    ensure(s.orgs.find(o => o.id === owner)?.status === 'Verified', 'LGU verification is required before publication.')
    ensure(activeAccount(s, owner), 'This account is inactive.')
    const subscription = s.subscriptions?.find(row => row.organizationId === owner)
    ensure(subscription?.status === 'Active' && subscription.expiryDate >= today(), 'An active subscription is required before publishing. Renew your subscription to continue.')
    ensure(jobs ? record.deadline >= today() : record.schedule.slice(0, 10) >= today(), 'Update the date before publishing.')
  }
  updateDemo(notify({ ...next, [key]: next[key].map(r => r.id === id ? { ...r, status: action === 'Publish' ? jobs ? 'Active' : 'Upcoming' : 'Closed', published: action === 'Publish' ? today() : r.published } : r) }, 'lgu', action === 'Publish' ? 'New fisheries opportunity published' : 'Opportunity closed', jobs ? record.title : record.name, `opportunities?tab=${jobs ? 'Job%20Vacancies' : 'Training%20Opportunities'}`, jobs ? 'job_match' : 'training'))
}
export function subscriptionFor(organizationId) {
  return state.subscriptions?.find(row => row.organizationId === organizationId)
}
export function renewSubscription(organizationId, plan) {
  const prices = { '1-Month Subscription': 1000, '6-Month Subscription': 5000, '1-Year Subscription': 9000 }
  ensure(prices[plan], 'Choose a valid subscription plan.')
  const organization = state.orgs.find(row => row.id === organizationId)
  ensure(organization, 'Organization not found.')
  const months = plan.startsWith('1-') ? 1 : plan.startsWith('6-') ? 6 : 12
  const start = today(), expiry = new Date(`${start}T00:00:00`)
  expiry.setMonth(expiry.getMonth() + months)
  const expiryDate = expiry.toLocaleDateString('en-CA')
  const previous = subscriptionFor(organizationId)
  const record = { id: previous?.id || uid('SUB'), organizationId, organizationType: organization.type, plan, startDate: start, expiryDate, status: 'Active', amount: prices[plan], createdAt: previous?.createdAt || start, renewedAt: start }
  const subscriptions = previous ? state.subscriptions.map(row => row.organizationId === organizationId ? record : row) : [...(state.subscriptions || []), record]
  const role = organization.type === 'Employer' ? 'employer' : 'training'
  updateDemo(notify({ ...state, subscriptions }, role, 'Subscription activated', `${plan} is active until ${expiryDate}. Publishing is now available.`, 'transactions', 'payment'))
}
export function saveOrganization(id, draft) {
  updateDemo(s => ({ ...s, orgs: s.orgs.map(o => o.id === id ? { ...o, ...draft, id: o.id, status: o.status, type: o.type } : o) }))
}
export function inviteCandidate(match) {
  const s = state
  ensure(!s.invitations.some(i => i.residentId === match.residentId && i.jobId === match.vacancyId), 'An invitation was already sent.')
  updateDemo(notify({ ...s, invitations: [...s.invitations, { id: uid('INV'), residentId: match.residentId, jobId: match.vacancyId }] }, 'resident', 'Invitation to apply', `${s.orgs.find(o => o.id === s.activeEmployerId)?.name} invited you to review a vacancy.`, 'employment?tab=Recommended%20Jobs', 'job_match'))
}
export function saveProfile(profile) { updateDemo(s => ({ ...s, reassessment: { previousProfile: copy(s.profiles[profile.id]), date: today(), reason: 'Career profile updated' }, profiles: { ...s.profiles, [profile.id]: copy(profile) } })) }
export function reassessCareer() { updateDemo(s => ({ ...s, reassessment: { ...s.reassessment, date: today() } })) }
export function setNotifications(role, updater) { updateDemo(s => ({ ...s, notifications: { ...s.notifications, [role]: typeof updater === 'function' ? updater(s.notifications[role]) : updater } })) }
export function setSettings(role, settings) { updateDemo(s => ({ ...s, settings: { ...s.settings, [role]: settings } })) }
export { skillIds }
