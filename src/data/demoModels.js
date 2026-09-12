import { useDemoStore, getDemoState, updateDemo, uid, today } from './demoStore'
import * as lgu from './lguData'
import * as resident from './residentData'
import * as employer from './employerData'
import * as training from './trainingData'
import { money } from './lguFormat'

const nameOf = (s, id, fallback = '') => s.profiles[id]?.name || lgu.residents.find(r => r.id === id)?.name || employer.candidateMatches.find(r => r.residentId === id)?.name || fallback
const orgName = (s, id) => s.orgs.find(o => o.id === id)?.name || 'Organization'
const skillNames = ids => (ids || []).map(id => lgu.skills.find(s => s.id === id)?.name || id)
const profileSkills = p => p.skills.map(s => `${s.name} (${s.level})`)
export function applicationsFor(s) {
  return s.applications.map(a => {
    const job = s.jobs.find(j => j.id === a.jobId)
    const interview = s.interviews.find(i => i.applicationId === a.id && i.status === 'Scheduled') || s.interviews.filter(i => i.applicationId === a.id).at(-1)
    return { ...a, vacancyId: a.jobId, applicantName: nameOf(s, a.residentId, a.applicantName), position: job?.title, jobTitle: job?.title, company: orgName(s, job?.employerId), employer: orgName(s, job?.employerId), interview }
  })
}
export function programsFor(s) {
  return s.programs.map(p => {
    const registrations = p.baseRegistrations + s.registrations.filter(r => r.programId === p.id && r.status !== 'Cancelled').length
    const completed = (p.baseCompleted || 0) + s.registrations.filter(r => r.programId === p.id && r.status === 'Completed').length
    const slots = Math.max(0, p.capacity - registrations)
    return { ...p, agency: orgName(s, p.agencyId), provider: orgName(s, p.agencyId), title: p.name, registrations, slots, availableSlots: slots, totalSlots: p.capacity, completions: completed, completed, status: ['Active', 'Upcoming', 'Full'].includes(p.status) ? slots === 0 ? 'Full' : p.status === 'Full' ? 'Active' : p.status : p.status, participants: s.registrations.filter(r => r.programId === p.id).map(r => r.id), skillsDeveloped: skillNames(p.skillIds), skillGapAddressed: skillNames(p.skillIds)[0] || 'Career development', eligibility: p.eligibility || 'Interested residents', requirements: p.requirements || [], relatedJobs: s.jobs.filter(j => j.skillIds?.some(id => p.skillIds.includes(id))).map(j => j.title), relevance: 'Recommended', whyRecommended: `Develop ${skillNames(p.skillIds).join(', ') || 'career'} skills relevant to your current profile and interests.`, placements: p.placements || 0 }
  })
}
export function jobsFor(s) {
  return s.jobs.map(j => {
    const baseline = s.baseline.jobs.find(b => b.id === j.id)?.applicantCount || 0
    const apps = s.applications.filter(a => a.jobId === j.id)
    return { ...j, name: j.title, employer: orgName(s, j.employerId), company: orgName(s, j.employerId), applicants: Math.max(0, (j.baseApplicants || 0) + apps.length - baseline), shortlisted: apps.filter(a => a.shortlistedDate || ['Shortlisted', 'Interview Scheduled', 'Interviewed', 'Hired'].includes(a.status)).length, interviewed: s.interviews.filter(i => i.jobId === j.id).length, published: j.published || j.postedDate, postedDate: j.published || j.postedDate, industry: s.orgs.find(o => o.id === j.employerId)?.industry, salary: typeof j.salary === 'object' ? j.salary : { min: 18000, max: 28000 }, filled: j.filled || 0, requirements: j.requirements || [], responsibilities: j.responsibilities || [], requiredSkills: j.requiredSkills || skillNames(j.skillIds), preferredSkills: j.preferredSkills || [] }
  })
}
export function registrationsFor(s) {
  const programs = programsFor(s)
  return s.registrations.map(r => {
    const p = programs.find(p => p.id === r.programId)
    return { ...r, name: nameOf(s, r.residentId, r.name), trainingId: r.programId, title: p?.name, programName: p?.name, provider: p?.provider, enrollmentDate: r.registrationDate, expectedCompletion: r.completionDate || p?.schedule?.split(' to ')[1] || p?.schedule?.slice(0, 10), schedule: p?.schedule, skillsDeveloped: p?.skillsDeveloped || [], employmentStatus: s.profiles[r.residentId]?.employmentStatus || 'Seeking Employment' }
  })
}
function orgProfile(s, id, template) {
  const o = s.orgs.find(o => o.id === id)
  return { ...template, ...o, verificationStatus: o.status, verified: o.status === 'Verified' ? o.verified || o.submitted : null, documents: o.documents.map((d, i) => typeof d === 'string' ? { id: `${id}-DOC-${i}`, name: d, type: 'Supporting document', uploaded: o.submitted, status: o.status } : d) }
}
export function lguModel(s) {
  const programs = programsFor(s)
  const applications = applicationsFor(s)
  const jobs = jobsFor(s)
  const placements = s.placements.map(p => {
    const j = jobs.find(j => j.id === p.jobId)
    return { ...p, resident: p.residentId ? nameOf(s, p.residentId, p.resident) : p.resident, job: j?.title || p.job, employer: j?.employer || p.employer }
  })
  const snapshot = { ...lgu.snapshot, applications: lgu.snapshot.applications + s.applications.length - s.baseline.applications, shortlisted: lgu.snapshot.shortlisted + s.applications.filter(a => a.shortlistedDate || ['Shortlisted', 'Interview Scheduled', 'Interviewed', 'Hired'].includes(a.status)).length - s.baseline.shortlisted, interviews: lgu.snapshot.interviews + s.interviews.length - s.baseline.interviews, hired: lgu.snapshot.hired + placements.length - s.baseline.placements, vacancies: lgu.snapshot.vacancies + jobs.filter(j => j.status === 'Active').length - s.baseline.activeJobs, trainingRegistrations: lgu.snapshot.trainingRegistrations + s.registrations.filter(r => r.status !== 'Cancelled').length - s.baseline.registrations, trainingCompleted: lgu.snapshot.trainingCompleted + s.registrations.filter(r => r.status === 'Completed').length - s.baseline.completions }
  snapshot.employers = lgu.snapshot.employers + s.orgs.filter(o => o.type === 'Employer' && o.status === 'Verified').length - s.baseline.verifiedEmployers
  snapshot.agencies = lgu.snapshot.agencies + s.orgs.filter(o => o.type === 'Training Agency' && o.status === 'Verified').length - s.baseline.verifiedAgencies
  const periods = Object.fromEntries(Object.entries(lgu.periods).map(([key, period]) => {
    const addedHires = placements.filter(p => p.createdInDemo).length
    const trend = period.trend.map((row, i) => i === period.trend.length - 1 ? [row[0], row[1] + addedHires] : row)
    return [key, { ...period, hired: period.hired + addedHires, applications: period.applications + snapshot.applications - lgu.snapshot.applications, shortlisted: period.shortlisted + snapshot.shortlisted - lgu.snapshot.shortlisted, interviews: period.interviews + snapshot.interviews - lgu.snapshot.interviews, trend }]
  }))
  const skills = lgu.skills.map(skill => ({ ...skill, slots: programs.filter(p => ['Upcoming', 'Active', 'Full'].includes(p.status) && p.skillIds.includes(skill.id)).reduce((n, p) => n + p.slots, 0) }))
  const rows = lgu.residents.map(r => {
    const p = s.profiles[r.id]
    const ownApps = applications.filter(a => a.residentId === r.id)
    const trainingRows = registrationsFor(s).filter(a => a.residentId === r.id)
    return { ...r, ...(p ? { name: p.name, location: p.location, interest: p.careerInterests.join(', '), employment: p.employmentStatus, skills: profileSkills(p), education: (p.educationEntries || []).map(e => `${e.course} · ${e.school}`).join('; '), experience: p.experience.map(e => `${e.position} · ${e.organization}`).join('; '), certifications: p.certifications.map(c => c.name).join(', '), completion: p.profileCompletion, gaps: skills.filter(skill => !p.skills.some(ps => ps.name === skill.name && ps.level !== 'Beginner')).filter(skill => ['network', 'directory', 'security'].includes(skill.id)).map(skill => skill.id) } : {}), status: s.users.find(u => u.id === r.id)?.status || r.status, applications: ownApps.length ? ownApps.map(a => `${a.jobTitle}: ${a.status}`).join('; ') : r.applications, training: trainingRows.length ? trainingRows.map(t => `${t.title}: ${t.status}`).join('; ') : r.training }
  })
  const orgs = s.orgs.map(o => ({ ...o, vacancies: jobs.filter(j => j.employerId === o.id && j.status === 'Active').length, hires: (o.hires || 0) + placements.filter(p => p.createdInDemo && jobs.find(j => j.id === p.jobId)?.employerId === o.id).length, participants: programs.filter(p => p.agencyId === o.id).reduce((n, p) => n + p.registrations, 0), completed: programs.filter(p => p.agencyId === o.id).reduce((n, p) => n + p.completed, 0), slots: programs.filter(p => p.agencyId === o.id).reduce((n, p) => n + p.slots, 0) }))
  const businesses = s.businesses.filter(b => b.status !== 'Draft').map(b => ({ ...b, applicant: nameOf(s, b.residentId, b.applicant) }))
  return { state: { orgs, businesses, users: s.users.map(u => ({ ...u, name: nameOf(s, u.id, s.orgs.find(o => o.id === u.id)?.name || u.name) })), settings: s.settings.lgu }, residents: rows, programs, applications, vacancies: jobs.filter(j => j.status !== 'Draft').map(j => ({ ...j, salary: `${money(j.salary.min)}–${money(j.salary.max)} / month` })), placements, snapshot, periods, skills, transactions: s.transactions.map(t => ({ ...t, organization: t.organizationId ? orgName(s, t.organizationId) : t.organization, item: t.itemId ? (t.kind === 'job' ? jobs.find(j => j.id === t.itemId)?.title : programs.find(p => p.id === t.itemId)?.name) || t.item : t.item })), sponsors: s.sponsors }
}
export function useLguData() { return lguModel(useDemoStore()) }
export function setLGUState(updater) {
  updateDemo(s => {
    const previous = lguModel(s).state, next = typeof updater === 'function' ? updater(previous) : updater
    let notifications = s.notifications
    for (const [key, roleFor] of [['orgs', r => r.type === 'Employer' ? 'employer' : 'training'], ['businesses', () => 'resident']]) {
      if (next[key] === previous[key]) continue
      for (const r of next[key]) {
        const old = previous[key].find(o => o.id === r.id)
        if (old && (old.status !== r.status || old.notes !== r.notes)) {
          const role = roleFor(r)
          const notification = { id: uid('N'), type: key === 'orgs' ? 'verification' : 'business', title: `${key === 'orgs' ? 'Verification' : 'Business application'} update`, message: `${r.name}: ${r.status}. ${r.notes || ''}`, date: today(), link: `/${role}/${role === 'resident' ? 'entrepreneurship?tab=Business%20Registration' : role === 'employer' ? 'company' : 'profile'}`, read: false }
          notifications = { ...notifications, [role]: [notification, ...notifications[role]] }
        }
      }
    }
    return { ...s, orgs: s.orgs.map(o => { const r = next.orgs.find(r => r.id === o.id); return r ? { ...o, status: r.status, notes: r.notes, history: r.history } : o }), businesses: s.businesses.map(o => { const r = next.businesses.find(r => r.id === o.id); return r ? { ...o, status: r.status, notes: r.notes, history: r.history, documents: r.documents } : o }), users: next.users, settings: { ...s.settings, lgu: next.settings }, notifications }
  })
}
export function residentModel(s) {
  const profile = s.profiles['R-001']
  const jobs = jobsFor(s)
  const recommendedJobs = jobs.filter(j => j.status === 'Active').map(j => {
    const seed = resident.recommendedJobs.find(r => r.id === j.id) || {}
    const currentSkills = profile.skills.map(s => s.name)
    return { ...seed, ...j, salary: `${money(j.salary.min)}–${money(j.salary.max)}`, matchScore: seed.matchScore || 82, matchedRequirements: profileSkills(profile), missingRequirements: j.requiredSkills.filter(skill => !currentSkills.includes(skill)), suggestedAction: 'Review the current requirements and apply if this opportunity fits your interests.', requiredEducation: j.requiredEducation || 'Relevant education or experience', certifications: j.certifications || [] }
  })
  const programs = programsFor(s)
  const business = s.businesses.filter(b => b.residentId === 'R-001').at(-1)
  const app = business ? { ...business, applicant: profile.name, businessName: business.name, businessType: business.type, address: business.address || business.location, contactNumber: business.contactNumber || profile.phone, timeline: business.history.map((h, i) => ({ stage: h, date: null, status: i === business.history.length - 1 ? business.status : 'Completed' })) } : null
  const data = lguModel(s)
  const skillGaps = resident.skillGaps.map(g => { const skill = data.skills.find(s => s.id === g.skillId); return { ...g, currentLevel: profile.skills.find(s => s.name === g.skill)?.level || 'None', trainingSlots: skill.slots, residentsMissing: skill.missing, relatedJobs: jobs.filter(j => j.skillIds?.includes(g.skillId)).map(j => j.title) } })
  return { state: { profile, applications: applicationsFor(s).filter(a => a.residentId === 'R-001'), myTraining: registrationsFor(s).filter(r => r.residentId === 'R-001'), businessApplication: app, settings: s.settings.resident }, demoResident: profile, recommendedJobs, recommendedTraining: programs.filter(p => ['Active', 'Upcoming', 'Full'].includes(p.status)), skillGaps, progressTimeline: [...resident.progressTimeline, ...s.notifications.resident.filter(n => n.id.startsWith('N-')).map(n => ({ ...n, description: n.message }))] }
}
export function useResidentModel() { return residentModel(useDemoStore()) }
export function setResidentState(updater) {
  updateDemo(s => {
    const previous = residentModel(s).state, next = typeof updater === 'function' ? updater(previous) : updater
    let businesses = s.businesses
    if (next.businessApplication && next.businessApplication !== previous.businessApplication) {
      const b = next.businessApplication
      const record = { ...b, residentId: 'R-001', name: b.businessName, type: b.businessType, status: b.status === 'New Application' ? 'Under Review' : b.status, documents: [...new Set(b.documents)], history: b.history || [] }
      businesses = businesses.some(r => r.id === record.id) ? businesses.map(r => r.id === record.id ? record : r) : [...businesses, record]
    }
    return { ...s, profiles: { ...s.profiles, 'R-001': next.profile || s.profiles['R-001'] }, businesses, settings: { ...s.settings, resident: next.settings || s.settings.resident } }
  })
}
export function employerModel(s) {
  const jobs = jobsFor(s).filter(j => j.employerId === s.activeEmployerId)
  const applications = applicationsFor(s).filter(a => jobs.some(j => j.id === a.jobId))
  const interviews = s.interviews.filter(i => jobs.some(j => j.id === i.jobId)).map(i => ({ ...i, applicantName: nameOf(s, i.residentId, i.applicantName), position: jobs.find(j => j.id === i.jobId)?.title }))
  const ownPlacements = lguModel(s).placements.filter(p => p.employer === orgName(s, s.activeEmployerId))
  const statistics = { totalVacancies: jobs.length, activeVacancies: jobs.filter(j => j.status === 'Active').length, totalHires: ownPlacements.length, currentMonth: { applications: applications.length, shortlisted: applications.filter(a => a.shortlistedDate || ['Shortlisted', 'Interview Scheduled', 'Interviewed', 'Hired'].includes(a.status)).length, interviewed: interviews.length, hired: ownPlacements.length } }
  const candidateMatches = employer.candidateMatches.filter(m => jobs.some(j => j.id === m.vacancyId)).map(m => { const p = s.profiles[m.residentId]; return { ...m, ...(p ? { name: p.name, location: p.location, education: p.educationEntries.map(e => e.course).join(', '), experience: p.experience.map(e => `${e.position} · ${e.organization}`).join('; '), skills: profileSkills(p), certifications: p.certifications.map(c => c.name), whyMatched: profileSkills(p), aiRecommendation: 'Compare the current resident profile with the vacancy requirements.', whatsMissing: jobs.find(j => j.id === m.vacancyId).requiredSkills.filter(skill => !p.skills.some(s => s.name === skill)), missingSkills: jobs.find(j => j.id === m.vacancyId).requiredSkills.filter(skill => !p.skills.some(s => s.name === skill)) } : {}), status: applications.find(a => a.jobId === m.vacancyId && a.residentId === m.residentId)?.status || 'Matched' } })
  return { state: { vacancies: jobs, settings: s.settings.employer }, currentEmployer: { ...orgProfile(s, s.activeEmployerId, employer.currentEmployer), statistics }, employerVacancies: jobs, applications, interviews, candidateMatches, hires: ownPlacements.map(p => ({ ...p, hiree: p.resident, position: p.job, startDate: p.hired, acceptedDate: p.hired, salary: 22000, employmentType: 'Full-time' })), organizations: s.orgs.filter(o => o.type === 'Employer'), transactions: lguModel(s).transactions.filter(t => t.kind === 'job' && (t.organizationId === s.activeEmployerId || t.organization === orgName(s, s.activeEmployerId))) }
}
export function useEmployerModel() { return employerModel(useDemoStore()) }
export function setEmployerState(updater) { updateDemo(s => { const previous = employerModel(s).state, next = typeof updater === 'function' ? updater(previous) : updater; return { ...s, settings: { ...s.settings, employer: next.settings } } }) }
export function trainingModel(s) {
  const programs = programsFor(s).filter(p => p.agencyId === s.activeAgencyId)
  const participants = registrationsFor(s).filter(r => programs.some(p => p.id === r.programId))
  const statistics = { totalPrograms: programs.length, activePrograms: programs.filter(p => ['Active', 'Upcoming', 'Full'].includes(p.status)).length, totalSlots: programs.reduce((n, p) => n + p.slots, 0), totalParticipants: participants.filter(p => p.status !== 'Cancelled').length, totalCompletions: participants.filter(p => p.status === 'Completed').length, currentBatch: { programs: programs.length, participants: participants.length, completions: participants.filter(p => p.status === 'Completed').length } }
  return { state: { programs, participants, settings: s.settings.training }, currentAgency: { ...orgProfile(s, s.activeAgencyId, training.currentAgency), statistics }, agencyPrograms: programs, participants, organizations: s.orgs.filter(o => o.type === 'Training Agency'), skillGapAlignment: lguModel(s).skills.map(skill => ({ skillId: skill.id, skillName: skill.name, employerDemand: skill.demand, residentsMissingSkill: skill.missing, currentSlots: skill.slots, gap: Math.max(0, skill.missing - skill.slots), priority: skill.priority })), trainingTransactions: lguModel(s).transactions.filter(t => t.kind === 'training' && (t.organizationId === s.activeAgencyId || t.organization === orgName(s, s.activeAgencyId))).map(t => ({ ...t, program: t.item })), trainingSponsors: s.sponsors }
}
export function useTrainingModel() { return trainingModel(useDemoStore()) }
export function setTrainingState(updater) { updateDemo(s => { const previous = trainingModel(s).state, next = typeof updater === 'function' ? updater(previous) : updater; return { ...s, settings: { ...s.settings, training: next.settings } } }) }
export function currentBusiness() { return residentModel(getDemoState()).state.businessApplication }
