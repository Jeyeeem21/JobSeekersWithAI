import fs from 'node:fs'
const read = p => fs.readFileSync(`src/${p}`, 'utf8').replace(/\r\n/g, '\n')
const write = (p, s) => fs.writeFileSync(`src/${p}`, s)
const between = (s, a, b, replacement) => {
  const start = s.indexOf(a), end = s.indexOf(b, start + a.length)
  if (start < 0 || end < 0) throw new Error(`Missing edit anchors: ${a} / ${b}`)
  return s.slice(0, start) + replacement + s.slice(end)
}
const removeLegacyState = s => {
  s = between(s, 'const storageKey =', 'export function ', '')
  s = s.replace(/  useEffect\(\(\) => \{\s*try \{ localStorage\.setItem\(storageKey, JSON\.stringify\(state\)\) \}\s*catch \{[^}]*\}\s*\}, \[state\]\)\s*/, '')
  s = s.replace(/^.*localStorage\.setItem\(storageKey, JSON\.stringify\([^\n]+\n/gm, '')
  return s.replace("import { useEffect, useState }", "import { useState }")
}

let s
s = removeLegacyState(read('pages/Resident.jsx'))
s = s.replace(/import \{\s*demoResident, skillGaps,[\s\S]+?from '\.\.\/data\/residentData'/, "import { entrepreneurshipRecommendations } from '../data/residentData'\nimport { useResidentModel, setResidentState } from '../data/demoModels'\nimport { applyForJob, updateApplication, registerTraining as createRegistration, updateRegistration, uid, today } from '../data/demoStore'\nimport { CareerProfile } from './resident/CareerProfile'\nimport { RecordEditor } from '../components/RecordEditor'")
s = s.replace('const [state, setState] = useState(readState)', 'const { state, demoResident, recommendedJobs, recommendedTraining, skillGaps, progressTimeline } = useResidentModel()\n  const setState = setResidentState')
s = s.replace("const close = () => setModal(null)", "const close = () => setModal(null)\n  const attempt = action => { try { action(); close() } catch (error) { setModal(m => ({ ...m, error: error.message })) } }")
s = between(s, '  const confirmApply =', '  // View Application', "  const confirmApply = draft => { applyForJob(modal.job.id, draft.note || ''); close(); showMessage('Application submitted.') }\n\n")
s = between(s, '  const confirmWithdraw =', '  // View Skill Gap', "  const confirmWithdraw = () => attempt(() => { updateApplication(modal.app.id, 'Withdrawn'); showMessage('Application withdrawn.') })\n\n")
s = between(s, '  const confirmTrainingRegistration =', '  // Cancel Training Registration', "  const confirmTrainingRegistration = () => attempt(() => { createRegistration(modal.training.id); showMessage('Training registration confirmed.') })\n\n")
s = s.replace("const job = recommendedJobs.find(j => j.id === app.jobId)", '')
s = s.replaceAll("app.status === 'Applied'", "['Submitted', 'Shortlisted', 'Interview Scheduled', 'Interviewed'].includes(app.status)")
s = s.replaceAll("'Applied'", "'Submitted'")
s = s.replaceAll("'In Progress'", "'In Training'")
const profileStart = s.indexOf("  if (path === 'profile')")
const profileEnd = s.indexOf("  if (path === 'employment')", profileStart)
if (profileStart < 0 || profileEnd < 0) throw new Error('Missing profile boundaries')
s = s.slice(0, profileStart) + "  if (path === 'profile') content = <CareerProfile showMessage={showMessage} />\n\n" + s.slice(profileEnd)
s = between(s, "      {modal?.kind === 'edit-profile'", "      {modal?.kind === 'confirm-cancel-training'", '')
s = between(s, "      {modal?.kind === 'confirm-apply'", "      {modal?.kind === 'confirm-withdraw'", `      {modal?.kind === 'confirm-apply' && <RecordEditor title="Apply for Position" record={{ note: '' }} fields={[{ key: 'note', label: 'Optional Application Note', type: 'textarea', required: false, wide: true }]} onClose={close} onSave={confirmApply} saveLabel="Submit Application" />}

`)
s = s.replace('title="Apply for Position" record=', 'title={`Apply — ${modal.job.title} · ${modal.job.company} · ${demoResident.name}`} record=')
s = between(s, "      {modal?.kind === 'confirm-cancel-training'", "      {(modal?.kind === 'create-business-draft'", `      {modal?.kind === 'confirm-cancel-training' && <ConfirmationDialog title={modal.title} description={modal.error || 'Cancel your training registration and release the reserved slot?'} confirmLabel="Cancel Registration" onClose={close} onConfirm={() => attempt(() => { updateRegistration(modal.training.id, 'Cancelled'); showMessage('Training registration cancelled.') })} />}

`)
s = s.replace('description={`Register for ${modal.training.title} at ${modal.training.provider}? Training fee: ${money(modal.training.fee)}`}', 'description={modal.error || `Register for ${modal.training.title} at ${modal.training.provider}? Training fee: ${money(modal.training.fee)}`}')
s = s.replace('description={`Withdraw your application for ${modal.app.jobTitle}? This action cannot be undone.`}', 'description={modal.error || `Withdraw your application for ${modal.app.jobTitle}? This action cannot be undone.`}')
s = s.replace("['Notes', app.notes || 'No updates yet']", "['Notes', app.notes || 'No updates yet'], ['Interview', app.interview ? `${app.interview.date} ${app.interview.time} · ${app.interview.type} · ${app.interview.location} · ${app.interview.status}` : 'Not scheduled']")
s = s.replaceAll('<Button onClick={() => applyToJob(job)}>', '<Button disabled={state.applications.some(a => a.jobId === job.id)} onClick={() => applyToJob(job)}>')
s = s.replace(/(onClick=\{\(\) => applyToJob\(job\)\}>\s*)Apply(\s*<\/Button>)/g, "$1{state.applications.some(a => a.jobId === job.id) ? 'Applied' : 'Apply'}$2")
s = s.replaceAll('<Button onClick={() => registerTraining(training)}>', '<Button disabled={training.availableSlots <= 0 || state.myTraining.some(r => r.programId === training.id)} onClick={() => registerTraining(training)}>')
s = s.replace(/(onClick=\{\(\) => registerTraining\(training\)\}>\s*)Register(\s*<\/Button>)/g, "$1{state.myTraining.some(r => r.programId === training.id) ? 'Registered' : training.availableSlots <= 0 ? 'Program Full' : 'Register'}$2")
s = s.replaceAll("id: `BR-${Date.now()}`", "id: uid('BR')").replaceAll("new Date().toISOString().split('T')[0]", 'today()')
s = s.replaceAll("'lg'", "'md'").replaceAll('size="lg"', 'size="md"')
// Show the actual LGU request, not a separate hardcoded requirements list.
s = between(s, '          <div style={{ marginTop: \'16px\' }}>\n            <h4', '          <Alert type="info" style=', '          <p className="lgu-caption">{modal.record.notes || \'Please provide the requirements requested by the LGU.\'}</p>\n')
write('pages/Resident.jsx', s)

for (const [file, role] of [['Employer.jsx', 'employer'], ['Training.jsx', 'training']]) {
  s = removeLegacyState(read(`pages/${file}`))
  const isEmployer = role === 'employer'
  s = s.replace(/import \{[^\n]+from '\.\.\/data\/(employer|training)Data'/, isEmployer ? "import { recruitmentAnalytics, skillGapAnalytics, sponsorshipOpportunities } from '../data/employerData'" : '')
  s = s.replace('const [state, setState] = useState(readState)', isEmployer ? 'const { state, currentEmployer, employerVacancies, applications, interviews, candidateMatches, hires, organizations, transactions } = useEmployerModel()\n  const setState = setEmployerState' : 'const { state, currentAgency, agencyPrograms, participants, organizations, skillGapAlignment, trainingTransactions, trainingSponsors } = useTrainingModel()\n  const setState = setTrainingState')
  s = `import { ${isEmployer ? 'useEmployerModel, setEmployerState' : 'useTrainingModel, setTrainingState'} } from '../data/demoModels'\nimport { setActor, saveOwnedRecord, recordLifecycle, saveOrganization, updateApplication, saveInterview, interviewAction, inviteCandidate, updateRegistration, today } from '../data/demoStore'\nimport { RecordEditor } from '../components/RecordEditor'\nimport { jobFields, programFields, organizationFields, interviewFields } from '../data/formSchemas'\n` + s
  s = s.replace("import { Alert, Button, ConfirmationDialog, Field, Modal, PageTitle, Panel }", "import { Alert, Button, ConfirmationDialog, Field, Modal, PageTitle, Panel, Tabs }")
  s = s.replaceAll("'Applied'", "'Submitted'")
  s = s.replace(/  const close = \(\) => \{[^\n]+\}/, `  const close = () => { setModal(null) }\n  const attempt = action => { try { action(); close() } catch (error) { setModal(m => ({ ...m, error: error.message })) } }\n  const lifecycle = (record, action) => setModal({ kind: 'lifecycle', title: action === 'Publish' ? 'Publish ${isEmployer ? 'Vacancy' : 'Program'}?' : action + '?', record, action })`)
  if (isEmployer) {
    s = s.replace(/    const allVacancies = \[[\s\S]+?\n    \]/, '    const allVacancies = state.vacancies')
    s = between(s, '  const commitApplicationReview =', '  const viewInterview =', "  const commitApplicationReview = () => attempt(() => { updateApplication(modal.record.id, modal.action === 'Reject' ? 'Rejected' : modal.action === 'Hire' ? 'Hired' : 'Shortlisted'); showMessage('Application status updated.') })\n\n")
    s = between(s, '  const commitInterviewAction =', '  const requestInviteAction =', "  const commitInterviewAction = () => attempt(() => { interviewAction(modal.record.id, modal.action); showMessage('Interview updated.') })\n\n")
    s = between(s, '  const commitInviteAction =', '  let content', "  const commitInviteAction = () => attempt(() => { inviteCandidate(modal.record); showMessage('Invitation added to resident notifications.') })\n\n")
    s = s.replace("{ label: 'View Application', run: viewApplication }", `{ label: 'View Application', run: viewApplication },
          { label: 'Shortlist', when: a => a.status === 'Submitted', run: a => requestApplicationDecision(a, 'Shortlist') },
          { label: 'Schedule Interview', when: a => ['Submitted', 'Shortlisted', 'Interviewed'].includes(a.status), run: a => setModal({ kind: 'schedule', title: 'Schedule Interview', applicationId: a.id, record: { date: '', time: '', type: 'In-person', location: currentEmployer.location, notes: '' } }) },
          { label: 'Record Hiring Outcome', when: a => !['Hired', 'Rejected', 'Withdrawn'].includes(a.status), run: a => requestApplicationDecision(a, 'Hire') }`)
    s = s.replace("{ label: 'Send Reminder', run: (i) => requestInterviewAction(i, 'Send Reminder') }", `{ label: 'Send Reminder', when: i => i.status === 'Scheduled', run: i => requestInterviewAction(i, 'Send Reminder') },
          { label: 'Reschedule', when: i => i.status === 'Scheduled', run: i => setModal({ kind: 'schedule', title: 'Reschedule Interview', applicationId: i.applicationId, interviewId: i.id, record: { ...i, time: /^\\d{2}:\\d{2}$/.test(i.time) ? i.time : '10:00' } }) },
          { label: 'Cancel Interview', when: i => i.status === 'Scheduled', run: i => requestInterviewAction(i, 'Cancel') }`)
    s = s.replace('description={`Are you sure you want to ${modal.action', 'description={modal.error || `Are you sure you want to ${modal.action')
    s = s.replace("modal.action === 'Reject' ? 'reject' : 'shortlist'", "modal.action === 'Reject' ? 'reject' : modal.action === 'Hire' ? 'hire' : 'shortlist'")
    s = s.replace("description={modal.action === 'Send Reminder'", "description={modal.error || (modal.action === 'Cancel' ? 'Cancel this interview? The resident will see the cancellation.' : modal.action === 'Send Reminder'")
    s = s.replace('as complete?`\n          }', 'as complete?`)\n          }')
    s = s.replace('description={`Send job application invitation', 'description={modal.error || `Send job application invitation')
    s = s.replace(/const employerTransactions = \[[\s\S]+?\n      \]/, 'const employerTransactions = transactions.map(t => ({ ...t, vacancy: t.item, jobTitle: t.item, paymentDate: t.date, postingStatus: t.publication }))')
    s = between(s, '      {/* Create/Edit Job Vacancy Modal */}', '      {/* Close Vacancy Confirmation */}', `      {(modal?.kind === 'create-vacancy' || modal?.kind === 'edit-vacancy') && <RecordEditor key={modal.record.id} title={modal.title} record={modal.record} fields={jobFields} onClose={close} saveLabel={modal.kind === 'create-vacancy' ? 'Save Draft' : 'Save Changes'} validate={draft => draft.salary.max < draft.salary.min ? { 'salary.max': 'Maximum salary must be at least the minimum.' } : draft.deadline < today() ? { deadline: 'Choose today or a later date.' } : {}} onSave={draft => { saveOwnedRecord('job', draft); close(); showMessage('Vacancy saved.'); navigate('vacancies') }} />}
      {modal?.kind === 'schedule' && <RecordEditor key={modal.interviewId || modal.applicationId} title={modal.title} record={modal.record} fields={interviewFields} onClose={close} onSave={draft => { saveInterview(modal.applicationId, draft, modal.interviewId); close(); showMessage('Interview schedule saved.') }} />}

`)
    s = between(s, '      {/* Close Vacancy Confirmation */}', '      {/* Edit Employer Profile Modal */}', '')
    s = between(s, '      {/* Edit Employer Profile Modal */}', '\n    </div>\n  )\n}', `      {modal?.kind === 'edit-employer-profile' && <RecordEditor title="Edit Company Profile" record={modal.record} fields={organizationFields} onClose={close} onSave={draft => { saveOrganization(currentEmployer.id, draft); close(); showMessage('Company profile updated.') }} />}
`)
    s = s.replace("{path === 'dashboard' && (", "{['dashboard', 'vacancies'].includes(path) && (")
  } else {
    s = s.replace(/    const allPrograms = \[[\s\S]+?\n    \]/, '    const allPrograms = state.programs')
    s = s.replace("{ label: 'View Details', run: () => showMessage('View participant feature coming soon') }", `{ label: 'View Details', run: p => details('Participant Details', [['Resident', p.name], ['Program', p.programName], ['Status', p.status], ['Attendance', p.attendance], ['Progress', p.progress], ['Completion Date', p.completionDate]]) },
            { label: 'Mark In Training', when: p => p.status === 'Registered', run: p => setModal({ kind: 'participant-status', title: 'Mark In Training?', record: p, status: 'In Training' }) },
            { label: 'Mark Completed', when: p => p.status === 'In Training', run: p => setModal({ kind: 'participant-status', title: 'Mark Completed?', record: p, status: 'Completed' }) }`)
    s = s.replace("{ label: 'View Transaction', run: () => showMessage('View transaction feature coming soon') }", "{ label: 'View Transaction', run: t => details('Transaction Details', [['Reference', t.id], ['Program', t.program], ['Amount', money(t.amount)], ['Payment Status', t.status], ['Publication Status', t.publication]]) }")
    s = between(s, '      {(modal?.kind === \'create-program\'', '      {/* Close Program Confirmation */}', `      {(modal?.kind === 'create-program' || modal?.kind === 'edit-program') && <RecordEditor key={modal.record.id} title={modal.title} record={{ ...modal.record, schedule: modal.record.schedule?.slice(0, 10) || '' }} fields={programFields} onClose={close} saveLabel={modal.kind === 'create-program' ? 'Save Draft' : 'Save Changes'} onSave={draft => { saveOwnedRecord('program', draft); close(); showMessage('Training program saved.') }} />}
      {modal?.kind === 'participant-status' && <ConfirmationDialog title={modal.title} description={modal.error || (modal.status === 'Completed' ? 'Record training completion? This does not guarantee employment.' : 'Start training for this participant?')} confirmLabel={modal.status === 'Completed' ? 'Mark Completed' : 'Mark In Training'} variant="primary" onClose={close} onConfirm={() => attempt(() => { updateRegistration(modal.record.id, modal.status); showMessage('Participant status updated.') })} />}

`)
    s = between(s, '      {/* Close Program Confirmation */}', '      {/* Edit Agency Profile Modal */}', '')
    s = between(s, '      {/* Edit Agency Profile Modal */}', '\n    </div>\n  )\n}', `      {modal?.kind === 'edit-agency-profile' && <RecordEditor title="Edit Agency Profile" record={modal.record} fields={organizationFields} onClose={close} onSave={draft => { saveOrganization(currentAgency.id, draft); close(); showMessage('Agency profile updated.') }} />}
`)
    s = s.replace('<Panel title="Completion Management" description="Issue certificates and track outcomes">\n          <p style={{ padding: \'20px\', color: \'#6b7280\', textAlign: \'center\' }}>\n            Completion records will appear here once participants finish training programs.\n          </p>\n        </Panel>', `<RecordTable title="Completion Records" rows={state.participants.filter(p => p.status === 'Completed')} columns={[col('name', 'Resident'), col('programName', 'Program'), col('completionDate', 'Completion Date'), statusCol()]} actions={[{ label: 'View Completion', run: p => details('Completion Record', [['Resident', p.name], ['Program', p.programName], ['Completion Date', p.completionDate], ['Status', p.status]]) }]} />`)
    s = s.replace('      <div className="lgu-content">', '      {module.tabs && <Tabs tabs={module.tabs.map(label => ({ id: label, label }))} active={tab} onChange={next => navigate(`${path}?tab=${encodeURIComponent(next)}`)} />}\n      <div className="lgu-content">')
  }
  // Replace ownership checks on fixture records with scoped actions. The store checks ownership again.
  const label = isEmployer ? 'Vacancy' : 'Program'
  const entity = isEmployer ? 'v' : 'p'
  const start = s.indexOf("          { label: 'Edit', run:")
  const end = s.indexOf('\n        ]}', start) >= 0 && isEmployer ? s.indexOf('\n        ]}', start) : s.indexOf('\n          ]}', start)
  if (start < 0 || end < 0) throw new Error(`Missing actions: ${file}`)
  s = s.slice(0, start) + `          { label: 'Edit', when: r => !['Closed', 'Completed', 'Expired'].includes(r.status), run: ${entity} => setModal({ kind: '${isEmployer ? 'edit-vacancy' : 'edit-program'}', title: 'Edit ${label}', record: ${entity} }) },
          { label: 'Publish', when: r => ['Draft', 'Pending Publication'].includes(r.status), run: r => lifecycle(r, 'Publish') },
          { label: 'Delete Draft', when: r => r.status === 'Draft', run: r => lifecycle(r, 'Delete Draft') },
          { label: 'Close', when: r => ['Active', 'Upcoming', 'Full'].includes(r.status), run: r => lifecycle(r, 'Close') }` + s.slice(end)
  const rootClose = s.lastIndexOf('\n    </div>\n  )\n}')
  s = s.slice(0, rootClose) + `
      {modal?.kind === 'lifecycle' && <ConfirmationDialog title={modal.title} description={modal.error || (modal.action === 'Publish' ? 'Confirm publication. The listing fee is recorded as a mock payment only; payment does not affect recommendations.' : 'Confirm this lifecycle change. Historical records remain visible.')} confirmLabel={modal.action} variant={modal.action === 'Delete Draft' ? 'danger' : 'primary'} onClose={close} onConfirm={() => attempt(() => { recordLifecycle('${isEmployer ? 'job' : 'program'}', modal.record.id, modal.action); showMessage('Record updated.') })} />}
` + s.slice(rootClose)
  s = s.replace('<div className="lgu-workspace">', `<div className="lgu-workspace"><div className="demo-organization"><Field label="Demo Organization"><select aria-label="Demo Organization" value={${isEmployer ? 'currentEmployer' : 'currentAgency'}.id} onChange={e => { setActor('${role}', e.target.value); close() }}>{organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field></div>`)
  s = s.replaceAll("'lg'", "'md'").replaceAll('size="lg"', 'size="md"')
  write(`pages/${file}`, s)
}

s = read('components/Layout.jsx')
s = s.replace(/import \{ notifications \}[^\n]+\n/, '').replace(/import \{ lguNotifications \}[^\n]+\n/, '').replace(/import \{ employerNotifications \}[^\n]+\n/, '').replace(/import \{ trainingNotifications \}[^\n]+\n/, '')
s = "import { useDemoStore, setNotifications } from '../data/demoStore'\n" + s
s = between(s, '  const [notifList, setNotifList] =', "  const [filter, setFilter]", "  const shared = useDemoStore()\n  const notifList = shared.notifications[role] || []\n  const setNotifList = next => setNotifications(role, next)\n")
s = s.replace(/  useEffect\(\(\) => \{\s*if \(role === 'lgu'\)[\s\S]+?\}, \[notifList, role\]\)\s*/, '')
write('components/Layout.jsx', s)

