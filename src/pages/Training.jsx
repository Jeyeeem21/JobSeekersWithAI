import { useTrainingModel, setTrainingState } from '../data/demoModels'
import { setActor, saveOwnedRecord, recordLifecycle, saveOrganization, updateRegistration } from '../data/demoStore'
import { RecordEditor } from '../components/RecordEditor'
import { programFields, organizationFields } from '../data/formSchemas'
import { useState } from 'react'
import { FileText, ShieldCheck, AlertCircle } from 'lucide-react'
import { Alert, Button, ConfirmationDialog, Field, Modal, PageTitle, Panel, Tabs } from '../components/ui'

import { Bars, Facts, Metrics, RecordTable, Status } from './lgu/Workspace'
import { money } from '../data/lguFormat'
import './lgu/lgu.css'

const modules = {
  dashboard: { title: 'Training Agency Dashboard', description: 'Manage your training programs and participants.' },
  profile: { title: 'Agency Profile & Verification', description: 'Manage your agency information and verification status.' },
  programs: { title: 'Training Programs', description: 'Create and manage your training offerings.' },
  participants: { title: 'Participants', description: 'Track participant registrations and progress.' },
  completion: { title: 'Training Completion', description: 'Manage completion records and certificates.' },
  analytics: { title: 'Analytics', description: 'Training performance and impact metrics.', tabs: ['Overview', 'Program Performance', 'Skill Development', 'Employment Outcomes'] },
  transactions: { title: 'Transactions & Partnerships', description: 'Listing fees and sponsorship opportunities.', tabs: ['Listing Transactions', 'Sponsorships'] },
  settings: { title: 'Settings', description: 'Manage your account and notification preferences.' }
}

const col = (key, label, render) => ({ key, label, render })
const statusCol = (key = 'status', label = 'Status') => col(key, label, r => <Status value={r[key]} />)
const filter = (key, label, options, test) => ({ key, label, options, test })
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function TrainingDashboard({ page, navigate, showMessage }) {
  const { state, currentAgency, agencyPrograms, organizations, skillGapAlignment, trainingTransactions, trainingSponsors } = useTrainingModel()
  const setState = setTrainingState
  const [modal, setModal] = useState(null)
  const [, setNotes] = useState('')
  const [path, query] = page.split('?')
  const module = modules[path] || modules.dashboard
  const requestedTab = new URLSearchParams(query).get('tab')
  const tab = module.tabs?.includes(requestedTab) ? requestedTab : module.tabs?.[0]
  
const close = () => { setModal(null); setNotes('') }
  const attempt = action => { try { action(); close() } catch (error) { setModal(m => ({ ...m, error: error.message })); showMessage(error.message) } }
  const lifecycle = (record, action) => setModal({ kind: 'lifecycle', title: `${action}: ${record.title || record.name}`, record, action, size: 'sm' })
  const details = (title, items, extra, size = 'md') => setModal({ title, items, extra, size })

  const isVerified = currentAgency.verificationStatus === 'Verified'
  const stats = currentAgency.statistics

  // View functions
  const viewAgencyProfile = () => details(
    'Agency Profile',
    [
      ['Agency Name', currentAgency.name],
      ['Type', currentAgency.type],
      ['Business Type', currentAgency.businessType],
      ['Location', currentAgency.location],
      ['Contact Person', currentAgency.contact],
      ['Email', currentAgency.email],
      ['Phone', currentAgency.phone],
      ['Website', currentAgency.website],
      ['TESDA Registration', currentAgency.tesda],
      ['Accreditations', currentAgency.accreditations.join(', ')],
      ['Verification Status', currentAgency.verificationStatus],
      ['Registered Date', formatDate(currentAgency.registered)]
    ],
    currentAgency.verificationStatus === 'Pending Review' ? (
      <Alert type="warning">
        <AlertCircle size={16} />
        <div>
          <strong>Verification Pending</strong>
          <p style={{ margin: 0 }}>Your agency is under LGU review. You can prepare training programs but cannot publish until verified.</p>
        </div>
      </Alert>
    ) : null,
    'md'
  )

  const viewProgram = (prog) => details(
    prog.name,
    [
      ['Program Name', prog.name],
      ['Skills Developed', prog.skillIds ? prog.skillIds.join(', ') : 'N/A'],
      ['Duration', prog.duration],
      ['Schedule', prog.schedule],
      ['Time Slot', prog.timeSlot],
      ['Capacity', prog.capacity],
      ['Training Fee', money(prog.fee)],
      ['Status', prog.status],
      ['Description', prog.description],
      ['Target Audience', prog.targetAudience],
      ['Instructor', prog.instructor],
      ['Registrations', prog.registrations || 0],
      ['Payment Status', prog.paymentStatus]
    ],
    prog.objectives && (
      <>
        <h3>Learning Objectives</h3>
        <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '13px' }}>
          {prog.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
        </ul>
        <h3>Requirements</h3>
        <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '13px' }}>
          {prog.requirements.map((req, i) => <li key={i}>{req}</li>)}
        </ul>
      </>
    ),
    'md'
  )

  let content

  // Dashboard
  if (path === 'dashboard' || !path) {
    content = (
      <>
        {!isVerified && (
          <Alert type="warning">
            <AlertCircle size={16} />
            <div>
              <strong>Agency Verification Required</strong>
              <p style={{ margin: 0 }}>
                Your agency is currently under LGU review. Complete your profile and wait for verification approval to publish training programs and reach participants.
              </p>
            </div>
          </Alert>
        )}

        <Metrics items={[
          ['Total Programs', stats.totalPrograms, isVerified ? `${stats.activePrograms} active` : 'Pending verification'],
          ['Available Slots', stats.totalSlots, 'Total training capacity'],
          ['Total Participants', stats.totalParticipants, 'All-time registrations'],
          ['Completions', stats.totalCompletions, stats.totalParticipants > 0 ? `${Math.round(stats.totalCompletions / stats.totalParticipants * 100)}% completion rate` : 'No completions yet']
        ]} />

        <div className="lgu-grid">
          <Panel
            title="Agency Information"
            description="Your training center profile"
            action={<Button variant="ghost" onClick={viewAgencyProfile}>View Full Profile</Button>}
          >
            <Facts items={[
              ['Agency Name', currentAgency.name],
              ['Type', currentAgency.type],
              ['Location', currentAgency.location],
              ['Verification Status', currentAgency.verificationStatus]
            ]} />
          </Panel>

          <Panel
            title="Getting Started"
            description="Steps to publish your training programs"
          >
            <div className="lgu-queue">
              <div>
                <div>
                  <strong>Complete Agency Profile</strong>
                  <small>Provide complete agency information and documents</small>
                </div>
                <Status value={currentAgency.verificationStatus === 'Pending Review' ? 'Completed' : 'Pending'} />
              </div>
              <div>
                <div>
                  <strong>LGU Verification</strong>
                  <small>Wait for LGU to verify your agency</small>
                </div>
                <Status value={currentAgency.verificationStatus === 'Verified' ? 'Approved' : currentAgency.verificationStatus} />
              </div>
              <div>
                <div>
                  <strong>Create Training Programs</strong>
                  <small>Design and prepare your training offerings</small>
                </div>
                <Status value="Pending" />
              </div>
              <div>
                <div>
                  <strong>Pay Listing Fee</strong>
                  <small>PHP 300 per program to publish</small>
                </div>
                <Status value="Pending" />
              </div>
              <div>
                <div>
                  <strong>Publish & Accept Participants</strong>
                  <small>Programs become visible to job seekers</small>
                </div>
                <Status value="Pending" />
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Skill Gap Alignment" description="Understand local workforce needs">
          <Alert type="info">
            These skill gaps represent opportunities to serve the local workforce. Design programs that address high-priority gaps with strong employer demand.
          </Alert>
          <Bars 
            title="Priority Skill Gaps" 
            description="Residents missing skills with employer demand"
            items={skillGapAlignment
              .filter(s => s.priority === 'High')
              .slice(0, 5)
              .map(s => [s.skillName, s.gap])}
          />
        </Panel>

        {isVerified && state.programs.length === 0 && (
          <Panel title="Ready to Create Programs?">
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ marginBottom: '16px', color: '#6b7280' }}>
                You're verified! Create your first training program to start reaching participants.
              </p>
              <Button onClick={() => navigate('programs')}>
                Create Training Program
              </Button>
            </div>
          </Panel>
        )}
      </>
    )
  }

  // Agency Profile
  if (path === 'profile') {
    content = (
      <>
        {/* Verification Hero Banner */}
        {currentAgency.verificationStatus === 'Verified' ? (
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
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>Verified Training Agency</h2>
              <p style={{ margin: '0 0 4px 0', opacity: 0.95 }}>
                Your agency has been verified by the LGU on {formatDate(currentAgency.verified)}.
              </p>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                You can now create and publish training programs.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>Verification Under Review</h2>
              <p style={{ margin: '0 0 4px 0', opacity: 0.95 }}>
                Your agency verification is being reviewed by the LGU.
              </p>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                This typically takes 3-5 business days. You'll be notified once approved.
              </p>
            </div>
          </div>
        )}

        {/* Unified Agency Profile Card */}
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
                {currentAgency.name}
              </h3>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {currentAgency.type} • {currentAgency.businessType}
              </div>
            </div>
            <Button variant="secondary" onClick={() => setModal({
              kind: 'edit-agency-profile',
              title: 'Edit Agency Profile',
              record: currentAgency
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
            {/* Left Column - Agency Details */}
            <div>
              <h4 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '15px', 
                fontWeight: '600',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Agency Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Agency Type</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Business Type</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.businessType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>TESDA Registration</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.tesda}</div>
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
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.contact}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Phone</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Website</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.website}</div>
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
              Agency Description
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
              {currentAgency.description}
            </p>
          </div>

          {/* Full-width Address */}
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Business Address</div>
            <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{currentAgency.address}</div>
          </div>

          {/* Accreditations */}
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '12px', color: '#166534', marginBottom: '6px', fontWeight: 600 }}>Accreditations & Certifications</div>
            <div style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>
              {currentAgency.accreditations.join(' • ')}
            </div>
          </div>
        </div>

        {/* Facilities & Resources */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#111827',
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            Facilities & Resources
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '12px' 
          }}>
            {currentAgency.facilities.map((fac, i) => (
              <div 
                key={i}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#111827',
                  background: '#fafafa'
                }}
              >
                ✓ {fac}
              </div>
            ))}
          </div>
        </div>

        {/* Instructors */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#111827',
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            Instructors
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            {currentAgency.instructors.map(inst => (
              <div 
                key={inst.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#fafafa'
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827', marginBottom: '6px' }}>
                  {inst.name}
                </div>
                <div style={{ fontSize: '13px', color: '#0a7e72', marginBottom: '8px', fontWeight: 500 }}>
                  {inst.specialty}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {inst.certifications.join(' • ')}
                </div>
              </div>
            ))}
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
            {currentAgency.documents.map(doc => (
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
  }

  // Training Programs
  if (path === 'programs') {
    // Merge mock programs with user-created programs
    const allPrograms = state.programs

    content = (
      <>
        {!isVerified && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              background: '#fbbf24',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>!</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                Verification Required
              </div>
              <div style={{ fontSize: '13px', color: '#92400e' }}>
                You must be verified before publishing training programs. You can create draft programs in preparation.
              </div>
            </div>
          </div>
        )}

        {allPrograms.length === 0 && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              background: '#3b82f6',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>i</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                No training programs yet
              </div>
              <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                Create your first program to start addressing local skill gaps and reaching participants.
              </div>
            </div>
          </div>
        )}

        <RecordTable
          title="Training programs"
          description=""
          rows={allPrograms}
          columns={[
            col('name', 'Program Name'),
            col('duration', 'Duration'),
            col('capacity', 'Capacity'),
            col('fee', 'Fee', p => money(p.fee)),
            col('registrations', 'Registrations', p => p.registrations || 0),
            col('schedule', 'Schedule'),
            statusCol('status', 'Status')
          ]}
          filters={[
            filter('status', 'Status')
          ]}
          actions={[
            { label: 'View Details', run: viewProgram },
            { label: 'Edit', when: r => !['Closed', 'Completed', 'Expired'].includes(r.status), run: p => setModal({ kind: 'edit-program', title: 'Edit Program', record: p }) },
          { label: 'Publish', when: r => ['Draft', 'Pending Publication'].includes(r.status), run: r => lifecycle(r, 'Publish') },
          { label: 'Delete Draft', when: r => r.status === 'Draft', run: r => lifecycle(r, 'Delete Draft') },
          { label: 'Close', when: r => ['Active', 'Upcoming', 'Full'].includes(r.status), run: r => lifecycle(r, 'Close') }
          ]}
        />

        {/* Skill Gap Analysis Section */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '16px',
          margin: '24px 0 20px 0',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <div style={{
            background: '#3b82f6',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>i</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
              Skill Gap Analysis
            </div>
            <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
              Create training programs that address high-priority skill gaps. Payment enables publication, but relevance to skill gaps determines recommendation to participants.
            </div>
          </div>
        </div>

        <RecordTable
          title="Local skill gaps"
          description=""
          rows={skillGapAlignment}
            columns={[
              col('skillName', 'Skill'),
              col('residentsMissingSkill', 'Residents Missing'),
              col('employerDemand', 'Employer Demand'),
              col('currentSlots', 'Current Supply'),
              col('gap', 'Gap'),
              statusCol('priority', 'Priority')
            ]}
            filters={[
              filter('priority', 'Priority')
            ]}
            actions={[
              { label: 'Create Program', run: (skill) => setModal({
                kind: 'create-program',
                title: `Create Program for ${skill.skillName}`,
                record: {
                  id: `PROG-${Date.now()}`,
                  name: `${skill.skillName} Training`,
                  description: `Develop ${skill.skillName} skills to meet local workforce demand`,
                  duration: '',
                  capacity: 20,
                  fee: 0,
                  schedule: '',
                  timeSlot: '',
                  location: currentAgency.location || '',
                  skillIds: [skill.skillName],
                  targetAudience: '',
                  instructor: '',
                  objectives: [],
                  requirements: [],
                  status: 'Draft',
                  registrations: 0,
                  paymentStatus: 'Unpaid'
                }
              })}
            ]}
          />
      </>
    )
  }

  // Participants
  if (path === 'participants') {
    content = (
      <>
        {state.participants.length === 0 && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              background: '#3b82f6',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>i</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                No participants yet
              </div>
              <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                Publish your training programs to start receiving participant registrations.
              </div>
            </div>
          </div>
        )}

        <RecordTable
          title="Participants"
          description=""
          rows={state.participants}
          columns={[
            col('name', 'Participant'),
            col('programName', 'Program'),
            col('registrationDate', 'Registered', p => formatDate(p.registrationDate)),
            col('progress', 'Progress', p => `${p.progress}%`),
            col('attendance', 'Attendance', p => `${p.attendance}%`),
            statusCol('status', 'Status')
          ]}
          filters={[
            filter('status', 'Status'),
            filter('programName', 'Program')
          ]}
          actions={[
            { label: 'View Details', run: p => details('Participant Details', [['Resident', p.name], ['Program', p.programName], ['Status', p.status], ['Attendance', p.attendance], ['Progress', p.progress], ['Completion Date', p.completionDate]]) },
            { label: 'Mark In Training', when: p => p.status === 'Registered', run: p => setModal({ kind: 'participant-status', title: 'Mark In Training?', record: p, status: 'In Training' }) },
            { label: 'Mark Completed', when: p => p.status === 'In Training', run: p => setModal({ kind: 'participant-status', title: 'Mark Completed?', record: p, status: 'Completed' }) }
          ]}
        />
      </>
    )
  }

  // Training Completion
  if (path === 'completion') {
    content = (
      <>
        {state.participants.filter(p => p.status === 'Completed').length === 0 && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              background: '#3b82f6',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>i</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                No completions yet
              </div>
              <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                Participants who complete training programs will appear here.
              </div>
            </div>
          </div>
        )}

        <RecordTable title="Completion records" description="" rows={state.participants.filter(p => p.status === 'Completed')} columns={[col('name', 'Resident'), col('programName', 'Program'), col('completionDate', 'Completion Date'), statusCol()]} actions={[{ label: 'View Completion', run: p => details('Completion Record', [['Resident', p.name], ['Program', p.programName], ['Completion Date', p.completionDate], ['Status', p.status]]) }]} />
      </>
    )
  }

  // Analytics
  if (path === 'analytics') {
    if (!tab || tab === 'Overview') {
      content = (
        <>
          <Metrics items={[
            ['Total Programs', stats.totalPrograms],
            ['Total Participants', stats.totalParticipants],
            ['Completion Rate', stats.totalParticipants > 0 ? `${Math.round(stats.totalCompletions / stats.totalParticipants * 100)}%` : 'N/A'],
            ['Revenue Generated', money(stats.totalPrograms * 300)]
          ]} />

          <div className="lgu-grid">
            <Bars 
              title="Program Enrollments" 
              description="Participants per program"
              items={[
                ['Digital Marketing', 45],
                ['Web Development', 38],
                ['Data Analytics', 32],
                ['Graphic Design', 28],
                ['Office Productivity', 25]
              ]}
            />
            
            <Bars 
              title="Completion Status" 
              description="Training outcomes"
              items={[
                ['Completed', stats.totalCompletions || 0],
                ['In Training', state.participants.filter(p => p.status === 'In Training').length],
                ['Registered', state.participants.filter(p => p.status === 'Registered').length],
                ['Dropped', state.participants.filter(p => p.status === 'Dropped').length || 0]
              ]}
            />
          </div>

          {stats.totalPrograms === 0 && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                background: '#3b82f6',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>i</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                  No Data Yet
                </div>
                <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                  Analytics data will populate as you publish programs and participants complete training.
                </div>
              </div>
            </div>
          )}
        </>
      )
    } else if (tab === 'Program Performance') {
      content = (
        <>
          <Metrics items={[
            ['Average Attendance', '87%'],
            ['Average Progress', '72%'],
            ['Dropout Rate', '8%'],
            ['Satisfaction Score', '4.5/5']
          ]} />
          
          <div className="lgu-grid">
            <Bars 
              title="Programs by Status" 
              description="Current program distribution"
              items={[
                ['Active', state.programs.filter(p => p.status === 'Active').length],
                ['Full', state.programs.filter(p => p.status === 'Full').length],
                ['Draft', state.programs.filter(p => p.status === 'Draft').length],
                ['Completed', state.programs.filter(p => p.status === 'Completed').length]
              ]}
            />
            
            <Bars 
              title="Capacity Utilization" 
              description="Enrollment vs capacity"
              items={[
                ['Web Development', 95],
                ['Digital Marketing', 89],
                ['Data Analytics', 78],
                ['Graphic Design', 72],
                ['Office Skills', 65]
              ]}
              suffix="%"
            />
          </div>

          {stats.totalPrograms === 0 && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                background: '#3b82f6',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>i</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                  No Programs Yet
                </div>
                <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                  Program performance metrics will appear here as programs are published and completed.
                </div>
              </div>
            </div>
          )}
        </>
      )
    } else if (tab === 'Skill Development') {
      content = (
        <>
          <Bars 
            title="Skills Developed" 
            description="Number of participants gaining each skill"
            items={[
              ['JavaScript', 45],
              ['Python', 38],
              ['Data Analysis', 35],
              ['Digital Marketing', 42],
              ['Graphic Design', 28],
              ['MS Excel', 52],
              ['Network Configuration', 24],
              ['Database Management', 31]
            ]}
          />
          
          <div className="lgu-grid">
            <Bars 
              title="High-Priority Skills" 
              description="Skills with employer demand"
              items={[
                ['Web Development', 85],
                ['Digital Marketing', 78],
                ['Data Analytics', 65],
                ['Network Admin', 58]
              ]}
              suffix=" jobs"
            />
            
            <Panel title="Skill Gap Closure" description="Before and after training">
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    ['Digital Marketing', 45, 89],
                    ['Web Development', 32, 76],
                    ['Data Analytics', 28, 65]
                  ].map(([skill, before, after]) => (
                    <div key={skill} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>{skill}</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#6b7280', marginBottom: '4px' }}>Before: {before}%</div>
                          <div style={{ background: '#f3f4f6', height: '8px', borderRadius: '4px' }}>
                            <div style={{ background: '#dc2626', width: `${before}%`, height: '100%', borderRadius: '4px' }} />
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#6b7280', marginBottom: '4px' }}>After: {after}%</div>
                          <div style={{ background: '#f3f4f6', height: '8px', borderRadius: '4px' }}>
                            <div style={{ background: '#10b981', width: `${after}%`, height: '100%', borderRadius: '4px' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </>
      )
    } else if (tab === 'Employment Outcomes') {
      content = (
        <>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              background: '#fbbf24',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>!</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                Important
              </div>
              <div style={{ fontSize: '13px', color: '#92400e' }}>
                Employment outcomes show correlation, not causation. Training completion does not guarantee employment.
              </div>
            </div>
          </div>
          
          <Metrics items={[
            ['Completions', stats.totalCompletions || 15],
            ['Employed Within 3 Months', 12],
            ['Employment Rate', '80%'],
            ['Avg. Starting Salary', money(18000)]
          ]} />
          
          <div className="lgu-grid">
            <Bars 
              title="Employment by Industry" 
              description="Where graduates found work"
              items={[
                ['IT & Technology', 5],
                ['Marketing & Advertising', 3],
                ['Business Services', 2],
                ['Education', 1],
                ['Manufacturing', 1]
              ]}
            />
            
            <Bars 
              title="Time to Employment" 
              description="Months after completion"
              items={[
                ['0-1 month', 6],
                ['1-2 months', 4],
                ['2-3 months', 2],
                ['3+ months', 0]
              ]}
            />
          </div>
        </>
      )
    }
  }

  // Transactions & Partnerships
  if (path === 'transactions') {
    if (!tab || tab === 'Listing Transactions') {
      // Sample transaction data for demo
      const sampleTransactions = trainingTransactions.length === 0 ? [
        {
          id: 'TXN-2026-001',
          program: 'Web Development Bootcamp',
          amount: 300,
          date: '2026-09-10',
          status: 'Paid',
          publication: 'Published'
        },
        {
          id: 'TXN-2026-002',
          program: 'Digital Marketing Mastery',
          amount: 300,
          date: '2026-09-05',
          status: 'Paid',
          publication: 'Published'
        }
      ] : trainingTransactions;

      content = (
        <>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              background: '#3b82f6',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>i</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                Listing Fee Policy
              </div>
              <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                PHP 300 per training program. Payment → Publication Eligibility. Matching relevance is determined by skill gap alignment, NOT by payment.
              </div>
            </div>
          </div>

          {sampleTransactions.length > 0 && (
            <>
              <Metrics items={[
                ['Total Transactions', sampleTransactions.length],
                ['Total Paid', money(sampleTransactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0))],
                ['Published Programs', sampleTransactions.filter(t => t.publication === 'Published').length],
                ['Pending Payment', sampleTransactions.filter(t => t.status === 'Pending').length]
              ]} />

              <RecordTable
                title="Listing transactions"
                description=""
                rows={sampleTransactions}
            columns={[
              col('id', 'Transaction ID'),
              col('program', 'Program'),
              col('amount', 'Amount', t => money(t.amount)),
              col('date', 'Date'),
              statusCol('status', 'Payment Status'),
              statusCol('publication', 'Publication Status')
            ]}
            filters={[
              filter('status', 'Payment Status')
            ]}
            actions={[
              { label: 'View Transaction', run: t => details('Transaction Details', [['Reference', t.id], ['Program', t.program], ['Amount', money(t.amount)], ['Payment Status', t.status], ['Publication Status', t.publication]]) }
            ]}
          />
            </>
          )}

          {sampleTransactions.length === 0 && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                background: '#3b82f6',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>i</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                  No transactions yet
                </div>
                <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                  Transactions will appear here when you publish training programs.
                </div>
              </div>
            </div>
          )}
        </>
      )
    } else if (tab === 'Sponsorships') {
      // Sample sponsorship data
      const sponsorshipOpportunities = [
        {
          id: 'S-001',
          employer: 'Tech Solutions Inc.',
          program: 'Web Development Bootcamp',
          slots: 10,
          costPerSlot: 5000,
          status: 'Active',
          deadline: '2026-10-15',
          benefit: 'Priority access to graduates'
        },
        {
          id: 'S-002',
          employer: 'Digital Marketing Pro',
          program: 'Digital Marketing Mastery',
          slots: 5,
          costPerSlot: 4500,
          status: 'Active',
          deadline: '2026-10-20',
          benefit: 'Co-branded certificates'
        },
        {
          id: 'S-003',
          employer: 'Data Analytics Corp',
          program: 'Data Science Fundamentals',
          slots: 8,
          costPerSlot: 6000,
          status: 'Pending',
          deadline: '2026-11-01',
          benefit: 'First interview rights'
        }
      ];

      content = (
        <>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              background: '#3b82f6',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>i</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                Sponsorship Opportunities
              </div>
              <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                Partner with employers or organizations to sponsor training slots for residents. Build relationships and create direct pathways to employment.
              </div>
            </div>
          </div>

          <Metrics items={[
            ['Total Opportunities', sponsorshipOpportunities.length],
            ['Available Slots', sponsorshipOpportunities.reduce((sum, s) => sum + s.slots, 0)],
            ['Potential Revenue', money(sponsorshipOpportunities.reduce((sum, s) => sum + (s.slots * s.costPerSlot), 0))],
            ['Active Partners', sponsorshipOpportunities.filter(s => s.status === 'Active').length]
          ]} />

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: '16px',
            marginTop: '20px'
          }}>
            {sponsorshipOpportunities.map(opp => (
              <div 
                key={opp.id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0a7e72';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 126, 114, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{opp.id}</div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                      {opp.employer}
                    </h3>
                  </div>
                  <Status value={opp.status} />
                </div>

                <div style={{ 
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                    {opp.program}
                  </div>
                  <div style={{ fontSize: '12px', color: '#166534' }}>
                    Training program to be sponsored
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Slots Available</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0a7e72' }}>{opp.slots}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Cost per Slot</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0a7e72' }}>{money(opp.costPerSlot)}</div>
                  </div>
                </div>

                <div style={{ 
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>Sponsor Benefit</div>
                  <div style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                    ✓ {opp.benefit}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                  <span>Deadline: {formatDate(opp.deadline)}</span>
                  <span style={{ fontWeight: 600, color: '#0a7e72' }}>
                    Total: {money(opp.slots * opp.costPerSlot)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {trainingSponsors && trainingSponsors.length > 0 && (
            <>
              <h3 style={{ 
                margin: '32px 0 16px 0',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#111827',
                paddingBottom: '12px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                Active Sponsorships
              </h3>
              
              <RecordTable
                title="Current sponsorships"
                description=""
                rows={trainingSponsors}
                columns={[
                  col('sponsor', 'Sponsor'),
                  col('program', 'Program'),
                  col('slots', 'Slots'),
                  col('amount', 'Amount', s => money(s.amount || 0)),
                  col('startDate', 'Start Date'),
                  statusCol('status', 'Status')
                ]}
                actions={[
                  { label: 'View Details', run: (s) => details('Sponsorship Details', [
                    ['Sponsor', s.sponsor],
                    ['Program', s.program],
                    ['Slots Sponsored', s.slots],
                    ['Amount', money(s.amount || 0)],
                    ['Start Date', s.startDate],
                    ['Status', s.status]
                  ])}
                ]}
              />
            </>
          )}
        </>
      )
    }
  }

  // Settings
  if (path === 'settings') {
    content = (
      <form onSubmit={e => { e.preventDefault(); showMessage('Settings saved') }}>
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
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Training Agency</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{currentAgency.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>{currentAgency.type}</div>
          </div>
          
          <div style={{ 
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Programs</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0a7e72' }}>{stats.totalPrograms}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{agencyPrograms.filter(p => p.status === 'Active').length} currently active</div>
          </div>
          
          <div style={{ 
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Participants</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0a7e72' }}>{stats.totalParticipants}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{state.participants.filter(p => p.status === 'In Training').length} currently enrolled</div>
          </div>
          
          <div style={{ 
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification Status</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: currentAgency.verificationStatus === 'Verified' ? '#10b981' : '#f59e0b' }}>
              {currentAgency.verificationStatus === 'Verified' ? '✓ Verified' : '⏳ Under Review'}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {currentAgency.verificationStatus === 'Verified' ? `Since ${formatDate(currentAgency.verified)}` : 'Pending LGU approval'}
            </div>
          </div>
        </div>
        
        <div style={{
          background: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <div style={{
            background: '#3b82f6',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>i</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
              Account Settings
            </div>
            <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
              Manage your notification preferences and account security settings.
            </div>
          </div>
        </div>
        
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
                checked={state.settings.emailNotifications.registrations}
                onChange={e => setState(s => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    emailNotifications: { ...s.settings.emailNotifications, registrations: e.target.checked }
                  }
                }))}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>New participant registrations</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Get notified when residents register for your training programs</div>
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
                checked={state.settings.emailNotifications.completions}
                onChange={e => setState(s => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    emailNotifications: { ...s.settings.emailNotifications, completions: e.target.checked }
                  }
                }))}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Training completions</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Receive alerts when participants complete training programs</div>
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
                checked={state.settings.emailNotifications.payments}
                onChange={e => setState(s => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    emailNotifications: { ...s.settings.emailNotifications, payments: e.target.checked }
                  }
                }))}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Payment confirmations</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Get confirmation emails for listing fee payments</div>
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
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Weekly summary reports</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Receive a weekly digest of your training activities and metrics</div>
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
                state.settings.emailNotifications.registrations && 'Registrations',
                state.settings.emailNotifications.completions && 'Completions',
                state.settings.emailNotifications.payments && 'Payments',
                state.settings.emailNotifications.summary && 'Weekly summaries'
              ].filter(Boolean).length > 0 
                ? `You'll receive notifications for: ${[
                    state.settings.emailNotifications.registrations && 'Registrations',
                    state.settings.emailNotifications.completions && 'Completions',
                    state.settings.emailNotifications.payments && 'Payments',
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
          
          <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              background: '#3b82f6',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>i</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>
                LGU Administrator Required
              </div>
              <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                For security and account management changes, please contact the LGU administrator directly.
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gap: '12px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>Email</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{currentAgency.email}</div>
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
    <div className="lgu-workspace"><div className="demo-organization"><Field label="Demo Organization"><select aria-label="Demo Organization" value={currentAgency.id} onChange={e => { setActor('training', e.target.value); close() }}>{organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field></div>
      <PageTitle
        eyebrow="TRAINING AGENCY PORTAL"
        title={module.title}
        description={module.description}
      >
        {path === 'programs' && (
          <Button onClick={() => setModal({
            kind: 'create-program',
            title: 'Create Training Program',
            record: {
              id: `PROG-${Date.now()}`,
              name: '',
              description: '',
              duration: '',
              capacity: 20,
              fee: 0,
              schedule: '',
              timeSlot: '',
              location: currentAgency.location || '',
              skillIds: [],
              targetAudience: '',
              instructor: '',
              objectives: [],
              requirements: [],
              status: 'Draft',
              registrations: 0,
              paymentStatus: 'Unpaid'
            }
          })}>
            Create Training Program
          </Button>
        )}
      </PageTitle>

      {module.tabs && <Tabs tabs={module.tabs.map(label => ({ id: label, label }))} active={tab} onChange={next => navigate(`${path}?tab=${encodeURIComponent(next)}`)} />}
      <div className="lgu-content">
        {content}
      </div>

      {/* Modals */}
      {modal?.title && !modal.kind && (
        <Modal title={modal.title} size={modal.size} onClose={close}>
          <div className="detail-list">
            {modal.items.map(([label, value]) => value !== undefined && (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || 'Not provided'}</dd>
              </div>
            ))}
          </div>
          {modal.extra}
        </Modal>
      )}

      {modal?.kind === 'confirm' && (
        <ConfirmationDialog
          title={modal.title}
          description={modal.description}
          confirmLabel={modal.confirmLabel || 'Confirm'}
          onConfirm={() => { modal.onConfirm(); close() }}
          onClose={close}
          variant={modal.variant || 'primary'}
        />
      )}

      {/* Create/Edit Training Program Modal */}
      {(modal?.kind === 'create-program' || modal?.kind === 'edit-program') && <RecordEditor key={modal.record.id} title={modal.title} record={{ developedLevel: 'Intermediate', ...modal.record, schedule: modal.record.schedule?.slice(0, 10) || '' }} fields={programFields} onClose={close} saveLabel={modal.kind === 'create-program' ? 'Save Draft' : 'Save Changes'} onSave={draft => { saveOwnedRecord('program', draft); close(); showMessage('Training program saved.') }} />}
      {modal?.kind === 'participant-status' && <ConfirmationDialog title={modal.title} description={modal.error || (modal.status === 'Completed' ? 'Record completion and add the program skills to the resident profile at the listed completion proficiency for this demo? Matching will be reassessed; this does not guarantee employment.' : 'Start training for this participant?')} confirmLabel={modal.status === 'Completed' ? 'Mark Completed' : 'Mark In Training'} variant="primary" onClose={close} onConfirm={() => attempt(() => { updateRegistration(modal.record.id, modal.status); showMessage('Participant status updated.') })} />}

      {modal?.kind === 'edit-agency-profile' && <RecordEditor title="Edit Agency Profile" record={modal.record} fields={organizationFields} onClose={close} onSave={draft => { saveOrganization(currentAgency.id, draft); close(); showMessage('Agency profile updated.') }} />}

      {modal?.kind === 'lifecycle' && <ConfirmationDialog title={modal.title} description={modal.error || (modal.action === 'Publish' ? 'Confirm publication. The listing fee is recorded as a mock payment only; payment does not affect recommendations.' : 'Confirm this lifecycle change. Historical records remain visible.')} confirmLabel={modal.action} variant={modal.action === 'Delete Draft' ? 'danger' : 'primary'} onClose={close} onConfirm={() => attempt(() => { recordLifecycle('program', modal.record.id, modal.action); showMessage('Record updated.') })} />}

    </div>
  )
}

