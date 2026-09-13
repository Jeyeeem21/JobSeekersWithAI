import { useState } from 'react'
import { Alert, Button, ConfirmationDialog, Modal, Panel, ProgressBar, Badge } from '../../components/ui'
import { RecordEditor } from '../../components/RecordEditor'
import { Facts, Status } from '../lgu/Workspace'
import { saveProfile, uid, useDemoStore } from '../../data/demoStore'
import { registrationsFor } from '../../data/demoModels'

const schemas = {
  personal: [{ key: 'name', label: 'Full Name' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone' }, { key: 'location', label: 'Location' }],
  career: [{ key: 'employmentStatus', label: 'Employment Status', options: ['Seeking Employment', 'Employed', 'Self-employed', 'Student'] }, { key: 'availability', label: 'Availability', options: ['Immediate', 'Within 1 month', 'Within 3 months', 'Not available'] }, { key: 'careerInterests', label: 'Career Interests', type: 'list', wide: true }],
  skills: [{ key: 'name', label: 'Skill Name' }, { key: 'level', label: 'Proficiency', options: ['Beginner', 'Intermediate', 'Advanced'] }],
  educationEntries: [{ key: 'level', label: 'Education Level' }, { key: 'course', label: 'Course / Qualification' }, { key: 'school', label: 'School' }, { key: 'yearCompleted', label: 'Year Completed', type: 'number', min: 1900, integer: true }],
  experience: [{ key: 'position', label: 'Position' }, { key: 'organization', label: 'Organization' }, { key: 'type', label: 'Experience Type', options: ['Employment', 'Internship', 'Volunteer', 'Self-employed'] }, { key: 'duration', label: 'Duration', required: false }, { key: 'startDate', label: 'Start Date', type: 'date' }, { key: 'endDate', label: 'End Date', type: 'date', required: false }, { key: 'responsibilities', label: 'Description', type: 'textarea', wide: true }],
  certifications: [{ key: 'name', label: 'Certification' }, { key: 'issuingOrganization', label: 'Provider' }, { key: 'dateIssued', label: 'Completion Date', type: 'date' }],
}
schemas.entrepreneurship = [{ key: 'businessIdea', label: 'Business Interest' }, { key: 'businessName', label: 'Proposed Business Name' }, { key: 'availableResources', label: 'Available Resources', type: 'textarea' }, { key: 'estimatedCapital', label: 'Available Capital (PHP)', type: 'number', min: 0 }, { key: 'assistanceNeeded', label: 'Assistance Needed', type: 'list', required: false }]
const labels = { skills: 'Skill', educationEntries: 'Education', experience: 'Experience', certifications: 'Certification' }

export function CareerProfile({ showMessage, tab }) {
  const store = useDemoStore(), profile = store.profiles['R-001']
  const [modal, setModal] = useState(null)
  const edit = (section, record) => setModal({ section, record: record ? structuredClone(record) : { id: uid('PROFILE'), level: section === 'skills' ? 'Beginner' : '', type: 'Employment' }, title: `${record ? 'Edit' : 'Add'} ${labels[section]}` })
  const close = () => setModal(null)
  const save = draft => {
    const next = structuredClone(profile)
    if (modal.section === 'entrepreneurship') next.entrepreneurship = { ...next.entrepreneurship, ...draft, interested: true }
    else if (['personal', 'career'].includes(modal.section)) Object.assign(next, draft)
    else {
      const rows = next[modal.section] || []
      if (modal.section === 'skills' && rows.some(r => r.id !== draft.id && r.name.toLowerCase() === draft.name.trim().toLowerCase())) throw new Error('This skill already exists. Edit the existing skill.')
      next[modal.section] = rows.some(r => r.id === draft.id) ? rows.map(r => r.id === draft.id ? draft : r) : [...rows, draft]
      if (modal.section === 'educationEntries') next.education = next.educationEntries[0] || {}
    }
    saveProfile(next); close(); showMessage('Changes saved across your connected profile views.')
  }
  
  // Determine which tab to show
  const showProfileSummary = !tab || tab === 'Profile Summary'
  
  // Profile Summary Tab
  if (showProfileSummary) {
    return (
      <>
        <Alert>Your current career profile is shared with relevant employer and LGU views.</Alert>
        
        <Panel title="Entrepreneurship Resources" action={<Button variant="secondary" onClick={() => setModal({ section: 'entrepreneurship', title: 'Edit Business Resources', record: profile.entrepreneurship || {} })}>Edit Business Resources</Button>}><div className="profile-section-body"><Facts items={[[ 'Interest', profile.entrepreneurship?.businessIdea], ['Resources', profile.entrepreneurship?.availableResources], ['Available Capital (PHP)', profile.entrepreneurship?.estimatedCapital]]} /></div></Panel>
        <Panel title="Profile Completion">
          <div className="profile-section-body">
            <ProgressBar value={profile.profileCompletion} label="Overall Completion" />
          </div>
        </Panel>
        
        <div className="lgu-grid">
          <Panel title="Personal Information" action={<Button variant="secondary" onClick={() => setModal({ section: 'personal', title: 'Edit Personal Information', record: Object.fromEntries(schemas.personal.map(f => [f.key, profile[f.key]])) })}>Edit Personal Information</Button>}>
            <div className="profile-section-body">
              <Facts items={schemas.personal.map(f => [f.label, profile[f.key]])} />
            </div>
          </Panel>
          
          <Panel title="Career Information" action={<Button variant="secondary" onClick={() => setModal({ section: 'career', title: 'Edit Career Information', record: Object.fromEntries(schemas.career.map(f => [f.key, profile[f.key]])) })}>Edit Career Information</Button>}>
            <div className="profile-section-body">
              <Facts items={schemas.career.map(f => [f.label, profile[f.key]])} />
            </div>
          </Panel>
        </div>
        
        {modal?.remove ? (
          <ConfirmationDialog 
            title={modal.title} 
            description="Remove this entry from your career profile?" 
            confirmLabel="Remove" 
            onClose={close} 
            onConfirm={() => { 
              const next = { ...profile, [modal.section]: profile[modal.section].filter(r => r.id !== modal.record.id) }
              if (modal.section === 'educationEntries') next.education = next.educationEntries[0] || {}
              saveProfile(next)
              close()
              showMessage('Entry removed.') 
            }} 
          />
        ) : modal?.view ? <Modal title={modal.title} onClose={close}><Facts items={schemas[modal.section].map(f => [f.label, modal.record[f.key]])} /></Modal> : modal && (
          <RecordEditor 
            key={`${modal.section}/${modal.record.id || ''}/${modal.view}`} 
            title={modal.title} 
            record={modal.record} 
            fields={schemas[modal.section]} 
            onClose={close} 
            onSave={save} 
            validate={draft => modal.section === 'experience' && draft.endDate && draft.endDate < draft.startDate ? { endDate: 'End date must follow start date.' } : {}} 
          />
        )}
      </>
    )
  }
  
  // Skills & Qualifications Tab
  // Skills & Qualifications Tab
  return (
    <>
      <Alert>Your current career profile is shared with relevant employer and LGU views.</Alert>
      
      {/* SKILLS SECTION - 4 COLUMN GRID */}
      <Panel title="Skills" action={<Button onClick={() => edit('skills')}>Add Skill</Button>}>
        <div className="profile-section-body">
          {!(profile.skills || []).length && <p className="muted">No skills added yet.</p>}
          {(profile.skills || []).length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '12px' 
            }}>
              {(profile.skills || []).map(skill => (
                <div key={skill.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '12px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px', color: '#111827' }}>{skill.name}</strong>
                    <Badge status="active">{skill.level}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => edit('skills', skill)} style={{ fontSize: '11px', padding: '4px 8px' }}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setModal({ remove: true, title: 'Remove Skill?', section: 'skills', record: skill })} style={{ fontSize: '11px', padding: '4px 8px' }}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
      
      {/* EDUCATION SECTION - 2 COLUMN GRID */}
      <Panel title="Education" action={<Button onClick={() => edit('educationEntries')}>Add Education</Button>}>
        <div className="profile-section-body">
          {!(profile.educationEntries || []).length && <p className="muted">No education entries yet.</p>}
          {(profile.educationEntries || []).length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '12px' 
            }}>
              {(profile.educationEntries || []).map(row => (
                <div key={row.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '14px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px', color: '#111827' }}>{row.course}</strong>
                    <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>{row.school}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0' }}>{row.level} • {row.yearCompleted}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => setModal({ view: true, title: 'Education Details', section: 'educationEntries', record: row })} style={{ fontSize: '11px', padding: '4px 8px' }}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => edit('educationEntries', row)} style={{ fontSize: '11px', padding: '4px 8px' }}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setModal({ remove: true, title: 'Remove Education?', section: 'educationEntries', record: row })} style={{ fontSize: '11px', padding: '4px 8px' }}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
      
      {/* EXPERIENCE SECTION - 2 COLUMN GRID */}
      <Panel title="Experience" action={<Button onClick={() => edit('experience')}>Add Experience</Button>}>
        <div className="profile-section-body">
          {!(profile.experience || []).length && <p className="muted">No experience entries yet.</p>}
          {(profile.experience || []).length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '12px' 
            }}>
              {(profile.experience || []).map(row => (
                <div key={row.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '14px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px', color: '#111827' }}>{row.position}</strong>
                    <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>{row.organization}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0' }}>{row.type} • {row.duration || `${row.startDate} - ${row.endDate || 'Present'}`}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => setModal({ view: true, title: 'Experience Details', section: 'experience', record: row })} style={{ fontSize: '11px', padding: '4px 8px' }}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => edit('experience', row)} style={{ fontSize: '11px', padding: '4px 8px' }}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setModal({ remove: true, title: 'Remove Experience?', section: 'experience', record: row })} style={{ fontSize: '11px', padding: '4px 8px' }}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
      
      {/* CERTIFICATIONS SECTION - 3 COLUMN GRID */}
      <Panel title="Certifications" action={<Button onClick={() => edit('certifications')}>Add Certification</Button>}>
        <div className="profile-section-body">
          {!(profile.certifications || []).length && <p className="muted">No certifications yet.</p>}
          {(profile.certifications || []).length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
              gap: '12px' 
            }}>
              {(profile.certifications || []).map(row => (
                <div key={row.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '14px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px', color: '#111827' }}>{row.name}</strong>
                    <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>{row.issuingOrganization}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0' }}>Issued: {row.dateIssued}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => setModal({ view: true, title: 'Certification Details', section: 'certifications', record: row })} style={{ fontSize: '11px', padding: '4px 8px' }}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => edit('certifications', row)} style={{ fontSize: '11px', padding: '4px 8px' }}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setModal({ remove: true, title: 'Remove Certification?', section: 'certifications', record: row })} style={{ fontSize: '11px', padding: '4px 8px' }}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
      
      {/* TRAINING RECORD SECTION - 2 COLUMN GRID */}
      <Panel title="Training Record">
        <div className="profile-section-body">
          {registrationsFor(store).filter(r => r.residentId === profile.id).length === 0 && (
            <p className="muted">No training registrations yet.</p>
          )}
          {registrationsFor(store).filter(r => r.residentId === profile.id).length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '12px' 
            }}>
              {registrationsFor(store).filter(r => r.residentId === profile.id).map(r => (
                <div key={r.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#111827' }}>{r.title}</strong>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{r.provider || 'Training Provider'}</p>
                  </div>
                  <Status value={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
      
      {modal?.remove ? (
        <ConfirmationDialog 
          title={modal.title} 
          description="Remove this entry from your career profile?" 
          confirmLabel="Remove" 
          onClose={close} 
          onConfirm={() => { 
            const next = { ...profile, [modal.section]: profile[modal.section].filter(r => r.id !== modal.record.id) }
            if (modal.section === 'educationEntries') next.education = next.educationEntries[0] || {}
            saveProfile(next)
            close()
            showMessage('Entry removed.') 
          }} 
        />
      ) : modal?.view ? <Modal title={modal.title} onClose={close}><Facts items={schemas[modal.section].map(f => [f.label, modal.record[f.key]])} /></Modal> : modal && (
        <RecordEditor 
          key={`${modal.section}/${modal.record.id || ''}/${modal.view}`} 
          title={modal.title} 
          record={modal.record} 
          fields={schemas[modal.section]} 
          onClose={close} 
          onSave={save} 
          validate={draft => modal.section === 'experience' && draft.endDate && draft.endDate < draft.startDate ? { endDate: 'End date must follow start date.' } : {}} 
        />
      )}
    </>
  )
}
