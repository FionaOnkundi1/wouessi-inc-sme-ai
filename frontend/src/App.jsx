// src/App.jsx
import { useCallback, useEffect, useRef, useState } from 'react'
import InputScreen from './components/InputScreen'
import ConversationScreen from './components/ConversationScreen'
import ProcessingScreen from './components/ProcessingScreen'
import GeneratedSite from './components/GeneratedSite'
import { extractBusinessData, buildFallback } from './services/aiService'
import { applyTheme, resetTheme } from './services/themeService'
import { useWouessiAuth } from './auth/AuthContext'
import { claimDraft, loadDraft, saveDraftContent } from './services/draftService'
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
  const restoreAttemptRef = useRef('')

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
    if (data.siteId) setDraftUrl(data.siteId)
    setSiteData(nextData)
    setSaveState(nextData.owned
      ? { status: 'saved', message: 'Saved to your account' }
      : { status: 'idle', message: '' })
    setScreen('result')
  }

  useEffect(() => {
    const draftId = getDraftId()
    if (!draftId || !auth.isLoaded || siteData?.siteId === draftId) return

    const attemptKey = `${draftId}:${auth.userId || 'anonymous'}`
    if (restoreAttemptRef.current === attemptKey) return
    restoreAttemptRef.current = attemptKey

    const claimToken = sessionStorage.getItem(claimTokenKey(draftId))
    let cancelled = false
    setScreen('loading-draft')

    loadDraft(draftId, {
      getToken: auth.isSignedIn ? auth.getToken : null,
      claimToken,
    }).then((data) => {
      if (cancelled) return
      const restoredData = {
        ...data,
        claimToken,
        owned: Boolean(auth.isSignedIn && !claimToken),
      }
      applyTheme(restoredData)
      setSiteData(restoredData)
      setSaveState(restoredData.owned
        ? { status: 'saved', message: 'Saved to your account' }
        : { status: 'idle', message: '' })
      setScreen('result')
    }).catch((error) => {
      if (cancelled) return
      console.warn('Could not restore saved website:', error.message)
      setScreen('input')
    })

    return () => {
      cancelled = true
    }
  }, [auth.getToken, auth.isLoaded, auth.isSignedIn, auth.userId, siteData?.siteId])

  const handleSiteContentChange = useCallback(async (nextData) => {
    if (!nextData?.siteId) return

    const owned = Boolean(siteData?.owned ?? nextData.owned)
    const claimToken = owned
      ? null
      : siteData?.claimToken
        || nextData.claimToken
        || sessionStorage.getItem(claimTokenKey(nextData.siteId))
    const updatedData = { ...nextData, claimToken, owned }

    setSiteData(updatedData)
    setSaveState({ status: 'saving', message: 'Saving website changes…' })

    try {
      await saveDraftContent(nextData.siteId, updatedData, {
        getToken: auth.isSignedIn ? auth.getToken : null,
        claimToken,
      })
      setSaveState(owned
        ? { status: 'saved', message: 'Changes saved to your account' }
        : { status: 'idle', message: 'Draft changes saved' })
    } catch (error) {
      setSaveState({ status: 'error', message: error.message })
      throw error
    }
  }, [auth.getToken, auth.isSignedIn, siteData?.claimToken, siteData?.owned])

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
    clearDraftUrl()
    window.scrollTo(0, 0)
  }

  // Full-page takeover for result
  if (screen === 'result' && siteData) {
    return (
      <GeneratedSite
        data={siteData}
        onRestart={handleRestart}
        onSave={handleSaveDraft}
        onDataChange={handleSiteContentChange}
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

  if (screen === 'loading-draft') {
    return (
      <div className={styles.page}>
        <main className={styles.container}>
          <p className={styles.status}>Loading saved website…</p>
        </main>
      </div>
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

function getDraftId() {
  return new URLSearchParams(window.location.search).get('draft')
}

function setDraftUrl(siteId) {
  const url = new URL(window.location.href)
  url.searchParams.set('draft', siteId)
  window.history.replaceState({}, '', url)
}

function clearDraftUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('draft')
  window.history.replaceState({}, '', url)
}
