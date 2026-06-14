import { useState, useRef, useEffect } from 'react'
import { isSpeechSupported, startSpeechSession } from '../services/speechService'
import { EXAMPLES } from '../data/examples'
import { AuthControls } from '../auth/AuthContext'
import styles from './InputScreen.module.css'

export default function InputScreen({
  onSubmit,
  onOpenDashboard,
  onHome,
  onFeatures,
  onHowItWorks,
  onPreviewTemplates,
}) {
  const [business, setBusiness] = useState('')
  const [location, setLocation] = useState('')
  const [recording, setRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [speechError, setSpeechError] = useState('')
  const sessionRef = useRef(null)
  const speechAvailable = isSpeechSupported()

  useEffect(() => () => sessionRef.current?.stop(), [])

  function startRecording() {
    setSpeechError('')
    setRecording(true)
    const session = startSpeechSession({
      onTranscript: (t) => { setBusiness(t); setInterimText('') },
      onInterim: (t) => setInterimText(t),
      onError: (err) => {
        setSpeechError(
          err === 'not-allowed'
            ? 'Microphone access denied. Please allow microphone access and try again.'
            : err === 'empty-transcript'
            ? 'I could not hear enough speech. Please speak for a few seconds or type your description.'
            : err === 'transcription-failed'
            ? 'Could not transcribe audio. Please try again or type your description.'
            : 'Speech error — try typing instead.'
        )
        setRecording(false)
        sessionRef.current = null
      },
      onStateChange: (s) => { if (s === 'idle') setRecording(false) },
    })
    sessionRef.current = session
  }

  function stopRecording() {
    sessionRef.current?.stop()
    sessionRef.current = null
    setRecording(false)
    setInterimText('')
  }

  function handleMic() { recording ? stopRecording() : startRecording() }

  function handleGenerate() {
    const val = business.trim()
    if (!val) return
    const full = location.trim() ? `${val}, based in ${location.trim()}` : val
    onSubmit(full)
  }

  function fillExample(ex) {
    setBusiness(ex.input)
    setSpeechError('')
    document.getElementById('business-input')?.focus()
  }

  return (
    <div className={styles.page}>

      {/* Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {recording ? 'Recording started. Speak your business description.' : ''}
        {speechError || ''}
      </div>

      {/* NAVBAR */}
      <nav className={styles.nav} role="navigation" aria-label="Main navigation">
        <button type="button" className={styles.navBrand} onClick={onHome} aria-label="Go to homepage">
          <div className={styles.navLogo} aria-hidden="true">
            <img src="/logo.png" alt="Wouessi Inc." style={{ width: '80px', height: 'auto', objectFit: 'contain' }} />
          </div>
        </button>
        <div className={styles.navLinks}>
          <button type="button" className={styles.navLinkButton} onClick={onFeatures}>Features</button>
          <button type="button" className={styles.navLinkButton} onClick={onHowItWorks}>How It Works</button>
          <button type="button" className={styles.navLinkButton} onClick={onPreviewTemplates}>Templates</button>
        </div>
        <AuthControls className={styles.navCta} onOpenDashboard={onOpenDashboard} />
      </nav>

      {/* MAIN CONTENT */}
      <div className={styles.container} role="main">

        {/* LEFT: Hero copy */}
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.heroPill} aria-label="AI-Powered Website Generation">
              <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11" aria-hidden="true">
                <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1L2 5.6l4.2-.9L8 1z"/>
              </svg>
              AI-Powered Website Generation
            </div>

            <h1 className={styles.heroH1}>
              Build Your Business<br/>
              on <span className={styles.heroAccent}>Autopilot</span>
            </h1>

            <p className={styles.heroDesc}>
              Generate a professional business website from voice or text in seconds.
              No coding required — just speak or type your idea.
            </p>

            <div className={styles.heroStats} aria-label="Platform statistics">
              <div className={styles.heroStat}>
                <div className={styles.heroStatNum}>5,000+</div>
                <div className={styles.heroStatLabel}>Websites Generated</div>
              </div>
              <div className={styles.heroStatDivider} aria-hidden="true" />
              <div className={styles.heroStat}>
                <div className={styles.heroStatNum}>30 sec</div>
                <div className={styles.heroStatLabel}>Average Build Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Card */}
        <div className={styles.cardWrap}>
          <div className={styles.card} role="region" aria-label="Website generator form">
            <h2 className={styles.cardTitle}>Start Building Your Website</h2>

            {/* Business input */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="business-input">
                Business or service description
              </label>
              <input
                id="business-input"
                className={styles.fieldInput}
                type="text"
                placeholder="e.g., Coffee shop, Digital marketing agency"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                aria-label="Business idea or service"
                autoComplete="off"
              />
            </div>

            {/* Mic zone */}
            <div className={styles.micZone} role="region" aria-label="Voice input">
              <button
                className={`${styles.micBtn} ${recording ? styles.micRecording : ''} ${!speechAvailable ? styles.micDisabled : ''}`}
                onClick={handleMic}
                disabled={!speechAvailable}
                aria-label={recording ? 'Stop recording' : 'Start recording your business description'}
                aria-pressed={recording}
              >
                {recording ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="26" height="26" aria-hidden="true">
                    <rect x="9" y="2" width="6" height="11" rx="3"/>
                    <path d="M5 10a7 7 0 0 0 14 0"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                )}
              </button>
              <p
                className={`${styles.micLabel} ${recording ? styles.micLabelActive : ''}`}
                aria-live="polite"
              >
                {!speechAvailable
                  ? 'Speech not supported — use the text field'
                  : recording
                  ? interimText || 'Listening… speak your business description'
                  : 'Click to record your business description'}
              </p>
              {recording && <p className={styles.micHint}>Tap again to stop</p>}
              {speechError && (
                <p className={styles.micError} role="alert" aria-live="assertive">
                  {speechError}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className={styles.divider} role="separator" aria-label="or type it">
              <span>or type it</span>
            </div>

            {/* Text input row */}
            <div className={styles.textRow}>
              <label htmlFor="text-input" className={styles.srOnly}>
                Type your business description
              </label>
              <input
                id="text-input"
                className={styles.textInput}
                type="text"
                placeholder='"I sell handmade candles in Melbourne, ~50 a week."'
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                aria-label="Type your business description"
              />
              <button
                className={styles.generateInlineBtn}
                onClick={handleGenerate}
                disabled={!business.trim()}
                aria-label="Generate website"
                aria-disabled={!business.trim()}
              >
                Generate →
              </button>
            </div>

            {/* Examples */}
            <div className={styles.examples} role="region" aria-label="Example business descriptions">
              <span className={styles.examplesLabel} id="examples-label">Try an example:</span>
              <div className={styles.chips} role="list" aria-labelledby="examples-label">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    className={styles.chip}
                    onClick={() => fillExample(ex)}
                    role="listitem"
                    aria-label={`Use example: ${ex.input}`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main CTA */}
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={!business.trim()}
              aria-label="Start building my website from the business description"
              aria-disabled={!business.trim()}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" aria-hidden="true">
                <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1L2 5.6l4.2-.9L8 1z"/>
              </svg>
              Start Building My Website
            </button>

            <p className={styles.cardMeta}>No credit card required · Generated in 30 seconds</p>
          </div>
        </div>

      </div>
    </div>
  )
}
