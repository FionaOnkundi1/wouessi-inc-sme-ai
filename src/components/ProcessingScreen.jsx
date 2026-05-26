// src/components/ProcessingScreen.jsx
import { useEffect, useState } from 'react'
import styles from './ProcessingScreen.module.css'

const STEPS = [
  { id: 1, label: 'Transcribing speech' },
  { id: 2, label: 'AI extracting business details' },
  { id: 3, label: 'Generating your website' },
  { id: 4, label: 'Creating SEO metadata' },
]

export default function ProcessingScreen({ input, fromVoice }) {
  const [activeStep, setActiveStep] = useState(1)
  const [seconds, setSeconds] = useState(0)

  // Step progression
  useEffect(() => {
    const delays = fromVoice ? [0, 900, 1800, 2700] : [0, 700, 1500, 2300]
    const timers = delays.map((d, i) =>
      setTimeout(() => setActiveStep(i + 1), d)
    )
    return () => timers.forEach(clearTimeout)
  }, [fromVoice])

  // Build timer — counts up every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.card}>
      <div className={styles.body}>

        {/* Build timer */}
        <div className={styles.timerRow}>
          <div className={styles.timerDot} />
          <span className={styles.timerLabel}>Building your website</span>
          <span className={styles.timerCount}>{seconds}s</span>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step) => {
            const state =
              step.id < activeStep ? 'done' : step.id === activeStep ? 'active' : 'pending'
            return (
              <div key={step.id} className={`${styles.step} ${styles[state]}`}>
                <div className={styles.dot}>
                  {state === 'done' ? '✓' : state === 'active' ? <span className={styles.spinner} /> : step.id}
                </div>
                <span>{step.label}</span>
              </div>
            )
          })}
        </div>

        {input && (
          <div className={styles.transcriptionBox}>
            <span className={styles.heardLabel}>Heard:</span>
            <span className={styles.heardText}>{input}</span>
          </div>
        )}

      </div>
    </div>
  )
}
