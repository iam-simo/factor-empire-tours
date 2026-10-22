import { useCallback, useEffect, useState } from 'react'
import Portal from './Portal.jsx'
import Admin from './Admin.jsx'

/* Contact details come from frontend/.env. Photos live in frontend/public/photos/ (see the list in the chat). */
const env = import.meta.env
const CONTACT = {
  whatsapp: env.VITE_WHATSAPP || '254700000000',
  phoneDisplay: env.VITE_PHONE || '+254 700 000 000',
  email: env.VITE_EMAIL || 'bookings@factorempire.com',
  address: env.VITE_ADDRESS || 'Your city, Kenya',
}
const LOGO = '/logo.svg'
const FOUNDER = '/founder.jpeg'
const photo = (f) => `/photos/${f}`

const START = ['mara', 'diani', 'events']

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Tours', href: '/tours' },
  { label: 'Car Hire', href: '/cars' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

const PLACES = [
  { id: 'mara', title: 'Maasai Mara', line: 'River crossings, lion prides and endless plains.', when: 'Jul to Oct for the migration', days: '3 to 5 days', img: photo('mara.jpg'), credit: '' },
  { id: 'amboseli', title: 'Amboseli', line: 'Elephant herds walking beneath Kilimanjaro.', when: 'Jun to Oct for clear mountain views', days: '2 to 3 days', img: photo('amboseli.jpg'), credit: '' },
  { id: 'nakuru', title: 'Lake Nakuru', line: 'Rhinos, buffalo and pink flamingo shores.', when: 'All year', days: '1 to 2 days', img: photo('nakuru.jpg'), credit: '' },
  { id: 'naivasha', title: "Naivasha & Hell's Gate", line: 'Cycle between cliffs and zebras, then boat among hippos.', when: 'Jun to Feb, the drier months', days: '1 to 2 days', img: photo('naivasha.jpg'), credit: '' },
  { id: 'diani', title: 'Diani Beach', line: 'White sand and warm Indian Ocean water.', when: 'Dec to Mar, Jul to Oct', days: '3 to 6 days', img: photo('diani.jpg'), credit: '' },
  { id: 'mombasa', title: 'Mombasa', line: 'Fort Jesus, Old Town lanes and Nyali beach, with city transfers.', when: 'Dec to Mar, Jul to Oct', days: '2 to 4 days', img: photo('mombasa.jpg'), credit: '' },
  { id: 'lamu', title: 'Lamu Old Town', line: 'Dhows, coral-stone lanes and donkeys instead of traffic.', when: 'Dec to Mar', days: '3 to 4 days', img: photo('lamu.jpg'), credit: '' },
  { id: 'events', title: 'Private Events', line: 'Chauffeured cars and coaches for weddings, birthdays, corporate days out and school trips.', when: 'Any date', days: 'Half day to multi-day', img: photo('events.jpg'), credit: '', cta: 'Plan this event' },
]

const VEHICLES = [
  { icon: 'fa-car-side', title: 'Saloon Cars', text: 'City, business and weekends', blurb: 'Smooth and efficient for town trips and airport runs.' },
  { icon: 'fa-truck-monster', title: 'SUVs', text: 'Safari tracks and long highways', blurb: 'Land Cruisers and Prados that handle rough roads and rain.' },
  { icon: 'fa-van-shuttle', title: 'Vans', text: 'Families and small teams', blurb: 'Air-conditioned vans with room for luggage and everyone.' },
  { icon: 'fa-bus', title: 'Buses', text: 'Weddings, schools and events', blurb: 'Coaches for large groups and multi-stop tours.' },
  { icon: 'fa-user-tie', title: 'Chauffeur Services', text: 'A driver who knows the route', blurb: 'Courteous, experienced drivers who keep you on time.' },
]

const PERKS = [
  { icon: 'fa-clock', title: 'Open 24/7', text: 'Day or night, we answer and the keys are ready.' },
  { icon: 'fa-calendar-days', title: 'Hire by the hour to the month', text: 'You choose the length of the rental.' },
  { icon: 'fa-tags', title: 'Clear prices', text: 'The quote is the price you pay on return.' },
  { icon: 'fa-screwdriver-wrench', title: 'Checked before every trip', text: 'Serviced and inspected before it reaches you.' },
  { icon: 'fa-plane-arrival', title: 'Airport meet and greet', text: 'We track your flight, even when you land late.' },
]

const SOCIALS = [
  { icon: 'fa-facebook-f', label: 'Facebook', href: 'https://facebook.com/' },
  { icon: 'fa-instagram', label: 'Instagram', href: 'https://instagram.com/' },
  { icon: 'fa-tiktok', label: 'TikTok', href: 'https://tiktok.com/' },
  { icon: 'fa-whatsapp', label: 'WhatsApp', href: `https://wa.me/${CONTACT.whatsapp}` },
]

const waLink = (m) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(m)}`

/* ------------------------------ router ------------------------------ */
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

function Link({ to, navigate, onClick, children, ...rest }) {
  const handle = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    const [pathname, hash] = to.split('#')
    const same = (pathname || window.location.pathname) === window.location.pathname
    if (same && !hash) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    e.preventDefault()
    if (same) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      window.history.replaceState({}, '', to)
    } else {
      navigate(to)
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 60)
    }
  }
  return <a href={to} onClick={handle} {...rest}>{children}</a>
}

function Img({ src, alt, className }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className={`img-fallback ${className || ''}`} role="img" aria-label={alt} />
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />
}

async function sendEnquiry(payload) {
  const res = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Please check your details and try again.')
  return data.reference
}

/* ------------------------------ chrome ------------------------------ */
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
        <Link to="/" navigate={navigate} className="nav__brand" onClick={close} aria-label="Factor Empire home">
          <Img src={LOGO} alt="Factor Empire logo" className="nav__logo" />
          <span className="nav__name">Factor Empire<small>Tours &amp; Car Hire</small></span>
        </Link>
        <nav id="primary-nav" className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {NAV.map((l) => <Link key={l.href} to={l.href} navigate={navigate} onClick={close}>{l.label}</Link>)}
          <Link to="/portal" navigate={navigate} onClick={close}>Track Booking</Link>
          <Link to="/cars#booking" navigate={navigate} className="btn btn--gold nav__cta-mobile" onClick={close}>Book Now</Link>
        </nav>
        <Link to="/cars#booking" navigate={navigate} className="btn btn--gold nav__cta">Book Now</Link>
        <button className={`nav__toggle ${open ? 'is-open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}

function Footer({ navigate }) {
  return (
    <footer id="contact" className="footer">
      <div className="container footer__grid">
        <div>
          <Img src={LOGO} alt="Factor Empire logo" className="footer__logo" />
          <p className="footer__slogan">Explore More, Drive Further.</p>
          <p className="footer__slogan2">Your Journey, Our Priority.</p>
        </div>
        <nav aria-label="Quick links">
          <h3>Pages</h3>
          <ul>
            {NAV.slice(0, 3).map((l) => <li key={l.href}><Link to={l.href} navigate={navigate}>{l.label}</Link></li>)}
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
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}><i className={`fa-brands ${s.icon}`} aria-hidden="true" /></a>
            ))}
          </div>
        </div>
      </div>
      <p className="footer__legal">
        © {new Date().getFullYear()} Factor Empire Tours &amp; Car Hire.{' '}
        <Link to="/admin" navigate={navigate} className="footer__staff">Staff login</Link>
      </p>
    </footer>
  )
}

/* ------------------------------ booking ------------------------------ */
function BookingForm({ onSearch }) {
  const today = new Date().toISOString().split('T')[0]
  const [f, setF] = useState({ pickup: '', pickDate: '', dropDate: '', vehicle: '' })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    onSearch({ kind: 'car', item: f.vehicle, pickup: f.pickup, pick_date: f.pickDate, drop_date: f.dropDate })
  }
  return (
    <form className="booking" id="booking" onSubmit={submit} aria-label="Check vehicle availability">
      <div className="field"><label htmlFor="pickup"><i className="fa-solid fa-location-dot" aria-hidden="true" /> Pick-up location</label>
        <input id="pickup" placeholder="Airport, hotel or town" value={f.pickup} onChange={set('pickup')} required /></div>
      <div className="field"><label htmlFor="pickDate"><i className="fa-regular fa-calendar" aria-hidden="true" /> Pick-up date</label>
        <input id="pickDate" type="date" min={today} value={f.pickDate} onChange={set('pickDate')} required /></div>
      <div className="field"><label htmlFor="dropDate"><i className="fa-regular fa-calendar-check" aria-hidden="true" /> Drop-off date</label>
        <input id="dropDate" type="date" min={f.pickDate || today} value={f.dropDate} onChange={set('dropDate')} required /></div>
      <div className="field"><label htmlFor="vehicle"><i className="fa-solid fa-car" aria-hidden="true" /> Vehicle type</label>
        <select id="vehicle" value={f.vehicle} onChange={set('vehicle')} required>
          <option value="" disabled>Choose a vehicle</option>
          {VEHICLES.map((v) => <option key={v.title} value={v.title}>{v.title}</option>)}
        </select></div>
      <button type="submit" className="btn btn--gold booking__submit">Check availability</button>
    </form>
  )
}

function BookingModal({ data, onClose, navigate }) {
  const isTour = data.kind === 'tour'
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '', pick_date: data.pick_date || '' })
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
  const summary = isTour ? data.item : [data.item, data.pickup && `from ${data.pickup}`, data.pick_date && `${data.pick_date} to ${data.drop_date}`].filter(Boolean).join(' · ')
  const submit = async (e) => {
    e.preventDefault()
    setState('sending'); setError('')
    try { setReference(await sendEnquiry({ ...data, ...form })); setState('done') }
    catch (err) { setError(err.message || 'Something went wrong.'); setState('error') }
  }
  const fallbackMsg = `Hello Factor Empire, I'd like ${isTour ? 'the ' + data.item + ' trip' : 'to check availability'}.\n${summary}\nName: ${form.name}\nPhone: ${form.phone}`
  return (
    <div className="modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal__close" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" aria-hidden="true" /></button>
        {state === 'done' ? (
          <div className="modal__done">
            <span className="icon-ring"><i className="fa-solid fa-check" aria-hidden="true" /></span>
            <h2 id="modal-title">Request received</h2>
            <p>We will contact you shortly to confirm. Keep this reference to track your booking.</p>
            <p className="ref-chip">{reference}</p>
            <div className="modal__actions">
              <button className="btn btn--gold" onClick={() => { onClose(); navigate(`/portal?ref=${reference}`) }}>Track this booking</button>
              <button className="btn btn--ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="modal-title">{isTour ? 'Plan this trip' : 'Check availability'}</h2>
            {summary && <p className="modal__summary">{summary}</p>}
            <div className="modal__grid">
              <div className="field"><label htmlFor="m-name">Full name</label><input id="m-name" value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" /></div>
              <div className="field"><label htmlFor="m-phone">Phone / WhatsApp</label><input id="m-phone" type="tel" value={form.phone} onChange={set('phone')} required minLength={7} autoComplete="tel" placeholder="+254 ..." /></div>
              <div className="field"><label htmlFor="m-email">Email (optional)</label><input id="m-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" /></div>
              {isTour && <div className="field"><label htmlFor="m-date">Preferred travel date</label><input id="m-date" type="date" value={form.pick_date} onChange={set('pick_date')} /></div>}
              <div className="field field--wide"><label htmlFor="m-notes">Anything we should know?</label><textarea id="m-notes" rows={3} value={form.notes} onChange={set('notes')} placeholder="Group size, luggage, flight number..." /></div>
            </div>
            {state === 'error' && <p className="form-error" role="alert">{error} <a href={waLink(fallbackMsg)} target="_blank" rel="noopener noreferrer">Send it on WhatsApp instead</a></p>}
            <button type="submit" className="btn btn--gold modal__submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending...' : 'Send request'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

/* Wraps every public page: navbar, footer and the booking pop-up */
function Shell({ navigate, children }) {
  const [booking, setBooking] = useState(null)
  const close = useCallback(() => setBooking(null), [])
  return (
    <>
      <Navbar navigate={navigate} />
      <main>{children(setBooking)}</main>
      <Footer navigate={navigate} />
      {booking && <BookingModal data={booking} onClose={close} navigate={navigate} />}
    </>
  )
}

/* Animated hero: a safari van drives past a camp at sunset (pure SVG + CSS, no photo needed) */
function Scene() {
  return (
    <svg className="scene" viewBox="0 0 1600 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <radialGradient id="sg" cx=".4" cy=".35"><stop offset="0" stopColor="#ffe0b8" /><stop offset=".55" stopColor="#ff9a52" /><stop offset="1" stopColor="#e0502b" /></radialGradient>
        <radialGradient id="fg"><stop offset="0" stopColor="#ffb27a" stopOpacity=".7" /><stop offset="1" stopColor="#ffb27a" stopOpacity="0" /></radialGradient>
      </defs>
      {[[120, 90], [380, 160], [620, 60], [840, 140], [1010, 70], [1330, 120], [1480, 60], [250, 230]].map(([x, y], i) => (
        <circle key={i} className="scene__star" cx={x} cy={y} r="2.2" fill="#fff" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      <circle className="scene__sun" cx="1130" cy="470" r="120" fill="url(#sg)" />
      <g className="scene__cloud" fill="#ffd1a3" opacity=".35"><ellipse cx="500" cy="260" rx="130" ry="16" /><ellipse cx="580" cy="246" rx="80" ry="14" /></g>
      <g className="scene__cloud scene__cloud--b" fill="#ffd1a3" opacity=".3"><ellipse cx="1200" cy="200" rx="110" ry="14" /><ellipse cx="1270" cy="188" rx="70" ry="12" /></g>
      <path d="M0 560 C200 480 360 520 560 500 S900 440 1100 500 S1450 480 1600 520 V800 H0Z" fill="#0f4a60" opacity=".85" />
      <path d="M0 625 C250 565 450 605 700 585 S1100 545 1300 595 S1500 605 1600 585 V800 H0Z" fill="#0a3446" />
      <path d="M0 690 H1600 V800 H0Z" fill="#061f29" />
      <g fill="#061f29"><path d="M905 690 C905 640 893 600 880 565 M910 690 C915 635 935 595 960 555" stroke="#061f29" strokeWidth="8" fill="none" strokeLinecap="round" /><ellipse cx="885" cy="552" rx="95" ry="17" /><ellipse cx="965" cy="540" rx="80" ry="14" /></g>
      <polygon points="1170,690 1235,605 1300,690" fill="#ff9a52" /><polygon points="1235,605 1217,690 1253,690" fill="#c2562d" />
      <circle className="scene__glow" cx="1370" cy="670" r="70" fill="url(#fg)" />
      <path d="M1352 692 H1388" stroke="#3a2415" strokeWidth="6" strokeLinecap="round" />
      <g className="scene__flame"><path d="M1370 690 C1352 670 1360 655 1370 636 C1380 655 1388 670 1370 690Z" fill="#ff7a45" /><path d="M1370 690 C1362 678 1366 668 1370 658 C1374 668 1378 678 1370 690Z" fill="#ffd199" /></g>
      <rect y="728" width="1600" height="72" fill="#7a4028" />
      <path className="scene__dash" d="M0 764 H1600" stroke="#ffd199" strokeWidth="4" strokeDasharray="46 40" opacity=".7" />
      <g transform="translate(0 758) scale(1.5)">
        <g className="scene__van">
          <g className="scene__bounce">
            <path d="M150 -42 L260 -62 V-24Z" fill="#ffe2a0" opacity=".25" />
            <rect x="0" y="-52" width="150" height="40" rx="10" fill="#f4ead8" />
            <path d="M20 -52 L36 -80 H112 L134 -52Z" fill="#f4ead8" />
            <path d="M42 -74 H72 V-54 H36Z M78 -74 H108 L122 -54 H78Z" fill="#17536a" />
            <rect x="26" y="-90" width="94" height="7" rx="3" fill="#ff7a45" />
            <rect x="0" y="-32" width="150" height="6" fill="#ff7a45" />
            <rect x="140" y="-46" width="8" height="8" rx="2" fill="#ffe2a0" />
          </g>
          {[32, 118].map((x) => (
            <g key={x} transform={`translate(${x} -12)`}><g className="scene__wheel"><circle r="14" fill="#061f29" /><circle r="5" fill="#ffd199" /><path d="M-14 0H14M0 -14V14" stroke="#ffd199" strokeWidth="2" /></g></g>
          ))}
        </g>
      </g>
    </svg>
  )
}

/* ------------------------------ HOME: story + invitation ------------------------------ */
function Home({ navigate }) {
  return (
    <Shell navigate={navigate}>
      {() => (
        <>
          <section className="sun">
            <Scene />
            <div className="container sun__text">
              <h1>Explore more.<br />Drive further.</h1>
              <p>Safari, coast and car hire from one Kenyan team. We handle the road, you watch the horizon.</p>
              <div className="sun__actions">
                <Link to="/tours" navigate={navigate} className="btn btn--gold">Browse tours</Link>
                <Link to="/cars" navigate={navigate} className="btn btn--ghost">Hire a vehicle</Link>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <header className="section__head">
                <h2>Where most guests begin</h2>
                <p>A park, a beach and a private celebration. More destinations, with seasons and trip lengths, are on the tours page.</p>
              </header>
              <div className="tiles">
                {START.map((id) => PLACES.find((p) => p.id === id)).map((p) => (
                  <Link key={p.id} to={`/tours#${p.id}`} navigate={navigate} className="tile">
                    <Img src={p.img} alt={p.title} />
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
              <p className="more"><Link to="/tours" navigate={navigate} className="link-gold">See more destinations <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link></p>
            </div>
          </section>

          <section className="section section--alt">
            <div className="container split">
              <div>
                <h2>A ride that fits the road ahead</h2>
                <p className="lead">Saloons for town, Land Cruisers for the park gate, coaches for the whole wedding party. Every vehicle comes with a driver option.</p>
                <Link to="/cars" navigate={navigate} className="btn btn--gold">See vehicles and prices</Link>
              </div>
              <ul className="chips">
                {VEHICLES.map((v) => <li key={v.title}><i className={`fa-solid ${v.icon}`} aria-hidden="true" /> {v.title}</li>)}
              </ul>
            </div>
          </section>

          <section id="about" className="section">
            <div className="container about">
              <div className="about__media">
                <Img src={FOUNDER} alt="Founder of Factor Empire Tours & Car Hire" />
                <span className="about__badge"><i className="fa-solid fa-road" aria-hidden="true" /> Founder and lead driver</span>
              </div>
              <div className="about__text">
                <h2>One van, one promise</h2>
                <p>Factor Empire began with a single van and a rule: arrive on time and treat every passenger like family. We still work that way, now across towns, the coast and the game parks.</p>
                <ul className="about__points">
                  <li><i className="fa-solid fa-shield-halved" aria-hidden="true" /> Safety checks before every trip</li>
                  <li><i className="fa-solid fa-handshake" aria-hidden="true" /> Honest prices, clear communication</li>
                  <li><i className="fa-solid fa-map-location-dot" aria-hidden="true" /> Drivers who know the roads and the stories</li>
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
    </Shell>
  )
}

/* ------------------------------ TOURS: destinations only ------------------------------ */
function Tours({ navigate }) {
  return (
    <Shell navigate={navigate}>
      {(onBook) => (
        <>
          <header className="phead"><div className="container">
            <h1>Tours across Kenya</h1>
            <p>Pick a place and we build the route, the stay and the ride. Seasons below are a guide, so ask us what suits your dates.</p>
          </div></header>
          <section className="section section--tight"><div className="container">
            <div className="places">
              {PLACES.map((p) => (
                <article key={p.id} id={p.id} className="place">
                  <Img src={p.img} alt={p.title} />
                  <div className="place__body">
                    <h2>{p.title}</h2>
                    <p>{p.line}</p>
                    <p className="place__meta"><i className="fa-regular fa-sun" aria-hidden="true" /> {p.when} <i className="fa-regular fa-clock" aria-hidden="true" /> {p.days}</p>
                    <button className="btn btn--gold" onClick={() => onBook({ kind: 'tour', item: p.title })}>{p.cta || 'Plan this trip'}</button>
                  </div>
                  {p.credit && <small className="place__credit">Photo: {p.credit}</small>}
                </article>
              ))}
            </div>
            <p className="more">Want a route that is not listed? <a className="link-gold" href={waLink('Hello Factor Empire, I would like a custom tour.')} target="_blank" rel="noopener noreferrer">Tell us on WhatsApp</a></p>
          </div></section>
        </>
      )}
    </Shell>
  )
}

/* ------------------------------ CARS: fleet, perks, availability ------------------------------ */
function Cars({ navigate }) {
  return (
    <Shell navigate={navigate}>
      {(onBook) => (
        <>
          <header className="phead"><div className="container">
            <h1>Car hire and transfers</h1>
            <p>Tell us where and when. We reply with what is free and what it costs.</p>
            <BookingForm onSearch={onBook} />
          </div></header>
          <section className="section section--tight"><div className="container">
            <ul className="rows">
              {VEHICLES.map((v) => (
                <li key={v.title}>
                  <span className="icon-ring"><i className={`fa-solid ${v.icon}`} aria-hidden="true" /></span>
                  <div><h3>{v.title}</h3><p className="fleet__tag">{v.text}</p><p>{v.blurb}</p></div>
                  <button className="btn btn--ghost" onClick={() => onBook({ kind: 'car', item: v.title })}>Request a quote</button>
                </li>
              ))}
            </ul>
          </div></section>
          <section className="section section--alt"><div className="container">
            <header className="section__head"><h2>What you can count on</h2></header>
            <ul className="perks">
              {PERKS.map((t) => (
                <li key={t.title}><span className="why__icon"><i className={`fa-solid ${t.icon}`} aria-hidden="true" /></span><div><h3>{t.title}</h3><p>{t.text}</p></div></li>
              ))}
            </ul>
          </div></section>
        </>
      )}
    </Shell>
  )
}

/* ------------------------------ app ------------------------------ */
export default function App() {
  const [path, navigate] = usePath()
  const [auth, setAuth] = useState(() => localStorage.getItem('fe_admin_token') || '')
  const onLogin = (token) => { localStorage.setItem('fe_admin_token', token); setAuth(token) }
  const onLogout = () => { localStorage.removeItem('fe_admin_token'); setAuth('') }
  useEffect(() => {
    const titles = { '/portal': 'Track your booking', '/admin': 'Admin', '/tours': 'Tours across Kenya', '/cars': 'Car hire' }
    document.title = `${titles[path] || 'Explore More, Drive Further'} | Factor Empire Tours & Car Hire`
  }, [path])
  if (path.startsWith('/admin')) return <Admin auth={auth} onLogin={onLogin} onLogout={onLogout} navigate={navigate} />
  if (path.startsWith('/portal')) return <Portal navigate={navigate} />
  if (path.startsWith('/tours')) return <Tours navigate={navigate} />
  if (path.startsWith('/cars')) return <Cars navigate={navigate} />
  return <Home navigate={navigate} />
}