import { useEmployerModel, setEmployerState } from '../data/demoModels'
import { setActor, saveOwnedRecord, recordLifecycle, saveOrganization, updateApplication, saveInterview, interviewAction, inviteCandidate, updateRegistration, today } from '../data/demoStore'
import { RecordEditor } from '../components/RecordEditor'
import { jobFields, programFields, organizationFields, interviewFields } from '../data/formSchemas'
import { useState } from 'react'
import { FileText, ShieldCheck } from 'lucide-react'
import { Alert, Button, ConfirmationDialog, Field, Modal, PageTitle, Panel, Tabs } from '../components/ui'
import { recruitmentAnalytics, skillGapAnalytics, sponsorshipOpportunities } from '../data/employerData'
import { Bars, Facts, Flow, Metrics, RecordTable, Status, Trend } from './lgu/Workspace'
import { money } from '../data/lguFormat'
import './lgu/lgu.css'

const modules = {
  dashboard: { title: 'Employer Dashboard', description: 'Manage your recruitment and find qualified candidates.' },
  company: { title: 'Company & Verification', description: 'Manage your company information and verification status.' },
  vacancies: { title: 'Job Vacancies', description: 'Create and manage your job postings.' },
  matches: { title: 'Candidate Matches', description: 'AI-recommended candidates for your job postings.' },
  applicants: { title: 'Applicants', description: 'Review and manage job applications.' },
  interviews: { title: 'Interviews', description: 'Schedule and track candidate interviews.' },
  analytics: { title: 'Analytics', description: 'Recruitment metrics and insights.', tabs: ['Overview', 'Recruitment Funnel', 'Skill Gaps', 'Hiring Outcomes'] },
  transactions: { title: 'Transactions & Partnerships', description: 'Job posting payments and sponsorship opportunities.', tabs: ['Job Posting Transactions', 'Training Sponsorships'] },
  settings: { title: 'Settings', description: 'Manage your account and notification preferences.' }
}

const col = (key, label, render) => ({ key, label, render })
const statusCol = (key = 'status', label = 'Status') => col(key, label, r => <Status value={r[key]} />)
const filter = (key, label, options, test) => ({ key, label, options, test })
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function EmployerDashboard({ page, navigate, showMessage }) {
  const { state, currentEmployer, employerVacancies, applications, interviews, candidateMatches, hires, organizations, transactions } = useEmployerModel()
  const setState = setEmployerState
  const [modal, setModal] = useState(null)
  const [notes, setNotes] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [path, query] = page.split('?')
  const module = modules[path] || modules.dashboard
  const requestedTab = new URLSearchParams(query).get('tab')
  const tab = module.tabs?.includes(requestedTab) ? requestedTab : module.tabs?.[0]
  
const close = () => { setModal(null); setNotes(''); setReviewError('') }
  const details = (title, items, extra, size = 'md') => setModal({ title, items, extra, size })

  const stats = currentEmployer.statistics
  const activeVacancies = employerVacancies.filter(v => v.status === 'Active')
  const pendingApplications = applications.filter(a => a.status === 'Submitted')
  const upcomingInterviews = interviews.filter(i => i.status === 'Scheduled')

  // View functions
  const viewCompanyProfile = () => details(
    'Company Profile',
    [
      ['Company Name', currentEmployer.name],
      ['Industry', currentEmployer.industry],
      ['Business Type', currentEmployer.businessType],
      ['Company Size', currentEmployer.employees],
      ['Location', currentEmployer.location],
      ['Contact Person', currentEmployer.contact],
      ['Email', currentEmployer.email],
      ['Phone', currentEmployer.phone],
      ['Website', currentEmployer.website],
      ['Verification Status', currentEmployer.verificationStatus],
      ['Verified Date', formatDate(currentEmployer.verified)]
    ],
    <Alert type="success">
      <ShieldCheck size={16} />
      <div>
        <strong>Verified Employer</strong>
        <p style={{ margin: 0 }}>Your company has been verified by the LGU. You can now post job vacancies and access the candidate matching system.</p>
      </div>
    </Alert>,
    'md'
  )

  const viewVacancy = (v) => details(
    v.title,
    [
      ['Job Title', v.title],
      ['Category', v.category],
      ['Employment Type', v.employmentType],
      ['Experience Level', v.experienceLevel],
      ['Openings', v.openings],
      ['Salary Range', `${money(v.salary.min)} - ${money(v.salary.max)}`],
      ['Location', v.location],
      ['Published Date', v.published ? formatDate(v.published) : '—'],
      ['Deadline', v.deadline ? formatDate(v.deadline) : '—'],
      ['Status', v.status],
      ['Description', v.description],
      ['Required Skills', v.requiredSkills.join(', ')],
      ['Preferred Skills', v.preferredSkills?.join(', ') || 'None specified'],
      ['Matched Candidates', v.matched || 0],
      ['Total Applications', v.applicants || 0],
      ['Shortlisted', v.shortlisted || 0],
      ['Interviewed', v.interviewed || 0]
    ],
    v.responsibilities && (
      <>
        <h3>Responsibilities</h3>
        <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '13px' }}>
          {v.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
        </ul>
        <h3>Requirements</h3>
        <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '13px' }}>
          {v.requirements.map((req, i) => <li key={i}>{req}</li>)}
        </ul>
      </>
    ),
    'md'
  )

  const viewMatch = (m) => {
    const vacancy = employerVacancies.find(v => v.id === m.vacancyId)
    details(
      `${m.name} - ${m.matchScore}% Match`,
      [
        ['Name', m.name],
        ['Position', vacancy?.title],
        ['Match Score', `${m.matchScore}%`],
        ['Education', m.education],
        ['Experience', m.experience],
        ['Location', m.location],
        ['Current Skills', m.skills.join(', ')],
        ['Skills in Development', m.missingSkills.join(', ') || 'None'],
        ['Certifications', m.certifications.join(', ') || 'None'],
        ['Training Progress', m.inTraining ? `${m.trainingProgress}% complete` : 'Not currently enrolled'],
        ['Status', m.status]
      ],
      <>
        <Alert type="info">
          <strong>AI Recommendation</strong>
          <p style={{ margin: '4px 0 0 0' }}>{m.aiRecommendation}</p>
        </Alert>
        <h3>Why This Candidate Matched</h3>
        <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '13px' }}>
          {m.whyMatched.map((reason, i) => <li key={i}>{reason}</li>)}
        </ul>
        {m.whatsMissing.length > 0 && (
          <>
            <h3>Areas for Development</h3>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '13px' }}>
              {m.whatsMissing.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </>
        )}
      </>,
      'md'
    )
  }

  const viewApplication = (app) => {
    const match = candidateMatches.find(m => m.residentId === app.residentId)
    details(
      `${app.applicantName} - Application`,
      [
        ['Applicant Name', app.applicantName],
        ['Position', app.position],
        ['Match Score', match ? `${match.matchScore}%` : 'N/A'],
        ['Applied Date', formatDate(app.appliedDate)],
        ['Status', app.status],
        ['Cover Letter', app.coverLetter],
        ['Resume', app.resume],
        ['Review Notes', app.notes || 'No notes yet'],
        ['Reviewed By', app.reviewedBy || '—'],
        ['Review Date', app.reviewedDate ? formatDate(app.reviewedDate) : '—']
      ],
      app.status === 'Submitted' ? (
        <div className="lgu-row-actions">
          <Button variant="danger" onClick={() => requestApplicationDecision(app, 'Reject')}>
            Reject
          </Button>
          <Button onClick={() => requestApplicationDecision(app, 'Shortlist')}>
            Shortlist Candidate
          </Button>
        </div>
      ) : null,
      'md'
    )
  }

  const requestApplicationDecision = (app, action) => {
    setModal({
      kind: 'confirm-application',
      title: `${action} Application?`,
      record: app,
      action,
      size: 'sm'
    })
  }

  const commitApplicationReview = () => attempt(() => { updateApplication(modal.record.id, modal.action === 'Reject' ? 'Rejected' : modal.action === 'Hire' ? 'Hired' : 'Shortlisted'); showMessage('Application status updated.') })

  const viewInterview = (interview) => details(
    `Interview - ${interview.applicantName}`,
    [
      ['Applicant', interview.applicantName],
      ['Position', interview.position],
      ['Date', formatDate(interview.date)],
      ['Time', interview.time],
      ['Duration', `${interview.duration} minutes`],
      ['Type', interview.type],
      ['Location', interview.location],
      ['Interviewers', interview.interviewers.join(', ')],
      ['Status', interview.status],
      ['Notes', interview.notes || 'No notes'],
      ['Outcome', interview.outcome || '—']
    ],
    interview.status === 'Scheduled' ? (
      <div className="lgu-row-actions">
        <Button variant="secondary" onClick={() => requestInterviewAction(interview, 'Send Reminder')}>
          Send Reminder
        </Button>
        <Button onClick={() => requestInterviewAction(interview, 'Mark Complete')}>
          Mark Complete
        </Button>
      </div>
    ) : null,
    'md'
  )

  const requestInterviewAction = (interview, action) => {
    setModal({
      kind: 'confirm-interview',
      title: `${action}?`,
      record: interview,
      action,
      size: 'sm'
    })
  }

  const commitInterviewAction = () => attempt(() => { interviewAction(modal.record.id, modal.action); showMessage('Interview updated.') })

  const requestInviteAction = (match) => {
    setModal({
      kind: 'confirm-invite',
      title: 'Invite Candidate to Apply?',
      record: match,
      size: 'sm'
    })
  }

  const commitInviteAction = () => attempt(() => { inviteCandidate(modal.record); showMessage('Invitation added to resident notifications.') })

  let content

  // Dashboard
  if (path === 'dashboard' || !path || path === 'company') {
    if (path === 'company') {
      content = (
        <>
          {/* Verification Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px',
            padding: '32px',
            color: 'white',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={48} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>Verified Employer</h2>
              <p style={{ margin: '0 0 4px 0', opacity: 0.95 }}>
                Your company has been verified by the LGU on {formatDate(currentEmployer.verified)}.
              </p>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                You can now post job vacancies and access the candidate matching system.
              </p>
            </div>
          </div>

          {/* Unified Company Profile Card */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                  {currentEmployer.name}
                </h3>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {currentEmployer.industry} • {currentEmployer.businessType} • {currentEmployer.employees}
                </div>
              </div>
              <Button variant="secondary" onClick={() => setModal({
                kind: 'edit-employer-profile',
                title: 'Edit Company Profile',
                record: currentEmployer
              })}>
                Edit Profile
              </Button>
            </div>

            {/* Two-column Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '32px',
              marginBottom: '24px'
            }}>
              {/* Left Column - Company Details */}
              <div>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '15px', 
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Company Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Industry</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.industry}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Business Type</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.businessType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Company Size</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.employees}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.location}</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Information */}
              <div>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '15px', 
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Contact Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Contact Person</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.contact}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Phone</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Website</div>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.website}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-width Description */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '15px', 
                fontWeight: '600',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Company Description
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                {currentEmployer.description}
              </p>
            </div>

            {/* Full-width Address */}
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Business Address</div>
              <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentEmployer.address}</div>
            </div>
          </div>

          {/* Verification Documents Section */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#111827',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              Verification Documents
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '16px' 
            }}>
              {currentEmployer.documents.map(doc => (
                <div 
                  key={doc.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#14b8a6';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(20, 184, 166, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    background: '#ecfdf5',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileText size={24} style={{ color: '#14b8a6' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '15px', 
                      fontWeight: 'bold', 
                      color: '#111827',
                      marginBottom: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {doc.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280', 
                      marginBottom: '8px' 
                    }}>
                      {doc.type} • Uploaded {formatDate(doc.uploaded)}
                    </div>
                    <Status value={doc.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )
    } else {
      content = (
        <>
          <Metrics items={[
            ['Active Job Postings', stats.activeVacancies, `${stats.totalVacancies} total vacancies`],
            ['Candidate Matches', candidateMatches.filter(m => m.status === 'Matched' || m.status === 'Submitted').length, 'AI-recommended candidates'],
            ['Applications This Month', stats.currentMonth.applications, `${pendingApplications.length} pending review`],
            ['Hired This Month', stats.currentMonth.hired, `${stats.totalHires} total hires`]
          ]} />

          {employerVacancies.filter(v => v.status === 'Draft').length > 0 && (
            <Alert type="warning">
              <strong>Job posting fee required:</strong> You have draft job postings pending payment. Pay the posting fee to publish and reach matched candidates across the platform.
            </Alert>
          )}

          <div className="lgu-grid">
            <Panel
              title="Active Job Postings"
              description="Your published vacancies"
              action={<Button variant="ghost" onClick={() => navigate('vacancies')}>View All</Button>}
            >
              <div className="lgu-queue">
                {activeVacancies.slice(0, 3).map(job => (
                  <div key={job.id}>
                    <div>
                      <strong>{job.title}</strong>
                      <small>{job.employmentType} • {job.matched} matched • {job.applicants} applications</small>
                    </div>
                    <Button variant="secondary" onClick={() => viewVacancy(job)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              title="Recent Applications"
              description="Candidates awaiting review"
              action={<Button variant="ghost" onClick={() => navigate('applicants')}>View All</Button>}
            >
              <div className="lgu-queue">
                {pendingApplications.slice(0, 3).map(app => {
                  const match = candidateMatches.find(m => m.residentId === app.residentId)
                  return (
                    <div key={app.id}>
                      <div>
                        <strong>{app.applicantName}</strong>
                        <small>{app.position} • {match ? `${match.matchScore}% match` : 'Match data unavailable'}</small>
                      </div>
                      <Button variant="secondary" onClick={() => viewApplication(app)}>
                        Review
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Panel>
          </div>

          {upcomingInterviews.length > 0 && (
            <Panel title="Upcoming Interviews" description="Scheduled candidate interviews">
              <div className="lgu-queue">
                {upcomingInterviews.map(interview => (
                  <div key={interview.id}>
                    <div>
                      <strong>{interview.applicantName}</strong>
                      <small>{formatDate(interview.date)} at {interview.time} • {interview.position}</small>
                    </div>
                    <Button variant="secondary" onClick={() => viewInterview(interview)}>
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Recruitment Performance" description="This month's hiring metrics">
            <Metrics items={[
              ['Applications', stats.currentMonth.applications],
              ['Shortlisted', stats.currentMonth.shortlisted],
              ['Interviewed', stats.currentMonth.interviewed],
              ['Hired', stats.currentMonth.hired]
            ]} />
            <div style={{ padding: '0 22px 22px' }}>
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
                <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Conversion Rate</strong>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#0a7e72' }}>
                  {((stats.currentMonth.hired / stats.currentMonth.applications) * 100).toFixed(1)}%
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  {stats.currentMonth.hired} hired from {stats.currentMonth.applications} applications
                </p>
              </div>
            </div>
          </Panel>
        </>
      )
    }
  }

  // Job Vacancies
  if (path === 'vacancies') {
    // Merge mock vacancies with user-created vacancies
    const allVacancies = state.vacancies

    content = (
      <RecordTable
        title="Job vacancies"
        description=""
        rows={allVacancies}
        columns={[
          col('title', 'Job Title'),
          col('category', 'Category'),
          col('employmentType', 'Type'),
          col('openings', 'Openings'),
          col('salary', 'Salary', v => `${money(v.salary.min)} - ${money(v.salary.max)}`),
          col('matched', 'Matches', v => v.matched || 0),
          col('applicants', 'Applications', v => v.applicants || 0),
          col('published', 'Published', v => v.published ? formatDate(v.published) : '—'),
          statusCol('status', 'Status')
        ]}
        filters={[
          filter('status', 'Status'),
          filter('category', 'Category'),
          filter('employmentType', 'Employment Type')
        ]}
        actions={[
          { label: 'View Details', run: viewVacancy },
          { label: 'Edit', when: r => !['Closed', 'Completed', 'Expired'].includes(r.status), run: v => setModal({ kind: 'edit-vacancy', title: 'Edit Vacancy', record: v }) },
          { label: 'Publish', when: r => ['Draft', 'Pending Publication'].includes(r.status), run: r => lifecycle(r, 'Publish') },
          { label: 'Delete Draft', when: r => r.status === 'Draft', run: r => lifecycle(r, 'Delete Draft') },
          { label: 'Close', when: r => ['Active', 'Upcoming', 'Full'].includes(r.status), run: r => lifecycle(r, 'Close') }
        ]}
      />
    )
  }

  // Candidate Matches
  if (path === 'matches') {
    const vacancyId = new URLSearchParams(query).get('vacancy')
    const filtered = vacancyId ? candidateMatches.filter(m => m.vacancyId === vacancyId) : candidateMatches
    const vacancy = vacancyId ? employerVacancies.find(v => v.id === vacancyId) : null

    content = (
      <>
        {vacancy && (
          <Alert type="info">
            Showing matches for <strong>{vacancy.title}</strong>
          </Alert>
        )}
        <Alert type="info">
          <strong>AI-Powered Matching</strong>
          <p style={{ margin: 0 }}>Candidates are matched based on skills, experience, education, and training progress. Match scores indicate alignment with job requirements.</p>
        </Alert>
        <RecordTable
          title="Candidate matches"
          description=""
          rows={filtered.sort((a, b) => b.matchScore - a.matchScore)}
          columns={[
            col('name', 'Name'),
            col('vacancyId', 'Position', m => employerVacancies.find(v => v.id === m.vacancyId)?.title),
            col('matchScore', 'Match Score', m => `${m.matchScore}%`),
            col('education', 'Education'),
            col('experience', 'Experience'),
            col('skills', 'Skills', m => {
              const skills = m.skills;
              const maxDisplay = 3;
              if (skills.length <= maxDisplay) return skills.join(', ');
              const displayed = skills.slice(0, maxDisplay).join(', ');
              const remaining = skills.length - maxDisplay;
              return (
                <span>
                  {displayed}
                  <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '4px' }}>
                    +{remaining} more
                  </span>
                </span>
              );
            }),
            col('location', 'Location'),
            statusCol('status', 'Status')
          ]}
          filters={[
            filter('status', 'Status'),
            filter('vacancyId', 'Position', [...new Set(filtered.map(m => m.vacancyId))].map(id => employerVacancies.find(v => v.id === id)?.title)),
            filter('matchScore', 'Match Score', ['90% and above', '80-89%', 'Below 80%'], (r, v) =>
              v === '90% and above' ? r.matchScore >= 90 : v === '80-89%' ? r.matchScore >= 80 && r.matchScore < 90 : r.matchScore < 80
            )
          ]}
          actions={[
            { label: 'View Profile', run: viewMatch },
            { label: 'Invite to Apply', run: (m) => requestInviteAction(m) }
          ]}
        />
      </>
    )
  }

  // Applicants
  if (path === 'applicants') {
    content = (
      <RecordTable
        title="Applicants"
        description=""
        rows={applications}
        columns={[
          col('applicantName', 'Name'),
          col('position', 'Position'),
          col('matchScore', 'Match', app => {
            const match = candidateMatches.find(m => m.residentId === app.residentId)
            return match ? `${match.matchScore}%` : 'N/A'
          }),
          col('appliedDate', 'Submitted', app => formatDate(app.appliedDate)),
          statusCol('status', 'Status')
        ]}
        filters={[
          filter('status', 'Status'),
          filter('position', 'Position')
        ]}
        actions={[
          { label: 'View Application', run: viewApplication },
          { label: 'Shortlist', when: a => a.status === 'Submitted', run: a => requestApplicationDecision(a, 'Shortlist') },
          { label: 'Schedule Interview', when: a => ['Submitted', 'Shortlisted', 'Interviewed'].includes(a.status), run: a => setModal({ kind: 'schedule', title: 'Schedule Interview', applicationId: a.id, record: { date: '', time: '', type: 'In-person', location: currentEmployer.location, notes: '' } }) },
          { label: 'Record Hiring Outcome', when: a => !['Hired', 'Rejected', 'Withdrawn'].includes(a.status), run: a => requestApplicationDecision(a, 'Hire') }
        ]}
      />
    )
  }

  // Interviews
  if (path === 'interviews') {
    content = (
      <RecordTable
        title="Interviews"
        description=""
        rows={interviews}
        columns={[
          col('applicantName', 'Applicant'),
          col('position', 'Position'),
          col('date', 'Date', i => formatDate(i.date)),
          col('time', 'Time'),
          col('type', 'Type'),
          col('location', 'Location'),
          statusCol('status', 'Status')
        ]}
        filters={[
          filter('status', 'Status'),
          filter('type', 'Interview Type')
        ]}
        actions={[
          { label: 'View Details', run: viewInterview },
          { label: 'Send Reminder', when: i => i.status === 'Scheduled', run: i => requestInterviewAction(i, 'Send Reminder') },
          { label: 'Reschedule', when: i => i.status === 'Scheduled', run: i => setModal({ kind: 'schedule', title: 'Reschedule Interview', applicationId: i.applicationId, interviewId: i.id, record: { ...i, time: /^\d{2}:\d{2}$/.test(i.time) ? i.time : '10:00' } }) },
          { label: 'Cancel Interview', when: i => i.status === 'Scheduled', run: i => requestInterviewAction(i, 'Cancel') }
        ]}
      />
    )
  }

  // Analytics
  if (path === 'analytics') {
    if (tab === 'Overview' || !tab) {
      content = (
        <>
          <Metrics items={[
            ['Average Time to Fill', `${recruitmentAnalytics.overview.timeToFill} days`, 'From posting to hire'],
            ['Time to Hire', `${recruitmentAnalytics.overview.timeToHire} days`, 'From application to acceptance'],
            ['Offer Acceptance Rate', `${recruitmentAnalytics.overview.offerAcceptanceRate}%`, 'Offers accepted'],
            ['Quality of Hire', `${recruitmentAnalytics.overview.qualityOfHire}/5`, 'Average performance rating']
          ]} />
          <div className="lgu-grid">
            <Bars
              title="Monthly Applications"
              description="Application trend over time"
              items={recruitmentAnalytics.monthlyTrend.map(m => [m.month, m.applications])}
            />
            <Bars
              title="Monthly Hires"
              description="Hiring trend over time"
              items={recruitmentAnalytics.monthlyTrend.map(m => [m.month, m.hires])}
            />
          </div>
        </>
      )
    } else if (tab === 'Recruitment Funnel') {
      content = (
        <>
          <Panel title="Recruitment Funnel" description="Candidate progression through hiring stages">
            <Flow steps={recruitmentAnalytics.funnel.map(stage => [stage.stage, stage.count])} />
            <div style={{ padding: '0 22px 22px', marginTop: '16px' }}>
              <Alert type="info">
                <strong>Conversion Rate:</strong> {((recruitmentAnalytics.funnel[5].count / recruitmentAnalytics.funnel[1].count) * 100).toFixed(1)}% of applicants are ultimately hired.
              </Alert>
            </div>
          </Panel>
        </>
      )
    } else if (tab === 'Skill Gaps') {
      content = (
        <>
          <Alert>
            <strong>Build Local Talent:</strong> Skill gap analysis helps identify training needs in the local workforce. Consider sponsoring training programs to develop needed skills.
          </Alert>
          <RecordTable
            title="Skill gap analysis"
            description=""
            rows={skillGapAnalytics}
            columns={[
              col('skill', 'Skill'),
              col('demand', 'Positions Requiring'),
              col('qualified', 'Qualified Candidates'),
              col('gap', 'Gap', s => s.gap > 0 ? `${s.gap} Short` : `${Math.abs(s.gap)} Surplus`),
              col('trainingEnrolled', 'Training Enrolled', s => `${s.trainingEnrolled}/${s.trainingAvailable}`),
              statusCol('priority', 'Priority')
            ]}
            filters={[
              filter('priority', 'Priority'),
              filter('gap', 'Gap Status', ['Shortage', 'Surplus'], (r, v) =>
                v === 'Shortage' ? r.gap > 0 : r.gap <= 0
              )
            ]}
            actions={[
              { label: 'View Details', run: (s) => details(
                s.skill,
                [
                  ['Skill', s.skill],
                  ['Employer Demand', s.demand],
                  ['Qualified Candidates', s.qualified],
                  ['Gap', s.gap > 0 ? `${s.gap} candidates short` : `${Math.abs(s.gap)} candidate surplus`],
                  ['Training Available', s.trainingAvailable],
                  ['Training Enrolled', s.trainingEnrolled],
                  ['Priority', s.priority],
                  ['Trend', s.trend]
                ],
                s.gap > 0 && (
                  <Alert type="warning">
                    Consider sponsoring training programs to develop this skill in the local workforce.
                  </Alert>
                )
              )}
            ]}
          />
        </>
      )
    } else if (tab === 'Hiring Outcomes') {
      content = (
        <RecordTable
          title="Hiring outcomes"
          description=""
          rows={hires}
          columns={[
            col('hiree', 'Name'),
            col('position', 'Position'),
            col('startDate', 'Start Date', h => formatDate(h.startDate)),
            col('salary', 'Salary', h => money(h.salary)),
            statusCol('status', 'Employment Status')
          ]}
          actions={[
            { label: 'View Details', run: (h) => details(
              'Hiring Details',
              [
                ['Name', h.hiree],
                ['Position', h.position],
                ['Offer Date', formatDate(h.offerDate)],
                ['Accepted Date', formatDate(h.acceptedDate)],
                ['Start Date', formatDate(h.startDate)],
                ['Salary', money(h.salary)],
                ['Employment Type', h.employmentType],
                ['Status', h.status],
                ['Notes', h.notes]
              ]
            )}
          ]}
        />
      )
    }
  }

  // Transactions & Partnerships
  if (path === 'transactions') {
    const employerTransactions = [
      { id: 'JP-2026-001', item: 'IT Support Technician', amount: 500, date: '2026-09-01', status: 'Paid' },
      { id: 'JP-2026-003', item: 'Digital Marketing Associate', amount: 500, date: '2026-08-20', status: 'Paid' },
      { id: 'JP-2026-004', item: 'Network Engineer', amount: 500, date: '—', status: 'Pending' },
      { id: 'JP-2026-005', item: 'Junior Network Technician', amount: 500, date: '2026-07-01', status: 'Refunded' }
    ]

    if (tab === 'Job Posting Transactions' || !tab) {
      content = (
        <>
          <Metrics items={[
            ['Total Transactions', employerTransactions.length],
            ['Successful', employerTransactions.filter(t => t.status === 'Paid').length],
            ['Pending', employerTransactions.filter(t => t.status === 'Pending').length],
            ['Total Paid', money(employerTransactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0))]
          ]} />
          <RecordTable
            title="Job posting transactions"
            description=""
            rows={employerTransactions}
            columns={[
              col('id', 'Transaction ID'),
              col('item', 'Job Posting'),
              col('amount', 'Amount', t => money(t.amount)),
              col('date', 'Date'),
              statusCol('status', 'Payment Status')
            ]}
            filters={[
              filter('status', 'Payment Status')
            ]}
            actions={[
              { label: 'View Transaction', run: (t) => details(
                'Transaction Details',
                [
                  ['Transaction ID', t.id],
                  ['Job Posting', t.item],
                  ['Amount', money(t.amount)],
                  ['Payment Date', t.date],
                  ['Status', t.status]
                ],
                <Alert>Simulated fee record. No funds are collected or refunded.</Alert>
              )}
            ]}
          />
        </>
      )
    } else if (tab === 'Training Sponsorships') {
      content = (
        <>
          <Alert type="info">
            <strong>Build Local Talent</strong>
            <p style={{ margin: 0 }}>Sponsor training programs to develop skilled workers in your area. Sponsored trainees gain early access to your job postings and you help close skill gaps in the community.</p>
          </Alert>
          <RecordTable
            title="Available sponsorship opportunities"
            description=""
            rows={sponsorshipOpportunities}
            columns={[
              col('program', 'Training Program'),
              col('provider', 'Provider'),
              col('slots', 'Slots Available'),
              col('costPerSlot', 'Cost per Slot', s => money(s.costPerSlot)),
              col('totalCost', 'Total Investment', s => money(s.totalCost)),
              col('benefit', 'Benefit'),
              statusCol('status', 'Status')
            ]}
            actions={[
              { label: 'View Details', run: (s) => details(
                s.program,
                [
                  ['Program', s.program],
                  ['Provider', s.provider],
                  ['Slots Available', s.slots],
                  ['Cost per Slot', money(s.costPerSlot)],
                  ['Total Investment', money(s.totalCost)],
                  ['Benefit', s.benefit],
                  ['Status', s.status]
                ]
              )},
              { label: 'Express Interest', run: (s) => showMessage('Sponsorship inquiry sent to LGU') }
            ]}
          />
        </>
      )
    }
  }

  // Settings
  if (path === 'settings') {
    content = (
      <form onSubmit={(e) => {
        e.preventDefault()
        showMessage('Settings saved successfully')
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
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Company</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{currentEmployer.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>{currentEmployer.industry}</div>
          </div>
          
          <div style={{ 
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Job Postings</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0a7e72' }}>{stats.activeVacancies}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{stats.totalVacancies} total vacancies</div>
          </div>
          
          <div style={{ 
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Hires</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0a7e72' }}>{stats.totalHires}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{stats.currentMonth.hired} hired this month</div>
          </div>
          
          <div style={{ 
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification Status</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#10b981' }}>✓ Verified</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Since {formatDate(currentEmployer.verified)}</div>
          </div>
        </div>
        
        <Alert type="info" style={{ marginBottom: '24px' }}>
          <strong>Account Settings:</strong> Manage your notification preferences and account security.
        </Alert>
        
        {/* Notification Preferences Section */}
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
            }}>Email Notifications</h3>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>Choose which updates you want to receive via email</p>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <input
                type="checkbox"
                checked={state.settings.emailNotifications.matches}
                onChange={e => setState(s => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    emailNotifications: { ...s.settings.emailNotifications, matches: e.target.checked }
                  }
                }))}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>New candidate matches</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Get notified when AI finds candidates matching your job requirements</div>
              </div>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <input
                type="checkbox"
                checked={state.settings.emailNotifications.applications}
                onChange={e => setState(s => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    emailNotifications: { ...s.settings.emailNotifications, applications: e.target.checked }
                  }
                }))}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>New applications</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Receive alerts when candidates apply to your job postings</div>
              </div>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <input
                type="checkbox"
                checked={state.settings.emailNotifications.interviews}
                onChange={e => setState(s => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    emailNotifications: { ...s.settings.emailNotifications, interviews: e.target.checked }
                  }
                }))}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Interview reminders</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Get reminded about upcoming scheduled interviews</div>
              </div>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <input
                type="checkbox"
                checked={state.settings.emailNotifications.summary}
                onChange={e => setState(s => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    emailNotifications: { ...s.settings.emailNotifications, summary: e.target.checked }
                  }
                }))}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Weekly recruitment summary</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Receive a weekly digest of your recruitment activities and metrics</div>
              </div>
            </label>
          </div>
          
          {/* Current Configuration Summary */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534', marginBottom: '8px' }}>
              Current Configuration
            </div>
            <div style={{ fontSize: '12px', color: '#166534', lineHeight: '1.6' }}>
              {[
                state.settings.emailNotifications.matches && 'Candidate matches',
                state.settings.emailNotifications.applications && 'Applications',
                state.settings.emailNotifications.interviews && 'Interview reminders',
                state.settings.emailNotifications.summary && 'Weekly summaries'
              ].filter(Boolean).length > 0 
                ? `You'll receive notifications for: ${[
                    state.settings.emailNotifications.matches && 'Candidate matches',
                    state.settings.emailNotifications.applications && 'Applications',
                    state.settings.emailNotifications.interviews && 'Interview reminders',
                    state.settings.emailNotifications.summary && 'Weekly summaries'
                  ].filter(Boolean).join(', ')}`
                : 'All email notifications are currently disabled'}
            </div>
          </div>
          
          <div className="lgu-row-actions" style={{ marginTop: '20px' }}>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>

        {/* Account Security Section */}
        <div style={{ 
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ 
            borderBottom: '2px solid #f3f4f6',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: '#111827',
              margin: 0
            }}>Account Security</h3>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>Password changes and security settings</p>
          </div>
          
          <Alert type="info">
            <strong>LGU Administrator Required:</strong> For security and account management changes, please contact the LGU administrator directly.
          </Alert>
          
          <div style={{ 
            display: 'grid', 
            gap: '12px',
            marginTop: '16px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>Email</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{currentEmployer.email}</div>
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#10b981',
                background: '#ecfdf5',
                padding: '4px 10px',
                borderRadius: '12px',
                fontWeight: 500
              }}>
                Verified
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>Password</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>••••••••</div>
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#6b7280',
                background: '#f3f4f6',
                padding: '4px 10px',
                borderRadius: '12px',
                fontWeight: 500
              }}>
                Contact LGU
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div className="lgu-workspace"><div className="demo-organization"><Field label="Demo Organization"><select aria-label="Demo Organization" value={currentEmployer.id} onChange={e => { setActor('employer', e.target.value); close() }}>{organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field></div>
      <PageTitle eyebrow="EMPLOYER PORTAL" title={module.title} description={module.description}>
        {['dashboard', 'vacancies'].includes(path) && (
          <Button onClick={() => setModal({
            kind: 'create-vacancy',
            title: 'Post New Job',
            record: {
              id: `JOB-${Date.now()}`,
              title: '',
              description: '',
              category: 'Information Technology',
              location: currentEmployer.location || '',
              employmentType: 'Full-time',
              experienceLevel: 'Entry Level',
              salary: { min: 0, max: 0 },
              openings: 1,
              deadline: '',
              published: null,
              status: 'Draft',
              requiredSkills: [],
              preferredSkills: [],
              responsibilities: [],
              requirements: []
            }
          })}>
            Post New Job
          </Button>
        )}
        {path === 'company' && (
          <Button variant="secondary" onClick={viewCompanyProfile}>
            View Full Profile
          </Button>
        )}
      </PageTitle>

      {module.tabs && (
        <Tabs
          tabs={module.tabs.map(t => ({ id: t, label: t }))}
          active={tab}
          onChange={(newTab) => navigate(`${path}?tab=${encodeURIComponent(newTab)}`)}
        />
      )}

      <div className="lgu-content">
        {content}
      </div>

      {/* Modal for details view */}
      {modal && !modal.kind && (
        <Modal title={modal.title} onClose={close} size={modal.size || 'md'}>
          <Facts items={modal.items} />
          {modal.extra}
          <div className="lgu-row-actions">
            <Button variant="secondary" onClick={close}>Close</Button>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Application Actions */}
      {modal && modal.kind === 'confirm-application' && (
        <ConfirmationDialog
          title={modal.title}
          description={modal.error || `Are you sure you want to ${modal.action === 'Reject' ? 'reject' : modal.action === 'Hire' ? 'hire' : 'shortlist'} ${modal.record.applicantName}'s application for ${modal.record.position}?`}
          confirmLabel={modal.action}
          variant={modal.action === 'Reject' ? 'danger' : 'primary'}
          onConfirm={commitApplicationReview}
          onClose={close}
        />
      )}

      {/* Confirmation Dialog for Interview Actions */}
      {modal && modal.kind === 'confirm-interview' && (
        <ConfirmationDialog
          title={modal.title}
          description={modal.error || (modal.action === 'Cancel' ? 'Cancel this interview? The resident will see the cancellation.' : modal.action === 'Send Reminder' 
            ? `Send interview reminder to ${modal.record.applicantName} for ${modal.record.position} on ${formatDate(modal.record.date)}?`
            : `Mark interview with ${modal.record.applicantName} as complete?`)
          }
          confirmLabel={modal.action}
          variant="primary"
          onConfirm={commitInterviewAction}
          onClose={close}
        />
      )}

      {/* Confirmation Dialog for Invite to Apply */}
      {modal && modal.kind === 'confirm-invite' && (
        <ConfirmationDialog
          title={modal.title}
          description={modal.error || `Send job application invitation to ${modal.record.name}? They will receive a notification about your interest.`}
          confirmLabel="Send Invitation"
          variant="primary"
          onConfirm={commitInviteAction}
          onClose={close}
        />
      )}

      {(modal?.kind === 'create-vacancy' || modal?.kind === 'edit-vacancy') && <RecordEditor key={modal.record.id} title={modal.title} record={modal.record} fields={jobFields} onClose={close} saveLabel={modal.kind === 'create-vacancy' ? 'Save Draft' : 'Save Changes'} validate={draft => draft.salary.max < draft.salary.min ? { 'salary.max': 'Maximum salary must be at least the minimum.' } : draft.deadline < today() ? { deadline: 'Choose today or a later date.' } : {}} onSave={draft => { saveOwnedRecord('job', draft); close(); showMessage('Vacancy saved.'); navigate('vacancies') }} />}
      {modal?.kind === 'schedule' && <RecordEditor key={modal.interviewId || modal.applicationId} title={modal.title} record={modal.record} fields={interviewFields} onClose={close} onSave={draft => { saveInterview(modal.applicationId, draft, modal.interviewId); close(); showMessage('Interview schedule saved.') }} />}

      {modal?.kind === 'edit-employer-profile' && <RecordEditor title="Edit Company Profile" record={modal.record} fields={organizationFields} onClose={close} onSave={draft => { saveOrganization(currentEmployer.id, draft); close(); showMessage('Company profile updated.') }} />}

      {modal?.kind === 'lifecycle' && <ConfirmationDialog title={modal.title} description={modal.error || (modal.action === 'Publish' ? 'Confirm publication. The listing fee is recorded as a mock payment only; payment does not affect recommendations.' : 'Confirm this lifecycle change. Historical records remain visible.')} confirmLabel={modal.action} variant={modal.action === 'Delete Draft' ? 'danger' : 'primary'} onClose={close} onConfirm={() => attempt(() => { recordLifecycle('job', modal.record.id, modal.action); showMessage('Record updated.') })} />}

    </div>
  )
}
