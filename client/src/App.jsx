import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Aperture, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check,
  ChevronDown, ChevronLeft, ChevronRight, CloudSun, Command, Grid2X2, Heart,
  LayoutDashboard, ListFilter, Plus, Search, Shirt, SlidersHorizontal, Sparkles,
  Sun, Upload, WandSparkles, X, Menu, MoreHorizontal, Footprints, Trash2,
} from 'lucide-react'

const seedItems = [
  { _id: 'demo-1', name: 'Soft knit cardigan', category: 'Outerwear', color: 'Oatmeal', brand: 'Arket', season: 'Fall', occasion: 'Everyday', imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=85', wearCount: 12 },
  { _id: 'demo-2', name: 'Classic straight denim', category: 'Bottoms', color: 'Indigo', brand: 'Levi’s', season: 'All season', occasion: 'Casual', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=85', wearCount: 18 },
  { _id: 'demo-3', name: 'Everyday white tee', category: 'Tops', color: 'White', brand: 'Uniqlo', season: 'All season', occasion: 'Everyday', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85', wearCount: 24 },
  { _id: 'demo-4', name: 'Leather loafers', category: 'Shoes', color: 'Espresso', brand: 'Vagabond', season: 'All season', occasion: 'Work', imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=700&q=85', wearCount: 9 },
  { _id: 'demo-5', name: 'Linen blend trousers', category: 'Bottoms', color: 'Sand', brand: 'COS', season: 'Spring', occasion: 'Work', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=85', wearCount: 7 },
  { _id: 'demo-6', name: 'Relaxed blazer', category: 'Outerwear', color: 'Charcoal', brand: 'Everlane', season: 'Fall', occasion: 'Work', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=85', wearCount: 5 },
  { _id: 'demo-7', name: 'Ribbed tank top', category: 'Tops', color: 'Sage', brand: 'Mango', season: 'Summer', occasion: 'Casual', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?auto=format&fit=crop&w=700&q=85', wearCount: 11 },
  { _id: 'demo-8', name: 'Canvas weekend tote', category: 'Accessories', color: 'Natural', brand: 'Baggu', season: 'All season', occasion: 'Everyday', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=85', wearCount: 3 },
]
const categories = ['All items', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories']
const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'wardrobe', label: 'My wardrobe', icon: Shirt, count: '24' },
  { id: 'outfits', label: 'Outfit ideas', icon: Sparkles },
  { id: 'planner', label: 'Outfit planner', icon: CalendarDays },
]
const photo = (item) => item.imageUrl?.startsWith('http') ? item.imageUrl : item.imageUrl ? item.imageUrl : ''

function IconButton({ label, children, onClick, className = '' }) {
  return <button className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick}>{children}</button>
}

function Sidebar({ active, onChange, onAdd, open, onClose }) {
  return <>
    {open && <button aria-label="Close menu" className="mobile-scrim" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Aperture size={19} strokeWidth={2.4} /></div><span>fitvibe<span className="brand-period">.</span></span></div>
      <div className="workspace-switch"><div className="avatar avatar-lilac">S</div><div className="workspace-name"><strong>Sam’s closet</strong><span>Personal wardrobe</span></div><ChevronDown size={15} /></div>
      <p className="side-label">MENU</p>
      <nav className="side-nav" aria-label="Main navigation">
        {nav.map(({ id, label, icon: Icon, count }) => <button key={id} className={`nav-link ${active === id ? 'active' : ''}`} onClick={() => { onChange(id); onClose() }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}</button>)}
      </nav>
      <div className="side-divider" />
      <p className="side-label">YOUR STYLE</p>
      <button className="nav-link" onClick={() => { onChange('outfits'); onClose() }}><Heart size={18} strokeWidth={1.8} /><span>Saved outfits</span></button>
      <div className="sidebar-spacer" />
      <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={17} /></div><strong>A little style inspo</strong><p>Build a wardrobe you love, one outfit at a time.</p><button onClick={() => { onChange('outfits'); onClose() }}>Explore ideas <ArrowRight size={14} /></button><div className="tip-orbit" /></div>
      <button className="profile-row"><div className="avatar avatar-photo">S</div><div className="profile-copy"><strong>Sam Morgan</strong><span>Free plan</span></div><MoreHorizontal size={20} /></button>
    </aside>
  </>
}

function AddItemModal({ onClose, onSave }) {
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const [form, setForm] = useState({ name: '', category: 'Tops', color: '', brand: '', season: 'All season', occasion: 'Everyday' })
  const change = (key) => (event) => setForm((old) => ({ ...old, [key]: event.target.value }))
  const selectImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Choose an image file.'); return }
    if (file.size > 8 * 1024 * 1024) { setError('Images must be 8 MB or smaller.'); return }
    setError(''); setPreview(URL.createObjectURL(file)); setForm((old) => ({ ...old, file }))
  }
  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!form.name.trim()) { setError('Give this piece a name.'); return }
    setBusy(true)
    try { await onSave(form); onClose() } catch (e) { setError(e.message || 'Could not save item.') } finally { setBusy(false) }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title">
      <div className="modal-head"><div><span className="eyebrow">GROW YOUR WARDROBE</span><h2 id="add-title">Add a piece</h2></div><IconButton label="Close" onClick={onClose}><X size={19} /></IconButton></div>
      <form onSubmit={submit}>
        <button type="button" className={`upload-zone ${preview ? 'has-preview' : ''}`} onClick={() => fileRef.current?.click()}>
          {preview ? <img src={preview} alt="Selected clothing preview" /> : <><span className="upload-symbol"><Upload size={20} /></span><strong>Drop a photo here, or browse</strong><span>JPG, PNG or WEBP · up to 8 MB</span></>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={selectImage} hidden />
        </button>
        <div className="form-grid">
          <label className="field field-wide">Piece name<input autoFocus placeholder="e.g. Linen button-up" value={form.name} onChange={change('name')} /></label>
          <label className="field">Category<select value={form.category} onChange={change('category')}>{categories.slice(1).map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="field">Color<input placeholder="e.g. Cream" value={form.color} onChange={change('color')} /></label>
          <label className="field">Brand<input placeholder="Optional" value={form.brand} onChange={change('brand')} /></label>
          <label className="field">Season<select value={form.season} onChange={change('season')}>{['All season', 'Spring', 'Summer', 'Fall', 'Winter'].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="field field-wide">Best for<select value={form.occasion} onChange={change('occasion')}>{['Everyday', 'Casual', 'Work', 'Party', 'Travel', 'Wedding'].map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-dark" disabled={busy}>{busy ? 'Adding…' : <><Plus size={16} /> Add to wardrobe</>}</button></div>
      </form>
    </section>
  </div>
}

function ItemCard({ item, onDelete, index }) {
  const [menu, setMenu] = useState(false)
  return <article className="item-card" style={{ animationDelay: `${index * 45}ms` }}>
    <div className="item-image-wrap">
      {photo(item) ? <img className="item-image" src={photo(item)} alt={item.name} loading="lazy" /> : <div className="image-placeholder"><Shirt size={35} /></div>}
      <button className="favorite-button" aria-label="Save item"><Heart size={16} /></button>
      <div className="item-menu-wrap"><IconButton label="Item options" className="item-more" onClick={() => setMenu(!menu)}><MoreHorizontal size={19} /></IconButton>{menu && <div className="item-popover"><button onClick={() => { onDelete(item._id); setMenu(false) }}><Trash2 size={14} /> Remove item</button></div>}</div>
      {item.aiSuggestions && <span className="ai-tag" title={`Suggested: ${item.aiSuggestions.detectedLabel || item.aiSuggestions.category}`}><Sparkles size={11} /> AI · {item.aiSuggestions.detectedLabel || item.aiSuggestions.category}</span>}
    </div>
    <div className="item-details"><div className="item-title-row"><h3>{item.name}</h3><span className="color-dot" style={{ backgroundColor: colorHex(item.color) }} /></div><p>{item.brand || item.category}<span className="dot-separator">·</span>{item.color || 'No color'}</p></div>
  </article>
}
function colorHex(name = '') { return ({ white: '#f5f3ee', cream: '#e9dfce', oatmeal: '#d9c9b3', indigo: '#536c91', espresso: '#49362c', sand: '#d7c29c', sage: '#8ea28a', charcoal: '#55545a', natural: '#c3ad8e', black: '#28282b', blue: '#6f91bb', red: '#c86c63' })[name.toLowerCase()] || '#b9aaa0' }

function OutfitCard({ outfit, onSave, saved }) {
  return <div className="outfit-card"><div className="outfit-topline"><span className="outfit-label"><Sparkles size={13} /> FITVIBE PICK</span><button className={`save-outfit ${saved ? 'is-saved' : ''}`} onClick={onSave} aria-label="Save outfit"><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div><div className="outfit-collage">{outfit.items.map((item, i) => <div className={`collage-photo collage-${i}`} key={item._id}>{photo(item) ? <img src={photo(item)} alt={item.name} /> : <Shirt />}</div>)}</div><h3>{outfit.title}</h3><p>{outfit.caption}</p><div className="outfit-footer"><span>{outfit.items.length} pieces <span className="dot-separator">·</span> {outfit.occasion}</span><button aria-label="View outfit"><ArrowRight size={16} /></button></div></div>
}

function App() {
  const [active, setActive] = useState('overview')
  const [items, setItems] = useState(seedItems)
  const [outfits, setOutfits] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All items')
  const [modal, setModal] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [occasion, setOccasion] = useState('Everyday')
  const [savedOutfits, setSavedOutfits] = useState([])
  const [weather, setWeather] = useState(null)
  const [toast, setToast] = useState('')
  const [day, setDay] = useState(new Date())
  const [locationName, setLocationName] = useState('New York, NY · sample')

  useEffect(() => { fetch('/api/items').then((r) => r.ok ? r.json() : Promise.reject()).then((data) => setItems(data)).catch(() => {}) }, [])
  useEffect(() => { fetch('/api/weather').then((r) => r.ok ? r.json() : Promise.reject()).then(setWeather).catch(() => {}) }, [])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2800); return () => clearTimeout(timer) }, [toast])

  const filteredItems = useMemo(() => items.filter((item) => (category === 'All items' || item.category === category) && `${item.name} ${item.category} ${item.brand} ${item.color}`.toLowerCase().includes(query.toLowerCase())), [items, category, query])
  const outfitIdeas = useMemo(() => {
    const tops = items.filter((i) => i.category === 'Tops')
    const bottoms = items.filter((i) => i.category === 'Bottoms' || i.category === 'Dresses')
    const shoes = items.filter((i) => i.category === 'Shoes')
    const make = (title, t, b, s, caption, event) => ({ title, caption, occasion: event, items: [t, b, ...(s ? [s] : [])].filter(Boolean) })
    const matches = []
    if (tops.length && bottoms.length) {
      matches.push(make('Easy does it', tops[0], bottoms[0], shoes[0], 'Comfortable classics for wherever today takes you.', occasion))
      if (tops[1] || bottoms[1]) matches.push(make('A little more polished', tops[1] || tops[0], bottoms[1] || bottoms[0], shoes[0], 'A fresh combination, already in your closet.', occasion))
      if (bottoms[2] || tops[2]) matches.push(make('Weekend state of mind', tops[2] || tops[0], bottoms[2] || bottoms[0], shoes[1] || shoes[0], 'Relaxed layers, thoughtfully put together.', 'Casual'))
    }
    return matches
  }, [items, occasion])
  const currentWeather = weather?.current
  const temp = currentWeather?.temperature_2m
  const weatherText = temp !== undefined ? `${Math.round(temp)}°` : '18°'
  const dateLabel = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
  const planForLocalWeather = () => {
    if (!navigator.geolocation) { setToast('Location is not available in this browser'); return }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`)
        if (!response.ok) throw new Error('Weather unavailable')
        setWeather(await response.json())
        setLocationName(`Nearby · ${coords.latitude.toFixed(1)}, ${coords.longitude.toFixed(1)}`)
        setToast('Local forecast updated')
      } catch { setToast('Could not load your local forecast') }
    }, () => setToast('Allow location access to get local weather'), { timeout: 8000 })
  }
  const firstWeekday = (new Date(day.getFullYear(), day.getMonth(), 1).getDay() + 6) % 7
  const monthLength = new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate()

  const saveItem = async (form) => {
    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => { if (value && key !== 'file') payload.append(key, value) })
    if (form.file) payload.append('image', form.file)
    try {
      const response = await fetch('/api/items', { method: 'POST', body: payload })
      if (!response.ok) { const body = await response.json(); throw new Error(body.message) }
      const item = await response.json(); setItems((old) => [item, ...old]); setToast(item.aiSuggestions ? `Added · AI suggests ${item.aiSuggestions.detectedLabel || item.aiSuggestions.category} in ${item.aiSuggestions.color}` : 'Added to your wardrobe')
      return item
    } catch (error) {
      if (error.message) throw error
      const item = { ...form, _id: `local-${Date.now()}`, imageUrl: form.file ? URL.createObjectURL(form.file) : '', aiStatus: 'review', wearCount: 0 }
      setItems((old) => [item, ...old]); setToast('Added locally — connect MongoDB to sync'); return item
    }
  }
  const removeItem = async (id) => {
    try { if (!String(id).startsWith('demo-') && !String(id).startsWith('local-')) await fetch(`/api/items/${id}`, { method: 'DELETE' }) } catch { /* local removal still works */ }
    setItems((old) => old.filter((item) => item._id !== id)); setToast('Piece removed')
  }
  const saveOutfit = async (outfit) => {
    const already = savedOutfits.includes(outfit.title)
    setSavedOutfits((old) => already ? old.filter((name) => name !== outfit.title) : [...old, outfit.title])
    if (!already && outfit.items.every((item) => !String(item._id).startsWith('demo-') && !String(item._id).startsWith('local-'))) {
      try { await fetch('/api/outfits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: outfit.title, itemIds: outfit.items.map((item) => item._id), occasion: outfit.occasion }) }) } catch { /* Keep the UI usable offline */ }
    }
    setToast(already ? 'Removed from saved outfits' : 'Outfit saved for later')
  }
  const scheduleOutfit = async (outfit) => {
    const date = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).toISOString()
    try {
      if (outfit.items.every((item) => !String(item._id).startsWith('demo-') && !String(item._id).startsWith('local-'))) await fetch('/api/outfits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: outfit.title, itemIds: outfit.items.map((item) => item._id), occasion: outfit.occasion, scheduledFor: date }) })
    } catch { /* Show scheduled state in current session */ }
    setOutfits((old) => [...old, { ...outfit, date }]); setToast('Outfit planned for tomorrow')
  }
  const title = ({ overview: 'Good morning, Sam', wardrobe: 'Your wardrobe', outfits: 'Outfit ideas', planner: 'Outfit planner' })[active]
  const subtitle = ({ overview: 'A little inspiration for getting dressed today.', wardrobe: 'Everything you own, all in one lovely place.', outfits: 'Thoughtful combinations made from your own pieces.', planner: 'Make tomorrow-you happy. Plan what to wear ahead.' })[active]

  return <div className="app-shell">
    <Sidebar active={active} onChange={setActive} onAdd={() => setModal(true)} open={mobileNav} onClose={() => setMobileNav(false)} />
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMobileNav(true)}><Menu size={21} /></button>
        <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{nav.find((n) => n.id === active)?.label || 'Overview'}</strong></div>
        <div className="topbar-right"><div className="search-box"><Search size={16} /><input aria-label="Search wardrobe" placeholder="Search anything…" value={query} onChange={(e) => { setQuery(e.target.value); if (active === 'overview') setActive('wardrobe') }} /><kbd>⌘ K</kbd></div><span className="topbar-rule" /><IconButton label="Notifications"><Bell size={18} /><i className="notification-dot" /></IconButton><div className="avatar avatar-top">S</div></div>
      </header>
      <div className="page-content">
        <section className="page-heading"><div><div className="date-kicker"><span className="live-dot" /> {dateLabel}</div><h1>{title}<span className="heading-comma">{active === 'overview' ? ' ✨' : ''}</span></h1><p>{subtitle}</p></div><div className="heading-actions"><button className="button button-quiet weather-pill" onClick={planForLocalWeather} title="Use your location for the forecast"><span className="weather-icon"><Sun size={19} /></span><span><strong>{weatherText} <span className="weather-city">· {locationName}</span></strong><small>{currentWeather ? 'Current conditions' : 'Mostly sunny today'}</small></span><ChevronDown size={15} /></button><button className="button button-dark" onClick={() => setModal(true)}><Plus size={17} /> Add a piece</button></div></section>

        {active === 'overview' && <>
          <section className="hero-card"><div className="hero-copy"><div className="hero-label"><Sparkles size={14} /> YOUR DAILY EDIT</div><h2>Wear what feels<br />like <em>you.</em></h2><p>A good outfit can change the whole day.<br className="desktop-break" /> Let’s find yours.</p><button className="button button-lime" onClick={() => setActive('outfits')}>Find my outfit <ArrowRight size={16} /></button><div className="hero-stat"><span className="stat-avatars"><b>S</b><b>M</b><b>J</b></span><span>Styled for <strong>2,400+</strong> good days</span></div></div><div className="hero-art"><div className="hero-circle hero-circle-one"/><div className="hero-circle hero-circle-two"/><div className="hero-image"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=90" alt="Person wearing a relaxed modern outfit" /></div><div className="floating-note"><span className="note-sparkle"><Sparkles size={15} /></span><span><strong>Today’s mood</strong><small>Soft layers, big energy</small></span></div><div className="floating-weather"><Sun size={17} /><strong>Perfect layering weather</strong></div></div><div className="hero-dots" /></section>
          <div className="section-heading section-heading-space"><div><span className="eyebrow">A FEW GOOD THINGS</span><h2>Your style at a glance</h2></div><button className="text-link" onClick={() => setActive('wardrobe')}>View wardrobe <ArrowRight size={15} /></button></div>
          <section className="stats-grid"><div className="stat-card"><div className="stat-top"><span className="stat-icon icon-cream"><Shirt size={18} /></span><span className="stat-trend trend-up"><ArrowUpRight size={13} /> 12%</span></div><div className="stat-number">{items.length + 16}<span> pieces</span></div><p>In your wardrobe</p><div className="stat-bottom"><span className="mini-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></span><span>+3 this month</span></div></div><div className="stat-card"><div className="stat-top"><span className="stat-icon icon-rose"><Heart size={18} /></span><span className="stat-trend trend-up"><ArrowUpRight size={13} /> 8%</span></div><div className="stat-number">18<span> outfits</span></div><p>Saved combinations</p><div className="stat-bottom"><span className="progress-track"><i style={{ width: '72%' }} /></span><span>Looking good</span></div></div><div className="stat-card"><div className="stat-top"><span className="stat-icon icon-sage"><Aperture size={18} /></span><span className="stat-trend trend-neutral">This week</span></div><div className="stat-number">76<span>%</span></div><p>Wardrobe in rotation</p><div className="stat-bottom"><span className="progress-track"><i style={{ width: '76%' }} /></span><span>Nice balance</span></div></div><div className="stat-card stat-card-highlight"><div className="stat-top"><span className="stat-icon icon-lime"><Sparkles size={18} /></span><span className="stat-trend trend-quiet">JUST FOR YOU</span></div><div className="stat-highlight-copy">3 fresh ideas<br />for today</div><p>Based on your wardrobe</p><button className="stat-link" onClick={() => setActive('outfits')}>See what’s good <ArrowRight size={14} /></button></div></section>
          <section className="dashboard-bottom"><div className="wardrobe-preview panel"><div className="panel-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>Recently added</h2></div><button className="text-link" onClick={() => setActive('wardrobe')}>See all <ArrowRight size={15} /></button></div><div className="mini-items">{items.slice(0, 4).map((item, i) => <div className="mini-item" key={item._id}><div className="mini-item-img">{photo(item) ? <img src={photo(item)} alt={item.name} /> : <Shirt />}</div><strong>{item.name}</strong><span>{item.category} <i className="color-dot" style={{ background: colorHex(item.color) }} /></span></div>)}</div></div><div className="week-panel panel"><div className="panel-heading"><div><span className="eyebrow">AHEAD OF THE GAME</span><h2>This week</h2></div><button className="round-arrow" aria-label="Go to planner" onClick={() => setActive('planner')}><ArrowUpRight size={17} /></button></div><div className="week-row">{['M','T','W','T','F'].map((letter, i) => <button key={i} className={`week-day ${i === 0 ? 'today' : ''} ${i === 2 ? 'has-outfit' : ''}`} onClick={() => setActive('planner')}><span>{letter}</span><strong>{27 + i}</strong>{i === 2 && <i />}</button>)}</div><div className="week-note"><span className="week-note-dot" /><div><strong>{outfits.length ? 'One outfit planned' : 'Your week is looking open'}</strong><small>{outfits.length ? 'Tomorrow · Easy does it' : 'Pick a look for tomorrow?'}</small></div><button onClick={() => setActive('planner')}><ArrowRight size={15} /></button></div></div></section>
          <section className="bottom-quote"><div className="quote-mark">“</div><p>Style is a way to say who you are without having to speak.</p><span>— Rachel Zoe</span><div className="quote-flower">✳</div></section>
        </>}

        {active === 'wardrobe' && <section className="wardrobe-view"><div className="wardrobe-toolbar"><div className="category-tabs" role="tablist" aria-label="Filter by category">{categories.map((c) => <button key={c} role="tab" aria-selected={category === c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}{c === 'All items' && <span>{items.length}</span>}</button>)}</div><button className="button button-outline filter-button"><SlidersHorizontal size={15} /> Filters <ChevronDown size={14} /></button></div><div className="wardrobe-summary"><span>Showing <strong>{filteredItems.length} pieces</strong></span><button><Grid2X2 size={15} /> Grid view</button></div>{filteredItems.length ? <div className="item-grid">{filteredItems.map((item, i) => <ItemCard key={item._id} item={item} index={i} onDelete={removeItem} />)}</div> : <div className="empty-state"><div className="empty-icon"><Shirt size={25} /></div><h3>No pieces found</h3><p>Try another search or add something new to your closet.</p><button className="button button-dark" onClick={() => setModal(true)}><Plus size={16} /> Add a piece</button></div>}</section>}

        {active === 'outfits' && <section className="outfits-view"><div className="recommend-banner"><div className="recommend-icon"><WandSparkles size={21} /></div><div className="recommend-copy"><strong>Your closet, remixed.</strong><span>Pick a moment and we’ll find a look using what you already own.</span></div><label className="occasion-select"><span>STYLE FOR</span><select value={occasion} onChange={(e) => setOccasion(e.target.value)}>{['Everyday', 'Work', 'Casual', 'Party', 'Travel', 'Wedding'].map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={14} /></label></div>{outfitIdeas.length ? <><div className="outfits-section-head"><div><span className="eyebrow">MADE FOR YOUR MOOD</span><h2>Fresh combinations</h2></div><span className="ideas-count">{outfitIdeas.length} ideas <Sparkles size={13} /></span></div><div className="outfit-grid">{outfitIdeas.map((outfit) => <OutfitCard key={outfit.title} outfit={outfit} saved={savedOutfits.includes(outfit.title)} onSave={() => saveOutfit(outfit)} />)}</div><div className="outfit-nudge"><div className="nudge-spark"><Sparkles size={17} /></div><div><strong>Good outfits start with what you love.</strong><span>Add a few more pieces to unlock even more combinations.</span></div><button className="text-link" onClick={() => setModal(true)}>Add a piece <ArrowRight size={15} /></button></div></> : <div className="empty-state"><div className="empty-icon"><Sparkles size={25} /></div><h3>Your next favorite look starts here</h3><p>Add at least one top and one bottom to get personalized outfit combinations.</p><button className="button button-dark" onClick={() => setModal(true)}><Plus size={16} /> Add a piece</button></div>}</section>}

        {active === 'planner' && <section className="planner-view"><div className="planner-top"><div><span className="eyebrow">MAKE SPACE FOR A GOOD OUTFIT</span><h2>Your week, styled.</h2><p>Plan ahead, feel good all week.</p></div><div className="month-switch"><IconButton label="Previous month" onClick={() => setDay(new Date(day.getFullYear(), day.getMonth() - 1, 1))}><ChevronLeft size={18} /></IconButton><strong>{day.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong><IconButton label="Next month" onClick={() => setDay(new Date(day.getFullYear(), day.getMonth() + 1, 1))}><ChevronRight size={18} /></IconButton></div></div><div className="calendar panel"><div className="calendar-weekdays">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => <span key={d}>{d}</span>)}</div><div className="calendar-days">{Array.from({ length: 42 }, (_, i) => { const dateNum = i - firstWeekday + 1; const actual = dateNum > 0 && dateNum <= monthLength; const shownDate = actual ? dateNum : dateNum <= 0 ? new Date(day.getFullYear(), day.getMonth(), dateNum).getDate() : dateNum - monthLength; const isToday = actual && dateNum === day.getDate(); const planned = outfits.find((o) => new Date(o.date).getDate() === dateNum && new Date(o.date).getMonth() === day.getMonth()); return <button key={i} className={`calendar-day ${!actual ? 'outside' : ''} ${isToday ? 'today' : ''} ${planned ? 'planned' : ''}`} onClick={() => { if (actual && outfitIdeas[0]) scheduleOutfit(outfitIdeas[0]) }} disabled={!actual}><span>{shownDate}</span>{planned && <small>{planned.title}</small>}{actual && dateNum === day.getDate() + 1 && !planned && <small className="calendar-suggestion">+ plan a look</small>}</button> })}</div></div><div className="planner-bottom"><div className="panel planner-weather"><div className="weather-big-icon"><CloudSun size={25} /></div><div><span className="eyebrow">TOMORROW’S FORECAST</span><h3>{weatherText} and lovely</h3><p>Looks like layering weather. We’ll keep that in mind.</p></div><div className="weather-low-high"><span>H {weather?.daily?.temperature_2m_max?.[1] ?? 21}°</span><span>L {weather?.daily?.temperature_2m_min?.[1] ?? 14}°</span></div></div><div className="panel plan-suggestion"><div className="suggestion-top"><span className="eyebrow">A LITTLE NUDGE</span><Sparkles size={16} /></div><strong>{outfitIdeas[0]?.title || 'Make a little room for style'}</strong><span>{outfitIdeas[0] ? outfitIdeas[0].caption : 'Add some wardrobe pieces and we’ll help style your week.'}</span><button className="text-link" onClick={() => outfitIdeas[0] && scheduleOutfit(outfitIdeas[0])}>Plan this outfit <ArrowRight size={14} /></button></div></div></section>}
        <footer className="page-footer"><span>Made for your kind of style <span className="footer-heart">♥</span></span><span>FITVIBE © 2025</span></footer>
      </div>
    </main>
    {modal && <AddItemModal onClose={() => setModal(false)} onSave={saveItem} />}
    {toast && <div className="toast"><span><Check size={15} /></span>{toast}</div>}
  </div>
}

export default App
