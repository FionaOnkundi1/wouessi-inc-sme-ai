// src/components/InputScreen.jsx
import { useState, useRef, useEffect } from 'react'
import { isSpeechSupported, startSpeechSession } from '../services/speechService'
import { EXAMPLES } from '../data/examples'
import styles from './InputScreen.module.css'

export default function InputScreen({ onSubmit }) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [speechError, setSpeechError] = useState('')
  const sessionRef = useRef(null)
  const speechAvailable = isSpeechSupported()
  const statusId = 'mic-status'
  const errorId = 'mic-error'
  const inputId = 'business-input'
  const liveRegionRef = useRef(null)

  useEffect(() => {
    return () => sessionRef.current?.stop()
  }, [])

  function startRecording() {
    setSpeechError('')
    setRecording(true)

    const session = startSpeechSession({
      onTranscript: (t) => {
        setText(t)
        setInterimText('')
      },
      onInterim: (t) => setInterimText(t),
      onError: (err) => {
        const msg = err === 'not-allowed'
          ? 'Microphone access denied. Please allow microphone access and try again.'
          : err === 'transcription-failed'
          ? 'Could not transcribe audio. Please try again or type your description.'
          : 'Speech error — try typing instead.'
        setSpeechError(msg)
        setRecording(false)
        sessionRef.current = null
      },
      onStateChange: (state) => {
        if (state === 'idle') setRecording(false)
      },
    })

    sessionRef.current = session
  }

  function stopRecording() {
    sessionRef.current?.stop()
    sessionRef.current = null
    setRecording(false)
    setInterimText('')
  }

  function handleMic() {
    recording ? stopRecording() : startRecording()
  }

  function handleGenerate() {
    const val = text.trim()
    if (!val) return
    onSubmit(val)
  }

  function fillExample(ex) {
    setText(ex.input)
    setSpeechError('')
    // Move focus to input so screen reader announces the filled text
    document.getElementById(inputId)?.focus()
  }

  const micStatusText = !speechAvailable
    ? 'Speech not available — use the text box below'
    : recording
    ? interimText || 'Listening… speak your business description'
    : 'Click to record your business description'

  return (
    <div className={styles.card} role="main">

      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {recording ? 'Recording started. Speak your business description.' : ''}
        {speechError ? speechError : ''}
      </div>

      {/* Header */}
      <div className={styles.header} role="banner">
        <div className={styles.logoMark} aria-hidden="true">
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="3" fill="#fff" />
            <path d="M7 1v2M7 11v2M1 7h2M11 7h2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className={styles.logoText} aria-label="Wouessi Inc.">Wouessi <span>Inc.</span></span>
        <span className={styles.badge} aria-label="MVP Demo version">MVP Demo</span>
      </div>

      {/* Main */}
      <div className={styles.body}>
        <div>
          <h1 className={styles.heading}>
            Speak your business.<br />Get a website instantly.
          </h1>
          <p className={styles.sub}>
            Press the mic and describe your business in one sentence. AI does the rest in under 30 seconds.
          </p>
        </div>

        {/* Mic zone */}
        <div
          className={styles.micZone}
          role="region"
          aria-label="Voice input"
        >
          <button
            className={`${styles.micBtn} ${recording ? styles.recording : ''} ${!speechAvailable ? styles.disabled : ''}`}
            onClick={handleMic}
            disabled={!speechAvailable}
            aria-label={recording ? 'Stop recording' : 'Start recording your business description'}
            aria-pressed={recording}
            aria-describedby={`${statusId} ${speechError ? errorId : ''}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="26"
              height="26"
              aria-hidden="true"
            >
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </button>

          <p
            id={statusId}
            className={`${styles.micStatus} ${recording ? styles.micActive : ''}`}
            aria-live="polite"
          >
            {micStatusText}
          </p>

          {speechError && (
            <p
              id={errorId}
              className={styles.micError}
              role="alert"
              aria-live="assertive"
            >
              {speechError}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className={styles.divider} role="separator" aria-label="or type it">
          <span>or type it</span>
        </div>

        {/* Text input */}
        <div className={styles.inputRow}>
          <label htmlFor={inputId} className={styles.srOnly}>
            Business description
          </label>
          <input
            id={inputId}
            type="text"
            className={styles.textInput}
            placeholder='"I sell handmade candles in Melbourne, ~50 a week."'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            aria-label="Business description"
            aria-describedby="input-hint"
            autoComplete="off"
            spellCheck="true"
          />
          <button
            className={styles.goBtn}
            onClick={handleGenerate}
            disabled={!text.trim()}
            aria-label="Generate website from your business description"
            aria-disabled={!text.trim()}
          >
            Generate →
          </button>
        </div>

        <p id="input-hint" className={styles.srOnly}>
          Type your business description or use the microphone above. Press Enter or click Generate to create your website.
        </p>

        {/* Examples */}
        <div role="region" aria-label="Example business descriptions">
          <p className={styles.exampleLabel} id="examples-label">
            Try an example:
          </p>
          <div
            className={styles.chips}
            role="list"
            aria-labelledby="examples-label"
          >
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
      </div>
    </div>
  )
}
