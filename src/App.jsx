import { useCallback, useEffect, useState } from 'react'
import { Notification } from './components/ui'
import { AppShell } from './components/Layout'
import { RoleSwitcher } from './pages/RoleSwitcher'
import { ResidentDashboard } from './pages/Resident'
import { EmployerDashboard } from './pages/Employer'
import { TrainingDashboard } from './pages/Training'
import { LGUDashboard } from './pages/LGU'

const readRoute = () => {
  const hash = window.location.hash.replace('#/', '')
  if (!hash || hash === 'login') return { role: null, page: 'login' }
  const [role, page] = hash.split('/')
  if (!['resident', 'employer', 'training', 'lgu'].includes(role)) return { role: null, page: 'login' }
  return { role, page: page || 'dashboard' }
}

export default function App() {
  const [route, setRoute] = useState(readRoute)
  const [currentRole, setCurrentRole] = useState(readRoute().role)
  const [menu, setMenu] = useState(false)
  const [message, setMessage] = useState('')
  
  const closeToast = useCallback(() => setMessage(''), [])
  
  useEffect(() => {
    const change = () => {
      const newRoute = readRoute()
      setRoute(newRoute)
      setCurrentRole(newRoute.role)
      setMenu(false)
    }
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])

  const navigate = (page) => {
    if (currentRole) {
      window.location.hash = `/${currentRole}/${page}`
    }
  }

  const switchRole = (role) => {
    window.location.hash = `/${role}/dashboard`
  }

  const showMessage = useCallback((msg) => setMessage(msg), [])

  // Role Switcher / Landing
  if (!currentRole) {
    return <RoleSwitcher onSelectRole={switchRole} />
  }

  // Main Application Shell
  return (
    <>
      <AppShell
        role={currentRole}
        page={route.page}
        menu={menu}
        onMenuToggle={() => setMenu(!menu)}
        onMenuClose={() => setMenu(false)}
        onNavigate={navigate}
        onSwitchRole={() => { window.location.hash = '/' }}
      >
        {currentRole === 'resident' && <ResidentDashboard page={route.page} navigate={navigate} showMessage={showMessage} />}
        {currentRole === 'employer' && <EmployerDashboard page={route.page} navigate={navigate} showMessage={showMessage} />}
        {currentRole === 'training' && <TrainingDashboard page={route.page} navigate={navigate} showMessage={showMessage} />}
        {currentRole === 'lgu' && <LGUDashboard page={route.page} navigate={navigate} showMessage={showMessage} />}
      </AppShell>
      
      {message && <Notification message={message} onClose={closeToast} />}
    </>
  )
}
