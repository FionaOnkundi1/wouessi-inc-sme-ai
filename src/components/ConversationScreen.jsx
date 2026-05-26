// src/components/ConversationScreen.jsx
import { useState, useRef, useEffect } from 'react'
import { isSpeechSupported, startSpeechSession } from '../services/speechService'
import styles from './ConversationScreen.module.css'

const QUESTIONS = [
  {
    id: 'products',
    question: 'What do you sell or offer?',
    hint: 'Include rough prices if you can',
    placeholder: 'e.g. Handmade soy candles, $18–$55 each',
  },
  {
    id: 'customer',
    question: 'Who is your typical customer?',
    hint: 'Think about who buys from you most',
    placeholder: 'e.g. Local families, young professionals, small cafes',
  },
  {
    id: 'difference',
    question: 'What makes you different?',
    hint: 'Your edge over competitors',
    placeholder: 'e.g. Everything is handmade to order, same-day delivery',
  },
  {
    id: 'contact',
    question: 'Any contact details to share?',
    hint: 'Phone, email, or both — say "at" for @ and "plus" for +',
    placeholder: 'e.g. info@mybusiness.com or +61 4xx xxx xxx',
  },
]

// ── Text-to-speech helper ─────────────────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return
  // Cancel any current speech first
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.92
  utterance.pitch = 1.05
  utterance.volume = 1

  // Try to use a natural English voice if available
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen'))
  )
  if (preferred) utterance.voice = preferred

  window.speechSynthesis.speak(utterance)
}

export default function ConversationScreen({ businessInput, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [inputVal, setInputVal] = useState('')
  const [recording, setRecording] = useState(false)
  const [interim, setInterim] = useState('')
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState('in')
  const sessionRef = useRef(null)
  const inputRef = useRef(null)
  const speechAvailable = isSpeechSupported()

  const q = QUESTIONS[current]
  const isLast = current === QUESTIONS.length - 1

  // Speak question when it changes
  useEffect(() => {
    setDirection('in')
    setAnimating(true)
    const t = setTimeout(() => setAnimating(false), 350)

    // Small delay so animation starts before speech
    const s = setTimeout(() => speak(q.question), 400)

    return () => {
      clearTimeout(t)
      clearTimeout(s)
      window.speechSynthesis?.cancel()
    }
  }, [current, q.question])

  // Speak intro on first load
  useEffect(() => {
    const intro = setTimeout(() => {
      speak("Great! I just need a few more details to build your website. Let's start.")
    }, 300)
    return () => clearTimeout(intro)
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [current])

  useEffect(() => () => {
    sessionRef.current?.stop()
    window.speechSynthesis?.cancel()
  }, [])

  function startRecording() {
    // Stop TTS before recording so it doesn't pick up the AI voice
    window.speechSynthesis?.cancel()
    setRecording(true)
    const session = startSpeechSession({
      onTranscript: (t) => { setInputVal(t); setInterim('') },
      onInterim: (t) => setInterim(t),
      onError: () => { setRecording(false); sessionRef.current = null },
      onStateChange: (s) => { if (s === 'idle') setRecording(false) },
    })
    sessionRef.current = session
  }

  function stopRecording() {
    sessionRef.current?.stop()
    sessionRef.current = null
    setRecording(false)
    setInterim('')
  }

  function handleMic() { recording ? stopRecording() : startRecording() }

  function advance(skip = false) {
    stopRecording()
    window.speechSynthesis?.cancel()
    const val = skip ? '' : inputVal.trim()
    const newAnswers = { ...answers, [q.id]: val }
    setAnswers(newAnswers)

    setDirection('out')
    setAnimating(true)

    setTimeout(() => {
  if (isLast) {
    const finalPrompt = buildPrompt(businessInput, newAnswers)
    // Ensure voices are loaded before speaking
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speak("Thanks for the information, building your website now.")
      }
    } else {
      speak("Thanks for the information, building your website now.")
    }
    setTimeout(() => onComplete(finalPrompt), 3500)
  } else {
        setCurrent((c) => c + 1)
        setInputVal('')
        setInterim('')
      }
    }, 280)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); advance() }
  }

  function buildPrompt(base, ans) {
    let prompt = base
    if (ans.products) prompt += `. Products/services: ${ans.products}`
    if (ans.customer) prompt += `. Target customer: ${ans.customer}`
    if (ans.difference) prompt += `. What makes us different: ${ans.difference}`
    if (ans.contact) prompt += `. Contact: ${ans.contact}`
    return prompt
  }

  const displayVal = recording ? (interim || '') : inputVal

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <img src="/logo.png" alt="Wouessi Inc." style={{ width: '80px', height: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        <button className={styles.skipAll} onClick={() => {
          window.speechSynthesis?.cancel()
          onComplete(businessInput)
        }}>
          Skip all → generate now
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${(current / QUESTIONS.length) * 100}%` }} />
      </div>

      {/* Main question area */}
      <div className={styles.main}>
        <div className={`${styles.questionWrap} ${animating ? (direction === 'in' ? styles.slideIn : styles.slideOut) : ''}`}>

          {/* Step indicator */}
          <div className={styles.step}>{current + 1} of {QUESTIONS.length}</div>

          {/* Question */}
          <h2 className={styles.question}>{q.question}</h2>
          <p className={styles.hint}>{q.hint}</p>

          {/* Mic button */}
          <button
            className={`${styles.micBtn} ${recording ? styles.micRecording : ''} ${!speechAvailable ? styles.micDisabled : ''}`}
            onClick={handleMic}
            disabled={!speechAvailable}
            aria-label={recording ? 'Stop recording' : 'Speak your answer'}
          >
            {recording ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <rect x="9" y="2" width="6" height="11" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="8" y1="22" x2="16" y2="22"/>
              </svg>
            )}
          </button>

          {recording && (
            <p className={styles.listeningLabel}>
              <span className={styles.listeningDot} />
              {interim || 'Listening…'}
            </p>
          )}

          {/* Text input */}
          <div className={styles.inputWrap}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder={q.placeholder}
              value={displayVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.skipBtn} onClick={() => advance(true)}>
              Skip
            </button>
            <button
              className={styles.nextBtn}
              onClick={() => advance(false)}
              disabled={!inputVal.trim() && !interim}
            >
              {isLast ? 'Generate My Website →' : 'Next →'}
            </button>
          </div>

        </div>
      </div>

      {/* Dots */}
      <div className={styles.dots}>
        {QUESTIONS.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''} ${i < current ? styles.dotDone : ''}`} />
        ))}
      </div>

    </div>
  )
}
