import { useState } from 'react'
import { ArrowUpRight, BarChart3, Download, Search } from 'lucide-react'
import { Badge, Button, DataTable, Field, Filter, Panel, SearchField, StatCard } from '../../components/ui'

import { format } from '../../data/lguFormat'
export function Status({ value }) {
  const good = ['Verified', 'Approved', 'Active', 'Paid', 'Published', 'Completed', 'Employed', 'Registered', 'Low']
  const bad = ['Rejected', 'Failed', 'High', 'Inactive', 'Expired']
  return <Badge status={good.includes(value) ? 'active' : bad.includes(value) ? 'rejected' : 'pending'}>{value}</Badge>
}
export function Metrics({ items }) {
  return <div className="stats-grid lgu-metrics">{items.map(([label, value, detail]) => <StatCard key={label} label={label} value={format(value)} detail={detail} />)}</div>
}
export function Bars({ title, description, items, suffix = '', action }) {
  const max = Math.max(...items.map(i => i[1]), 1)
  return <Panel title={title} description={description} action={action}><div className="lgu-bars">{items.map(([label, value]) => <div className="lgu-bar" key={label}><div><span>{label}</span><strong>{format(value)}{suffix}</strong></div><div className="lgu-bar-track"><span style={{ width: `${value / max * 100}%` }} /></div></div>)}</div></Panel>
}
export function Trend({ period }) {
  return <Panel title="Employment Placement Trend" description={`${period.label} · ${period.hired} tracked hires`}><div className="lgu-trend" role="img" aria-label={period.trend.map(([m, n]) => `${m}: ${n} hires`).join(', ')}>{period.trend.map(([label, count]) => <div key={label}><strong>{count}</strong><span style={{ height: `${count / Math.max(...period.trend.map(t => t[1])) * 130}px` }} /><small>{label}</small></div>)}</div></Panel>
}
export function Facts({ items }) {
  return <dl className="lgu-facts">{items.filter(([, value]) => value !== undefined).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{Array.isArray(value) ? value.join(', ') || 'None recorded' : format(value) || 'None recorded'}</dd></div>)}</dl>
}
export function RecordTable({ title, description = 'Representative records from the mock workforce snapshot.', rows, columns, filters = [], actions = [], searchKeys }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState({})
  const filtered = rows.filter(row => {
    const text = (searchKeys ? searchKeys.map(k => row[k]) : Object.values(row)).flat().join(' ').toLowerCase()
    return text.includes(search.toLowerCase()) && filters.every(f => !selected[f.key] || selected[f.key] === 'All' || (f.test ? f.test(row, selected[f.key]) : Array.isArray(row[f.key]) ? row[f.key].includes(selected[f.key]) : String(row[f.key]) === selected[f.key]))
  })
  const cols = columns.map(c => typeof c === 'string' ? { key: c, label: c } : c)
  if (actions.length) cols.push({ key: 'actions', label: 'Actions', render: row => <div className="lgu-row-actions">{actions.filter(a => !a.when || a.when(row)).map(a => <Button key={a.label} variant="secondary" disabled={a.disabled?.(row)} title={a.reason?.(row)} onClick={() => a.run(row)}>{a.label}</Button>)}</div> })
  return <Panel title={title} description={description}>
    <div className="lgu-toolbar"><SearchField value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} />{filters.map(f => <Field key={f.key} label={f.label}><Filter label={f.label} value={selected[f.key] || 'All'} onChange={e => setSelected({ ...selected, [f.key]: e.target.value })} options={['All', ...(f.options || [...new Set(rows.flatMap(r => r[f.key]).filter(v => v !== undefined))])]} /></Field>)}{(search || Object.values(selected).some(v => v !== 'All')) && <Button variant="ghost" onClick={() => { setSearch(''); setSelected({}) }}>Clear filters</Button>}</div>
    <DataTable columns={cols} rows={filtered} caption={title} totalRows={rows.length} />
  </Panel>
}
export function Flow({ steps }) {
  return <ol className="lgu-flow">{steps.map(([name, value], i) => <li key={name}><small>{String(i + 1).padStart(2, '0')}</small><span>{name}</span>{value !== undefined && <strong>{format(value)}</strong>}{i < steps.length - 1 && <ArrowUpRight size={16} />}</li>)}</ol>
}
export function SectionLink({ children, onClick }) { return <Button variant="ghost" onClick={onClick}>{children}<ArrowUpRight size={15} /></Button> }
export function ReportActions({ onView, onGenerate, onExport }) { return <div className="lgu-row-actions"><Button variant="secondary" onClick={onView}><Search size={15} />View Report</Button><Button onClick={onGenerate}><BarChart3 size={15} />Generate Mock Report</Button><Button variant="ghost" onClick={onExport}><Download size={15} />Export</Button></div> }
