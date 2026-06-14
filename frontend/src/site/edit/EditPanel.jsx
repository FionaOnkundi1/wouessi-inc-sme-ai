// src/site/edit/EditPanel.jsx
import { useState, useRef } from 'react'
import { useSite } from '../SiteContext'
import { regenerateSection } from './regenerateSection'
import { isSpeechSupported, startSpeechSession } from '../../services/speechService'
import { useWouessiAuth } from '../../auth/AuthContext'
import styles from './EditPanel.module.css'

export default function EditPanel() {
  const { data, editPanel, closeEdit, updateSection } = useSite()
  const auth = useWouessiAuth()
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [recording, setRecording] = useState(null) // qId currently recording
  const [error, setError] = useState('')
  const sessionRef = useRef(null)

  if (!editPanel) return null
  const { sectionId, title, questions } = editPanel

  function handleAnswerChange(qId, value) {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  function startRecording(qId) {
    // Stop any existing session first
    if (sessionRef.current) {
      sessionRef.current.stop()
      sessionRef.current = null
    }

    setRecording(qId)
    // Preserve whatever was already typed
    const existing = answers[qId]?.trim() || ''

    const session = startSpeechSession({
      onTranscript: (text) => {
        const full = existing ? existing + ' ' + text : text
        handleAnswerChange(qId, full)
      },
      onInterim: (text) => {
        const full = existing ? existing + ' ' + text : text
        handleAnswerChange(qId, full)
      },
      onError: (err) => {
        setError(
          err === 'not-allowed'
            ? 'Microphone access denied. Please allow microphone access in your browser settings.'
            : `Speech error: ${err}. Try typing instead.`
        )
        setRecording(null)
        sessionRef.current = null
      },
      onStateChange: (state) => {
        if (state === 'idle') setRecording(null)
      },
    })

    sessionRef.current = session
  }

  function stopRecording() {
    sessionRef.current?.stop()
    sessionRef.current = null
    setRecording(null)
  }

  async function handleSave() {
    stopRecording()
    setLoading(true)
    setError('')

    try {
      const combined = questions
        .filter((q) => answers[q.id]?.trim())
        .map((q) => `[${q.id}] ${answers[q.id].trim()}`)
        .join('\n')

      const patch = await regenerateSection(sectionId, combined, data, {
        getToken: auth.isSignedIn ? auth.getToken : null,
        claimToken: data.claimToken,
      })
      await updateSection(patch)
      setDone(true)
      setTimeout(() => {
        closeEdit()
        setDone(false)
        setAnswers({})
      }, 1200)
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    stopRecording()
    closeEdit()
    setAnswers({})
    setError('')
    setDone(false)
  }

  const hasAnyAnswer = questions.some((q) => answers[q.id]?.trim())

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose} />
      <div className={styles.panel}>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.sectionBadge}>Editing</div>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.intro}>
            Answer by typing or using the mic. Tap mic to start, tap stop when done.<br/>
            <span className={styles.voiceTip}>Voice tips: say "at" for @, "plus" for +, "dot com" for .com, "underscore" for _</span>
          </p>

          <div className={styles.questions}>
            {questions.map((q) => (
              <div key={q.id} className={styles.question}>
                <label className={styles.qLabel}>{q.label}</label>
                {q.hint && <p className={styles.qHint}>{q.hint}</p>}
                <div className={styles.inputRow}>
                  <textarea
                    className={styles.textarea}
                    placeholder={q.placeholder || 'Type your answer...'}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    rows={2}
                  />
                  {isSpeechSupported() && (
                    <button
                      className={`${styles.micBtn} ${recording === q.id ? styles.micActive : ''}`}
                      onClick={() => recording === q.id ? stopRecording() : startRecording(q.id)}
                      title={recording === q.id ? 'Stop recording' : 'Start recording'}
                      aria-label={recording === q.id ? 'Stop recording' : 'Record answer'}
                    >
                      {recording === q.id ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                          <rect x="6" y="6" width="12" height="12" rx="2"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                          <rect x="9" y="2" width="6" height="11" rx="3"/>
                          <path d="M5 10a7 7 0 0 0 14 0"/>
                          <line x1="12" y1="19" x2="12" y2="22"/>
                          <line x1="8" y1="22" x2="16" y2="22"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                {recording === q.id && (
                  <div className={styles.recordingHint}>
                    <span className={styles.recordingDot} />
                    Listening — speak now, tap stop when done
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`${styles.saveBtn} ${done ? styles.saveDone : ''}`}
            onClick={handleSave}
            disabled={loading || !hasAnyAnswer}
          >
            {done ? '✓ Updated!' : loading ? (
              <span className={styles.loadingRow}>
                <span className={styles.spinner} /> Regenerating…
              </span>
            ) : 'Regenerate section →'}
          </button>
        </div>
      </div>
    </>
  )
}
