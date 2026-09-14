import { Alert, Button, Panel } from '../../components/ui'
import { placementRate } from '../../data/lguData'
import { useLguData } from '../../data/demoModels'
import { Bars, Facts, Flow, Metrics, Status, Trend } from './Workspace'

export function Rate({ period }) {
  const { snapshot } = useLguData()
  return <Panel title="Platform Employment Placement Rate" description="Among active registered job seekers in the tracked population."><div className="lgu-rate"><strong>{placementRate(period.hired)}</strong><div><b>{period.hired} hires ÷ {snapshot.active} active job seekers × 100</b><p>Based only on registered and tracked job seekers in EntretifAI.</p><small>{period.label}. Active denominator: fixed September snapshot cohort; total registered: 1,248.</small></div></div></Panel>
}
export function Funnel({ period }) {
  return <Flow steps={[[ 'Applications', period.applications], ['Shortlisted', period.shortlisted], ['Interviewed', period.interviews], ['Hired', period.hired]]} />
}
export function SkillCharts() {
  const { skills } = useLguData()
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px', minWidth: 0 }}><Bars title="Employer Demand by Skill" description="Related vacancies; one vacancy may require several skills." items={skills.map(s => [s.name, s.demand])} /><Bars title="Residents Missing Each Skill" description="Identified gaps among interested residents; groups may overlap." items={skills.map(s => [s.name, s.missing])} /><Bars title="Common Resident Skills" description="Residents with each tracked skill." items={skills.map(s => [s.name, s.qualified])} /><Bars title="Available Training Slots" description="Current supply linked to each skill gap." items={skills.map(s => [s.name, s.slots])} /></div>
}
export function TrainingAnalytics() {
  const { programs, skills, snapshot } = useLguData()
  const completed = programs.filter(p => p.completed > 0)
  const completionRate = (snapshot.trainingCompleted / snapshot.trainingRegistrations * 100).toFixed(1)
  return <><Metrics items={[[ 'Active Training Programs', programs.filter(p => ['Active', 'Full'].includes(p.status)).length], ['Available Training Slots', programs.reduce((n, p) => n + p.slots, 0)], ['Registrations', snapshot.trainingRegistrations], ['Completion Rate', `${completionRate}%`, `${snapshot.trainingCompleted} of ${snapshot.trainingRegistrations} year-to-date registrations`]]} /><div className="lgu-grid"><Bars title="Most Requested Training Areas" description="Residents with identified training needs." items={skills.map(s => [s.name, s.missing])} /><Bars title="Skill Gaps Addressed" description="Current available training capacity by skill." items={skills.map(s => [s.name, s.slots])} /></div><Panel title="Related Employment Outcomes" description="Year-to-date completed cohorts, separate from upcoming batch registrations. Training does not establish a causal effect on employment."><div className="lgu-outcome-grid">{completed.map(p => <div key={p.id}><h3>{p.name}</h3><Facts items={[[ 'Completed Training', p.completed], ['Related Employment Placements', p.placements], ['Tracked Related Placement Share', `${(p.placements / p.completed * 100).toFixed(1)}%`]]} /></div>)}</div></Panel></>
}
export function EntrepreneurshipAnalytics({ businesses }) {
  const { snapshot } = useLguData()
  const underReview = businesses.filter(b => b.status === 'Under Review').length
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {[
          ['Residents Exploring Entrepreneurship', snapshot.exploring], 
          ['Business Pathways Started', snapshot.pathways], 
          ['Residents in Preparation', snapshot.preparing],
          ['Business Registration Apps', snapshot.registrationStarted], 
          ['Applications Under Review', underReview, 'Current review queue'], 
          ['Registered Businesses', snapshot.registeredBusinesses, 'Separate from application approval']
        ].map(([label, value, detail]) => (
          <div key={label} className="stat-card">
            <div className="stat-top">
              <span>{label}</span>
            </div>
            <div className="stat-value">{value}</div>
            {detail && <p>{detail}</p>}
          </div>
        ))}
      </div>
      <Flow steps={[
        ['Interested Residents', snapshot.exploring], 
        ['Business Pathway Started', snapshot.pathways], 
        ['Registration Started', snapshot.registrationStarted], 
        ['Under Review', underReview], 
        ['Registered Business', snapshot.registeredBusinesses]
      ]} />
      <p className="lgu-caption">Stage counts describe cumulative activity and the current review queue, not a conversion rate between adjacent stages.</p>
      <Bars title="Most Recommended Business Categories" description="96 started business pathways, grouped by primary category." items={[['Food Services', 28], ['Computer Repair', 22], ['Retail', 20], ['Agriculture', 14], ['Digital Services', 12]]} />
    </>
  )
}
export function HiringOutcomes() {
  const { snapshot } = useLguData()
  return <><Metrics items={[[ 'Employment Placements', snapshot.hired, 'Year to date'], ['Average Match Score of Hired Residents', '91%', 'Illustrative tracked cohort average']]} /><div className="lgu-grid"><Bars title="Hires by Industry" items={[[ 'Information Technology', 86], ['Business Services', 68], ['Retail', 35], ['Other Industries', 25]]} /><Bars title="Hires by Job Category" items={[[ 'IT Support', 74], ['Administration', 68], ['Sales & Service', 47], ['Marketing', 25]]} /><Bars title="Hires by Employer" items={[[ 'San Jose Business Center', 68], ['Mindoro Digital Services', 49], ['Other Verified Employers', 97]]} /><Bars title="Hires by Career Interest" items={[[ 'IT Support', 80], ['Administration', 70], ['Digital Services', 30], ['Other Interests', 34]]} /></div></>
}
export function InsightCards({ onSupport, compact = false }) {
  const { skills, insights } = useLguData()
  return <>{!compact && <><Alert>Decision support only. Suggested actions are for LGU review; the system does not automatically execute policy decisions.</Alert><Flow steps={['Employer Demand', 'Resident Skill Gaps', 'Training Need', 'Training Supply', 'Resident Development', 'Employment Outcomes', 'Suggested LGU Action'].map(s => [s])} /></>}<div className={compact ? '' : 'lgu-grid'}>{(compact ? insights.slice(0, 1) : insights).map(insight => {
    const skill = skills.find(s => s.id === insight.skillId)
    return <Panel key={insight.id} title={insight.title} action={<Status value={insight.priority} />}><div className="lgu-insight-body"><div className="eyebrow">PRESCRIPTIVE INSIGHT</div><div className="lgu-evidence"><span><b>{skill.demand}</b> related vacancies</span><span><b>{skill.missing}</b> residents missing skill</span><span><b>{skill.slots}</b> training slots</span></div><p>{insight.explanation}</p><div className="lgu-suggestion"><h3>Suggested Action</h3><p>{insight.action}</p></div><small>Related skill: {skill.name} · September 12, 2026 snapshot</small><div className="lgu-row-actions"><Button variant="secondary" onClick={() => onSupport(insight, 'View Supporting Data')}>View Supporting Data</Button>{!compact && insight.actions.map(action => <Button variant="ghost" key={action} onClick={() => onSupport(insight, action)}>{action}</Button>)}</div></div></Panel>
  })}</div></>
}
export function OverviewMetrics({ period, orgs }) {
  const { skills, snapshot } = useLguData()
  return <Metrics items={[[ 'Registered Job Seekers', snapshot.registered], ['Active Job Seekers', snapshot.active], ['Active Job Vacancies', snapshot.vacancies], ['Employment Placements', period.hired, period.label], ['Verified Employers', snapshot.employers], ['Verified Training Agencies', snapshot.agencies], ['High-Priority Skill Gaps', skills.filter(s => s.priority === 'High').length], ['Pending Verifications', orgs.filter(o => ['Pending Review', 'Under Review', 'Needs Additional Documents'].includes(o.status)).length]]} />
}
export function Analytics({ tab, period, orgs, businesses, onSupport }) {
  const { skills, programs, snapshot } = useLguData()
  if (tab === 'Prescriptive Insights') return <InsightCards onSupport={onSupport} />
  if (tab === 'Skills & Skill Gap Analytics') return (
    <>
      <Metrics items={[[ 'Skills Tracked', skills.length], ['Common Skill Gaps', skills.length], ['High-Priority Skill Gaps', skills.filter(s => s.priority === 'High').length], ['Training Programs Available', programs.filter(p => p.slots > 0).length]]} />
      <SkillCharts />
    </>
  )
  if (tab === 'Training Analytics') return <TrainingAnalytics />
  if (tab === 'Entrepreneurship Analytics') return <EntrepreneurshipAnalytics businesses={businesses} />
  if (tab === 'Employment Analytics') return (
    <>
      <Funnel period={period} />
      <Metrics items={[[ 'Active Vacancies', snapshot.vacancies], ['Placement Rate', placementRate(period.hired)]]} />
      <Rate period={period} />
      <div className="lgu-grid">
        <Trend period={period} />
        <Bars title="In-Demand Jobs" items={[[ 'IT Support Technician', 75], ['Administrative Assistant', 68], ['Digital Marketing Associate', 35]]} />
        <Bars title="Employers with Most Vacancies" description="Current snapshot; selected employers." items={[[ 'Mindoro Digital Services', 24], ['San Jose Business Center', 18]]} />
        <Bars title="Hires by Industry" description="Year-to-date hiring outcomes." items={[[ 'Information Technology', 86], ['Business Services', 68], ['Retail', 35], ['Other Industries', 25]]} />
      </div>
    </>
  )
  
  return (
    <>
      <div className="lgu-metrics-4col">
        <OverviewMetrics period={period} orgs={orgs} />
        <Metrics items={[[ 'Training Participation', snapshot.trainingRegistrations], ['Training Completion', snapshot.trainingCompleted], ['Entrepreneurship Participation', snapshot.exploring], ['Business Registration Activity', snapshot.registrationStarted]]} />
      </div>
      <Rate period={period} />
      <div className="lgu-grid">
        <Trend period={period} />
        <Bars title="Top In-Demand Jobs" items={[[ 'IT Support Technician', 75], ['Administrative Assistant', 68], ['Digital Marketing Associate', 35]]} />
        <Bars title="Top In-Demand Skills" items={skills.map(s => [s.name, s.demand])} />
        <Bars title="High-Priority Skill Gaps" items={skills.filter(s => s.priority === 'High').map(s => [s.name, s.missing])} />
      </div>
      <Bars title="Training Availability" items={skills.map(s => [s.name, s.slots])} />
    </>
  )
}
