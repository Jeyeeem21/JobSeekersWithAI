import { User, Building, GraduationCap, MapPin, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { Brand } from '../components/Layout'

const roles = [
  {
    id: 'resident',
    icon: User,
    title: 'Resident / Job Seeker',
    description: 'Find jobs, develop skills, explore entrepreneurship opportunities',
    features: ['AI Job Matching', 'Skills Assessment', 'Training Recommendations', 'Career Guidance'],
    color: 'teal'
  },
  {
    id: 'employer',
    icon: Building,
    title: 'Employer / Business',
    description: 'Post jobs, find qualified candidates, manage hiring process',
    features: ['Job Posting', 'Candidate Matching', 'Applicant Management', 'Hiring Analytics'],
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
              Connecting <span className="highlight">Opportunities</span> with <span className="highlight">Local Talent</span>
            </h1>
            
            <p className="hero-description">
              EntritifAI brings together residents, employers, training agencies, and local government
              to create a thriving community through intelligent matching, skills development, and data-driven insights.
            </p>
          </div>

          <div className="ecosystem-diagram">
            <div className="ecosystem-node">Residents</div>
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
            <span>© 2025 EntritifAI</span>
            <span>·</span>
            <span>Empowering local possibilities</span>
          </div>
        </div>
      </div>
    </div>
  )
}
