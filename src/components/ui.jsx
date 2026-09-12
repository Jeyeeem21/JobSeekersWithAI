import { useEffect, useId, useRef, useState } from 'react'
import { X, Search, Inbox, CheckCircle2, AlertCircle, Info } from 'lucide-react'

// Buttons
export function Button({ children, variant = 'primary', className = '', ...props }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>
}

// Badges
export function Badge({ status, children }) {
  const displayText = children || status
  return (
    <span className={`badge badge-${status?.toLowerCase() || 'default'}`}>
      <span />
      {displayText}
    </span>
  )
}

// Page Title
export function PageTitle({ eyebrow, title, description, children }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  )
}

// Stat Card
export function StatCard({ icon, label, value, detail, trend, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-top">
        <span>{label}</span>
        {icon && <span className="icon-tile">{icon}</span>}
      </div>
      <div className="stat-value">
        {value}
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
      {detail && <p>{detail}</p>}
    </div>
  )
}

// Panel/Card
export function Panel({ title, description, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || description || action) && (
        <div className="panel-heading">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

// Form Field
export function Field({ label, children, hint, error }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

// Search Field
export function SearchField({ value, onChange, placeholder = 'Search...' }) {
  return (
    <label className="search-field">
      <Search size={18} />
      <input 
        aria-label={placeholder} 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
      />
    </label>
  )
}

// Filter/Select
export function Filter({ label, value, onChange, options }) {
  return (
    <select aria-label={label} value={value} onChange={onChange}>
      {options.map(option => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
}

// Empty State
export function EmptyState({ icon, title = 'No items found', description = 'Try a different search or filter.' }) {
  const Icon = icon || Inbox
  return (
    <div className="empty-state">
      <Icon size={32} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

// Data Table with Sorting and Pagination
export function DataTable({ columns, rows, caption, pageSize = 5, totalRows }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  
  // Sorting logic
  const sortedRows = [...rows].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    
    // Handle null/undefined
    if (aVal == null) return 1
    if (bVal == null) return -1
    
    // Compare values
    if (typeof aVal === 'string') {
      return sortConfig.direction === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal)
    }
    
    return sortConfig.direction === 'asc' 
      ? aVal > bVal ? 1 : -1
      : bVal > aVal ? 1 : -1
  })
  
  // Pagination logic
  const totalPages = Math.ceil(sortedRows.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRows = sortedRows.slice(startIndex, endIndex)
  
  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1) // Reset to first page when sorting
  }
  
  // Handle page change
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  
  return rows.length ? (
    <>
      <div className="table-scroll">
        <table>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map(c => (
                <th 
                  key={c.key} 
                  scope="col"
                  onClick={() => c.key !== 'actions' && handleSort(c.key)}
                  style={{ 
                    cursor: c.key !== 'actions' ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {c.label}
                    {c.key !== 'actions' && sortConfig.key === c.key && (
                      <span style={{ fontSize: '10px' }}>
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, rowIndex) => (
              <tr key={row.id || `row-${startIndex + rowIndex}`}>
                {columns.map(c => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Info and Pagination Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 22px',
        borderTop: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {totalPages > 1 ? (
            <>Showing {startIndex + 1}-{Math.min(endIndex, sortedRows.length)} of {sortedRows.length}</>
          ) : (
            <>{sortedRows.length} {totalRows ? `of ${totalRows} demonstration records` : 'records'}</>
          )}
        </div>
        
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              First
            </button>
            
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            
            <span style={{ 
              padding: '0 12px', 
              fontSize: '12px',
              color: '#374151',
              fontWeight: 500
            }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
            
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Last
            </button>
          </div>
        )}
      </div>
    </>
  ) : (
    <EmptyState />
  )
}

// Progress Bar
export function ProgressBar({ value, max = 100, label, className = '' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`progress-container ${className}`}>
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="progress-value">{Math.round(percentage)}%</div>
    </div>
  )
}

// Alert/Notice
export function Alert({ type = 'info', children, className = '' }) {
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: AlertCircle
  }
  const Icon = icons[type]
  
  return (
    <div className={`notice notice-${type} ${className}`}>
      <Icon size={16} />
      <div>{children}</div>
    </div>
  )
}

// Modal
export function Modal({ title, description, children, onClose, size = 'md', dismissible = true }) {
  const ref = useRef(null)
  const id = useId()

  useEffect(() => {
    const previous = document.activeElement
    const dialog = ref.current
    dialog.showModal()
    return () => {
      dialog.close()
      previous?.focus()
    }
  }, [])

  return (
    <dialog 
      ref={ref} 
      aria-labelledby={id} 
      onCancel={e => { e.preventDefault(); if (dismissible) onClose() }}
      onClick={e => { if (dismissible && e.target === ref.current) onClose() }}
      className={`modal-${size}`}
    >
      <div className="modal-inner">
        <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
        
        {title && (
          <>
            <h2 id={id}>{title}</h2>
          </>
        )}
        
        {description && <p className="modal-description">{description}</p>}
        
        {children}
      </div>
    </dialog>
  )
}

// Confirmation Dialog
export function ConfirmationDialog({ title, description, confirmLabel, onConfirm, onClose, variant = 'danger' }) {
  return (
    <Modal title={title} description={description} onClose={onClose} size="sm" dismissible={false}>
      <Alert type="info">
        This updates the prototype demonstration only. No live services will be affected.
      </Alert>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

// Toast Notification
export function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500)
    return () => clearTimeout(timer)
  }, [message, onClose])

  return (
    <div className={`toast toast-${type}`} role="status">
      <CheckCircle2 size={20} />
      <span>{message}</span>
      <button className="icon-button" aria-label="Dismiss notification" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  )
}

// Recommendation Card (for jobs, training, etc.)
export function RecommendationCard({ title, subtitle, match, tags, actions, children }) {
  return (
    <div className="recommendation-card">
      <div className="recommendation-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="recommendation-subtitle">{subtitle}</p>}
        </div>
        {match && (
          <div className="match-score">
            <span className="match-value">{match}%</span>
            <span className="match-label">Match</span>
          </div>
        )}
      </div>
      
      {children && <div className="recommendation-body">{children}</div>}
      
      {tags && tags.length > 0 && (
        <div className="recommendation-tags">
          {tags.map((tag, i) => <Badge key={i} status="default">{tag}</Badge>)}
        </div>
      )}
      
      {actions && <div className="recommendation-actions">{actions}</div>}
    </div>
  )
}

// Tabs
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`tab ${active === tab.id ? 'tab-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
          {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}
