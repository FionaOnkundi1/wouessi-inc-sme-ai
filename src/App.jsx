// src/App.jsx
import { useState } from 'react'
import InputScreen from './components/InputScreen'
import ConversationScreen from './components/ConversationScreen'
import ProcessingScreen from './components/ProcessingScreen'
import GeneratedSite from './components/GeneratedSite'
import { extractBusinessData, buildFallback } from './services/aiService'
import { applyTheme, resetTheme } from './services/themeService'
import styles from './App.module.css'

const PROCESSING_DISPLAY_MS = 3400

export default function App() {
  const [screen, setScreen] = useState('input')
  const [input, setInput] = useState('')
  const [fromVoice, setFromVoice] = useState(false)
  const [siteData, setSiteData] = useState(null)

  // Step 1 — user submits initial voice/text description
  function handleSubmit(text, isVoice = false) {
    setInput(text)
    setFromVoice(isVoice)
    setScreen('conversation') // go to follow-up questions
  }

  // Step 2 — user completes conversation questions
  // fullPrompt is the enriched text built by ConversationScreen
  async function handleConversationComplete(fullPrompt) {
    setScreen('processing')

    let data
    try {
      const [aiResult] = await Promise.all([
        extractBusinessData(fullPrompt).catch(() => buildFallback(fullPrompt)),
        wait(PROCESSING_DISPLAY_MS),
      ])
      data = aiResult
    } catch {
      await wait(PROCESSING_DISPLAY_MS)
      data = buildFallback(fullPrompt)
    }

    applyTheme(data)
    setSiteData(data)
    setScreen('result')
  }

  function handleRestart() {
    resetTheme()
    setSiteData(null)
    setInput('')
    setScreen('input')
    window.scrollTo(0, 0)
  }

  // Full-page takeover for result
  if (screen === 'result' && siteData) {
    return <GeneratedSite data={siteData} onRestart={handleRestart} />
  }

  // Full-page takeover for conversation
  if (screen === 'conversation') {
    return (
      <ConversationScreen
        businessInput={input}
        onComplete={handleConversationComplete}
      />
    )
  }

  return (
  <>
    {screen === 'input' && (
      <InputScreen onSubmit={(text) => handleSubmit(text, false)} />
    )}
    {screen === 'processing' && (
      <div className={styles.page}>
        <main className={styles.container}>
          <ProcessingScreen input={input} fromVoice={fromVoice} />
        </main>
      </div>
    )}
  </>
)
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
