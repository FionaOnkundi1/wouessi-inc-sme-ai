import { useMemo, useState } from 'react'
import styles from './BusinessReviewScreen.module.css'

const VIBES = ['modern', 'warm', 'bold', 'minimal', 'professional', 'playful']

const REQUIRED_FIELDS = [
  'businessName',
  'businessType',
  'productsOrServices',
  'location',
  'targetCustomers',
  'uniqueSellingPoint',
  'tagline',
  'shortDescription',
]

export default function BusinessReviewScreen({
  review,
  onConfirm,
  onStartOver,
  isSubmitting,
  error,
}) {
  const [businessData, setBusinessData] = useState(review.businessData)
  const [showOptional, setShowOptional] = useState(false)

  const missingRequired = useMemo(
    () => REQUIRED_FIELDS.filter((field) => !String(businessData[field] || '').trim()),
    [businessData]
  )

  function updateField(field, value) {
    setBusinessData((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (missingRequired.length || isSubmitting) return
    onConfirm({
      ...businessData,
      missingFields: [],
      confidence: businessData.confidence || 'medium',
    })
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Business review navigation">
        <button type="button" className={styles.logoButton} onClick={onStartOver} aria-label="Start over">
          <img src="/logo.png" alt="Wouessi Inc." className={styles.logo} />
        </button>
        <button type="button" className={styles.startOverButton} onClick={onStartOver}>
          Start over
        </button>
      </nav>

      <form className={styles.workspace} onSubmit={submit}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Review your business details</p>
            <h1>Check the details before we build.</h1>
            <p className={styles.intro}>
              Correct anything the AI misunderstood. These details directly shape your website copy,
              services, style, and contact section.
            </p>
          </div>
          <div className={styles.reviewStatus}>
            <span className={styles.statusDot} />
            Ready for your review
          </div>
        </header>

        <section className={styles.section} aria-labelledby="business-basics">
          <div className={styles.sectionHeading}>
            <span>01</span>
            <div>
              <h2 id="business-basics">Business basics</h2>
              <p>The essentials customers need to understand immediately.</p>
            </div>
          </div>

          <div className={styles.twoColumnGrid}>
            <Field
              label="Business name"
              value={businessData.businessName}
              onChange={(value) => updateField('businessName', value)}
              required
            />
            <Field
              label="Business type"
              value={businessData.businessType}
              onChange={(value) => updateField('businessType', value)}
              placeholder="e.g. Electrical services"
              required
            />
            <Field
              label="Location or service area"
              value={businessData.location}
              onChange={(value) => updateField('location', value)}
              required
            />
            <Field
              label="Contact details"
              value={businessData.contactHint}
              onChange={(value) => updateField('contactHint', value)}
              placeholder="Phone, email, opening hours"
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="business-offer">
          <div className={styles.sectionHeading}>
            <span>02</span>
            <div>
              <h2 id="business-offer">Offer and audience</h2>
              <p>This content becomes the core of the generated website.</p>
            </div>
          </div>

          <div className={styles.stack}>
            <Field
              label="Products or services"
              value={businessData.productsOrServices}
              onChange={(value) => updateField('productsOrServices', value)}
              multiline
              required
            />
            <div className={styles.twoColumnGrid}>
              <Field
                label="Typical customers"
                value={businessData.targetCustomers}
                onChange={(value) => updateField('targetCustomers', value)}
                multiline
                required
              />
              <Field
                label="What makes you different"
                value={businessData.uniqueSellingPoint}
                onChange={(value) => updateField('uniqueSellingPoint', value)}
                multiline
                required
              />
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="website-direction">
          <div className={styles.sectionHeading}>
            <span>03</span>
            <div>
              <h2 id="website-direction">Website direction</h2>
              <p>Choose the tone and confirm the headline copy.</p>
            </div>
          </div>

          <fieldset className={styles.vibeFieldset}>
            <legend>Website style</legend>
            <div className={styles.vibeOptions}>
              {VIBES.map((vibe) => (
                <label key={vibe} className={businessData.websiteVibe === vibe ? styles.vibeActive : styles.vibe}>
                  <input
                    type="radio"
                    name="websiteVibe"
                    value={vibe}
                    checked={businessData.websiteVibe === vibe}
                    onChange={() => updateField('websiteVibe', vibe)}
                  />
                  {vibe}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.stack}>
            <Field
              label="Tagline"
              value={businessData.tagline}
              onChange={(value) => updateField('tagline', value)}
              required
            />
            <Field
              label="Short business description"
              value={businessData.shortDescription}
              onChange={(value) => updateField('shortDescription', value)}
              multiline
              required
            />
          </div>

          <button
            type="button"
            className={styles.optionalToggle}
            onClick={() => setShowOptional((current) => !current)}
            aria-expanded={showOptional}
          >
            {showOptional ? 'Hide optional details' : 'Add optional details'}
          </button>

          {showOptional && (
            <div className={styles.twoColumnGrid}>
              <Field
                label="Extra website features"
                value={businessData.extraFeatures}
                onChange={(value) => updateField('extraFeatures', value)}
                placeholder="e.g. Booking form, gallery"
              />
              <Field
                label="Competitor or inspiration"
                value={businessData.competitorReference}
                onChange={(value) => updateField('competitorReference', value)}
                placeholder="A website or business you like"
              />
            </div>
          )}
        </section>

        <footer className={styles.actions}>
          <div className={styles.actionMessage} aria-live="polite">
            {error
              ? <span className={styles.error}>{error}</span>
              : missingRequired.length
                ? `${missingRequired.length} required ${missingRequired.length === 1 ? 'detail needs' : 'details need'} attention`
                : 'Everything required is ready'}
          </div>
          <button type="submit" className={styles.generateButton} disabled={Boolean(missingRequired.length) || isSubmitting}>
            {isSubmitting ? 'Building website…' : 'Confirm and build website'}
          </button>
        </footer>
      </form>
    </main>
  )
}

function Field({ label, value, onChange, placeholder, multiline = false, required = false }) {
  const Component = multiline ? 'textarea' : 'input'

  return (
    <label className={styles.field}>
      <span>
        {label}
        {required && <strong>Required</strong>}
      </span>
      <Component
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={multiline ? 4 : undefined}
        required={required}
      />
    </label>
  )
}
