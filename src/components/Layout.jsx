import { useDemoStore, setNotifications } from '../data/demoStore'
import { 
  LayoutDashboard, User, FileText, Briefcase, GraduationCap, Sprout, 
  FileCheck, Building2, TrendingUp, Bell, ChevronRight, 
  Menu, X, Users, Building, Calendar, BarChart3, Settings, DollarSign,
  Target, MapPin, ShieldCheck, LogOut, CheckCircle2
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Navigation configurations for each role
const navigationConfig = {
  resident: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Fisheries Profile', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'training', label: 'Skills Development', icon: GraduationCap },
    { id: 'entrepreneurship', label: 'Fisheries Entrepreneurship', icon: Sprout },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ],
  employer: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'company', label: 'Fisheries Business & Verification', icon: Building },
    { id: 'vacancies', label: 'Fisheries Job Vacancies', icon: Briefcase },
    { id: 'matches', label: 'Candidate Matches', icon: Target },
    { id: 'applicants', label: 'Applicants', icon: FileCheck },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions & Partnerships', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ],
  training: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Agency Profile & Verification', icon: Building },
    { id: 'programs', label: 'Training Programs', icon: GraduationCap },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'completion', label: 'Training Completion', icon: FileCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions & Partnerships', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ],
  lgu: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'people', label: 'Fisheries People & Organizations', icon: Users },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'employment', label: 'Employment', icon: FileCheck },
    { id: 'entrepreneurship', label: 'Entrepreneurship', icon: Sprout },
    { id: 'partnerships', label: 'Transactions & Partnerships', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]
}

const roleLabels = {
  resident: 'Fisheries Job Seeker Portal',
  employer: 'Fisheries Employer Portal',
  training: 'Private Training Agency',
  lgu: 'LGU Administrator'
}

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <MapPin size={20} />
      </span>
      <div>
        Entretif<span className="brand-ai">AI</span>
        <small>WORKFORCE ECOSYSTEM</small>
      </div>
    </div>
  )
}

export function Sidebar({ role, page, open, onClose, onNavigate, onSwitchRole }) {
  const navigation = navigationConfig[role] || []
  
  return (
    <>
      {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <Brand />
        <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation">
          <X />
        </button>

        <div className="workspace-label">{roleLabels[role]}</div>

        <nav aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); onClose() }}
              className={page.split('?')[0] === id ? 'nav-link active' : 'nav-link'}
              aria-current={page.split('?')[0] === id ? 'page' : undefined}
            >
              <Icon size={18} />
              {label}
              {page.split('?')[0] === id && <ChevronRight size={16} className="nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="scope-card">
            <ShieldCheck size={16} />
            <h3>Frontend Prototype</h3>
            <p>{role === 'lgu' ? 'Phase 2 LGU workforce demonstration.' : role === 'training' ? 'Phase 4 Training Agency demonstration.' : 'Phase 1 demonstration with mock data and realistic interactions.'}</p>
            <span><i />Demo Mode</span>
          </div>

          <button className="signout" onClick={onSwitchRole}>
            <LogOut size={17} />
            Switch Role
          </button>
        </div>
      </aside>
    </>
  )
}

export function Header({ role, page, onMenuToggle, onNavigate }) {
  const navigation = navigationConfig[role] || []
  const currentPage = navigation.find(n => n.id === page.split('?')[0])
  const [showNotifications, setShowNotifications] = useState(false)
  const shared = useDemoStore()
  const notifList = shared.notifications[role] || []
  const setNotifList = next => setNotifications(role, next)
  const [filter, setFilter] = useState('all')
  const notificationRef = useRef(null)
  useEffect(() => {
    if (!showNotifications) return
    const previous = document.activeElement
    const dialog = notificationRef.current
    dialog.showModal()
    return () => { dialog.close(); previous?.focus() }
  }, [showNotifications])
const unreadCount = notifList.filter(n => !n.read).length
  
  const filteredNotifs = filter === 'all'
    ? notifList
    : filter === 'unread'
    ? notifList.filter(n => !n.read)
    : notifList.filter(n => n.type === filter)
  
  const markAsRead = (id) => {
    setNotifList(notifList.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifList(notifList.map(n => ({ ...n, read: true })))
  }
  
  return (
    <>
      <header className="header">
        <div className="breadcrumb">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenuToggle}>
            <Menu />
          </button>
          <span>{roleLabels[role]}</span>
          <ChevronRight size={14} />
          <strong>{currentPage?.label || 'Dashboard'}</strong>
        </div>

        <div className="header-right">
          <button 
            className="notification-bell-btn" 
            onClick={() => setShowNotifications(true)}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          <span className="demo-pill">
            <span />
            Demo Mode
          </span>
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifications && (
        <>
          <dialog 
            ref={notificationRef} 
            className="notifications-modal" 
            aria-label="Notifications" 
            onCancel={(e) => { e.preventDefault(); setShowNotifications(false) }}
            onClick={(e) => { 
              // Only close if clicking directly on the dialog backdrop (not on modal content)
              if (e.target === notificationRef.current) setShowNotifications(false) 
            }}
          >
            <div className="notifications-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="notifications-modal-header">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2>Notifications</h2>
                  <p className="muted" style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    {role === 'lgu' ? 'Verification, workforce insights, and local opportunities' : role === 'employer' ? 'Stay updated with job matches, applications, and payments' : role === 'training' ? 'Participant registrations, completions, and verification updates' : 'Stay updated with job matches, applications, and training'}
                  </p>
                </div>
                <div className="notifications-modal-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={markAllAsRead}
                    style={{ fontSize: '11px', padding: '5px 8px', whiteSpace: 'nowrap' }}
                  >
                    <CheckCircle2 size={13} />
                    Mark All Read
                  </button>
                  <button 
                    className="icon-button" 
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="notifications-filters">
                <button 
                  className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('all')}
                >
                  All ({notifList.length})
                </button>
                <button 
                  className={filter === 'unread' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('unread')}
                >
                  Unread ({notifList.filter(n => !n.read).length})
                </button>
                <button 
                  className={filter === (role === 'lgu' || role === 'employer' ? 'job_match' : 'job_match') ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('job_match')}
                >
                  {role === 'lgu' ? 'Vacancies' : role === 'employer' ? 'Matches' : role === 'training' ? 'Programs' : 'Job Matches'}
                </button>
                <button 
                  className={filter === (role === 'lgu' ? 'verification' : role === 'training' ? 'verification' : 'application') ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter(role === 'lgu' ? 'verification' : role === 'training' ? 'verification' : 'application')}
                >
                  {role === 'lgu' ? 'Verification' : role === 'employer' ? 'Applications' : role === 'training' ? 'Verification' : 'Applications'}
                </button>
                <button 
                  className={filter === 'training' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('training')}
                >
                  Training
                </button>
              </div>

              <div className="notifications-list">
                {filteredNotifs.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click() } }}
                    onClick={(e) => {
                      // Prevent closing the modal
                      e.stopPropagation()
                      if (!notif.read) markAsRead(notif.id)
                      if (notif.link && onNavigate) {
                        const page = notif.link.split('/').pop()
                        onNavigate(page)
                        setShowNotifications(false)
                      }
                    }}
                  >
                    <div className="notification-icon">
                      {notif.type === 'job_match' && <Briefcase size={20} />}
                      {notif.type === 'application' && <FileText size={20} />}
                      {notif.type === 'training' && <GraduationCap size={20} />}
                      {notif.type === 'training_progress' && <TrendingUp size={20} />}
                      {notif.type === 'profile' && <User size={20} />}
                      {notif.type === 'verification' && <ShieldCheck size={20} />}
                      {notif.type === 'business' && <Building2 size={20} />}
                      {notif.type === 'insight' && <Target size={20} />}
                      {notif.type === 'interview' && <Calendar size={20} />}
                      {notif.type === 'payment' && <DollarSign size={20} />}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <strong>{notif.title}</strong>
                        {!notif.read && <span className="notification-unread-dot" />}
                      </div>
                      <p>{notif.message}</p>
                      <span className="notification-date">{notif.date}</span>
                      {!notif.read && (
                        <button 
                          className="btn btn-ghost notification-mark-read" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            markAsRead(notif.id) 
                          }} 
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>

              {filteredNotifs.length === 0 && (
                <div className="notifications-empty">
                  <CheckCircle2 size={40} />
                  <h3>No notifications</h3>
                  <p>You're all caught up!</p>
                </div>
              )}
            </div>
          </dialog>
        </>
      )}
    </>
  )
}

export function AppShell({ role, page, menu, onMenuToggle, onMenuClose, onNavigate, onSwitchRole, children }) {
  return (
    <div className="app-shell">
      <a 
        className="skip-link" 
        href="#main-content" 
        onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus() }}
      >
        Skip to content
      </a>
      
      <Sidebar 
        role={role}
        page={page}
        open={menu}
        onClose={onMenuClose}
        onNavigate={onNavigate}
        onSwitchRole={onSwitchRole}
      />
      
      <div className="main-shell">
        <Header key={role} role={role} page={page} onMenuToggle={onMenuToggle} onNavigate={onNavigate} />
        
        <main id="main-content" tabIndex={-1}>
          {children}
          
          <footer className="app-footer">
            <span>© 2026 EntretifAI. Empowering local possibilities.</span>
            <span>
              <span className="footer-dot" />
              Frontend prototype · {role === 'lgu' ? 'Phase 2' : 'Phase 1'}
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}
