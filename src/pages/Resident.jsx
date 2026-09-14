import { useState } from 'react'
import { 
  Briefcase, GraduationCap, Target, CheckCircle2, 
  AlertCircle, FileText, Sparkles, MapPin, Lightbulb, 
  Building2, Clock
} from 'lucide-react'
import { 
  PageTitle, StatCard, Panel, Alert, Button, Badge, ProgressBar, Field, Modal, ConfirmationDialog, Tabs
} from '../components/ui'
import { useResidentModel, setResidentState } from '../data/demoModels'
import { applyForJob, updateApplication, registerTraining as createRegistration, updateRegistration, reassessCareer, today } from '../data/demoStore'
import { CareerProfile } from './resident/CareerProfile'
import { RecordEditor } from '../components/RecordEditor'
import { Metrics, Facts, Status } from './lgu/Workspace'
import { money } from '../data/lguFormat'
import './lgu/lgu.css'

const modules = {
  dashboard: { title: 'Dashboard', description: 'Track your career profile, job opportunities, training progress, and entrepreneurship pathway.' },
  profile: { title: 'Fisheries Profile', description: 'Your fisheries qualifications, experience, and livelihood information.', tabs: ['Profile Summary', 'Skills & Qualifications'] },
  employment: { title: 'Fisheries Employment', description: 'Fisheries job recommendations, applications, and interviews.', tabs: ['Recommended Jobs', 'My Applications'] },
  training: { title: 'Fisheries Skills Development', description: 'Fisheries skill gaps, training recommendations, and progress.', tabs: ['Skill Gaps', 'Recommended Training', 'My Training'] },
  entrepreneurship: { title: 'Fisheries Entrepreneurship', description: 'Fisheries livelihood recommendations and business registration.', tabs: ['Business Recommendations', 'Business Preparation', 'Business Registration'] },
  progress: { title: 'Progress', description: 'Track your career journey and achievements.', tabs: ['Career Progress', 'Timeline'] },
  settings: { title: 'Settings', description: 'Manage your account preferences.' }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function ResidentDashboard({ page, navigate, showMessage }) {
  const { state, demoResident, recommendedJobs, recommendedTraining, skillGaps, progressTimeline, entrepreneurshipRecommendations, reassessment } = useResidentModel()
  const setState = setResidentState
  const [modal, setModal] = useState(null)
  const [path, query] = page.split('?')
  const module = modules[path] || modules.dashboard
  const requestedTab = new URLSearchParams(query).get('tab')
  const tab = module.tabs?.includes(requestedTab) ? requestedTab : module.tabs?.[0]
  
const close = () => setModal(null)
  const attempt = action => { try { action(); close() } catch (error) { setModal(m => ({ ...m, error: error.message })) } }
  const details = (title, items, extra, size = 'md') => setModal({ title, items, extra, size })

  // View Job Match Explanation
  const viewMatchExplanation = (job) => {
    details(
      `${job.title} - ${job.matchScore}% Match`,
      [
        ['Match Score', `${job.matchScore}%`],
        ['Calculation', job.explanation],
        ['Company', job.company],
        ['Location', job.location],
        ['Employment Type', job.employmentType],
        ['Salary Range', job.salary]
      ],
      <>
        <Alert type="info">
          <div>
            <strong>Why This Job Matches Your Profile</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              {job.matchedRequirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        </Alert>
        {job.missingRequirements && job.missingRequirements.length > 0 && (
          <Alert type="warning">
            <div>
              <strong>Areas for Development</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
                {job.missingRequirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}
        <Alert>
          <div>
            <strong>Suggested Next Step</strong>
            <p style={{ margin: 0 }}>{job.suggestedAction}</p>
          </div>
        </Alert>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => { close(); viewJobDetails(job) }}>
            View Full Job Details
          </Button>
          <Button onClick={() => { close(); applyToJob(job) }}>
            Apply Now
          </Button>
        </div>
      </>,
      'md'
    )
  }

  // View Job Details
  const viewJobDetails = (job) => {
    details(
      job.title,
      [
        ['Company', job.company],
        ['Location', job.location],
        ['Employment Type', job.employmentType],
        ['Salary Range', job.salary],
        ['Openings', job.openings],
        ['Posted Date', formatDate(job.postedDate)],
        ['Application Deadline', formatDate(job.deadline)],
        ['Match Score', `${job.matchScore}%`],
        ['Description', job.description],
        ['Required Education', job.requiredEducation],
        ['Required Skills', job.requiredSkills.join(', ')],
        ['Preferred Skills', job.preferredSkills?.join(', ') || 'None specified'],
        ['Certifications', job.certifications?.join(', ') || 'None required']
      ],
      <>
        <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '10px' }}>Responsibilities</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
          {job.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
        </ul>
        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <Button variant="secondary" onClick={() => { close(); viewMatchExplanation(job) }}>
            Why This Matches
          </Button>
          <Button onClick={() => { close(); applyToJob(job) }}>
            Apply Now
          </Button>
        </div>
      </>,
      'md'
    )
  }

  // Apply to Job
  const applyToJob = (job) => {
    // Check if already applied
    if (state.applications.some(app => app.jobId === job.id)) {
      showMessage('You have already applied to this position')
      return
    }
    
    setModal({
      kind: 'confirm-apply',
      title: 'Apply for Position?',
      job: job,
      size: 'sm'
    })
  }

  const confirmApply = draft => { applyForJob(modal.job.id, draft.note || ''); close(); showMessage('Application submitted.') }

  // View Application
  const viewApplication = (app) => {
    
    details(
      `Application - ${app.jobTitle}`,
      [
        ['Job Title', app.jobTitle],
        ['Company', app.company],
        ['Match Score', `${app.matchScore}%`],
        ['Applied Date', formatDate(app.appliedDate)],
        ['Current Status', app.status],
        ['Last Update', formatDate(app.lastUpdate)],
        ['Cover Letter', app.coverLetter],
        ['Notes', app.notes || 'No updates yet'], ['Interview', app.interview ? `${app.interview.date} ${app.interview.time} · ${app.interview.type} · ${app.interview.location} · ${app.interview.status}` : 'Not scheduled']
      ],
      <>
        <Alert type="info">
          Application status is updated by the employer. Check back regularly for updates.
        </Alert>
        {['Submitted', 'Shortlisted', 'Interview Scheduled', 'Interviewed'].includes(app.status) && (
          <div className="modal-actions">
            <Button variant="danger-outline" onClick={() => requestWithdraw(app)}>
              Withdraw Application
            </Button>
          </div>
        )}
      </>,
      'md'
    )
  }

  const requestWithdraw = (app) => {
    setModal({
      kind: 'confirm-withdraw',
      title: 'Withdraw Application?',
      app: app,
      size: 'sm'
    })
  }

  const confirmWithdraw = () => attempt(() => { updateApplication(modal.app.id, 'Withdrawn'); showMessage('Application withdrawn.') })

  // View Skill Gap
  const viewSkillGap = (gap) => {
    const relatedTraining = recommendedTraining.filter(t => t.coveredGaps?.includes(gap.skill))
    details(
      gap.skill,
      [
        ['Skill', gap.skill],
        ['Priority', gap.priority],
        ['Current Level', gap.currentLevel],
        ['Target Level', gap.targetLevel],
        ['Employer Demand', `${gap.employerDemand} related vacancies`],
        ['Residents Missing Skill', gap.residentsMissing],
        ['Available Training Slots', gap.trainingSlots],
        ['Related Jobs Count', gap.jobDemand],
        ['Related Jobs', gap.relatedJobs.join(', ')],
        ['Description', gap.description]
      ],
      <>
        <Alert>
          <strong>Why This Matters:</strong> {gap.description}
        </Alert>
        {relatedTraining.length > 0 && (
          <>
            <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '10px' }}>Related Training Available</h3>
            <div className="lgu-queue">
              {relatedTraining.map(training => (
                <div key={training.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <strong style={{ fontSize: '13px' }}>{training.title}</strong>
                    <small style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                      {training.provider} • {training.availableSlots} slots
                    </small>
                  </div>
                  <Button variant="secondary" onClick={() => { close(); viewTrainingDetails(training) }}>
                    View Training
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </>,
      'md'
    )
  }

  // View Training Explanation
  const viewTrainingExplanation = (training) => {
    details(
      `Why ${training.title} is Recommended`,
      [
        ['Training Program', training.title],
        ['Provider', training.provider],
        ['Relevance', `${training.relevance} (${training.relevanceScore}%)`],
        ['Next Step', training.suggestedNextStep],
        ['Skill Gap Addressed', training.skillGapAddressed]
      ],
      <>
        <Alert type="info">
          <div>
            <strong>Why This Training is Recommended</strong>
            <p style={{ margin: '4px 0 0 0' }}>{training.whyRecommended}</p>
          </div>
        </Alert>
        <div style={{ marginTop: '16px' }}>
          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Skills You'll Develop</strong>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
            {training.skillsDeveloped.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </div>
        <div style={{ marginTop: '16px' }}>
          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Potential Career Relevance</strong>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
            {training.relatedJobs.map((job, i) => <li key={i}>{job}</li>)}
          </ul>
        </div>
        <Alert type="warning">
          <strong>Important:</strong> Training completion does not guarantee employment. It addresses skill gaps and strengthens your qualifications.
        </Alert>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => { close(); viewTrainingDetails(training) }}>
            View Full Details
          </Button>
          <Button onClick={() => { close(); registerTraining(training) }}>
            Register
          </Button>
        </div>
      </>,
      'md'
    )
  }

  // View Training Details
  const viewTrainingDetails = (training) => {
    details(
      training.title,
      [
        ['Training Program', training.title],
        ['Provider', training.provider],
        ['Duration', training.duration],
        ['Schedule', training.schedule],
        ['Time Slot', training.timeSlot],
        ['Location', training.location],
        ['Available Slots', `${training.availableSlots} of ${training.totalSlots}`],
        ['Current Registrations', training.registrations],
        ['Training Fee', money(training.fee)],
        ['Registration Deadline', formatDate(training.deadline)],
        ['Description', training.description],
        ['Skills Developed', training.skillsDeveloped.join(', ')],
        ['Eligibility', training.eligibility],
        ['Requirements', training.requirements.join(', ')],
        ['Skill Gap Addressed', training.skillGapAddressed]
      ],
      <>
        <Alert>
          <strong>Related Job Opportunities:</strong> {training.relatedJobs.join(', ')}
        </Alert>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => { close(); viewTrainingExplanation(training) }}>
            Why Recommended
          </Button>
          <Button onClick={() => { close(); registerTraining(training) }}>
            Register Now
          </Button>
        </div>
      </>,
      'md'
    )
  }

  // Register for Training
  const registerTraining = (training) => {
    // Check if already registered
    if (state.myTraining.some(t => t.trainingId === training.id)) {
      showMessage('You are already registered for this training')
      return
    }
    
    setModal({
      kind: 'confirm-training',
      title: 'Register for Training?',
      training: training,
      size: 'sm'
    })
  }

  const confirmTrainingRegistration = () => attempt(() => { createRegistration(modal.training.id); showMessage('Training registration confirmed.') })

  // Cancel Training Registration
  const cancelTraining = (training) => {
    // Only allow cancel if not yet started or completed
    const allowedStatuses = ['Registered', 'Waitlisted']
    
    if (!allowedStatuses.includes(training.status)) {
      showMessage('Cannot cancel training that has already started or completed')
      return
    }
    
    setModal({
      kind: 'confirm-cancel-training',
      title: 'Cancel Training Registration?',
      training: training
    })
  }

  // View My Training
  const viewMyTraining = (training) => {
    details(
      training.title,
      [
        ['Program', training.title],
        ['Provider', training.provider],
        ['Status', training.status],
        ['Progress', `${training.progress}%`],
        ['Attendance', `${training.attendance}%`],
        ['Enrollment Date', formatDate(training.enrollmentDate)],
        ['Expected Completion', formatDate(training.expectedCompletion)],
        ['Schedule', training.schedule],
        ['Skills Being Developed', training.skillsDeveloped.join(', ')],
        ['Assessment Score', training.assessmentScore || 'Not yet assessed']
      ],
      <>
        <ProgressBar value={training.progress} label="Training Progress" />
        <Alert type="info">
          Training progress is updated by the training provider. Continue attending sessions to complete the program.
        </Alert>
      </>,
      'md'
    )
  }

  // View Business Recommendation
  const viewBusinessRecommendation = (business) => {
    details(
      business.title,
      [
        ['Business Type', business.title],
        ['Category', business.category],
        ['Compatibility', `${business.compatibility} (${business.compatibilityScore}%)`],
        ['Target Market', business.targetMarket],
        ['Description', business.description],
        ['Estimated Startup Capital', `₱${business.estimatedStartup.min.toLocaleString()} - ₱${business.estimatedStartup.max.toLocaleString()}`],
        ['Note', business.estimatedStartup.note]
      ],
      <>
        <Alert type="info">
          <div>
            <strong>Why This May Fit Your Profile</strong>
            <p style={{ margin: '4px 0 0 0' }}>{business.whyRecommended}</p>
          </div>
        </Alert>
        <div style={{ marginTop: '16px' }}>
          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Existing Strengths</strong>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
            {business.existingStrengths.map((strength, i) => <li key={i}>{strength}</li>)}
          </ul>
        </div>
        <div style={{ marginTop: '16px' }}>
          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Development Areas</strong>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
            {business.developmentAreas.map((area, i) => <li key={i}>{area}</li>)}
          </ul>
        </div>
        <Alert>
          <div>
            <strong>Suggested Next Steps</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              {business.suggestedNextSteps.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
          </div>
        </Alert>
      </>,
      'md'
    )
  }

  // View Business Application
  const viewBusinessApplication = () => {
    const app = state.businessApplication
    details(
      `Business Registration - ${app.businessName}`,
      [
        ['Reference Number', app.id],
        ['Business Name', app.businessName],
        ['Business Type', app.businessType],
        ['Business Activity', app.activity],
        ['Location', app.location],
        ['Submitted Date', formatDate(app.submitted)],
        ['Current Status', app.status],
        ['Documents Submitted', app.documents.join(', ')],
        ['LGU Notes', app.notes || 'No notes yet']
      ],
      <>
        <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '10px' }}>Application Timeline</h3>
        <div className="lgu-queue">
          {app.timeline.map((stage, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: i < app.timeline.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>{stage.stage}</strong>
                <small style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                  {stage.date ? formatDate(stage.date) : 'Pending'}
                </small>
              </div>
              <Status value={stage.status} />
            </div>
          ))}
        </div>
        <Alert type="info">
          Your application is under LGU review. You'll be notified of any updates or additional requirements.
        </Alert>
      </>,
      'md'
    )
  }

  let content

  // DASHBOARD
  if (path === 'dashboard' || !path) {
    const topJob = recommendedJobs[0]
    const topSkillGap = skillGaps[0]
    const topTraining = recommendedTraining[0]
    const businessRec = entrepreneurshipRecommendations[0]

    content = (
      <>
        <div className="resident-welcome" style={{ marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '6px' }}>
              Welcome back, {demoResident.name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Track your career profile, job opportunities, training progress, and entrepreneurship pathway.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={<Target size={18} />}
            label="Career Profile"
            value={`${demoResident.profileCompletion}%`}
            detail="Profile completion"
          />
          <StatCard
            icon={<Briefcase size={18} />}
            label="Job Matches"
            value={recommendedJobs.length}
            detail="Opportunities found"
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Active Applications"
            value={state.applications.filter(a => a.status === 'Submitted').length}
            detail={`${state.applications.length} total applications`}
          />
          <StatCard
            icon={<GraduationCap size={18} />}
            label="Training"
            value={state.myTraining.length}
            detail={`${state.myTraining.filter(t => t.status === 'In Training').length} in progress`}
          />
        </div>

        <div className="lgu-grid">
          {topJob ? <Panel title="Top Job Match" description="Highest match for your profile">
            <div style={{ padding: '0 22px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{topJob.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{topJob.company}</p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                    <span><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />{topJob.location}</span>
                    <span>{topJob.employmentType}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#ecfdf5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#0a7e72' }}>{topJob.matchScore}%</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Match</div>
                </div>
              </div>
              <Facts items={[
                ['Salary', topJob.salary],
                ['Deadline', formatDate(topJob.deadline)]
              ]} />
              <div className="lgu-row-actions" style={{ marginTop: '16px' }}>
                <Button variant="secondary" onClick={() => viewMatchExplanation(topJob)}>
                  Why This Matches
                </Button>
                <Button onClick={() => viewJobDetails(topJob)}>
                  View Job
                </Button>
              </div>
            </div>
          </Panel> : <Panel title="Top Job Match"><p className="profile-section-body">No open vacancies available.</p></Panel>}

          {topSkillGap ? <Panel title="Priority Skill Gap" description="Focus area for development">
            <div style={{ padding: '0 22px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{topSkillGap.skill}</h3>
                <Status value={topSkillGap.priority} />
              </div>
              <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
                {topSkillGap.description}
              </p>
              <Facts items={[
                ['Related Jobs', topSkillGap.jobDemand],
                ['Employer Demand', `${topSkillGap.employerDemand} vacancies`],
                ['Training Available', `${topSkillGap.trainingSlots} slots`]
              ]} />
              <div className="lgu-row-actions" style={{ marginTop: '16px' }}>
                <Button onClick={() => viewSkillGap(topSkillGap)}>
                  View Details
                </Button>
                <Button variant="secondary" onClick={() => navigate('training?tab=Recommended%20Training')}>
                  Find Training
                </Button>
              </div>
            </div>
          </Panel> : <Panel title="Priority Skill Gap"><p className="profile-section-body">No skill gaps found for the current relevant vacancies.</p></Panel>}
        </div>

        {topTraining ? <Panel title="Recommended Training" description="Address your skill gaps">
          <div style={{ padding: '0 22px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{topTraining.title}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{topTraining.provider}</p>
              </div>
              <Badge status="active">{topTraining.relevance}</Badge>
            </div>
            <Alert>
          <strong>Why Recommended:</strong> {topTraining.whyRecommended}
            </Alert>
            <Facts items={[
              ['Duration', topTraining.duration],
              ['Available Slots', `${topTraining.availableSlots} of ${topTraining.totalSlots}`],
              ['Training Fee', money(topTraining.fee)],
              ['Skill Gap Addressed', topTraining.skillGapAddressed]
            ]} />
            <div className="lgu-row-actions" style={{ marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => viewTrainingExplanation(topTraining)}>
                Why Recommended
              </Button>
              <Button onClick={() => viewTrainingDetails(topTraining)}>
                View Training
              </Button>
            </div>
          </div>
        </Panel> : <Panel title="Recommended Training"><p className="profile-section-body">No training batches available.</p></Panel>}

        <Panel title="Entrepreneurship Opportunity" description="Business recommendation based on your profile">
          <div style={{ padding: '0 22px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{businessRec.title}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{businessRec.category}</p>
              </div>
              <Badge status="active">{businessRec.compatibility} Compatibility</Badge>
            </div>
            <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
              {businessRec.whyRecommended}
            </p>
            <Facts items={[
              ['Target Market', businessRec.targetMarket],
              ['Estimated Capital', `₱${businessRec.estimatedStartup.min.toLocaleString()} - ₱${businessRec.estimatedStartup.max.toLocaleString()}`],
              ['Preparation Progress', `${businessRec.preparationProgress}%`]
            ]} />
            <div className="lgu-row-actions" style={{ marginTop: '16px' }}>
              <Button onClick={() => viewBusinessRecommendation(businessRec)}>
                View Details
              </Button>
              <Button variant="secondary" onClick={() => navigate('entrepreneurship')}>
                Explore Pathway
              </Button>
            </div>
          </div>
        </Panel>
      </>
    )
  }

  // CAREER PROFILE
  if (path === 'profile') content = <CareerProfile showMessage={showMessage} tab={tab} />

  if (path === 'employment') {
    if (!tab || tab === 'Recommended Jobs') {
      content = (
        <>
          <Alert type="info">
          Jobs are matched based on your skills, education, experience, and career interests. Match scores indicate alignment with requirements.
          </Alert>

          <Metrics items={[
            ['Total Matches', recommendedJobs.length],
            ['High Match (80%+)', recommendedJobs.filter(j => j.matchScore >= 80).length],
            ['Applications', state.applications.length],
            ['Active Applications', state.applications.filter(a => a.status === 'Submitted').length]
          ]} />

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', 
            gap: '16px' 
          }}>
            {recommendedJobs.map(job => (
              <div key={job.id} style={{ 
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                {/* Header with match score */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  background: '#fafbfc'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                      {job.title}
                    </h3>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      {job.company}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: '#6b7280' }}>
                      <span><MapPin size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />{job.location}</span>
                      <span><Briefcase size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />{job.employmentType}</span>
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '8px 12px', 
                    background: job.matchScore >= 80 ? '#ecfdf5' : '#fef3c7', 
                    borderRadius: '6px',
                    minWidth: '60px'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: job.matchScore >= 80 ? '#0a7e72' : '#92400e' }}>
                      {job.matchScore}%
                    </div>
                    <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Match
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.6', marginBottom: '12px' }}>
                      {job.description}
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'auto 1fr', 
                      gap: '6px 12px',
                      fontSize: '12px',
                      marginBottom: '12px'
                    }}>
                      <span style={{ color: '#6b7280' }}>Salary:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{job.salary}</span>
                      
                      <span style={{ color: '#6b7280' }}>Openings:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{job.openings}</span>
                      
                      <span style={{ color: '#6b7280' }}>Deadline:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{formatDate(job.deadline)}</span>
                    </div>

                    <div style={{ 
                      fontSize: '11px',
                      padding: '8px 10px',
                      background: '#f9fafb',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <span style={{ color: '#6b7280', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Required Skills:</span>
                      <span style={{ color: '#374151', lineHeight: '1.5' }}>
                        {job.requiredSkills.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '6px', 
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => viewMatchExplanation(job)}
                      style={{ flex: 1, fontSize: '11px', padding: '6px 8px' }}
                    >
                      <Sparkles size={12} />
                      Why Match
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => viewJobDetails(job)}
                      style={{ flex: 1, fontSize: '11px', padding: '6px 8px' }}
                    >
                      Details
                    </Button>
                    <Button 
                      disabled={state.applications.some(a => a.jobId === job.id)} 
                      size="sm"
                      onClick={() => applyToJob(job)}
                      style={{ flex: 1, fontSize: '11px', padding: '6px 8px' }}
                    >
                      {state.applications.some(a => a.jobId === job.id) ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )
    } else if (tab === 'My Applications') {
      content = (
        <>
          {state.applications.length === 0 ? (
            <Alert type="info">
          You haven't applied to any jobs yet. Browse recommended jobs and apply to positions that match your profile.
            </Alert>
          ) : (
            <>
              <Metrics items={[
                ['Total Applications', state.applications.length],
                ['Active', state.applications.filter(a => !['Hired', 'Rejected', 'Withdrawn'].includes(a.status)).length],
                ['Under Review', state.applications.filter(a => a.status === 'Under Review').length],
                ['Withdrawn', state.applications.filter(a => a.status === 'Withdrawn').length]
              ]} />

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
                gap: '16px' 
              }}>
                {state.applications.map(app => (
                  <div key={app.id} style={{ 
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    {/* Header */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', flex: 1, marginRight: '12px' }}>
                          {app.jobTitle}
                        </h3>
                        <Status value={app.status} />
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                        {app.company}
                      </p>
                      <p style={{ fontSize: '11px', color: '#6b7280' }}>
                        Applied {formatDate(app.appliedDate)}
                      </p>
                    </div>

                    {/* Content */}
                    <div style={{ 
                      flex: 1,
                      display: 'grid', 
                      gridTemplateColumns: 'auto 1fr', 
                      gap: '6px 12px',
                      fontSize: '12px',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      marginBottom: '12px'
                    }}>
                      <span style={{ color: '#6b7280' }}>Match:</span>
                      <span style={{ color: '#111827', fontWeight: '600' }}>{app.matchScore}%</span>
                      
                      <span style={{ color: '#6b7280' }}>Status:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{app.status}</span>
                      
                      <span style={{ color: '#6b7280' }}>Updated:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{formatDate(app.lastUpdate)}</span>
                    </div>

                    {/* Action */}
                    <Button 
                      onClick={() => viewApplication(app)}
                      size="sm"
                      style={{ width: '100%', fontSize: '12px' }}
                    >
                      View Application
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )
    }
  }

  // SKILLS DEVELOPMENT (TRAINING)
  if (path === 'training') {
    if (!tab || tab === 'Skill Gaps') {
      content = (
        <>
          <Alert type="warning">
          These skill gaps were identified based on your career interests and recommended job opportunities. Addressing them may strengthen your profile.
          </Alert>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
            gap: '16px' 
          }}>
            {skillGaps.map(gap => (
              <div key={gap.id} style={{ 
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                {/* Header */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', flex: 1 }}>
                      {gap.skill}
                    </h3>
                    <Status value={gap.priority} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.6' }}>
                    {gap.description}
                  </p>
                </div>

                {/* Stats */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'auto 1fr', 
                  gap: '6px 12px',
                  fontSize: '11px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '12px'
                }}>
                  <span style={{ color: '#6b7280' }}>Demand:</span>
                  <span style={{ color: '#111827', fontWeight: '600' }}>{gap.employerDemand} vacancies</span>
                  
                  <span style={{ color: '#6b7280' }}>Missing:</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>{gap.residentsMissing} residents</span>
                  
                  <span style={{ color: '#6b7280' }}>Training:</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>{gap.trainingSlots} slots</span>
                </div>

                {/* Related Jobs */}
                <div style={{ 
                  fontSize: '11px',
                  padding: '8px 10px',
                  background: '#f0f9ff',
                  borderRadius: '4px',
                  border: '1px solid #bae6fd',
                  marginBottom: '12px'
                }}>
                  <span style={{ color: '#0369a1', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Related Jobs:</span>
                  <span style={{ color: '#0c4a6e', lineHeight: '1.5' }}>
                    {gap.relatedJobs.join(', ')}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => viewSkillGap(gap)}
                    style={{ flex: 1, fontSize: '11px' }}
                  >
                    Details
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate('training?tab=Recommended%20Training')}
                    style={{ flex: 1, fontSize: '11px' }}
                  >
                    Find Training
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )
    } else if (tab === 'Recommended Training') {
      content = (
        <>
          <Alert type="info">
          Training programs are recommended based on your identified skill gaps and career interests. Completing training strengthens your qualifications.
          </Alert>

          <Alert type="warning">
          <strong>Important:</strong> Training completion does not guarantee employment. It addresses skill gaps and improves your profile.
          </Alert>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
            gap: '16px' 
          }}>
            {recommendedTraining.map(training => (
              <div key={training.id} style={{ 
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                {/* Header */}
                <div style={{ 
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  background: '#fafbfc'
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                    {training.title}
                  </h3>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    {training.provider}
                  </p>
                  <Badge status="active">{training.relevance}</Badge>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Why Recommended */}
                  <div style={{ 
                    fontSize: '11px',
                    padding: '10px',
                    background: '#ecfdf5',
                    borderRadius: '6px',
                    border: '1px solid #a7f3d0',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'start' }}>
                      <Sparkles size={12} style={{ marginTop: '2px', color: '#059669', flexShrink: 0 }} />
                      <div>
                        <span style={{ color: '#065f46', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Why Recommended:</span>
                        <span style={{ color: '#047857', lineHeight: '1.5' }}>{training.whyRecommended}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'auto 1fr', 
                    gap: '6px 10px',
                    fontSize: '11px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Duration:</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{training.duration}</span>
                    
                    <span style={{ color: '#6b7280' }}>Schedule:</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{training.schedule}</span>
                    
                    <span style={{ color: '#6b7280' }}>Slots:</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{training.availableSlots} of {training.totalSlots}</span>
                    
                    <span style={{ color: '#6b7280' }}>Fee:</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{money(training.fee)}</span>
                    
                    <span style={{ color: '#6b7280' }}>Addresses:</span>
                    <span style={{ color: '#111827', fontWeight: '600' }}>{training.skillGapAddressed}</span>
                  </div>

                  {/* Skills Developed */}
                  <div style={{ 
                    fontSize: '10px',
                    padding: '8px',
                    background: '#f9fafb',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#6b7280', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Skills You'll Develop:</span>
                    <span style={{ color: '#374151', lineHeight: '1.4' }}>
                      {training.skillsDeveloped.join(', ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '6px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => viewTrainingExplanation(training)}
                      style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                    >
                      <Sparkles size={11} />
                      Why
                    </Button>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => viewTrainingDetails(training)}
                      style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                    >
                      Details
                    </Button>
                    <Button 
                      disabled={training.availableSlots <= 0 || state.myTraining.some(r => r.programId === training.id)}
                      size="sm"
                      onClick={() => registerTraining(training)}
                      style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                    >
                      {state.myTraining.some(r => r.programId === training.id) ? 'Registered' : training.availableSlots <= 0 ? 'Full' : 'Register'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )
    } else if (tab === 'My Training') {
      content = (
        <>
          {state.myTraining.length === 0 ? (
            <Alert type="info">
          You haven't registered for any training programs yet. Browse recommended training to address your skill gaps.
            </Alert>
          ) : (
            <>
              <Metrics items={[
                ['Total Registrations', state.myTraining.length],
                ['In Training', state.myTraining.filter(t => t.status === 'In Training').length],
                ['Registered', state.myTraining.filter(t => t.status === 'Registered').length],
                ['Completed', state.myTraining.filter(t => t.status === 'Completed').length]
              ]} />

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
                gap: '16px' 
              }}>
                {state.myTraining.map(training => (
                  <div key={training.id} style={{ 
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    {/* Header */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', flex: 1, marginRight: '12px' }}>
                          {training.title}
                        </h3>
                        <Status value={training.status} />
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                        {training.provider}
                      </p>
                      <p style={{ fontSize: '11px', color: '#6b7280' }}>
                        Enrolled {formatDate(training.enrollmentDate)}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    {training.status === 'In Training' && (
                      <div style={{ marginBottom: '12px' }}>
                        <ProgressBar value={training.progress} label="Training Progress" />
                      </div>
                    )}

                    {/* Details */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'auto 1fr', 
                      gap: '6px 12px',
                      fontSize: '12px',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      marginBottom: '12px'
                    }}>
                      <span style={{ color: '#6b7280' }}>Schedule:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{training.schedule}</span>
                      
                      <span style={{ color: '#6b7280' }}>Progress:</span>
                      <span style={{ color: '#111827', fontWeight: '600' }}>{training.progress}%</span>
                      
                      <span style={{ color: '#6b7280' }}>Attendance:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{training.attendance}%</span>
                    </div>

                    {/* Skills */}
                    <div style={{ 
                      fontSize: '11px',
                      padding: '8px 10px',
                      background: '#f0fdf4',
                      borderRadius: '4px',
                      border: '1px solid #bbf7d0',
                      marginBottom: '12px'
                    }}>
                      <span style={{ color: '#15803d', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Skills Developing:</span>
                      <span style={{ color: '#166534', lineHeight: '1.5' }}>
                        {training.skillsDeveloped.join(', ')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button 
                        onClick={() => viewMyTraining(training)}
                        size="sm"
                        style={{ flex: 1, fontSize: '11px' }}
                      >
                        View Progress
                      </Button>
                      {(training.status === 'Registered' || training.status === 'Waitlisted') && (
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => cancelTraining(training)}
                          style={{ flex: 1, fontSize: '11px' }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )
    }
  }

  // ENTREPRENEURSHIP
  if (path === 'entrepreneurship') {
    if (!tab || tab === 'Business Recommendations') {
      content = (
        <>
          <Alert type="info">
          Business recommendations are based on your skills, experience, available resources, and estimated capital.
          </Alert>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', 
            gap: '16px' 
          }}>
            {entrepreneurshipRecommendations.map(business => (
              <div key={business.id} style={{ 
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                {/* Header */}
                <div style={{ 
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  background: '#fafbfc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', flex: 1 }}>
                      {business.title}
                    </h3>
                    <Badge status="active">{business.compatibility} Compatibility</Badge>
                  </div>
                  <p style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                    {business.category}
                  </p>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Why Recommended */}
                  <div style={{ 
                    fontSize: '11px',
                    padding: '10px',
                    background: '#fef3c7',
                    borderRadius: '6px',
                    border: '1px solid #fde047',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'start' }}>
                      <Lightbulb size={12} style={{ marginTop: '2px', color: '#d97706', flexShrink: 0 }} />
                      <div>
                        <span style={{ color: '#78350f', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Why This May Fit:</span>
                        <span style={{ color: '#92400e', lineHeight: '1.5' }}>{business.whyRecommended}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'auto 1fr', 
                    gap: '6px 12px',
                    fontSize: '12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Target Market:</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{business.targetMarket}</span>
                    
                    <span style={{ color: '#6b7280' }}>Estimated Capital:</span>
                    <span style={{ color: '#111827', fontWeight: '600' }}>
                      ₱{business.estimatedStartup.min.toLocaleString()} - ₱{business.estimatedStartup.max.toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '6px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f3f4f6',
                    marginTop: 'auto'
                  }}>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => viewBusinessRecommendation(business)}
                      style={{ flex: 1, fontSize: '11px' }}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => navigate('entrepreneurship?tab=Business%20Preparation')}
                      style={{ flex: 1, fontSize: '11px' }}
                    >
                      Start Preparation
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )
    } else if (tab === 'Business Preparation') {
      const business = entrepreneurshipRecommendations[0]
      content = (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Alert type="info" style={{ flex: 1, marginBottom: 0, marginRight: '16px' }}>
              Before starting your business registration, complete these preparation steps to increase your chances of success.
            </Alert>
            <Button 
              onClick={() => navigate('entrepreneurship?tab=Business%20Registration')}
              style={{ whiteSpace: 'nowrap' }}
            >
              Start Business Registration
            </Button>
          </div>

          <Panel title="Business Preparation Checklist">
            <div style={{ padding: '0 22px 22px' }}>
              <ProgressBar value={business.preparationProgress} label="Preparation Progress" />
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#111827' }}>Review business recommendation</strong>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Understand the business model and requirements</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#111827' }}>Define service offering</strong>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Specify what services you'll provide</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <Clock size={20} style={{ color: '#6b7280', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#111827' }}>Complete business training</strong>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Learn basic business management skills</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <Clock size={20} style={{ color: '#6b7280', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#111827' }}>Prepare requirements</strong>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Gather necessary documents</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', padding: '12px 0' }}>
                  <Clock size={20} style={{ color: '#6b7280', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#111827' }}>Start business registration</strong>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Submit application to LGU</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <div className="lgu-grid">
            <Panel title="Proposed Business Details">
              <div className="profile-section-body">
                <Facts items={[
                  ['Business Name', business.businessName],
                  ['Business Type', business.title],
                  ['Category', business.category],
                  ['Target Market', business.targetMarket],
                  ['Estimated Capital', `₱${business.estimatedStartup.min.toLocaleString()} - ₱${business.estimatedStartup.max.toLocaleString()}`]
                ]} />
              </div>
            </Panel>

            <Panel title="Development Areas">
              <div style={{ padding: '0 22px 22px' }}>
                <Alert type="warning">
                  These skills will help you succeed in your business. Consider completing relevant training before registration.
                </Alert>
                <ul style={{ margin: '16px 0 0 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '2' }}>
                  {business.developmentAreas.map((area, i) => <li key={i}>{area}</li>)}
                </ul>
              </div>
            </Panel>
          </div>
        </>
      )
    } else if (tab === 'Business Registration') {
      const app = state.businessApplication
      const profileData = state.profile || demoResident
      
      content = (
        <>
          <Alert type="warning">
          <strong>Prototype Workflow:</strong> This is a demonstration of digital business registration. Actual requirements may vary based on LGU rules and business type.
          </Alert>

          {/* Case 1: No application yet */}
          {!app && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <Alert type="info" style={{ flex: 1, marginBottom: 0 }}>
                  Ready to start your business? Submit a business registration application to get started.
                </Alert>
                <Button 
                  onClick={() => setModal({
                    kind: 'create-business-draft',
                    title: 'Start Business Registration',
                    record: {
                      applicant: profileData.name,
                      businessName: '',
                      businessType: 'Computer Repair',
                      activity: '',
                      location: profileData.location,
                      address: '',
                      contactNumber: profileData.phone,
                      status: 'Draft'
                    }
                  })}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Start Business Registration
                </Button>
              </div>
            </>
          )}

          {/* Case 2: Draft exists (not yet submitted) */}
          {app && app.status === 'Draft' && (
            <>
              <Alert type="info">
                Your business registration is in draft. Complete the information and submit when ready.
              </Alert>
              <Panel title="Draft Application">
                <div style={{ padding: '0 22px 22px' }}>
                  <Facts items={[
                    ['Business Name', app.businessName],
                    ['Business Type', app.businessType],
                    ['Location', app.location],
                    ['Status', <Status value="Draft" />]
                  ]} />
                  <div className="lgu-row-actions" style={{ marginTop: '20px' }}>
                    <Button onClick={() => setModal({
                      kind: 'edit-business-draft',
                      title: 'Edit Business Registration',
                      record: app
                    })}>
                      Edit Draft
                    </Button>
                    <Button onClick={() => setModal({
                      kind: 'confirm-submit-business',
                      title: 'Submit Business Registration?',
                      record: app
                    })}>
                      Submit Application
                    </Button>
                  </div>
                </div>
              </Panel>
            </>
          )}

          {/* Case 3: Submitted - show status and actions */}
          {app && app.status !== 'Draft' && (
            <>
              <Alert type="info">
                Track your business registration application status and respond to LGU requests.
              </Alert>
              <Panel title="Business Registration Application">
                <div style={{ padding: '0 22px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '16px' }}>{app.businessName}</strong>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Reference: {app.id}</p>
                    </div>
                    <Status value={app.status} />
                  </div>
                  <Facts items={[
                    ['Business Type', app.businessType],
                    ['Activity', app.activity],
                    ['Location', app.location],
                    ['Submitted Date', formatDate(app.submitted)],
                    ['Current Status', app.status],
                    ['Documents Submitted', app.documents.join(', ')]
                  ]} />
                  
                  {/* Timeline */}
                  <h4 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '13px', fontWeight: '600' }}>Application Timeline</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {app.timeline.map((stage, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Status value={stage.status} />
                        <span style={{ flex: 1, fontSize: '13px' }}>{stage.stage}</span>
                        {stage.date && <span style={{ fontSize: '12px', color: '#666' }}>{formatDate(stage.date)}</span>}
                      </div>
                    ))}
                  </div>

                  {/* Action buttons based on status */}
                  <div className="lgu-row-actions" style={{ marginTop: '20px' }}>
                    <Button variant="secondary" onClick={() => viewBusinessApplication()}>
                      View Full Details
                    </Button>
                    
                    {app.status === 'Needs Requirements' && (
                      <Button onClick={() => setModal({
                        kind: 'submit-business-requirements',
                        title: 'Submit Additional Requirements',
                        record: app
                      })}>
                        Submit Requirements
                      </Button>
                    )}
                    
                    {(app.status === 'New Application' || app.status === 'Under Review') && (
                      <Button 
                        variant="danger" 
                        onClick={() => setModal({
                          kind: 'confirm-withdraw-business',
                          title: 'Withdraw Business Application?',
                          record: app
                        })}
                      >
                        Withdraw Application
                      </Button>
                    )}
                  </div>
                </div>
              </Panel>
            </>
          )}
        </>
      )
    }
  }

  // PROGRESS
  if (path === 'progress') {
    if (!tab || tab === 'Career Progress') {
      content = (
        <>
          <Metrics items={[
            ['Profile Completion', `${demoResident.profileCompletion}%`],
            ['Job Matches', recommendedJobs.length],
            ['Applications', state.applications.length],
            ['Training Enrolled', state.myTraining.length]
          ]} />

          <div className="lgu-grid">
            <Panel title="Employment Progress">
              <div style={{ padding: '0 22px 22px' }}>
                <div style={{ 
                  display: 'grid',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  {[
                    ['Recommended Jobs', recommendedJobs.length, '#ecfdf5', '#0a7e72'],
                    ['Applications Submitted', state.applications.length, '#f0f9ff', '#0369a1'],
                    ['Active Applications', state.applications.filter(a => a.status === 'Submitted').length, '#fef3c7', '#d97706'],
                    ['Interviews', 0, '#f3f4f6', '#6b7280'],
                    ['Hired', 0, '#f3f4f6', '#6b7280']
                  ].map(([label, value, bg, color]) => (
                    <div key={label} style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: bg,
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{label}</span>
                      <span style={{ fontSize: '20px', fontWeight: '700', color }}>{value}</span>
                    </div>
                  ))}
                </div>
                <Alert>
          Continue applying to matched positions and improving your skills to increase your chances.
                </Alert>
              </div>
            </Panel>

            <Panel title="Training Progress">
              <div style={{ padding: '0 22px 22px' }}>
                <div style={{ 
                  display: 'grid',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  {[
                    ['Skill Gaps Identified', skillGaps.length, '#fef2f2', '#dc2626'],
                    ['Training Recommended', recommendedTraining.length, '#ecfdf5', '#059669'],
                    ['Enrolled', state.myTraining.length, '#eff6ff', '#2563eb'],
                    ['In Training', state.myTraining.filter(t => t.status === 'In Training').length, '#fef3c7', '#d97706'],
                    ['Completed', state.myTraining.filter(t => t.status === 'Completed').length, '#f0fdf4', '#16a34a']
                  ].map(([label, value, bg, color]) => (
                    <div key={label} style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: bg,
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{label}</span>
                      <span style={{ fontSize: '20px', fontWeight: '700', color }}>{value}</span>
                    </div>
                  ))}
                </div>
                <Alert>
          Complete your enrolled training to address skill gaps and strengthen your profile.
                </Alert>
              </div>
            </Panel>
          </div>

          <Panel title="Entrepreneurship Progress">
            <div style={{ padding: '0 22px 22px' }}>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px'
              }}>
                {[
                  ['Business Recommendations', entrepreneurshipRecommendations.length, '#fef3c7', '#d97706'],
                  ['Selected Pathway', entrepreneurshipRecommendations[0].title, '#ecfdf5', '#059669'],
                  ['Preparation Progress', `${entrepreneurshipRecommendations[0].preparationProgress}%`, '#eff6ff', '#2563eb'],
                  ['Business Registration', state.businessApplication ? state.businessApplication.status : 'Not Started', '#f9fafb', '#374151']
                ].map(([label, value, bg, color]) => (
                  <div key={label} style={{ 
                    padding: '16px',
                    background: bg,
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: typeof value === 'number' ? '24px' : '15px', fontWeight: '700', color, wordBreak: 'break-word' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </>
      )
    } else if (tab === 'Timeline') {
      content = (
        <>
          <Alert type="info">
            Track your career progress from assessment to applications, training, and entrepreneurship.
          </Alert>
          
          <Panel title="Career Journey Timeline">
            <div style={{ padding: '16px 22px 22px' }}>
              <div style={{ position: 'relative', paddingLeft: '48px' }}>
                {/* Timeline line */}
                <div style={{ 
                  position: 'absolute',
                  left: '20px',
                  top: '20px',
                  bottom: '20px',
                  width: '2px',
                  background: 'linear-gradient(to bottom, #10b981 0%, #0a7e72 100%)'
                }} />
                
                {progressTimeline.map((item, i) => (
                  <div key={item.id} style={{ 
                    position: 'relative',
                    marginBottom: i < progressTimeline.length - 1 ? '32px' : '0',
                    paddingLeft: '24px'
                  }}>
                    {/* Icon badge */}
                    <div style={{ 
                      position: 'absolute',
                      left: '-28px',
                      top: '4px',
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: '#fff',
                      border: '3px solid #10b981',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                    }}>
                      {item.type === 'assessment' && <Target size={18} style={{ color: '#10b981' }} />}
                      {item.type === 'jobs' && <Briefcase size={18} style={{ color: '#10b981' }} />}
                      {item.type === 'skills' && <AlertCircle size={18} style={{ color: '#10b981' }} />}
                      {item.type === 'training' && <GraduationCap size={18} style={{ color: '#10b981' }} />}
                      {item.type === 'application' && <FileText size={18} style={{ color: '#10b981' }} />}
                      {item.type === 'entrepreneurship' && <Lightbulb size={18} style={{ color: '#10b981' }} />}
                      {item.type === 'business' && <Building2 size={18} style={{ color: '#10b981' }} />}
                    </div>
                    
                    {/* Content card */}
                    <div style={{ 
                      background: '#fafbfc',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '15px', color: '#111827', fontWeight: '600' }}>
                          {item.title}
                        </strong>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#6b7280',
                          background: '#f3f4f6',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          marginLeft: '12px'
                        }}>
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '13px', 
                        color: '#374151', 
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </>
      )
    }
  }

  // SETTINGS
  if (path === 'settings') {
    content = (
      <>
        <Panel title="Account Settings">
          <div style={{ padding: '0 22px 22px' }}>
            <Alert type="info">
              Settings and preferences are saved locally in this demo. No backend connection.
            </Alert>
            
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Account Information
              </h3>
              <div style={{ 
                display: 'grid',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {[
                  ['Name', demoResident.name],
                  ['Email', demoResident.email],
                  ['Phone', demoResident.phone],
                  ['Location', demoResident.location]
                ].map(([label, value]) => (
                  <div key={label} style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{label}</span>
                    <span style={{ fontSize: '13px', color: '#111827', fontWeight: '600' }}>{value}</span>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Profile Status
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {[
                  ['Profile Completion', `${demoResident.profileCompletion}%`, '#ecfdf5', '#059669'],
                  ['Employment Status', demoResident.employmentStatus, '#eff6ff', '#2563eb'],
                  ['Availability', demoResident.availability, '#fef3c7', '#d97706']
                ].map(([label, value, bg, color]) => (
                  <div key={label} style={{ 
                    padding: '16px',
                    background: bg,
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Career Interests
              </h3>
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '24px'
              }}>
                {demoResident.careerInterests.map(interest => (
                  <span key={interest} style={{
                    padding: '6px 12px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#0369a1',
                    fontWeight: '500'
                  }}>
                    {interest}
                  </span>
                ))}
              </div>

              <Alert type="warning">
                <strong>Demo Mode:</strong> Account management features (password change, email updates, notifications) will be available in production.
              </Alert>
            </div>
          </div>
        </Panel>
      </>
    )
  }

  return (
    <div className="lgu-workspace">
      <PageTitle
        eyebrow="RESIDENT PORTAL"
        title={module.title}
        description={module.description}
      />

      {module.tabs && (
        <Tabs
          tabs={module.tabs.map(t => ({ id: t, label: t }))}
          active={tab}
          onChange={t => navigate(`${path}?tab=${encodeURIComponent(t)}`)}
        />
      )}

      <div className="lgu-content">
        {content}
      </div>

      {/* Modals */}
      {modal?.title && !modal.kind && (
        <Modal title={modal.title} size={modal.size} onClose={close}>
          <div className="detail-list">
            {modal.items.map(([label, value]) => value !== undefined && value !== '' && (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || 'Not provided'}</dd>
              </div>
            ))}
          </div>
          {modal.extra}
        </Modal>
      )}

      {['profile', 'employment', 'training'].includes(path) && <Panel title="Career Reassessment" action={<Button onClick={() => { reassessCareer(); showMessage('Career recommendations updated using your latest profile.') }}>Reassess Career Profile</Button>}><div className="profile-section-body"><p>Recommendations use your current profile and the latest requirements. {reassessment.reason}.</p><div className="lgu-row-actions">{reassessment.changes.slice(0, 3).map(change => <span key={change.id}><strong>{change.title}</strong>: {change.before}% before ? {change.after}% now</span>)}</div><small>Before uses your profile before its most recent edit or training completion, compared with the same current vacancy.</small></div></Panel>}

      {modal?.kind === 'confirm-apply' && <RecordEditor title={`Apply — ${modal.job.title} · ${modal.job.company} · ${demoResident.name}`} record={{ note: '' }} fields={[{ key: 'note', label: 'Optional Application Note', type: 'textarea', required: false, wide: true }]} onClose={close} onSave={confirmApply} saveLabel="Submit Application" />}

      {modal?.kind === 'confirm-withdraw' && (
        <ConfirmationDialog
          title={modal.title}
          description={modal.error || `Withdraw your application for ${modal.app.jobTitle}? This action cannot be undone.`}
          confirmLabel="Withdraw Application"
          onConfirm={confirmWithdraw}
          onClose={close}
          variant="danger"
        />
      )}

      {modal?.kind === 'confirm-training' && (
        <ConfirmationDialog
          title={modal.title}
          description={modal.error || `Register for ${modal.training.title} at ${modal.training.provider}? Training fee: ${money(modal.training.fee)}`}
          confirmLabel="Confirm Registration"
          onConfirm={confirmTrainingRegistration}
          onClose={close}
          variant="primary"
        />
      )}

      {modal?.kind === 'confirm-cancel-training' && <ConfirmationDialog title={modal.title} description={modal.error || 'Cancel your training registration and release the reserved slot?'} confirmLabel="Cancel Registration" onClose={close} onConfirm={() => attempt(() => { updateRegistration(modal.training.id, 'Cancelled'); showMessage('Training registration cancelled.') })} />}

      {(modal?.kind === 'create-business-draft' || modal?.kind === 'edit-business-draft') && (
        <Modal 
          title={modal.title} 
          onClose={close}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Business Name" required>
              <input
                type="text"
                value={modal.record?.businessName || ''}
                onChange={(e) => setModal(m => ({
                  ...m,
                  record: { ...m.record, businessName: e.target.value }
                }))}
                placeholder="e.g., JD Computer Repair Services"
              />
            </Field>

            <Field label="Business Type" required>
              <select
                value={modal.record?.businessType || 'Computer Repair'}
                onChange={(e) => setModal(m => ({
                  ...m,
                  record: { ...m.record, businessType: e.target.value }
                }))}
              >
                <option>Computer Repair</option>
                <option>Sari-Sari Store</option>
                <option>Food Service</option>
                <option>Tailoring</option>
                <option>Welding</option>
                <option>Other</option>
              </select>
            </Field>

            <Field label="Business Activity" required>
              <textarea
                value={modal.record?.activity || ''}
                onChange={(e) => setModal(m => ({
                  ...m,
                  record: { ...m.record, activity: e.target.value }
                }))}
                rows={3}
                placeholder="Describe what your business will do"
              />
            </Field>

            <Field label="Business Location" required>
              <input
                type="text"
                value={modal.record?.location || ''}
                onChange={(e) => setModal(m => ({
                  ...m,
                  record: { ...m.record, location: e.target.value }
                }))}
                placeholder="Barangay, Municipality"
              />
            </Field>

            <Field label="Complete Address" required>
              <input
                type="text"
                value={modal.record?.address || ''}
                onChange={(e) => setModal(m => ({
                  ...m,
                  record: { ...m.record, address: e.target.value }
                }))}
                placeholder="Full business address"
              />
            </Field>

            <Field label="Contact Number" required>
              <input
                type="tel"
                value={modal.record?.contactNumber || ''}
                onChange={(e) => setModal(m => ({
                  ...m,
                  record: { ...m.record, contactNumber: e.target.value }
                }))}
              />
            </Field>

            <Alert type="info">
              Your draft will be saved. You can edit it anytime before submitting.
            </Alert>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Validate required fields
                const { businessName, activity, location, address } = modal.record
                if (!businessName || !activity || !location || !address) {
                  showMessage('Please fill all required fields')
                  return
                }
                
                // Save draft
                const draft = {
                  ...modal.record,
                  id: modal.record.id || `BR-${Date.now()}`,
                  submitted: null,
                  status: 'Draft',
                  documents: [],
                  notes: '',
                  history: ['Draft saved'],
                  timeline: [
                    { stage: 'Draft', date: today(), status: 'Completed' },
                    { stage: 'Submit Application', date: null, status: 'Pending' },
                    { stage: 'Under LGU Review', date: null, status: 'Pending' },
                    { stage: 'Approved / Rejected', date: null, status: 'Pending' }
                  ]
                }
                
                setState(s => {
                  const updated = { ...s, businessApplication: draft }
                  return updated
                })
                close()
                showMessage('Business registration draft saved')
              }}>
                Save Draft
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {modal?.kind === 'confirm-submit-business' && (
        <ConfirmationDialog
          title={modal.title}
          description={`Submit your business registration for "${modal.record.businessName}" to the LGU for review? You cannot edit the application after submission.`}
          confirmLabel="Submit Application"
          onConfirm={() => {
            const actionDate = today()
            const submitted = {
              ...modal.record,
              submitted: actionDate,
              status: 'New Application',
              history: [
                `Draft saved`,
                `Application submitted · ${actionDate}`
              ],
              timeline: [
                { stage: 'Draft', date: actionDate, status: 'Completed' },
                { stage: 'Application Submitted', date: actionDate, status: 'Completed' },
                { stage: 'Under LGU Review', date: null, status: 'Pending' },
                { stage: 'Approved / Rejected', date: null, status: 'Pending' }
              ]
            }
            
            setState(s => {
              const updated = { ...s, businessApplication: submitted }
              return updated
            })
            close()
            showMessage('Business registration submitted to LGU')
          }}
          onClose={close}
          variant="primary"
        />
      )}

      {modal?.kind === 'submit-business-requirements' && (
        <Modal 
          title={modal.title} 
          onClose={close}
        >
          <Alert type="warning">
            The LGU has requested additional requirements for your business registration.
          </Alert>
          
          <p className="lgu-caption">{modal.record.notes || 'Please provide the requirements requested by the LGU.'}</p>
          <Alert type="info" style={{ marginTop: '16px' }}>
            <strong>Prototype Note:</strong> File upload is simulated. In production, you would upload actual documents here.
          </Alert>
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={() => {
              const actionDate = today()
              const updated = {
                ...modal.record,
                status: 'Under Review',
                documents: [...modal.record.documents, 'Barangay Clearance.pdf', 'DTI Certificate.pdf', 'Location Sketch v2.pdf'],
                history: [
                  ...modal.record.history,
                  `Additional requirements submitted · ${actionDate}`
                ],
                timeline: modal.record.timeline.map(t => 
                  t.stage === 'Under LGU Review' 
                    ? { ...t, status: 'Under Review' }
                    : t
                )
              }
              
              setState(s => {
                const updatedState = { ...s, businessApplication: updated }
                return updatedState
              })
              close()
              showMessage('Additional requirements submitted')
            }}>
              Submit Requirements
            </Button>
          </div>
        </Modal>
      )}

      {modal?.kind === 'confirm-withdraw-business' && (
        <ConfirmationDialog
          title={modal.title}
          description={`Are you sure you want to withdraw your business registration application for "${modal.record.businessName}"? This action cannot be undone.`}
          confirmLabel="Withdraw Application"
          onConfirm={() => {
            const actionDate = today()
            const withdrawn = {
              ...modal.record,
              status: 'Withdrawn',
              history: [
                ...modal.record.history,
                `Application withdrawn by applicant · ${actionDate}`
              ]
            }
            
            setState(s => {
              const updated = { ...s, businessApplication: withdrawn }
              return updated
            })
            close()
            showMessage('Business registration application withdrawn')
          }}
          onClose={close}
          variant="danger"
        />
      )}
    </div>
  )
}


