// src/App.jsx
import { useState } from 'react'
import InputScreen from './components/InputScreen'
import ProcessingScreen from './components/ProcessingScreen'
import GeneratedSite from './components/GeneratedSite'
import { extractBusinessData, buildFallback } from './services/aiService'
import { EXAMPLES } from './data/examples'
import styles from './App.module.css'

const PROCESSING_DISPLAY_MS = 3400

export default function App() {
  const [screen, setScreen] = useState('input')
  const [input, setInput] = useState('')
  const [fromVoice, setFromVoice] = useState(false)
  const [siteData, setSiteData] = useState(null)

  async function handleSubmit(text, isVoice = false) {
    setInput(text)
    setFromVoice(isVoice)
    setScreen('processing')

    const preset = EXAMPLES.find((ex) =>
      text.toLowerCase().includes(ex.input.toLowerCase().split(' ').slice(0, 3).join(' ').toLowerCase()) ||
      ex.input.toLowerCase().includes(text.toLowerCase().split(' ').slice(0, 3).join(' ').toLowerCase())
    )

    let data
    try {
      if (preset) {
        await wait(PROCESSING_DISPLAY_MS)
        data = preset.data
      } else {
        const [aiResult] = await Promise.all([
          extractBusinessData(text).catch(() => buildFallback(text)),
          wait(PROCESSING_DISPLAY_MS),
        ])
        data = aiResult
      }
    } catch {
      await wait(PROCESSING_DISPLAY_MS)
      data = buildFallback(text)
    }

    setSiteData(data)
    setScreen('result')
  }

  function handleRestart() {
    setSiteData(null)
    setInput('')
    setScreen('input')
    window.scrollTo(0, 0)
  }

  // Full-page takeover — no wrapper
  if (screen === 'result' && siteData) {
    return <GeneratedSite data={siteData} onRestart={handleRestart} />
  }

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        {screen === 'input' && (
          <InputScreen onSubmit={(text) => handleSubmit(text, false)} />
        )}
        {screen === 'processing' && (
          <ProcessingScreen input={input} fromVoice={fromVoice} />
        )}
      </main>
    </div>
  )
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
