import { User, Building, GraduationCap, MapPin, ArrowRight, Sparkles } from 'lucide-react'
import { Brand } from '../components/Layout'

const roles = [
  {
    id: 'resident',
    icon: User,
    title: 'Resident / Fisheries Job Seeker',
    description: 'Find fisheries jobs, develop fisheries skills, and explore livelihoods',
    features: ['Explainable Job Matching', 'Fisheries Assessment', 'Training Recommendations', 'Livelihood Guidance'],
    color: 'teal'
  },
  {
    id: 'employer',
    icon: Building,
    title: 'Fisheries Employer / Business',
    description: 'Post fisheries jobs, find qualified workers, and manage hiring',
    features: ['Subscription Publishing', 'Candidate Matching', 'Applicant Management', 'Fisheries Analytics'],
    color: 'blue'
  },
  {
    id: 'training',
    icon: GraduationCap,
    title: 'Private Training Agency',
    description: 'Offer training programs, reach learners, track completions',
    features: ['Training Listings', 'Participant Management', 'Completion Tracking', 'Analytics'],
    color: 'purple'
  },
  {
    id: 'lgu',
    icon: MapPin,
    title: 'LGU Administrator / Staff',
    description: 'Oversee workforce ecosystem, verify participants, access insights',
    features: ['Workforce Analytics', 'Verification Management', 'Transaction Oversight', 'Prescriptive Insights'],
    color: 'green'
  }
]

export function RoleSwitcher({ onSelectRole }) {
  return (
    <div className="role-switcher-page">
      <div className="role-switcher-content">
        <div className="role-switcher-header">
          <Brand />
          
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>AI-Powered Workforce Ecosystem</span>
            </div>
            
            <h1>
              Connecting <span className="highlight">Fisheries Opportunities</span> with <span className="highlight">Local Talent</span>
            </h1>
            
            <p className="hero-description">
              EntretifAI brings together residents, employers, training agencies, and local government
              to strengthen fisheries employment, skills development, livelihoods, and data-informed LGU action.
            </p>
          </div>

          <div className="ecosystem-diagram">
            <div className="ecosystem-node">Fisheries Job Seekers</div>
            <div className="ecosystem-connector">↔</div>
            <div className="ecosystem-node">Employers</div>
            <div className="ecosystem-connector">↔</div>
            <div className="ecosystem-node">Training</div>
            <div className="ecosystem-connector">↔</div>
            <div className="ecosystem-node">LGU</div>
          </div>
        </div>

        <div className="role-switcher-label">
          <span>SELECT A ROLE TO EXPLORE</span>
          <span className="demo-indicator">Interactive Demo · Phase 1</span>
        </div>

        <div className="role-grid">
          {roles.map(role => (
            <button
              key={role.id}
              className={`role-option role-${role.color}`}
              onClick={() => onSelectRole(role.id)}
            >
              <div className="role-icon">
                <role.icon size={24} />
              </div>
              
              <div className="role-content">
                <h2>{role.title}</h2>
                <p>{role.description}</p>
                
                <ul className="role-features">
                  {role.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="role-action">
                <span>Explore Portal</span>
                <ArrowRight size={16} />
              </div>
            </button>
          ))}
        </div>

        <div className="role-switcher-footer">
          <div className="footer-note">
            <p><strong>About this prototype:</strong> This is a Phase 1 frontend demonstration with realistic mock data.
            All interactions are simulated for presentation purposes.</p>
          </div>
          
          <div className="footer-info">
            <span>© 2026 EntretifAI</span>
            <span>·</span>
            <span>Empowering local possibilities</span>
          </div>
        </div>
      </div>
    </div>
  )
}
