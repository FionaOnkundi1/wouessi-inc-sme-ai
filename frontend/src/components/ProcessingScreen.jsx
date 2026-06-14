// src/components/ProcessingScreen.jsx
import { useEffect, useState } from 'react'
import styles from './ProcessingScreen.module.css'

const GENERATION_STEPS = [
  { id: 1, label: 'Transcribing speech' },
  { id: 2, label: 'AI extracting business details' },
  { id: 3, label: 'Generating your website' },
  { id: 4, label: 'Creating SEO metadata' },
]

const EXTRACTION_STEPS = [
  { id: 1, label: 'Reading your answers' },
  { id: 2, label: 'Identifying business details' },
  { id: 3, label: 'Preparing your review' },
]

export default function ProcessingScreen({ input, fromVoice, mode = 'generating' }) {
  const [activeStep, setActiveStep] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const steps = mode === 'extracting' ? EXTRACTION_STEPS : GENERATION_STEPS

  // Step progression
  useEffect(() => {
    setActiveStep(1)
    const delays = mode === 'extracting'
      ? [0, 500, 1100]
      : fromVoice
        ? [0, 900, 1800, 2700]
        : [0, 700, 1500, 2300]
    const timers = delays.map((d, i) =>
      setTimeout(() => setActiveStep(i + 1), d)
    )
    return () => timers.forEach(clearTimeout)
  }, [fromVoice, mode])

  // Build timer
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.card}>
      <div className={styles.body}>

        {/* Build timer */}
        <div className={styles.timerRow}>
          <span className={styles.timerDot} />
          <span className={styles.timerLabel}>
            {mode === 'extracting' ? 'Preparing your business details' : 'Building your website'}
          </span>
          <span className={styles.timerCount}>{seconds}s</span>
        </div>

        <div className={styles.steps}>
          {steps.map((step) => {
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
