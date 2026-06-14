// src/App.jsx
import { useCallback, useEffect, useState } from 'react'
import InputScreen from './components/InputScreen'
import ConversationScreen from './components/ConversationScreen'
import ProcessingScreen from './components/ProcessingScreen'
import GeneratedSite from './components/GeneratedSite'
import { extractBusinessData, buildFallback } from './services/aiService'
import { applyTheme, resetTheme } from './services/themeService'
import { useWouessiAuth } from './auth/AuthContext'
import { claimDraft } from './services/draftService'
import styles from './App.module.css'

const PROCESSING_DISPLAY_MS = 3400
const PENDING_CLAIM_KEY = 'wouessi:pending-claim'

export default function App() {
  const auth = useWouessiAuth()
  const [screen, setScreen] = useState('input')
  const [input, setInput] = useState('')
  const [fromVoice, setFromVoice] = useState(false)
  const [siteData, setSiteData] = useState(null)
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' })

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
        extractBusinessData(fullPrompt, {
          getToken: auth.isSignedIn ? auth.getToken : null,
        }).catch(() => buildFallback(fullPrompt)),
        wait(PROCESSING_DISPLAY_MS),
      ])
      data = aiResult
    } catch {
      await wait(PROCESSING_DISPLAY_MS)
      data = buildFallback(fullPrompt)
    }

    applyTheme(data)
    const nextData = {
      ...data,
      owned: Boolean(auth.isSignedIn && data.siteId && !data.claimToken),
    }
    if (data.siteId && data.claimToken) {
      sessionStorage.setItem(claimTokenKey(data.siteId), data.claimToken)
    }
    setSiteData(nextData)
    setSaveState(nextData.owned
      ? { status: 'saved', message: 'Saved to your account' }
      : { status: 'idle', message: '' })
    setScreen('result')
  }

  const claimCurrentDraft = useCallback(async () => {
    if (!siteData?.siteId) {
      setSaveState({ status: 'error', message: 'This local preview cannot be saved. Start the backend and generate it again.' })
      return
    }

    const claimToken = siteData.claimToken || sessionStorage.getItem(claimTokenKey(siteData.siteId))
    if (!claimToken) {
      if (siteData.owned) return
      setSaveState({ status: 'error', message: 'This draft no longer has a valid save token.' })
      return
    }

    setSaveState({ status: 'saving', message: 'Saving draft…' })
    try {
      await claimDraft(siteData.siteId, claimToken, auth.getToken)
      sessionStorage.removeItem(claimTokenKey(siteData.siteId))
      sessionStorage.removeItem(PENDING_CLAIM_KEY)
      setSiteData((current) => ({ ...current, claimToken: null, owned: true }))
      setSaveState({ status: 'saved', message: 'Saved to your account' })
    } catch (error) {
      setSaveState({ status: 'error', message: error.message })
    }
  }, [auth.getToken, siteData])

  useEffect(() => {
    if (!auth.isSignedIn || !siteData?.siteId) return
    if (sessionStorage.getItem(PENDING_CLAIM_KEY) !== siteData.siteId) return
    claimCurrentDraft()
  }, [auth.isSignedIn, claimCurrentDraft, siteData?.siteId])

  function handleSaveDraft() {
    if (!auth.configured) {
      setSaveState({ status: 'error', message: 'Account saving is unavailable until Clerk is configured.' })
      return
    }
    if (!auth.isSignedIn) {
      if (siteData?.siteId) sessionStorage.setItem(PENDING_CLAIM_KEY, siteData.siteId)
      setSaveState({ status: 'signin', message: 'Sign in to save this draft' })
      auth.openSignIn()
      return
    }
    claimCurrentDraft()
  }

  function handleRestart() {
    resetTheme()
    setSiteData(null)
    setInput('')
    setSaveState({ status: 'idle', message: '' })
    setScreen('input')
    window.scrollTo(0, 0)
  }

  // Full-page takeover for result
  if (screen === 'result' && siteData) {
    return (
      <GeneratedSite
        data={siteData}
        onRestart={handleRestart}
        onSave={handleSaveDraft}
        saveState={saveState}
      />
    )
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

function claimTokenKey(siteId) {
  return `wouessi:claim:${siteId}`
}
