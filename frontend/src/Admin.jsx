import { useCallback, useEffect, useMemo, useState } from 'react'

const STATUSES = [
  { key: 'new', label: 'New' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]
const statusLabel = (k) => STATUSES.find((s) => s.key === k)?.label || k
const fmt = (s) => (s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '')
const digitsOnly = (s) => (s || '').replace(/\D/g, '')

/* ------------------------------ login ------------------------------ */
function Login({ onLogin, navigate }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Could not sign in.')
      onLogin(data.token)
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Cannot reach the server. Is the backend running?' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page--center">
      <form className="login" onSubmit={submit}>
        <img src="/logo.jpeg" alt="Factor Empire" className="login__logo" />
        <h1>Staff sign in</h1>
        <div className="field">
          <label htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus autoComplete="current-password" />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn--gold" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        <button type="button" className="link-gold link-button" onClick={() => navigate('/')}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to site
        </button>
      </form>
    </div>
  )
}

/* ------------------------------ one enquiry row ------------------------------ */
function Row({ item, open, onToggle, onSave, onDelete }) {
  const [status, setStatus] = useState(item.status)
  const [notes, setNotes] = useState(item.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const dirty = status !== item.status || notes !== (item.admin_notes || '')

  const save = async () => {
    setSaving(true)
    await onSave(item.id, { status, admin_notes: notes })
    setSaving(false)
  }

  const wa = `https://wa.me/${digitsOnly(item.phone)}?text=${encodeURIComponent(`Hello ${item.name}, this is Factor Empire about your booking ${item.reference}.`)}`

  return (
    <li className={`arow ${open ? 'is-open' : ''}`}>
      <button className="arow__summary" onClick={onToggle} aria-expanded={open}>
        <span className="arow__ref">{item.reference}</span>
        <span className="arow__who"><strong>{item.name}</strong><small>{item.kind === 'tour' ? 'Tour' : 'Car hire'} · {item.item || 'Not specified'}</small></span>
        <span className="arow__when">{fmt(item.created_at)}</span>
        <span className={`pill pill--${item.status}`}>{statusLabel(item.status)}</span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="arow__body">
          <dl className="portal__details">
            <div><dt>Phone</dt><dd><a href={`tel:${item.phone}`}>{item.phone}</a></dd></div>
            {item.email && <div><dt>Email</dt><dd><a href={`mailto:${item.email}`}>{item.email}</a></dd></div>}
            {item.pickup && <div><dt>Pick-up</dt><dd>{item.pickup}</dd></div>}
            {item.pick_date && <div><dt>{item.kind === 'tour' ? 'Travel date' : 'From'}</dt><dd>{item.pick_date}</dd></div>}
            {item.drop_date && <div><dt>To</dt><dd>{item.drop_date}</dd></div>}
            {item.notes && <div className="wide"><dt>Customer notes</dt><dd>{item.notes}</dd></div>}
          </dl>

          <div className="arow__edit">
            <div className="field">
              <label htmlFor={`st-${item.id}`}>Status</label>
              <select id={`st-${item.id}`} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className="field field--grow">
              <label htmlFor={`nt-${item.id}`}>Internal notes</label>
              <textarea id={`nt-${item.id}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Driver, price quoted, vehicle plate..." />
            </div>
          </div>

          <div className="arow__actions">
            <button className="btn btn--gold" onClick={save} disabled={!dirty || saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            <a className="btn btn--ghost" href={wa} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp" aria-hidden="true" /> WhatsApp</a>
            <button className="btn btn--danger" onClick={() => onDelete(item)}><i className="fa-solid fa-trash" aria-hidden="true" /> Delete</button>
          </div>
        </div>
      )}
    </li>
  )
}

/* ------------------------------ dashboard ------------------------------ */
export default function Admin({ auth, onLogin, onLogout, navigate }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)
  const [q, setQ] = useState('')
  const [fStatus, setFStatus] = useState('all')
  const [fKind, setFKind] = useState('all')

  const request = useCallback(async (url, options = {}) => {
    const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}`, ...options.headers } })
    if (res.status === 401) { onLogout(); throw new Error('Session expired. Please sign in again.') }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Request failed.')
    return data
  }, [auth, onLogout])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await request('/api/admin/enquiries'))
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Cannot reach the server. Is the backend running?' : err.message)
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => { if (auth) load() }, [auth, load])

  const save = async (id, patch) => {
    try {
      const updated = await request(`/api/admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      setItems((list) => list.map((x) => (x.id === id ? updated : x)))
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.reference} (${item.name})? This cannot be undone.`)) return
    try {
      await request(`/api/admin/enquiries/${item.id}`, { method: 'DELETE' })
      setItems((list) => list.filter((x) => x.id !== item.id))
    } catch (err) {
      setError(err.message)
    }
  }

  const counts = useMemo(() => {
    const c = { total: items.length, car: 0, tour: 0 }
    STATUSES.forEach((s) => { c[s.key] = 0 })
    items.forEach((i) => { c[i.status] += 1; c[i.kind] += 1 })
    return c
  }, [items])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((i) =>
      (fStatus === 'all' || i.status === fStatus) &&
      (fKind === 'all' || i.kind === fKind) &&
      (!needle || [i.reference, i.name, i.phone, i.email, i.item, i.pickup].join(' ').toLowerCase().includes(needle)),
    )
  }, [items, q, fStatus, fKind])

  if (!auth) return <Login onLogin={onLogin} navigate={navigate} />

  return (
    <div className="page">
      <header className="page__bar">
        <div className="nav__brand">
          <img src="/logo.jpeg" alt="" className="nav__logo" />
          <span className="nav__name">Admin dashboard<small>Factor Empire Tours &amp; Car Hire</small></span>
        </div>
        <div className="page__bar-actions">
          <button className="btn btn--ghost" onClick={() => navigate('/')}>View site</button>
          <button className="btn btn--gold" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <main className="admin">
        <section className="stats" aria-label="Summary">
          <div className="stat"><strong>{counts.total}</strong><span>All requests</span></div>
          <div className="stat stat--new"><strong>{counts.new}</strong><span>New</span></div>
          <div className="stat"><strong>{counts.confirmed + counts.in_progress}</strong><span>Confirmed / on road</span></div>
          <div className="stat"><strong>{counts.completed}</strong><span>Completed</span></div>
          <div className="stat"><strong>{counts.car} / {counts.tour}</strong><span>Car hire / tours</span></div>
        </section>

        <div className="toolbar">
          <div className="field field--grow">
            <label htmlFor="a-q">Search</label>
            <input id="a-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone, reference..." />
          </div>
          <div className="field">
            <label htmlFor="a-status">Status</label>
            <select id="a-status" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="a-kind">Type</label>
            <select id="a-kind" value={fKind} onChange={(e) => setFKind(e.target.value)}>
              <option value="all">Car hire &amp; tours</option>
              <option value="car">Car hire</option>
              <option value="tour">Tours</option>
            </select>
          </div>
          <button className="btn btn--ghost" onClick={load} disabled={loading}>
            <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`} aria-hidden="true" /> Refresh
          </button>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        {shown.length === 0 && !loading ? (
          <p className="empty">{items.length === 0 ? 'No requests yet. New bookings from the website will appear here.' : 'No requests match these filters.'}</p>
        ) : (
          <ul className="alist">
            {shown.map((item) => (
              <Row
                key={`${item.id}-${item.updated_at}`}
                item={item}
                open={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                onSave={save}
                onDelete={remove}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
