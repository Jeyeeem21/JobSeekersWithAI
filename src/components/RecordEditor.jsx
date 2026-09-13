import { useState } from 'react'
import { Button, Field, Modal } from './ui'

// Compact form behavior built on the existing dialog and fields.
export function RecordEditor({ title, record, fields, onSave, onClose, saveLabel = 'Save Changes', validate }) {
  const [draft, setDraft] = useState(() => structuredClone(record))
  const [errors, setErrors] = useState({})
  const get = key => key.split('.').reduce((value, part) => value?.[part], draft)
  const change = (key, value) => setDraft(current => {
    const next = structuredClone(current)
    const parts = key.split('.'), last = parts.pop()
    const target = parts.reduce((obj, part) => (obj[part] ||= {}), next)
    target[last] = value
    return next
  })
  const submit = e => {
    e.preventDefault()
    const issues = {}
    for (const f of fields) {
      const value = get(f.key)
      if (f.required !== false && (value === undefined || value === null || String(value).trim() === '' || Array.isArray(value) && !value.length)) issues[f.key] = `${f.label} is required.`
      else if (f.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < (f.min ?? 0) || f.integer && !Number.isInteger(Number(value)))) issues[f.key] = `Enter ${f.integer ? 'a whole number' : 'a number'} of at least ${f.min ?? 0}.`
      else if (f.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) issues[f.key] = 'Enter a valid email address.'
      else if (f.type === 'date' && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) issues[f.key] = 'Enter a valid date.'
    }
    Object.assign(issues, validate?.(draft) || {})
    setErrors(issues)
    if (Object.keys(issues).length) return
    const normalized = structuredClone(draft)
    fields.filter(f => f.type === 'list').forEach(f => { const parts = f.key.split('.'); const last = parts.pop(); const target = parts.reduce((obj, key) => obj[key], normalized); target[last] = (Array.isArray(target[last]) ? target[last] : String(target[last] || '').split(',')).map(v => String(v).trim()).filter(Boolean) })
    try { onSave(normalized) } catch (error) { setErrors({ form: error.message }) }
  }
  return <Modal title={title} size="md" onClose={onClose}><form className="compact-form" onSubmit={submit} noValidate><div className="compact-form-grid">{fields.map(f => {
    const value = get(f.key)
    const props = { 'aria-label': f.label, value: f.type === 'list' ? (Array.isArray(value) ? value.join(', ') : value || '') : value ?? '', onChange: e => change(f.key, f.type === 'number' ? e.target.value === '' ? '' : Number(e.target.value) : e.target.value), 'aria-invalid': !!errors[f.key] }
    return <div key={f.key} className={f.wide ? 'compact-form-wide' : ''}><Field label={f.label} error={errors[f.key]} hint={f.hint}>{f.options ? <select {...props}>{f.options.map(o => <option key={o}>{o}</option>)}</select> : f.type === 'textarea' ? <textarea {...props} rows={3} /> : <input {...props} type={f.type === 'list' ? 'text' : f.type || 'text'} min={f.min} step={f.integer ? 1 : undefined} />}</Field></div>
  })}</div>{errors.form && <p className="field-error" role="alert">{errors.form}</p>}<div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">{saveLabel}</Button></div></form></Modal>
}
