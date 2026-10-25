import { useCallback, useEffect, useRef, useState } from 'react'
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
const HERO_PHOTO = photo('van-hero.jpg')

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

/* img = a photo in public/photos/. If the file is missing, the icon is shown instead. */
const VEHICLES = [
  { icon: 'fa-car-side', img: 'car-saloon.jpg', title: 'Saloon Cars', text: 'City, business and weekends', blurb: 'Smooth and efficient for town trips and airport runs.' },
  { icon: 'fa-truck-monster', img: 'car-suv.jpg', title: 'SUVs', text: 'Safari tracks and long highways', blurb: 'Land Cruisers and Prados that handle rough roads and rain.' },
  { icon: 'fa-van-shuttle', img: 'car-van.jpg', title: 'Vans', text: 'Families and small teams', blurb: 'Air-conditioned vans with room for luggage and everyone.' },
  { icon: 'fa-bus', img: 'car-bus.jpg', title: 'Buses', text: 'Weddings, schools and events', blurb: 'Coaches for large groups and multi-stop tours.' },
  { icon: 'fa-user-tie', img: 'car-chauffeur.jpg', title: 'Chauffeur Services', text: 'A driver who knows the route', blurb: 'Courteous, experienced drivers who keep you on time.' },
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

/* A vehicle photo; if the file does not exist yet, show the icon instead */
function VehiclePic({ v }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className="vwrap vwrap--icon"><i className={`fa-solid ${v.icon}`} aria-hidden="true" /></div>
  return (
    <div className="vwrap">
      <img src={photo(v.img)} alt={v.title} loading="lazy" onError={() => setFailed(true)} />
    </div>
  )
}

/* ------------------------------ animation helpers ------------------------------ */
/* Fades and lifts anything with className="reveal" the first time it scrolls into view */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* Moves the hero photo slightly slower than the page while you scroll */
function useParallax(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => el.style.setProperty('--py', `${Math.min(window.scrollY, 900) * 0.16}px`))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [ref])
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
  useReveal()
  return (
    <>
      <Navbar navigate={navigate} />
      <main>{children(setBooking)}</main>
      <Footer navigate={navigate} />
      {booking && <BookingModal data={booking} onClose={close} navigate={navigate} />}
    </>
  )
}

/* ------------------------------ HOME: story + invitation ------------------------------ */
function Home({ navigate }) {
  const heroRef = useRef(null)
  useParallax(heroRef)
  return (
    <Shell navigate={navigate}>
      {() => (
        <>
          <section className="sun" ref={heroRef}>
            <div className="sun__bg" style={{ backgroundImage: `url(${HERO_PHOTO})` }} aria-hidden="true" />
            <div className="sun__photo">
              <img className="sun__img" src={HERO_PHOTO} alt="A Factor Empire van parked beside the lake at sunset" />
            </div>
            <div className="container sun__text">
              <p className="sun__badge"><span className="dot" aria-hidden="true" /> Open 24/7 · Airport transfers</p>
              <h1>
                <span className="line"><span>Explore more.</span></span>
                <span className="line"><span>Drive further.</span></span>
              </h1>
              <p className="sun__sub">Safari, coast and car hire from one Kenyan team. We handle the road, you watch the horizon.</p>
              <div className="sun__actions">
                <Link to="/tours" navigate={navigate} className="btn btn--gold">Browse tours</Link>
                <Link to="/cars" navigate={navigate} className="btn btn--ghost">Hire a vehicle</Link>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <header className="section__head reveal">
                <h2>Where most guests begin</h2>
                <p>A park, a beach and a private celebration. More destinations, with seasons and trip lengths, are on the tours page.</p>
              </header>
              <div className="tiles">
                {START.map((id) => PLACES.find((p) => p.id === id)).map((p, i) => (
                  <Link key={p.id} to={`/tours#${p.id}`} navigate={navigate} className="tile reveal" style={{ '--i': i }}>
                    <Img src={p.img} alt={p.title} />
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
              <p className="more reveal"><Link to="/tours" navigate={navigate} className="link-gold">See more destinations <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link></p>
            </div>
          </section>

          <section className="section section--alt">
            <div className="container split">
              <div className="reveal">
                <h2>A ride that fits the road ahead</h2>
                <p className="lead">Saloons for town, Land Cruisers for the park gate, coaches for the whole wedding party. Every vehicle comes with a driver option.</p>
                <Link to="/cars" navigate={navigate} className="btn btn--gold">See vehicles and prices</Link>
              </div>
              <ul className="chips">
                {VEHICLES.map((v, i) => <li key={v.title} className="reveal" style={{ '--i': i }}><i className={`fa-solid ${v.icon}`} aria-hidden="true" /> {v.title}</li>)}
              </ul>
            </div>
          </section>

          <section id="about" className="section">
            <div className="container about">
              <div className="about__media reveal">
                <Img src={FOUNDER} alt="Founder of Factor Empire Tours & Car Hire" />
                <span className="about__badge"><i className="fa-solid fa-road" aria-hidden="true" /> Founder and lead driver</span>
              </div>
              <div className="about__text reveal" style={{ '--i': 2 }}>
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
                <article key={p.id} id={p.id} className="place reveal">
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
              {VEHICLES.map((v, i) => (
                <li key={v.title} className="reveal" style={{ '--i': i }}>
                  <VehiclePic v={v} />
                  <div><h3>{v.title}</h3><p className="fleet__tag">{v.text}</p><p>{v.blurb}</p></div>
                  <button className="btn btn--ghost" onClick={() => onBook({ kind: 'car', item: v.title })}>Request a quote</button>
                </li>
              ))}
            </ul>
          </div></section>
          <section className="section section--alt"><div className="container">
            <header className="section__head reveal"><h2>What you can count on</h2></header>
            <ul className="perks">
              {PERKS.map((t, i) => (
                <li key={t.title} className="reveal" style={{ '--i': i % 2 }}><span className="why__icon"><i className={`fa-solid ${t.icon}`} aria-hidden="true" /></span><div><h3>{t.title}</h3><p>{t.text}</p></div></li>
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