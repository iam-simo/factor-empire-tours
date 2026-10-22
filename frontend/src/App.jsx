import { useCallback, useEffect, useState } from 'react'
import Portal from './Portal.jsx'
import Admin from './Admin.jsx'

/* ------------------------------------------------------------------
   Contact details come from frontend/.env (VITE_WHATSAPP, VITE_PHONE ...)
   Images: public/logo.jpeg and public/founder.jpeg
   ------------------------------------------------------------------ */
const env = import.meta.env
const CONTACT = {
  whatsapp: env.VITE_WHATSAPP || '254700000000',
  phoneDisplay: env.VITE_PHONE || '+254 700 000 000',
  email: env.VITE_EMAIL || 'bookings@factorempire.com',
  address: env.VITE_ADDRESS || 'Your city, Country',
}

const IMAGES = {
  logo: '/logo.jpeg',
  founder: '/founder.jpeg',
  hero: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80',
}

const NAV = [
  { label: 'Home', href: '/#home' },
  { label: 'Car Hire', href: '/#car-hire' },
  { label: 'Tours', href: '/#tours' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

const VEHICLES = [
  { icon: 'fa-car-side', title: 'Saloon Cars', text: 'Comfort & Style', blurb: 'Smooth, efficient and polished for city trips, business and weekends away.' },
  { icon: 'fa-truck-monster', title: 'SUVs', text: 'For Every Terrain', blurb: 'Land Cruisers and Prados built for safari tracks, coastal roads and long highways.' },
  { icon: 'fa-van-shuttle', title: 'Vans', text: 'Group Travel', blurb: 'Roomy, air-conditioned vans for families, friends and small corporate teams.' },
  { icon: 'fa-bus', title: 'Buses', text: 'Large Groups', blurb: 'Coaches for weddings, school trips, events and big-group tours.' },
  { icon: 'fa-user-tie', title: 'Chauffeur Services', text: 'Professional Drivers', blurb: 'Courteous, experienced drivers who know the route and keep you on time.' },
]

const TRUST = [
  { icon: 'fa-clock', title: '24/7 Availability', text: 'Day or night, we pick up the phone and the keys are ready.' },
  { icon: 'fa-calendar-days', title: 'Flexible Rental Periods', text: 'Hire by the hour, day, week or month. You choose the length.' },
  { icon: 'fa-tags', title: 'Competitive Rates', text: 'Clear, fair pricing with no surprises when you return the vehicle.' },
  { icon: 'fa-screwdriver-wrench', title: 'Well-Maintained Vehicles', text: 'Every vehicle is serviced and inspected before it reaches you.' },
  { icon: 'fa-plane-arrival', title: 'Airport Transfers', text: 'We track your flight and meet you at arrivals, even when you land late.' },
]

const TOURS = [
  { title: 'Beach Getaways', tag: 'Sun, sand and slow mornings', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { title: 'City Escapes', tag: 'Skylines, food and nightlife', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Adventure Trips', tag: 'Mountains, lakes and trails', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { title: 'Luxury Holidays', tag: 'Overwater villas and private transfers', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80' },
  { title: 'Safari Tours', tag: 'Big game at golden hour', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80' },
]

const SOCIALS = [
  { icon: 'fa-facebook-f', label: 'Facebook', href: 'https://facebook.com/' },
  { icon: 'fa-instagram', label: 'Instagram', href: 'https://instagram.com/' },
  { icon: 'fa-tiktok', label: 'TikTok', href: 'https://tiktok.com/' },
  { icon: 'fa-whatsapp', label: 'WhatsApp', href: `https://wa.me/${CONTACT.whatsapp}` },
]

const waLink = (message) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`

/* ------------------------------ tiny router ------------------------------ */
function usePath() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to)
    setPath(to.split(/[?#]/)[0])
    window.scrollTo(0, 0)
  }, [])
  return [path, navigate]
}

/* Link that switches pages without a full reload; "/#section" links scroll on the home page */
function Link({ to, navigate, onClick, children, ...rest }) {
  const handle = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    const [pathname, hash] = to.split('#')
    if (pathname === window.location.pathname && hash === undefined) return
    e.preventDefault()
    if ((pathname || '/') === window.location.pathname && hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      window.history.replaceState({}, '', to)
    } else {
      navigate(to)
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 50)
    }
  }
  return <a href={to} onClick={handle} {...rest}>{children}</a>
}

/* ------------------------------ shared bits ------------------------------ */
function Img({ src, alt, className }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className={`img-fallback ${className || ''}`} role="img" aria-label={alt} />
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />
}

async function sendEnquiry(payload) {
  const res = await fetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Please check your details and try again.')
  return data.reference
}

/* ------------------------------ navbar ------------------------------ */
function Navbar({ navigate }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <div className="nav__inner">
        <Link to="/#home" navigate={navigate} className="nav__brand" onClick={close} aria-label="Factor Empire home">
          <Img src={IMAGES.logo} alt="Factor Empire logo" className="nav__logo" />
          <span className="nav__name">Factor Empire<small>Tours &amp; Car Hire</small></span>
        </Link>

        <nav id="primary-nav" className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {NAV.map((l) => <Link key={l.href} to={l.href} navigate={navigate} onClick={close}>{l.label}</Link>)}
          <Link to="/portal" navigate={navigate} onClick={close}>Track Booking</Link>
          <Link to="/#booking" navigate={navigate} className="btn btn--gold nav__cta-mobile" onClick={close}>Book Now</Link>
        </nav>

        <Link to="/#booking" navigate={navigate} className="btn btn--gold nav__cta">Book Now</Link>

        <button
          className={`nav__toggle ${open ? 'is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}

/* ------------------------------ booking widget + modal ------------------------------ */
function BookingForm({ onSearch }) {
  const today = new Date().toISOString().split('T')[0]
  const [f, setF] = useState({ pickup: '', pickDate: '', dropDate: '', vehicle: '' })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onSearch({ kind: 'car', item: f.vehicle, pickup: f.pickup, pick_date: f.pickDate, drop_date: f.dropDate })
  }

  return (
    <form className="booking" id="booking" onSubmit={submit} aria-label="Search vehicles">
      <div className="field">
        <label htmlFor="pickup"><i className="fa-solid fa-location-dot" aria-hidden="true" /> Pick-up location</label>
        <input id="pickup" type="text" placeholder="Airport, hotel or city" value={f.pickup} onChange={set('pickup')} required />
      </div>
      <div className="field">
        <label htmlFor="pickDate"><i className="fa-regular fa-calendar" aria-hidden="true" /> Pick-up date</label>
        <input id="pickDate" type="date" min={today} value={f.pickDate} onChange={set('pickDate')} required />
      </div>
      <div className="field">
        <label htmlFor="dropDate"><i className="fa-regular fa-calendar-check" aria-hidden="true" /> Drop-off date</label>
        <input id="dropDate" type="date" min={f.pickDate || today} value={f.dropDate} onChange={set('dropDate')} required />
      </div>
      <div className="field">
        <label htmlFor="vehicle"><i className="fa-solid fa-car" aria-hidden="true" /> Vehicle type</label>
        <select id="vehicle" value={f.vehicle} onChange={set('vehicle')} required>
          <option value="" disabled>Choose a vehicle</option>
          {VEHICLES.map((v) => <option key={v.title} value={v.title}>{v.title}</option>)}
        </select>
      </div>
      <button type="submit" className="btn btn--gold booking__submit">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Search
      </button>
    </form>
  )
}

function BookingModal({ data, onClose, navigate }) {
  const isTour = data.kind === 'tour'
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '', pick_date: data.pick_date || '' })
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const summary = isTour
    ? data.item
    : [data.item, data.pickup && `from ${data.pickup}`, data.pick_date && `${data.pick_date} to ${data.drop_date}`].filter(Boolean).join(' · ')

  const submit = async (e) => {
    e.preventDefault()
    setState('sending')
    setError('')
    try {
      const ref = await sendEnquiry({ ...data, ...form })
      setReference(ref)
      setState('done')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setState('error')
    }
  }

  const fallbackMsg = `Hello Factor Empire, I'd like ${isTour ? 'the ' + data.item + ' package' : 'to check availability'}.\n${summary}\nName: ${form.name}\nPhone: ${form.phone}`

  return (
    <div className="modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal__close" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" aria-hidden="true" /></button>

        {state === 'done' ? (
          <div className="modal__done">
            <span className="icon-ring"><i className="fa-solid fa-check" aria-hidden="true" /></span>
            <h2 id="modal-title">Request received</h2>
            <p>We will contact you shortly to confirm. Keep your reference number to track the booking.</p>
            <p className="ref-chip">{reference}</p>
            <div className="modal__actions">
              <button className="btn btn--gold" onClick={() => { onClose(); navigate(`/portal?ref=${reference}`) }}>Track this booking</button>
              <button className="btn btn--ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="modal-title">{isTour ? 'Enquire about this package' : 'Check availability'}</h2>
            {summary && <p className="modal__summary"><i className={`fa-solid ${isTour ? 'fa-umbrella-beach' : 'fa-car'}`} aria-hidden="true" /> {summary}</p>}

            <div className="modal__grid">
              <div className="field">
                <label htmlFor="m-name">Full name</label>
                <input id="m-name" value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="m-phone">Phone / WhatsApp</label>
                <input id="m-phone" type="tel" value={form.phone} onChange={set('phone')} required minLength={7} autoComplete="tel" placeholder="+254 ..." />
              </div>
              <div className="field">
                <label htmlFor="m-email">Email (optional)</label>
                <input id="m-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
              {isTour && (
                <div className="field">
                  <label htmlFor="m-date">Preferred travel date</label>
                  <input id="m-date" type="date" value={form.pick_date} onChange={set('pick_date')} />
                </div>
              )}
              <div className="field field--wide">
                <label htmlFor="m-notes">Anything we should know?</label>
                <textarea id="m-notes" rows={3} value={form.notes} onChange={set('notes')} placeholder="Passengers, luggage, flight number..." />
              </div>
            </div>

            {state === 'error' && (
              <p className="form-error" role="alert">
                {error}{' '}
                <a href={waLink(fallbackMsg)} target="_blank" rel="noopener noreferrer">Send it on WhatsApp instead</a>
              </p>
            )}

            <button type="submit" className="btn btn--gold modal__submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending...' : 'Send request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ home page sections ------------------------------ */
function Hero({ onBook }) {
  return (
    <section id="home" className="hero" style={{ '--hero-img': `url(${IMAGES.hero})` }}>
      <div className="container hero__content">
        <p className="hero__kicker">Tours &amp; Car Hire</p>
        <h1 className="hero__title">Explore More.<br />Drive Further.</h1>
        <p className="hero__sub">Your Journey, Our Priority.</p>
        <div className="hero__actions">
          <a href="#car-hire" className="btn btn--gold">View our fleet</a>
          <a href="#tours" className="btn btn--ghost">See tour packages</a>
        </div>
      </div>
      <div className="container hero__form"><BookingForm onSearch={onBook} /></div>
    </section>
  )
}

function CarHire({ onBook }) {
  return (
    <section id="car-hire" className="section">
      <div className="container">
        <header className="section__head">
          <h2>Car hire that fits the journey</h2>
          <p>Reliable, affordable and comfortable, from a single saloon to a full coach.</p>
        </header>
        <div className="fleet">
          {VEHICLES.map((v) => (
            <article key={v.title} className="fleet__card">
              <span className="icon-ring"><i className={`fa-solid ${v.icon}`} aria-hidden="true" /></span>
              <h3>{v.title}</h3>
              <p className="fleet__tag">{v.text}</p>
              <p>{v.blurb}</p>
              <button className="link-gold link-button" onClick={() => onBook({ kind: 'car', item: v.title })}>
                Request a quote <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyUs() {
  return (
    <section id="why-us" className="section section--alt">
      <div className="container why">
        <div className="why__intro">
          <h2>Why travellers choose Factor Empire</h2>
          <p>
            Whether it is a 5 a.m. airport run or a week on the road, you get the same
            standard: a clean vehicle, a fair price and someone who answers when you call.
          </p>
          <a href="#booking" className="btn btn--gold">Plan your trip</a>
        </div>
        <ul className="why__list">
          {TRUST.map((t) => (
            <li key={t.title}>
              <span className="why__icon"><i className={`fa-solid ${t.icon}`} aria-hidden="true" /></span>
              <div><h3>{t.title}</h3><p>{t.text}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Tours({ onBook }) {
  return (
    <section id="tours" className="section">
      <div className="container">
        <header className="section__head">
          <h2>Tour packages &amp; travel experiences</h2>
          <p>Pick a mood and we will build the route, the stays and the ride.</p>
        </header>
      </div>
      <div className="polaroids" tabIndex={0} aria-label="Tour packages, scroll sideways">
        {TOURS.map((t, i) => (
          <button
            key={t.title}
            className={`polaroid ${i % 2 ? 'polaroid--b' : 'polaroid--a'}`}
            onClick={() => onBook({ kind: 'tour', item: t.title })}
          >
            <figure>
              <Img src={t.img} alt={t.title} />
              <figcaption><strong>{t.title}</strong><span>{t.tag}</span></figcaption>
            </figure>
          </button>
        ))}
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section section--alt">
      <div className="container about">
        <div className="about__media">
          <Img src={IMAGES.founder} alt="Founder of Factor Empire Tours & Car Hire" />
          <span className="about__badge"><i className="fa-solid fa-crown" aria-hidden="true" /> Founder &amp; lead driver</span>
        </div>
        <div className="about__text">
          <h2>Built on reliability. Driven by memories.</h2>
          <p>
            Factor Empire started with one van and one promise: show up on time and look
            after every passenger like family. Today we move travellers across towns, coasts
            and game parks with the same care.
          </p>
          <p>
            Our mission is simple: make every trip safe, comfortable and worth remembering,
            from the first pick-up to the last drop-off.
          </p>
          <ul className="about__points">
            <li><i className="fa-solid fa-shield-halved" aria-hidden="true" /> Safety checks before every trip</li>
            <li><i className="fa-solid fa-handshake" aria-hidden="true" /> Honest prices and clear communication</li>
            <li><i className="fa-solid fa-map-location-dot" aria-hidden="true" /> Drivers who know the roads and the stories</li>
          </ul>
          <a href="#contact" className="btn btn--gold">Talk to us</a>
        </div>
      </div>
    </section>
  )
}

function Footer({ navigate }) {
  return (
    <footer id="contact" className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Img src={IMAGES.logo} alt="Factor Empire logo" className="footer__logo" />
          <p className="footer__slogan">Explore More, Drive Further.</p>
          <p className="footer__slogan2">Your Journey, Our Priority.</p>
        </div>

        <nav aria-label="Quick links">
          <h3>Quick links</h3>
          <ul>
            {NAV.map((l) => <li key={l.href}><Link to={l.href} navigate={navigate}>{l.label}</Link></li>)}
            <li><Link to="/portal" navigate={navigate}>Track Booking</Link></li>
          </ul>
        </nav>

        <div>
          <h3>Contact</h3>
          <ul className="footer__contact">
            <li><i className="fa-solid fa-phone" aria-hidden="true" /> <a href={`tel:${CONTACT.phoneDisplay.replace(/\s/g, '')}`}>{CONTACT.phoneDisplay}</a></li>
            <li><i className="fa-brands fa-whatsapp" aria-hidden="true" /> <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></li>
            <li><i className="fa-solid fa-envelope" aria-hidden="true" /> <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li><i className="fa-solid fa-location-dot" aria-hidden="true" /> {CONTACT.address}</li>
          </ul>
        </div>

        <div>
          <h3>Follow us</h3>
          <div className="socials">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <i className={`fa-brands ${s.icon}`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="footer__legal">
        © {new Date().getFullYear()} Factor Empire Tours &amp; Car Hire. All rights reserved.{' '}
        <Link to="/admin" navigate={navigate} className="footer__staff">Staff login</Link>
      </p>
    </footer>
  )
}

function Home({ navigate }) {
  const [booking, setBooking] = useState(null)
  const closeBooking = useCallback(() => setBooking(null), [])
  return (
    <>
      <Navbar navigate={navigate} />
      <main>
        <Hero onBook={setBooking} />
        <CarHire onBook={setBooking} />
        <WhyUs />
        <Tours onBook={setBooking} />
        <About />
      </main>
      <Footer navigate={navigate} />
      {booking && <BookingModal data={booking} onClose={closeBooking} navigate={navigate} />}
    </>
  )
}

/* ------------------------------ app / routes ------------------------------ */
export default function App() {
  const [path, navigate] = usePath()
  const [auth, setAuth] = useState(() => localStorage.getItem('fe_admin_token') || '')

  const onLogin = (token) => { localStorage.setItem('fe_admin_token', token); setAuth(token) }
  const onLogout = () => { localStorage.removeItem('fe_admin_token'); setAuth('') }

  useEffect(() => {
    const titles = { '/portal': 'Track your booking', '/admin': 'Admin' }
    document.title = `${titles[path] || 'Explore More, Drive Further'} | Factor Empire Tours & Car Hire`
  }, [path])

  if (path.startsWith('/admin')) return <Admin auth={auth} onLogin={onLogin} onLogout={onLogout} navigate={navigate} />
  if (path.startsWith('/portal')) return <Portal navigate={navigate} />
  return <Home navigate={navigate} />
}
