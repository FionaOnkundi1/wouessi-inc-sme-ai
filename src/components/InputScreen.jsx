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
        setSpeechError(err === 'not-allowed' ? 'Microphone access denied.' : 'Speech error — try typing instead.')
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
  }

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
            <circle cx="7" cy="7" r="3" fill="#fff" />
            <path d="M7 1v2M7 11v2M1 7h2M11 7h2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className={styles.logoText}>Wouessi <span>Inc.</span></span>
        <span className={styles.badge}>MVP Demo</span>
      </div>

      {/* Main */}
      <div className={styles.body}>
        <div>
          <h1 className={styles.heading}>Speak your business.<br />Get a website instantly.</h1>
          <p className={styles.sub}>
            Press the mic and describe your business in one sentence. AI does the rest in under 30 seconds.
          </p>
        </div>

        {/* Mic zone */}
        <div className={styles.micZone}>
          <button
            className={`${styles.micBtn} ${recording ? styles.recording : ''} ${!speechAvailable ? styles.disabled : ''}`}
            onClick={handleMic}
            disabled={!speechAvailable}
            title={speechAvailable ? 'Click to record' : 'Speech not supported in this browser'}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </button>
          <p className={`${styles.micStatus} ${recording ? styles.micActive : ''}`}>
            {!speechAvailable
              ? 'Speech not available — use the text box below'
              : recording
              ? interimText || 'Listening… speak your business description'
              : 'Click to record your business description'}
          </p>
          {speechError && <p className={styles.micError}>{speechError}</p>}
        </div>

        {/* Divider */}
        <div className={styles.divider}><span>or type it</span></div>

        {/* Text input */}
        <div className={styles.inputRow}>
          <input
            type="text"
            className={styles.textInput}
            placeholder='"I sell handmade candles in Melbourne, ~50 a week."'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button className={styles.goBtn} onClick={handleGenerate} disabled={!text.trim()}>
            Generate →
          </button>
        </div>

        {/* Examples */}
        <div>
          <p className={styles.exampleLabel}>Try an example:</p>
          <div className={styles.chips}>
            {EXAMPLES.map((ex) => (
              <button key={ex.label} className={styles.chip} onClick={() => fillExample(ex)}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
