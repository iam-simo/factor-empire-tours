import { useState } from 'react'

const STEPS = [
  { key: 'new', label: 'Request received', icon: 'fa-inbox', hint: 'We have your request and are checking availability.' },
  { key: 'confirmed', label: 'Confirmed', icon: 'fa-circle-check', hint: 'Your booking is confirmed. Our team will share the final details.' },
  { key: 'in_progress', label: 'On the road', icon: 'fa-road', hint: 'Your trip is under way. Safe travels!' },
  { key: 'completed', label: 'Completed', icon: 'fa-flag-checkered', hint: 'Trip completed. Thank you for travelling with Factor Empire.' },
]

const fmtDate = (s) => (s ? new Date(s.replace(' ', 'T') + (s.includes('T') ? '' : 'Z')).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '')

/* Customer portal: look up a booking with its reference + phone number */
export default function Portal({ navigate }) {
  const [ref, setRef] = useState(() => new URLSearchParams(window.location.search).get('ref') || '')
  const [phone, setPhone] = useState('')
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const lookup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setBooking(null)
    try {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(ref.trim())}&phone=${encodeURIComponent(phone.trim())}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Could not look up that booking.')
      setBooking(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = booking ? STEPS.findIndex((s) => s.key === booking.status) : -1
  const cancelled = booking?.status === 'cancelled'

  return (
    <div className="page">
      <header className="page__bar">
        <a href="/" className="nav__brand" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          <img src="/logo.jpeg" alt="" className="nav__logo" />
          <span className="nav__name">Factor Empire<small>Tours &amp; Car Hire</small></span>
        </a>
        <button className="btn btn--ghost" onClick={() => navigate('/')}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to site
        </button>
      </header>

      <main className="portal">
        <h1>Track your booking</h1>
        <p className="portal__lead">Enter the reference we gave you and the phone number you booked with.</p>

        <form className="portal__form" onSubmit={lookup}>
          <div className="field">
            <label htmlFor="p-ref">Booking reference</label>
            <input id="p-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="FE-ABC123" required autoCapitalize="characters" />
          </div>
          <div className="field">
            <label htmlFor="p-phone">Phone number</label>
            <input id="p-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 ..." required />
          </div>
          <button className="btn btn--gold" disabled={loading}>{loading ? 'Checking...' : 'Check status'}</button>
        </form>

        {error && <p className="form-error" role="alert">{error}</p>}

        {booking && (
          <section className="portal__card" aria-live="polite">
            <div className="portal__head">
              <div>
                <p className="ref-chip">{booking.reference}</p>
                <h2>{booking.item || (booking.kind === 'tour' ? 'Tour package' : 'Car hire')}</h2>
              </div>
              <span className={`pill pill--${booking.status}`}>
                {cancelled ? 'Cancelled' : STEPS[stepIndex]?.label}
              </span>
            </div>

            {cancelled ? (
              <p className="portal__note">This booking was cancelled. If that is a mistake, contact us and we will help right away.</p>
            ) : (
              <>
                <ol className="steps">
                  {STEPS.map((s, i) => (
                    <li key={s.key} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''}>
                      <span className="steps__dot"><i className={`fa-solid ${s.icon}`} aria-hidden="true" /></span>
                      <span className="steps__label">{s.label}</span>
                    </li>
                  ))}
                </ol>
                <p className="portal__note">{STEPS[stepIndex]?.hint}</p>
              </>
            )}

            <dl className="portal__details">
              <div><dt>Name</dt><dd>{booking.name}</dd></div>
              {booking.pickup && <div><dt>Pick-up</dt><dd>{booking.pickup}</dd></div>}
              {booking.pick_date && <div><dt>{booking.kind === 'tour' ? 'Travel date' : 'Pick-up date'}</dt><dd>{booking.pick_date}</dd></div>}
              {booking.drop_date && <div><dt>Drop-off date</dt><dd>{booking.drop_date}</dd></div>}
              <div><dt>Requested</dt><dd>{fmtDate(booking.created_at)}</dd></div>
              <div><dt>Last update</dt><dd>{fmtDate(booking.updated_at)}</dd></div>
            </dl>
          </section>
        )}
      </main>
    </div>
  )
}
