import { useState } from 'react'
import { FileText, ShieldCheck } from 'lucide-react'
import { Alert, Button, ConfirmationDialog, Field, Filter, Modal, PageTitle, Panel, ProgressBar, Tabs } from '../components/ui'
import { pathways, placementRate, reports } from '../data/lguData'
import { useLguData, setLGUState } from '../data/demoModels'
import { Bars, Facts, Flow, Metrics, RecordTable, ReportActions, SectionLink, Status, Trend } from './lgu/Workspace'
import { money } from '../data/lguFormat'
import { Analytics, Funnel, HiringOutcomes, InsightCards, OverviewMetrics, Rate } from './lgu/Analytics'
import './lgu/lgu.css'

const modules = {
  dashboard: { title: 'LGU Fisheries Workforce Dashboard', description: 'Monitor fisheries employment, skills development, livelihoods, and workforce trends.' },
  people: { title: 'Fisheries People & Organizations', description: 'Understand fisheries job seeker progress and review participating organizations.', tabs: ['Residents', 'Employers', 'Training Agencies', 'Verification Requests'] },
  opportunities: { title: 'Fisheries Opportunities', description: 'Monitor fisheries employer demand, training supply, and priority skill gaps.', tabs: ['Job Vacancies', 'Training Opportunities', 'Skills & Skill Gaps'] },
  employment: { title: 'Employment', description: 'Track applications, hiring outcomes, and platform employment placements.', tabs: ['Applications & Placements', 'Hiring Outcomes', 'Employment Placement Rate'] },
  entrepreneurship: { title: 'Entrepreneurship', description: 'Support residents from business exploration to LGU application review.', tabs: ['Entrepreneurship Pathways', 'Business Registration / Permits'] },
  partnerships: { title: 'Subscriptions & Partnerships', description: 'Review fisheries employer and training agency subscriptions and partnerships.', tabs: ['Job Posting Transactions', 'Training Listing Transactions', 'Sponsorships'] },
  analytics: { title: 'Fisheries Analytics', description: 'Understand fisheries workforce patterns and consider evidence-informed LGU actions.', tabs: ['Workforce Overview', 'Employment Analytics', 'Skills & Skill Gap Analytics', 'Training Analytics', 'Entrepreneurship Analytics', 'Prescriptive Insights'] },
  reports: { title: 'Reports', description: 'Preview and generate workforce reports from the demonstration snapshot.' },
  'user-management': { title: 'User Management', description: 'Manage resident, organization, and LGU staff account status.' },
  settings: { title: 'Settings', description: 'Manage LGU information and display preferences.' },
}
const aliases = { residents: ['people', 'Residents'], employers: ['people', 'Employers'], 'training-agencies': ['people', 'Training Agencies'], verification: ['people', 'Verification Requests'], vacancies: ['opportunities', 'Job Vacancies'], 'training-opportunities': ['opportunities', 'Training Opportunities'], skills: ['opportunities', 'Skills & Skill Gaps'], 'business-permits': ['entrepreneurship', 'Business Registration / Permits'], 'job-transactions': ['partnerships', 'Job Posting Transactions'], 'training-transactions': ['partnerships', 'Training Listing Transactions'], sponsorships: ['partnerships', 'Sponsorships'], insights: ['analytics', 'Prescriptive Insights'] }
const col = (key, label, render) => ({ key, label, render })
const statusCol = (key = 'status', label = 'Status') => col(key, label, r => <Status value={r[key]} />)
const filter = (key, label, options, test) => ({ key, label, options, test })

export function LGUDashboard({ page, navigate, showMessage }) {
  const { state, residents, programs, applications, vacancies, placements, snapshot, periods, skills, transactions, sponsors } = useLguData()
  const setState = setLGUState
  const names = ids => ids.map(id => skills.find(s => s.id === id)?.name).join(', ')
  const [periodName, setPeriodName] = useState(state.settings.period)
  const [modal, setModal] = useState(null)
  const [notes, setNotes] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [draft, setDraft] = useState(state.settings)
  const [generated, setGenerated] = useState({})
  const [skillFilters, setSkillFilters] = useState({})
  const [path, query] = page.split('?')
  const [moduleKey, legacyTab] = aliases[path] || [modules[path] ? path : 'dashboard', null]
  const module = modules[moduleKey]
  const requestedTab = new URLSearchParams(query).get('tab') || legacyTab
  const tab = module.tabs?.includes(requestedTab) ? requestedTab : module.tabs?.[0]
  const period = periods[periodName] || periods['This Year']
  const { orgs, businesses } = state
  const go = (key, nextTab) => navigate(`${key}${nextTab ? `?tab=${encodeURIComponent(nextTab)}` : ''}`)
  const close = () => setModal(null)
  const details = (title, items, extra, size = 'md') => setModal({ title, items, extra, size })
  const openReview = (record, kind) => { setReviewError(''); setNotes(record.notes || ''); setModal({ title: kind === 'business' ? 'Review Business Application' : 'Review Verification', record, kind, size: 'lg' }) }
  const requestDecision = (record, kind, action) => {
    if (action !== 'Approve' && !notes.trim()) { setReviewError('Add review notes explaining the rejection or requested requirements.'); return }
    setModal({ kind: 'confirm-review', title: `${action} ${kind === 'business' ? 'Business Application' : `${record.type} Verification`}?`, record, reviewKind: kind, action, notes, size: 'sm' })
  }
  const commitReview = () => {
    const { record, reviewKind, action } = modal
    const status = action === 'Approve' ? reviewKind === 'business' ? 'Approved' : 'Verified' : action === 'Reject' ? 'Rejected' : reviewKind === 'business' ? 'Needs Requirements' : 'Needs Additional Documents'
    const key = reviewKind === 'business' ? 'businesses' : 'orgs'
    setState(s => ({ ...s, [key]: s[key].map(r => r.id === record.id ? { ...r, status, notes: modal.notes, history: [...r.history, `${status} by LGU staff · Sep 12, 2026${modal.notes ? ` · ${modal.notes}` : ''}`] } : r) }))
    close(); showMessage(`${record.name}: ${status}. Mock review saved.`)
  }
  const residentRows = residents.map(r => ({ ...r, status: state.users.find(u => u.id === r.id)?.status || r.status }))
  const viewResident = (r, progress = false) => details(progress ? `${r.name} — Progress` : `${r.name} — Resident Profile`, [[ 'Resident Reference', r.id], ['Basic Information', `${r.name} · ${r.location}`], ['Education', r.education], ['Skills', r.skills], ['Experience', r.experience], ['Certifications', r.certifications], ['Career Interests', r.interest], ['Identified Skill Gaps', names(r.gaps) || 'None currently identified'], ['Applications', r.applications], ['Training Activity', r.training], ['Entrepreneurship Activity', businesses.find(b => b.applicant === r.name) ? `${businesses.find(b => b.applicant === r.name).name} · ${businesses.find(b => b.applicant === r.name).status}` : r.activity]], <><ProgressBar label="Profile Completion" value={r.completion} /><Flow steps={[[ 'Profile', `${r.completion}%`], ['Current Pathway', r.pathway], ['Training', r.training]]} /></>, 'lg')
  const viewVacancy = (r, summary = false) => details(summary ? `${r.name} — Applicants Summary` : r.name, [[ 'Employer', r.employer], ['Openings', r.openings], ['Applicants', r.applicants], ['Required Skills', names(r.skillIds)], ['Published Date', r.published], ['Deadline', r.deadline], ['Posting Status', r.status], ['Salary', r.salary], ['Job Description', r.description]], summary && <Alert>Aggregate applicant count only. Candidate selection remains with the employer.</Alert>)
  const viewProgram = r => details(r.name, [[ 'Training Agency', r.agency], ['Skills Developed', names(r.skillIds) || 'Business planning and entrepreneurship'], ['Available Slots', r.slots], ['Registered Residents', r.registrations], ['Total Batch Capacity', r.capacity], ['Training Fee', money(r.fee)], ['Schedule', r.schedule], ['Listing Status', r.status]], <Alert>Training relevance depends on resident skills and interests. Payment does not guarantee recommendation.</Alert>)
  const viewOrg = (r, mode = 'profile') => details(r.name, [[ 'Organization Type', r.type], ['Industry', r.industry], ['Location', r.location], ['Contact Person', r.contact], ['Contact Email', r.email], ['Verification Status', r.status], ['Date Registered', r.registered], ['Active Vacancies', r.type === 'Employer' ? r.vacancies : undefined], ['Total Hires', r.type === 'Employer' ? r.hires : undefined], ['Available Slots', r.slots]], mode === 'vacancies' ? <RecordTable title="Organization vacancies" rows={vacancies.filter(v => v.employer === r.name)} columns={[col('name', 'Job'), col('openings', 'Openings'), statusCol()]} actions={[{ label: 'View Vacancy', run: viewVacancy }]} /> : mode === 'programs' ? <RecordTable title="Agency programs" rows={programs.filter(p => p.agency === r.name)} columns={[col('name', 'Program'), col('slots', 'Slots'), statusCol()]} actions={[{ label: 'View Training', run: viewProgram }]} /> : null, 'lg')
  const support = (insight, action) => {
    const skill = skills.find(s => s.id === (insight.skillId || insight.id))
    details(`${action} — ${skill.name}`, [[ 'Related Vacancies', skill.demand], ['Residents With Skill', skill.qualified], ['Residents Missing Skill', skill.missing], ['Available Training Slots', skill.slots], ['Training Capacity Gap', Math.max(0, skill.missing - skill.slots)], ['Priority', skill.priority]], <><Alert>Current shared demo evidence, with historical workforce cohort baselines. Rows below are representative records; skills may overlap across residents and vacancies.</Alert><RecordTable title="Affected residents" rows={residentRows.filter(r => r.gaps.includes(skill.id))} columns={[col('name', 'Resident'), col('interest', 'Career Interest'), col('training', 'Training')]} actions={[{ label: 'View Profile', run: r => viewResident(r) }]} /><RecordTable title="Related vacancies" rows={vacancies.filter(v => v.skillIds.includes(skill.id))} columns={[col('name', 'Job'), col('employer', 'Employer'), statusCol()]} actions={[{ label: 'View Vacancy', run: r => viewVacancy(r) }]} /><RecordTable title="Relevant training supply" rows={programs.filter(p => p.skillIds.includes(skill.id))} columns={[col('name', 'Program'), col('slots', 'Available Slots'), col('agency', 'Agency')]} actions={[{ label: 'View Training', run: viewProgram }]} /></>, 'lg')
  }
  const viewPlacement = r => details('Employment Placement Details', [[ 'Reference', r.id], ['Resident', r.resident], ['Job', r.job], ['Employer', r.employer], ['Match Score', `${r.match}%`], ['Date Hired', r.hired], ['Employment Status', r.status]], <Alert>Tracked mock placement. A match score is a demonstration indicator, not a hiring decision.</Alert>)
  const periodPlacements = placements.filter(p => periodName === 'This Year' || p.hired >= (periodName === 'This Month' ? '2026-09-01' : '2026-07-01'))
  const placementTable = <RecordTable title="Recent placements" rows={periodPlacements} columns={[col('resident', 'Resident'), col('job', 'Job'), col('employer', 'Employer'), col('match', 'Match Score', r => `${r.match}%`), col('hired', 'Date Hired'), statusCol('status', 'Employment Status')]} actions={[{ label: 'View Placement', run: viewPlacement }]} />
  const reportData = category => ({
    'Workforce Overview': [[ 'Registered Job Seekers', snapshot.registered], ['Active Job Seekers', snapshot.active], ['Active Vacancies', snapshot.vacancies], ['Employment Placements', period.hired], ['Platform Placement Rate', placementRate(period.hired)]],
    'Employment Summary': [[ 'Applications', period.applications], ['Shortlisted', period.shortlisted], ['Interviews', period.interviews], ['Hired', period.hired], ['Platform Placement Rate', placementRate(period.hired)]],
    'Job Vacancy & Employer Demand': skills.map(s => [s.name, `${s.demand} related vacancies`]),
    'Skills Gap Report': skills.map(s => [s.name, `${s.missing} missing skill · ${s.slots} training slots · ${s.priority} priority`]),
    'Training Participation': [[ 'Registrations', snapshot.trainingRegistrations], ['Completions', snapshot.trainingCompleted], ['Completion Rate', '80%'], ['Available Slots', programs.reduce((n, p) => n + p.slots, 0)]],
    'Training Outcomes': programs.filter(p => p.completed).map(p => [p.name, `${p.completed} completions · ${p.placements} related placements`]),
    Entrepreneurship: [[ 'Exploring Entrepreneurship', snapshot.exploring], ['Pathways Started', snapshot.pathways], ['In Preparation', snapshot.preparing], ['Registration Started', snapshot.registrationStarted], ['Registered Businesses', snapshot.registeredBusinesses]],
    'Business Registration': businesses.map(b => [b.id, `${b.name} · ${b.status}`]),
  })[category]
  const previewReport = category => details(`${category} — Mock Report`, reportData(category), <><p className="lgu-caption">{period.label}. Employment activity uses the selected period. Other totals use the September snapshot or year-to-date cohorts. Placement rate = hires ÷ 842 active registered job seekers × 100. Training outcomes describe association, not causation.</p><Alert>Demonstration report for LGU review. Business review statuses are mock workflow records.</Alert></>, 'lg')
  const exportReport = category => {
    const csv = [['EntretifAI Mock Report', category], ['Reporting Period', period.label], ['Scope', 'Employment: selected period; other measures: September snapshot or year-to-date cohorts'], ['Placement Rate Denominator', '842 active registered job seekers'], ...reportData(category)].map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `EntretifAI-${category.replaceAll(' ', '-')}-mock.csv`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    showMessage('Mock report exported as CSV.')
  }

  let content
  if (moduleKey === 'dashboard') content = <><OverviewMetrics period={period} orgs={orgs} /><Rate period={period} /><div className="lgu-grid"><Trend period={period} /><Bars title="Top In-Demand Jobs" description="Current vacancy demand" items={[[ 'IT Support Technician', 75], ['Administrative Assistant', 68], ['Digital Marketing Associate', 35]]} action={<SectionLink onClick={() => go('opportunities')}>Explore</SectionLink>} /></div><div className="lgu-grid"><Bars title="Top Skill Gaps" description="Residents with identified gaps" items={skills.slice(0, 3).map(s => [s.name, s.missing])} action={<SectionLink onClick={() => go('opportunities', 'Skills & Skill Gaps')}>View skills</SectionLink>} /><Panel title="Review Queue" description="Organizations awaiting LGU review" action={<SectionLink onClick={() => go('people', 'Verification Requests')}>View all</SectionLink>}><div className="lgu-queue">{orgs.filter(o => ['Pending Review', 'Under Review'].includes(o.status)).slice(0, 3).map(o => <div key={o.id}><ShieldCheck size={18} /><div><strong>{o.name}</strong><small>{o.type} · {o.status}</small></div><Button variant="secondary" onClick={() => openReview(o, 'organization')}>Review</Button></div>)}</div></Panel></div>{placementTable}<InsightCards compact onSupport={support} /></>

  if (moduleKey === 'people') {
    if (tab === 'Residents') content = <RecordTable title="Residents" rows={residentRows} columns={[col('name', 'Resident'), col('interest', 'Career Interest'), statusCol('employment', 'Employment Status'), col('skills', 'Top Skills', r => r.skills.length > 3 ? r.skills.slice(0, 3).join(', ') + '...' : r.skills.join(', ')), col('completion', 'Profile Completion', r => <ProgressBar value={r.completion} />), col('pathway', 'Current Pathway'), col('training', 'Training Status'), statusCol()]} filters={[filter('employment', 'Employment Status'), filter('interest', 'Career Interest'), filter('skills', 'Skills'), filter('pathway', 'Pathway'), filter('completion', 'Profile Completion', ['Complete', '50–99%', 'Below 50%'], (r, v) => v === 'Complete' ? r.completion === 100 : v === '50–99%' ? r.completion >= 50 && r.completion < 100 : r.completion < 50)]} actions={[{ label: 'View Profile', run: r => viewResident(r) }, { label: 'View Progress', run: r => viewResident(r, true) }]} />
    if (tab === 'Employers' || tab === 'Training Agencies') {
      const employer = tab === 'Employers'
      content = <RecordTable title={tab} rows={orgs.filter(o => o.type === (employer ? 'Employer' : 'Training Agency')).map(o => ({ ...o, programs: employer ? undefined : programs.filter(p => p.agency === o.name && ['Active', 'Full'].includes(p.status)).length, slots: employer ? undefined : programs.filter(p => p.agency === o.name).reduce((n, p) => n + p.slots, 0) }))} columns={employer ? [col('name', 'Company'), col('industry', 'Industry'), col('contact', 'Contact Person'), col('vacancies', 'Active Vacancies'), col('hires', 'Total Hires'), statusCol('status', 'Verification Status'), col('registered', 'Date Registered')] : [col('name', 'Training Agency'), col('location', 'Location'), col('programs', 'Active Programs'), col('slots', 'Available Slots'), col('participants', 'Participants'), col('completed', 'Completion Rate', r => r.participants ? `${(r.completed / r.participants * 100).toFixed(1)}%` : 'No completed cohort'), statusCol('status', 'Verification Status')]} filters={[filter('status', 'Verification Status')]} actions={[{ label: employer ? 'View Company' : 'View Agency', run: r => viewOrg(r) }, { label: 'Review Verification', run: r => openReview(r, 'organization') }, { label: employer ? 'View Vacancies' : 'View Programs', run: r => viewOrg(r, employer ? 'vacancies' : 'programs') }]} />
    }
    if (tab === 'Verification Requests') content = <RecordTable title="Verification requests" description="Review submitted records and record a mock verification decision." rows={orgs} columns={[col('name', 'Organization'), col('type', 'Type'), col('submitted', 'Submission Date'), col('documents', 'Documents', r => `${r.documents.length} submitted`), statusCol('status', 'Current Status')]} filters={[filter('type', 'Organization Type'), filter('status', 'Current Status')]} actions={[{ label: 'Review', run: r => openReview(r, 'organization') }]} />
  }
  if (moduleKey === 'opportunities') {
    if (tab === 'Job Vacancies') content = <RecordTable title="Job vacancies" rows={vacancies} columns={[col('name', 'Job Title'), col('employer', 'Employer'), col('openings', 'Openings'), col('applicants', 'Applicants'), col('skillIds', 'Required Skills', r => names(r.skillIds)), col('published', 'Published Date'), col('deadline', 'Deadline'), statusCol('status', 'Posting Status')]} filters={[filter('employer', 'Employer'), filter('industry', 'Industry'), filter('category', 'Job Category'), filter('status', 'Status'), filter('date', 'Published Date', ['September 2026', 'Before September'], (r, v) => v === 'September 2026' ? r.published >= '2026-09-01' : r.published < '2026-09-01')]} actions={[{ label: 'View Vacancy', run: r => viewVacancy(r) }, { label: 'View Applicants Summary', run: r => viewVacancy(r, true) }]} />
    if (tab === 'Training Opportunities') content = <><Alert>Compare training supply with identified skill gaps. Network Configuration has {skills.find(s => s.id === 'network')?.slots || 0} available slots for {skills.find(s => s.id === 'network')?.missing || 0} residents with identified needs.</Alert><RecordTable title="Training opportunities" rows={programs} columns={[col('name', 'Training Program'), col('agency', 'Training Agency'), col('skillIds', 'Skills Developed', r => names(r.skillIds) || 'Entrepreneurship'), col('slots', 'Available Slots'), col('registrations', 'Registered Residents'), col('fee', 'Training Fee', r => money(r.fee)), col('schedule', 'Schedule'), statusCol('status', 'Listing Status')]} filters={[filter('agency', 'Training Agency'), filter('status', 'Listing Status')]} actions={[{ label: 'View Training', run: viewProgram }]} /></>
    if (tab === 'Skills & Skill Gaps') {
      const filteredSkills = skills.filter(skill => {
        // Category filter
        if (skillFilters.category && skillFilters.category !== 'All' && skill.category !== skillFilters.category) return false
        // Priority filter
        if (skillFilters.priority && skillFilters.priority !== 'All' && skill.priority !== skillFilters.priority) return false
        // Demand filter
        if (skillFilters.demand && skillFilters.demand !== 'All') {
          if (skillFilters.demand === '50+ vacancies' && skill.demand < 50) return false
          if (skillFilters.demand === 'Below 50 vacancies' && skill.demand >= 50) return false
        }
        // Slots filter
        if (skillFilters.slots && skillFilters.slots !== 'All') {
          if (skillFilters.slots === 'Capacity Shortfall' && skill.slots >= skill.missing) return false
          if (skillFilters.slots === 'Enough Capacity' && skill.slots < skill.missing) return false
        }
        return true
      })
      
      const filterDefs = [
        { key: 'category', label: 'Skill Category', options: ['All', ...new Set(skills.map(s => s.category).filter(Boolean))] },
        { key: 'priority', label: 'Priority', options: ['All', 'High', 'Medium', 'Low'] },
        { key: 'demand', label: 'Employer Demand', options: ['All', '50+ vacancies', 'Below 50 vacancies'] },
        { key: 'slots', label: 'Training Availability', options: ['All', 'Capacity Shortfall', 'Enough Capacity'] }
      ]
      
      content = <>
        <Metrics items={[[ 'Skills Tracked', skills.length], ['Common Skill Gaps', skills.length], ['High-Priority Skill Gaps', skills.filter(s => s.priority === 'High').length], ['Training Programs Available', programs.filter(p => p.slots > 0).length]]} />
        
        <Panel title="Skills & skill gaps" description="Shared workforce aggregates. Vacancies and residents can appear under more than one skill.">
          <div className="lgu-toolbar">
            {filterDefs.map(f => (
              <Field key={f.key} label={f.label}>
                <select 
                  value={skillFilters[f.key] || 'All'} 
                  onChange={e => setSkillFilters({ ...skillFilters, [f.key]: e.target.value })}
                  aria-label={f.label}
                >
                  {f.options.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </Field>
            ))}
            {Object.values(skillFilters).some(v => v && v !== 'All') && (
              <Button variant="ghost" onClick={() => setSkillFilters({})}>Clear filters</Button>
            )}
          </div>
          
          <p className="lgu-table-count">{filteredSkills.length} of {skills.length} demonstration records</p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: '16px',
            maxWidth: '100%'
          }}>
            {filteredSkills.map((skill, index) => {
              const hasCapacityShortfall = skill.slots < skill.missing
              const priorityColor = skill.priority === 'High' ? '#dc2626' : skill.priority === 'Medium' ? '#f59e0b' : '#10b981'
              const isLastOdd = index === filteredSkills.length - 1 && filteredSkills.length % 4 !== 0
              
              return (
                <div key={skill.id} style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '16px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  gridColumn: isLastOdd && filteredSkills.length % 4 === 1 ? 'span 2' : 'auto'
                }}>
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '12px' 
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '15px', 
                      fontWeight: 600, 
                      color: '#111827',
                      flex: 1
                    }}>
                      {skill.name}
                    </h3>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '2px 8px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      color: 'white',
                      backgroundColor: priorityColor,
                      borderRadius: '4px',
                      marginLeft: '8px',
                      whiteSpace: 'nowrap'
                    }}>
                      {skill.priority}
                    </span>
                  </div>
                  
                  {/* Stats Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px',
                    marginBottom: '12px' 
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
                        Employer Demand
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                        {skill.demand}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
                        Residents Missing
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#dc2626' }}>
                        {skill.missing}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
                        Residents With Skill
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#10b981' }}>
                        {skill.qualified}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
                        Training Slots
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 600, 
                        color: hasCapacityShortfall ? '#f59e0b' : '#10b981' 
                      }}>
                        {skill.slots}
                      </div>
                    </div>
                  </div>
                  
                  {/* Capacity Warning */}
                  {hasCapacityShortfall && (
                    <div style={{ 
                      padding: '8px 12px',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#78350f', fontWeight: 500 }}>
                        Capacity Shortfall: {skill.missing - skill.slots} more slots needed
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '6px' 
                  }}>
                    {['View Skill Details', 'View Affected Residents', 'View Related Vacancies', 'View Available Training'].map((label, idx) => (
                      <Button 
                        key={idx}
                        variant="secondary" 
                        onClick={() => support(skill, label)}
                        style={{ 
                          fontSize: '11px',
                          padding: '4px 10px',
                          flex: idx < 2 ? '1 1 calc(50% - 3px)' : '1 1 100%'
                        }}
                      >
                        {label.replace('View ', '')}
                      </Button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </>
    }
  }
  if (moduleKey === 'employment') content = tab === 'Hiring Outcomes' ? <HiringOutcomes /> : tab === 'Employment Placement Rate' ? <><Metrics items={[[ 'Registered Job Seekers', snapshot.registered], ['Active Job Seekers', snapshot.active], ['Residents Hired Through Platform', period.hired], ['Placement Rate', placementRate(period.hired)]]} /><Rate period={period} /><Trend period={period} /></> : <><Funnel period={period} /><RecordTable title="Applications" rows={applications} columns={[col('applicantName', 'Resident'), col('position', 'Job'), col('company', 'Employer'), statusCol(), col('appliedDate', 'Applied Date')]} filters={[filter('status', 'Application Status')]} actions={[{ label: 'View Application', run: r => details('Application Details', [['Resident', r.applicantName], ['Job', r.position], ['Status', r.status], ['Interview', r.interview ? `${r.interview.date} ${r.interview.time} · ${r.interview.status}` : 'Not scheduled']]) }]} />{placementTable}</>
  if (moduleKey === 'entrepreneurship') {
    if (tab === 'Entrepreneurship Pathways') content = <><Metrics items={[[ 'Residents Exploring Entrepreneurship', snapshot.exploring], ['Business Pathways Started', snapshot.pathways], ['Residents in Preparation', snapshot.preparing], ['Residents in Registration Stage', snapshot.registrationStarted], ['Registered Businesses', snapshot.registeredBusinesses]]} /><RecordTable title="Entrepreneurship pathways" rows={pathways.map(p => { const b = businesses.find(b => b.applicant === p.resident); return b ? { ...p, registration: b.status, stage: b.status === 'Approved' ? p.stage === 'Registered' ? 'Registered' : 'Application Approved' : b.status === 'Under Review' ? 'Under LGU Review' : p.stage } : p })} columns={[col('resident', 'Resident'), col('business', 'Recommended Business'), col('category', 'Business Category'), col('stage', 'Current Stage'), col('training', 'Training Status'), statusCol('registration', 'Registration Status')]} filters={[filter('category', 'Business Category'), filter('stage', 'Current Stage')]} actions={[{ label: 'View Pathway', run: r => details(`${r.resident} — Entrepreneurship`, [[ 'Recommended Business', r.business], ['Business Category', r.category], ['Current Stage', r.stage], ['Training Status', r.training], ['Registration Status', r.registration]], <Flow steps={['Assessment', 'Recommendation', 'Guidance', 'Preparation', 'Registration', 'Requirements', 'LGU Review', 'Status Tracking'].map(s => [s])} />, 'lg') }]} /></>
    else content = <><Alert>Prototype digital workflow. Submitted requirements are illustrative and do not represent every actual legal requirement. Authorized LGU personnel make review decisions; no permit is issued by this demo.</Alert><Metrics items={['New Application', 'Under Review', 'Needs Requirements', 'Approved', 'Rejected'].map(s => [s, businesses.filter(b => b.status === s).length, 'Shown review records'])} /><RecordTable title="Business applications" rows={businesses} columns={[col('id', 'Reference Number'), col('applicant', 'Applicant'), col('name', 'Business Name'), col('type', 'Business Type'), col('submitted', 'Submission Date'), statusCol('status', 'Current Status')]} filters={[filter('status', 'Current Status'), filter('type', 'Business Type')]} actions={[{ label: 'Review Application', run: r => openReview(r, 'business') }]} /></>
  }
  if (moduleKey === 'partnerships') {
    if (tab === 'Sponsorships') content = <><Metrics items={[[ 'Active Sponsors', sponsors.length], ['Sponsored Programs', sponsors.length], ['Sponsored Training Slots', sponsors.reduce((n, s) => n + s.slots, 0)], ['Residents Supported', sponsors.reduce((n, s) => n + s.supported, 0)]]} /><Alert>Sponsorship does not grant access to resident personal information. Sponsorship totals describe supported cohorts, separate from current available training slots.</Alert><RecordTable title="Sponsorships" rows={sponsors} columns={[col('name', 'Sponsor'), col('program', 'Program'), col('slots', 'Sponsored Slots'), col('total', 'Total Cohort Slots'), col('support', 'Support'), statusCol()]} actions={[{ label: 'View Sponsorship', run: r => details(r.name, [[ 'Program', r.program], ['Sponsored Slots', r.slots], ['Total Cohort Slots', r.total], ['Residents Supported', r.supported], ['Support', r.support], ['Status', r.status]], <Alert>Aggregate partnership information only. No sponsor access to resident records is granted.</Alert>) }]} /></>
    else {
      const training = tab === 'Training Listing Transactions'
      const rows = transactions.filter(t => t.kind === (training ? 'training' : 'job'))
      content = <><Metrics items={[[ training ? 'Total Listing Transactions' : 'Total Job Posting Transactions', rows.length], ['Successful', rows.filter(r => r.status === 'Paid').length], ['Pending', rows.filter(r => r.status === 'Pending').length], ['Failed', rows.filter(r => r.status === 'Failed').length], ['Total Mock Revenue', money(rows.filter(r => r.status === 'Paid').reduce((n, r) => n + r.amount, 0)), 'Paid only; refunds excluded']]} /><Alert>{training ? 'Private Training Agencies pay per eligible published opportunity. Payment → Eligible to Publish. Matching / Relevance → Determines Recommendation. Payment never changes relevance, ranking, or resident matching.' : 'Employers pay a posting fee per eligible published vacancy. All transactions are mock records; no payment processing is connected.'}</Alert><RecordTable title={tab} rows={rows} columns={[col('id', 'Transaction ID'), col('organization', training ? 'Training Agency' : 'Employer'), col('item', training ? 'Training Program' : 'Job Vacancy'), col('amount', 'Amount', r => money(r.amount)), col('date', 'Payment Date'), statusCol('status', 'Payment Status'), statusCol('publication', training ? 'Listing Status' : 'Posting Status')]} filters={[filter('status', 'Payment Status')]} actions={[{ label: 'View Transaction', run: r => details('Transaction Details', [[ 'Transaction ID', r.id], ['Organization', r.organization], ['Listing', r.item], ['Amount', money(r.amount)], ['Payment Date', r.date], ['Payment Status', r.status], ['Publication Status', r.publication]], <Alert>Simulated fee record. No funds are collected or refunded.</Alert>) }]} /></>
    }
  }
  if (moduleKey === 'analytics') content = <Analytics tab={tab} period={period} orgs={orgs} businesses={businesses} onSupport={support} />
  if (moduleKey === 'reports') content = <div className="lgu-grid">{reports.map(category => <Panel key={category} title={category} action={<FileText size={19} />}><div className="lgu-report"><p>{generated[category] ? `Mock report generated for ${generated[category]}.` : 'Preview the connected workforce snapshot and export a mock summary.'}</p><ReportActions onView={() => previewReport(category)} onGenerate={() => { setGenerated(g => ({ ...g, [category]: period.label })); previewReport(category); showMessage('Mock report generated from current demonstration data.') }} onExport={() => exportReport(category)} /></div></Panel>)}</div>
  if (moduleKey === 'user-management') content = <RecordTable title="Users" rows={state.users.map(u => ({ ...u, verification: orgs.find(o => o.id === u.id)?.status || u.verification }))} columns={[col('name', 'User'), col('role', 'Role'), statusCol('status', 'Account Status'), statusCol('verification', 'Verification Status'), col('registered', 'Date Registered')]} filters={[filter('role', 'User Category'), filter('status', 'Account Status')]} actions={[{ label: 'View', run: r => details('User Details', [[ 'User Reference', r.id], ['User', r.name], ['Role', r.role], ['Account Status', r.status], ['Verification Status', r.verification], ['Date Registered', r.registered]]) }, { label: 'Activate / Deactivate', run: r => setModal({ kind: 'confirm-user', title: `${r.status === 'Active' ? 'Deactivate' : 'Activate'} User?`, record: r }) }]} />
  if (moduleKey === 'settings') content = (
    <form onSubmit={e => { 
      e.preventDefault(); 
      setState(s => ({ ...s, settings: draft })); 
      setPeriodName(draft.period); 
      showMessage('LGU settings saved in this browser.') 
    }}>
      {/* Header Section with Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0a7e72 0%, #0d9488 100%)',
          borderRadius: '12px',
          padding: '20px',
          color: 'white'
        }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Organization</div>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{draft.name}</div>
          <div style={{ fontSize: '12px', opacity: 0.85 }}>{draft.office}</div>
        </div>
        
        <div style={{ 
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Residents</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0a7e72' }}>{residents.length}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{snapshot.active} active job seekers</div>
        </div>
        
        <div style={{ 
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Organizations</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0a7e72' }}>{orgs.filter(o => o.status === 'Verified').length}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{snapshot.employers} employers, {snapshot.agencies} agencies</div>
        </div>
        
        <div style={{ 
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Snapshot</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Sept 12, 2026</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Demo v2.0</div>
        </div>
      </div>
      
      <Alert type="info" style={{ marginBottom: '24px' }}>
        <strong>Local Settings:</strong> Changes are saved in your browser and apply to this demonstration session only.
      </Alert>
      
      {/* Organization Profile Section */}
      <div style={{ 
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          borderBottom: '2px solid #f3f4f6',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: '#111827',
            margin: 0
          }}>Organization Profile</h3>
          <p style={{ 
            fontSize: '13px', 
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>Update your LGU's basic information and contact details</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <Field label="LGU Name" hint="Official name of the local government unit">
            <input 
              required 
              type="text" 
              value={draft.name} 
              onChange={e => setDraft({ ...draft, name: e.target.value })} 
              placeholder="e.g., Municipality of San Jose"
              style={{ fontSize: '14px' }}
            />
          </Field>
          
          <Field label="Office" hint="Department or office name">
            <input 
              required 
              type="text" 
              value={draft.office} 
              onChange={e => setDraft({ ...draft, office: e.target.value })} 
              placeholder="e.g., Public Employment Service Office"
              style={{ fontSize: '14px' }}
            />
          </Field>
          
          <Field label="Province">
            <input 
              required 
              type="text" 
              value={draft.province} 
              onChange={e => setDraft({ ...draft, province: e.target.value })} 
              placeholder="e.g., Occidental Mindoro"
              style={{ fontSize: '14px' }}
            />
          </Field>
          
          <Field label="Region">
            <input 
              required 
              type="text" 
              value={draft.region} 
              onChange={e => setDraft({ ...draft, region: e.target.value })} 
              placeholder="e.g., MIMAROPA"
              style={{ fontSize: '14px' }}
            />
          </Field>
          
          <Field label="Municipal Address" style={{ gridColumn: '1 / -1' }}>
            <input 
              required 
              type="text" 
              value={draft.address} 
              onChange={e => setDraft({ ...draft, address: e.target.value })} 
              placeholder="e.g., Municipal Hall, San Jose"
              style={{ fontSize: '14px' }}
            />
          </Field>
          
          <Field label="Contact Email">
            <input 
              required 
              type="email" 
              value={draft.email} 
              onChange={e => setDraft({ ...draft, email: e.target.value })} 
              placeholder="contact@example.gov.ph"
              style={{ fontSize: '14px' }}
            />
          </Field>
          
          <Field label="Contact Number">
            <input 
              required 
              type="text" 
              value={draft.phone} 
              onChange={e => setDraft({ ...draft, phone: e.target.value })} 
              placeholder="+63 XXX XXX XXXX"
              style={{ fontSize: '14px' }}
            />
          </Field>
        </div>
      </div>
      
      {/* Display Preferences Section */}
      <div style={{ 
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          borderBottom: '2px solid #f3f4f6',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: '#111827',
            margin: 0
          }}>Display Preferences</h3>
          <p style={{ 
            fontSize: '13px', 
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>Customize how data is displayed across the platform</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <Field label="Table Density" hint="Controls row height and spacing in tables">
            <select 
              value={draft.density} 
              onChange={e => setDraft({ ...draft, density: e.target.value })}
              style={{ fontSize: '14px', padding: '10px 12px' }}
            >
              <option value="Comfortable">Comfortable (Default)</option>
              <option value="Compact">Compact (More rows visible)</option>
            </select>
          </Field>
          
          <Field label="Default Reporting Period" hint="Default time range for analytics and reports">
            <select 
              value={draft.period} 
              onChange={e => setDraft({ ...draft, period: e.target.value })}
              style={{ fontSize: '14px', padding: '10px 12px' }}
            >
              {Object.keys(periods).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>
        
        <div style={{ 
          marginTop: '20px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px', fontWeight: 500 }}>
            Current Configuration
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#6b7280' }}>Table View: </span>
              <strong style={{ color: '#0a7e72' }}>{draft.density}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Default Period: </span>
              <strong style={{ color: '#0a7e72' }}>{draft.period}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Page Size: </span>
              <strong style={{ color: '#0a7e72' }}>5 rows per page</strong>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Sticky Footer Style */}
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        padding: '20px 24px',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        justifyContent: 'flex-end'
      }}>
        <Button type="button" variant="secondary" onClick={() => setDraft(state.settings)}>
          Discard Changes
        </Button>
        <Button type="submit" style={{ minWidth: '140px' }}>
          Save Settings
        </Button>
      </div>
    </form>
  )

  return <div className={`lgu-workspace ${state.settings.density === 'Compact' ? 'lgu-compact' : ''}`}><PageTitle eyebrow={`${state.settings.name} · LGU ADMINISTRATOR / STAFF`} title={module.title} description={module.description}>{['dashboard', 'employment', 'analytics', 'reports'].includes(moduleKey) && <Field label="Reporting Period"><Filter label="Reporting Period" value={periodName} onChange={e => setPeriodName(e.target.value)} options={Object.keys(periods)} /></Field>}</PageTitle><div className="lgu-snapshot"><span><i />Mock workforce snapshot · September 12, 2026</span><span>{period.label}</span></div>{['dashboard', 'employment', 'analytics', 'reports'].includes(moduleKey) && <p className="lgu-caption">Period filter applies to employment activity and placements. Population, demand, and capacity use the current snapshot; training and entrepreneurship totals are year to date.</p>}{module.tabs && <Tabs tabs={module.tabs.map(label => ({ id: label, label }))} active={tab} onChange={next => go(moduleKey, next)} />}<div key={`${moduleKey}/${tab || ''}`} className="lgu-content">{content}</div>
    {modal?.kind === 'confirm-user' ? <ConfirmationDialog title={modal.title} description={`${modal.record.name} will be ${modal.record.status === 'Active' ? 'deactivated' : 'activated'} in this prototype.`} confirmLabel={modal.record.status === 'Active' ? 'Deactivate User' : 'Activate User'} variant={modal.record.status === 'Active' ? 'danger' : 'primary'} onClose={close} onConfirm={() => { const status = modal.record.status === 'Active' ? 'Inactive' : 'Active'; setState(s => ({ ...s, users: s.users.map(u => u.id === modal.record.id ? { ...u, status } : u) })); close(); showMessage(`Account ${status.toLowerCase()}.`) }} /> : modal?.kind === 'confirm-review' ? <ConfirmationDialog title={modal.title} description={`${modal.record.name}. ${modal.action === 'Approve' ? 'Confirm that the submitted information has been reviewed.' : modal.action === 'Reject' ? 'Are you sure you want to reject this request?' : 'Confirm the additional requirements described in your review notes.'}${modal.notes ? ` Review notes: ${modal.notes}` : ''}`} confirmLabel={modal.action === 'Reject' ? 'Reject Request' : modal.action} variant={modal.action === 'Reject' ? 'danger' : 'primary'} onClose={() => { setNotes(modal.notes); setModal({ title: modal.reviewKind === 'business' ? 'Review Business Application' : 'Review Verification', kind: modal.reviewKind, record: modal.record, size: 'lg' }) }} onConfirm={commitReview} /> : modal && <Modal key={modal.title} title={modal.title} onClose={close} size={modal.size || 'md'}>
      {modal.record ? <div className="lgu-review"><Status value={modal.record.status} /><h3>{modal.kind === 'business' ? 'Business Information' : 'Organization Information'}</h3><Facts items={modal.kind === 'business' ? [[ 'Business Name', modal.record.name], ['Business Type', modal.record.type], ['Business Activity', modal.record.activity], ['Business Location', modal.record.location]] : [[ 'Organization', modal.record.name], ['Type', modal.record.type], ['Industry', modal.record.industry], ['Location', modal.record.location]]} /><h3>{modal.kind === 'business' ? 'Owner Information' : 'Contact Information'}</h3><Facts items={modal.kind === 'business' ? [[ 'Applicant', modal.record.applicant], ['Application Reference', modal.record.id]] : [[ 'Contact Person', modal.record.contact], ['Email', modal.record.email]]} /><h3>Submitted Information</h3><Facts items={[[ 'Submission Date', modal.record.submitted], ['Current Status', modal.record.status]]} /><h3>{modal.kind === 'business' ? 'Submitted Requirements' : 'Submitted Documents'}</h3><div className="lgu-documents">{modal.record.documents.map(doc => <details key={doc}><summary><FileText size={16} />{doc}<span>Preview</span></summary><div className="lgu-document-preview"><b>DEMONSTRATION DOCUMENT</b><p>{doc}</p><p>Submitted by {modal.record.name}. Reference: {modal.record.id}.</p><p>Illustrative supporting record for review. No real ID or legal document is stored.</p></div></details>)}</div><h3>Application History</h3><ul className="lgu-history">{modal.record.history.map((entry, i) => <li key={i}>{entry}</li>)}</ul><Field label={modal.kind === 'business' ? 'LGU Notes' : 'Review Notes'} hint="Required when requesting requirements or rejecting a record." error={reviewError}><textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Record the review findings or specific additional requirements..." /></Field><div className="modal-actions lgu-row-actions"><Button variant="secondary" onClick={close}>Close</Button>{!['Verified', 'Approved', 'Rejected'].includes(modal.record.status) && <><Button variant="secondary" onClick={() => { setState(s => ({ ...s, [modal.kind === 'business' ? 'businesses' : 'orgs']: s[modal.kind === 'business' ? 'businesses' : 'orgs'].map(r => r.id === modal.record.id ? { ...r, notes, status: 'Under Review' } : r) })); setModal(m => ({ ...m, record: { ...m.record, status: 'Under Review', notes } })); showMessage('Review notes saved.') }}>Save Review</Button><Button variant="secondary" onClick={() => requestDecision(modal.record, modal.kind, modal.kind === 'business' ? 'Request Additional Requirements' : 'Request Additional Documents')}>{modal.kind === 'business' ? 'Request Additional Requirements' : 'Request Additional Documents'}</Button><Button variant="danger" onClick={() => requestDecision(modal.record, modal.kind, 'Reject')}>Reject</Button><Button onClick={() => requestDecision(modal.record, modal.kind, 'Approve')}>Approve</Button></>}</div></div> : <><Facts items={modal.items || []} />{modal.extra}<div className="modal-actions"><Button variant="secondary" onClick={close}>Close</Button></div></>}
    </Modal>}
  </div>
}

