import { useEffect, useRef, useState } from 'react'
import { Aperture, ArrowRight, Check, Heart, ImagePlus, LoaderCircle, Shirt, Sparkles, Trash2, Upload } from 'lucide-react'

const storageKey = 'fitvibe-favorites-v1'

function OutfitCard({ outfit, saved, onSave }) {
  return <article className="outfit-card">
    <div className="card-top"><span className="eyebrow">{outfit.occasion || 'YOUR OUTFIT EDIT'}</span><button className={`icon-button ${saved ? 'saved' : ''}`} onClick={onSave} aria-label={`${saved ? 'Unsave' : 'Save'} ${outfit.title}`} aria-pressed={saved}><Heart size={19} fill={saved ? 'currentColor' : 'none'} /></button></div>
    <div className="palette" aria-label="Suggested color palette">{outfit.colors.map((color, i) => <span key={`${color}-${i}`} style={{ background: color }} title={color}><span className="sr-only">{color} </span></span>)}</div>
    <h3>{outfit.title}</h3><p>{outfit.reason}</p>
    <ul className="pieces">{outfit.pieces.map((piece, i) => <li key={i}><Check size={15} />{piece}</li>)}</ul>
    <div className="styling-tip"><Sparkles size={16} /><p>{outfit.tip}</p></div>
  </article>
}


export default function App() {
  const [tab, setTab] = useState('match')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [occasion, setOccasion] = useState('Everyday')
  const [preference, setPreference] = useState('Any style')
  const [correction, setCorrection] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [result, setResult] = useState(null)
  const [configured, setConfigured] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
      return Array.isArray(stored) ? stored.filter((item) => item && typeof item.id === 'string' && ['title', 'reason', 'tip'].every((key) => typeof item[key] === 'string') && ['pieces', 'colors'].every((key) => Array.isArray(item[key]) && item[key].every((value) => typeof value === 'string'))).slice(0, 30) : []
    } catch { return [] }
  })
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const controllerRef = useRef(null)
  useEffect(() => {
    fetch('/api/health').then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setConfigured(data.aiConfigured)).catch(() => {})
    return () => controllerRef.current?.abort()
  }, [])
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => { if (result) resultsRef.current?.focus() }, [result])

  function selectFile(selected) {
    if (busy || !selected) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) { setError('Choose a JPG, PNG, or WEBP photo.'); return }
    if (selected.size > 8 * 1024 * 1024 || selected.size === 0) { setError('Choose a non-empty image smaller than 8 MB.'); return }
    setFile(selected); setResult(null); setCorrection(''); setError('')
  }
  async function analyze(event) {
    event.preventDefault()
    if (!file || busy) return
    setBusy(true); setError(''); setResult(null)
    const body = new FormData()
    body.append('image', file); body.append('occasion', occasion); body.append('preference', preference); body.append('correction', correction)
    const controller = new AbortController()
    controllerRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 75000)
    try {
      const response = await fetch('/api/style', { method: 'POST', body, signal: controller.signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not analyze this photo.')
      if (!data.isClothing) { setError(data.message); return }
      setResult({ ...data, outfits: data.outfits.map((outfit) => ({ ...outfit, id: crypto.randomUUID(), occasion })) })
      setConfigured(true)
    } catch (err) { setError(err.name === 'AbortError' ? 'The request timed out. Please try again.' : err instanceof TypeError ? 'Cannot reach the API. Check that the server is running.' : err.message) }
    finally { clearTimeout(timeout); setBusy(false) }
  }
  function toggleFavorite(outfit) {
    const exists = favorites.some((item) => item.id === outfit.id)
    if (!exists && favorites.length >= 30) { setNotice('Your collection is full. Remove a favorite before adding another.'); return }
    const next = exists ? favorites.filter((item) => item.id !== outfit.id) : [...favorites, outfit]
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setFavorites(next); setNotice(exists ? 'Outfit removed from favorites.' : 'Outfit saved on this browser.') }
    catch { setNotice('Browser storage is unavailable. This outfit could not be saved.') }
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><a className="brand" href="/" aria-label="FitVibe home"><span className="brand-mark"><Aperture size={22} /></span>fitvibe<span className="brand-period">.</span></a><nav aria-label="Main navigation"><button className={tab === 'match' ? 'active' : ''} onClick={() => setTab('match')} aria-current={tab === 'match' ? 'page' : undefined}><Sparkles size={16} /> Outfit matcher</button><button className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')} aria-current={tab === 'saved' ? 'page' : undefined}><Heart size={16} /> Saved <span className="count">{favorites.length}</span></button></nav><span className="header-label">YOUR PERSONAL STYLE STUDIO</span></header>
    <main id="main">
      {tab === 'match' ? <>
        <section className="intro"><div><span className="eyebrow"><span className="live-dot" /> LESS GUESSWORK. MORE GOOD OUTFITS.</span><h1>One piece.<br />A whole new <em>perspective.</em></h1><p>Your favorite shirt. Those new trousers. Upload a photo and discover what to wear with it.</p></div><div className="intro-note"><span>THE FITVIBE FORMULA</span><p>Your piece <span>+</span> a little inspiration<br /><strong>Your next favorite outfit.</strong></p><div className="mini-palette"><i /><i /><i /><i /></div></div></section>
        {configured === false && <div className="setup-notice" role="status"><Sparkles size={19} /><div><strong>One small setup step</strong><p>Add a valid GEMINI_API_KEY to the server’s .env file, then restart the API. Free-tier availability and limits depend on your Google account.</p></div></div>}
        <section className="studio"><form className="upload-panel" onSubmit={analyze}><div className="section-title"><span className="step">01</span><div><h2>Start with your piece</h2><p>One clear photo is all you need.</p></div></div>
          <input ref={inputRef} id="clothing-image" className="sr-only" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = '' }} />
          <button type="button" className={`upload-zone ${preview ? 'has-preview' : ''} ${dragging ? 'dragging' : ''}`} disabled={busy} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files?.[0]) }} aria-label={file ? 'Change clothing photo' : 'Upload clothing photo'}>
            {preview ? <><img src={preview} alt="Your uploaded clothing" /><span className="change-image"><ImagePlus size={16} /> Change photo</span></> : <><span className="upload-icon"><Upload size={25} /></span><strong>Drop your clothing photo here</strong><span>or <u>browse files</u></span><small>JPG, PNG, WEBP · up to 8 MB</small></>}
          </button>
          {file && <div className="file-detail"><span>{file.name}</span><button type="button" disabled={busy} aria-label="Remove uploaded photo" onClick={() => { setFile(null); setResult(null); setError('') }}><Trash2 size={16} /></button></div>}
          <div className="form-grid"><label>Dress for<select value={occasion} disabled={busy} onChange={(event) => setOccasion(event.target.value)}>{['Everyday', 'Casual', 'Work', 'Party', 'Travel', 'Wedding'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Style preference<select value={preference} disabled={busy} onChange={(event) => setPreference(event.target.value)}>{['Any style', 'Masculine', 'Feminine', 'Gender-neutral'].map((value) => <option key={value}>{value}</option>)}</select></label></div>
          <label className="description-label">Describe or correct your piece <span>optional</span><input maxLength={200} value={correction} disabled={busy} onChange={(event) => setCorrection(event.target.value)} placeholder="e.g. Navy oversized shirt, not a jacket" /></label>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="primary-button" disabled={!file || busy}>{busy ? <><LoaderCircle className="spin" size={18} /> Finding your combinations…</> : <><Sparkles size={18} /> Find my matches <ArrowRight size={17} /></>}</button>
          <p className="privacy-note">Your photo is sent to Google Gemini for analysis. FitVibe does not save the uploaded photo.</p>
        </form><aside className="inspiration-panel"><span className="eyebrow">A LITTLE DIRECTION GOES A LONG WAY</span><h2>Good style starts<br />with what you <em>love.</em></h2><div className="inspiration-photo"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=850&q=85" alt="Fashion inspiration with layered clothing" /><span><Sparkles size={15} /> A fresh take on your everyday</span></div><div className="how-it-works"><div><b>01</b><span>Upload a piece</span></div><div><b>02</b><span>Find your pairings</span></div><div><b>03</b><span>Save what you love</span></div></div><p className="photo-tip">For better results, photograph one item in natural light against a simple background.</p></aside></section>
        <div aria-live="polite" className="progress-status">{busy && 'Looking at colors, patterns, and styling possibilities. This may take up to a minute.'}</div>
        {result && <section className="results" ref={resultsRef} tabIndex={-1} aria-labelledby="results-title"><div className="results-heading"><div><span className="eyebrow">02 / YOUR PERSONAL EDIT</span><h2 id="results-title">Meet your next combinations.</h2></div><span className="ai-badge"><Sparkles size={14} /> Styled with Gemini</span></div><div className="detected"><Shirt size={26} /><div><span className="eyebrow">YOUR UPLOADED PIECE</span><h3>{result.garment.name}</h3><p>{result.garment.color} · {result.garment.pattern} · {result.garment.style}</p></div></div>{result.message && <p className="result-message">{result.message}</p>}<div className="outfit-grid">{result.outfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} saved={favorites.some((item) => item.id === outfit.id)} onSave={() => toggleFavorite(outfit)} />)}</div><p className="results-note">Style is personal. Check the detected details and use the description field to correct anything the AI missed.</p></section>}
      </> : <section className="saved-section"><span className="eyebrow">YOUR GOOD-OUTFIT COLLECTION</span><h1>Keep the <em>good ones.</em></h1><p>Favorite combinations, saved on this browser. Uploaded photos are not included.</p>{favorites.length ? <div className="outfit-grid">{favorites.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} saved onSave={() => toggleFavorite(outfit)} />)}</div> : <div className="empty-state"><Heart size={34} /><h2>A little inspiration belongs here.</h2><p>Upload a piece and tap the heart on a look you love.</p><button className="primary-button" onClick={() => setTab('match')}>Find my first match <ArrowRight size={17} /></button></div>}</section>}
    </main>
    {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
    <footer><span className="brand">fitvibe.</span><span>A little inspiration. A lot more you.</span><span>AI suggestions, your personal style.</span></footer>
  </div>
}
