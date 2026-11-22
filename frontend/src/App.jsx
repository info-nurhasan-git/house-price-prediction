import { useEffect, useState } from 'react'

const DEFAULT_FORM = {
  area: '7420',
  bedrooms: '4',
  bathrooms: '2',
  stories: '3',
  parking: '2',
  mainroad: 'Yes',
  guestroom: 'No',
  basement: 'No',
  hotwaterheating: 'No',
  airconditioning: 'Yes',
  prefarea: 'Yes',
  furnishingstatus: 'Furnished',
}

const YES_NO = ['Yes', 'No']
const FURNISHING_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished']

const NUMBER_FIELDS = [
  ['area', 'Area', 'sq ft', 500, 50000, 10, 'Total covered area of the house'],
  ['bedrooms', 'Bedrooms', 'rooms', 1, 10, 1, 'Number of bedrooms'],
  ['bathrooms', 'Bathrooms', 'rooms', 1, 10, 1, 'Number of bathrooms'],
  ['stories', 'Stories', 'floors', 1, 5, 1, 'Number of floors'],
  ['parking', 'Parking', 'spaces', 0, 5, 1, 'Available parking spaces'],
]

const AMENITIES = [
  ['mainroad', 'Main road'],
  ['guestroom', 'Guest room'],
  ['basement', 'Basement'],
  ['hotwaterheating', 'Hot water heating'],
  ['airconditioning', 'Air conditioning'],
  ['prefarea', 'Preferred area'],
]

function HouseLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10 21v-6h4v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.5 13.5h.01M15.5 13.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function HouseShowcase() {
  return (
    <div className="house-showcase" aria-hidden="true">
      <div className="showcase-glow" />
      <div className="showcase-tag">
        <span className="tag-dot" /> Model ready · Random Forest
      </div>
      <svg className="house-svg" viewBox="0 0 620 330" role="img">
        <defs>
          <linearGradient id="wallGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
          <linearGradient id="roofGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
        </defs>
        <ellipse cx="310" cy="296" rx="230" ry="14" fill="rgba(15, 23, 42, 0.14)" />
        <path d="M310 48 566 158H54L310 48Z" fill="url(#roofGradient)" />
        <path d="M310 48 566 158H54L310 48Z" fill="none" stroke="#065f46" strokeWidth="4" strokeLinejoin="round" />
        <rect x="104" y="158" width="412" height="126" rx="8" fill="url(#wallGradient)" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M104 158h412" stroke="#94a3b8" strokeWidth="4" />
        <rect x="140" y="188" width="104" height="88" rx="6" fill="url(#glassGradient)" stroke="#38bdf8" strokeWidth="3" />
        <path d="M192 188v88M140 232h104" stroke="#7dd3fc" strokeWidth="3" />
        <rect x="386" y="188" width="104" height="88" rx="6" fill="url(#glassGradient)" stroke="#38bdf8" strokeWidth="3" />
        <path d="M438 188v88M386 232h104" stroke="#7dd3fc" strokeWidth="3" />
        <path d="M276 284v-62a20 20 0 0 1 20-20h28a20 20 0 0 1 20 20v62" fill="#b45309" stroke="#92400e" strokeWidth="3" />
        <circle cx="306" cy="245" r="3.5" fill="#fde68a" />
        <rect x="272" y="120" width="76" height="42" rx="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
        <path d="M282 141h56" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
        <circle cx="84" cy="278" r="21" fill="#16a34a" />
        <circle cx="104" cy="266" r="17" fill="#22c55e" />
        <circle cx="540" cy="278" r="21" fill="#16a34a" />
        <circle cx="522" cy="264" r="16" fill="#22c55e" />
        <path d="M84 296h28M508 296h28" stroke="#15803d" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div className="showcase-caption">
        <span>Area &amp; rooms</span>
        <span>Amenities</span>
        <span>Furnishing</span>
      </div>
    </div>
  )
}

function TextField({ id, label, unit, hint, value, min, max, step, onChange, error }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {unit && <span className="unit">{unit}</span>}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={error ? 'input invalid' : 'input'}
        placeholder={label}
      />
      {hint && <small className="hint">{hint}</small>}
    </div>
  )
}

function Segmented({ legend, options, value, onChange, name }) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="segmented">
        {options.map((option) => (
          <label key={option} className={value === option ? 'segment active' : 'segment'}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={onChange}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function ResultPanel({ result, loading, onReset }) {
  return (
    <div className="card result-card">
      <div className="result-head">
        <span className="result-kicker">Prediction result</span>
        <span className={loading ? 'status-pill working' : 'status-pill'}>
          <span className="pill-dot" /> {loading ? 'Predicting' : 'Ready'}
        </span>
      </div>

      {loading ? (
        <div className="result-loading" aria-live="polite">
          <div className="spinner" />
          <p>Analysing your house details…</p>
        </div>
      ) : result ? (
        <div className="result-body" aria-live="polite">
          <span className="result-label">Estimated house price</span>
          <div className="price">{result.formatted_price}</div>
          <div className="price-inr">≈ ₹ {Number(result.predicted_price_inr).toLocaleString('en-IN')}</div>
          <div className="result-chips">
            <span>{Number(result.selected.area).toLocaleString('en-IN')} sq ft</span>
            <span>{result.selected.bedrooms} bed</span>
            <span>{result.selected.bathrooms} bath</span>
            <span>{result.selected.furnishingstatus}</span>
          </div>
          <button type="button" className="btn secondary full" onClick={onReset}>
            Reset form
          </button>
          <p className="disclaimer">
            Estimate from the trained Random Forest model. Actual market price may vary with location and condition.
          </p>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><HouseLogo size={42} /></div>
          <h3>Your estimate will appear here</h3>
          <p>Fill in the house details and hit <strong>Predict Price</strong> to see the result.</p>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [backend, setBackend] = useState('checking')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/health', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setBackend(data.status === 'ok' ? 'online' : 'error'))
      .catch((err) => {
        if (err.name !== 'AbortError') setBackend('offline')
      })
    return () => controller.abort()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }))
    setError('')
  }

  const validate = () => {
    const problems = {}
    NUMBER_FIELDS.forEach(([key, label, , min, max]) => {
      const value = Number(form[key])
      if (form[key] === '' || !Number.isFinite(value)) problems[key] = `${label} is required.`
      else if (value < min || value > max) problems[key] = `${label} must be between ${min} and ${max}.`
      else if (!Number.isInteger(value) && key !== 'area') problems[key] = `${label} must be a whole number.`
    })
    setFieldErrors(problems)
    return Object.keys(problems).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      setError('Please fix the highlighted fields and try again.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: Number(form.area),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          stories: Number(form.stories),
          parking: Number(form.parking),
          mainroad: form.mainroad,
          guestroom: form.guestroom,
          basement: form.basement,
          hotwaterheating: form.hotwaterheating,
          airconditioning: form.airconditioning,
          prefarea: form.prefarea,
          furnishingstatus: form.furnishingstatus,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Prediction request failed.')
      setResult(data)
      setBackend('online')
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Cannot reach the Flask backend. Is it running on port 5000?' : err.message)
      setBackend('offline')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(DEFAULT_FORM)
    setResult(null)
    setError('')
    setFieldErrors({})
  }

  const backendText = {
    checking: 'Checking backend…',
    online: 'Backend online',
    offline: 'Backend offline',
    error: 'Model unavailable',
  }[backend]

  return (
    <div className="app-shell" id="top">
      <header className="site-header">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <span className="brand-icon"><HouseLogo /></span>
            <span>HousePrice <strong>AI</strong></span>
          </a>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#predict">Predict</a>
            <a href="#model">How it works</a>
            <a href="#about">About</a>
          </nav>
          <a className="nav-cta" href="#predict">Get estimate</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-dot" /> Machine Learning · Random Forest</span>
              <h1>What is your home <span className="gradient-text">really worth?</span></h1>
              <p>
                Enter a few details about your property and get an instant, data-driven price estimate
                from a trained machine learning model.
              </p>
              <div className="hero-actions">
                <a href="#predict" className="btn primary">Predict price <span aria-hidden="true">→</span></a>
                <a href="#model" className="btn ghost">See how it works</a>
              </div>
              <div className="hero-meta">
                <span><strong>13</strong> model features</span>
                <span><strong>1</strong> trained model</span>
                <span><strong>100%</strong> local inference</span>
              </div>
            </div>
            <HouseShowcase />
          </div>
        </section>

        <section className="section" id="predict">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">Prediction studio</span>
              <h2>Tell us about your house</h2>
              <p>Every field below is passed to the model in the exact training order.</p>
            </div>

            {backend === 'offline' && (
              <div className="alert" role="alert">
                Flask backend is not reachable. Start it with <code>python app.py</code> inside <code>backend/</code>, then refresh.
              </div>
            )}

            <div className="workspace">
              <form className="card form-card" onSubmit={handleSubmit} noValidate>
                <div className="card-head">
                  <div>
                    <h3>Property details</h3>
                    <p>All fields are required</p>
                  </div>
                  <span className="model-badge">Random Forest</span>
                </div>

                <div className="form-group">
                  <h4>Basics</h4>
                  <div className="field-grid">
                    {NUMBER_FIELDS.map(([key, label, unit, min, max, step, hint]) => (
                      <TextField
                        key={key}
                        id={key}
                        label={label}
                        unit={unit}
                        hint={hint}
                        value={form[key]}
                        min={min}
                        max={max}
                        step={step}
                        onChange={handleChange}
                        error={fieldErrors[key]}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <h4>Amenities</h4>
                  <div className="toggle-grid">
                    {AMENITIES.map(([key, label]) => (
                      <Segmented
                        key={key}
                        legend={label}
                        name={key}
                        options={YES_NO}
                        value={form[key]}
                        onChange={handleChange}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <h4>Finishing</h4>
                  <Segmented
                    legend="Furnishing status"
                    name="furnishingstatus"
                    options={FURNISHING_OPTIONS}
                    value={form.furnishingstatus}
                    onChange={handleChange}
                  />
                </div>

                {error && <div className="form-error" role="alert">{error}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn primary" disabled={loading}>
                    {loading ? <><span className="btn-spinner" /> Predicting…</> : <>Predict price <span aria-hidden="true">→</span></>}
                  </button>
                  <button type="button" className="btn text" onClick={handleReset}>Clear</button>
                </div>
              </form>

              <aside className="result-column">
                <ResultPanel result={result} loading={loading} onReset={handleReset} />
                <div className="card info-card">
                  <span className="info-label">System status</span>
                  <div className={backend === 'online' ? 'info-value ok' : 'info-value'}>
                    <span className="pill-dot" /> {backendText}
                  </div>
                  <p>Yes/No answers are encoded as 1/0 and furnishing is one-hot encoded exactly like the training data.</p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="section soft" id="model">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">Under the hood</span>
              <h2>How the prediction works</h2>
              <p>A simple, transparent pipeline from your input to the final estimate.</p>
            </div>
            <div className="steps">
              <div className="step-card">
                <span className="step-number">01</span>
                <h3>Enter details</h3>
                <p>Area, rooms, parking, six amenities and furnishing status — 13 training features in total.</p>
              </div>
              <div className="step-card">
                <span className="step-number">02</span>
                <h3>Encode &amp; predict</h3>
                <p>Flask encodes the categories like training did and runs the saved Random Forest model.</p>
              </div>
              <div className="step-card">
                <span className="step-number">03</span>
                <h3>Read the estimate</h3>
                <p>The predicted price is returned in rupees and shown instantly in the React interface.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="about">
        <div className="container footer-inner">
          <a className="brand" href="#top">
            <span className="brand-icon"><HouseLogo size={24} /></span>
            <span>HousePrice <strong>AI</strong></span>
          </a>
          <p>React + Flask interface for a scikit-learn house price prediction model.</p>
        </div>
      </footer>
    </div>
  )
}
