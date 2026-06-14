// src/App.jsx
import { useCallback, useEffect, useRef, useState } from 'react'
import InputScreen from './components/InputScreen'
import ConversationScreen from './components/ConversationScreen'
import ProcessingScreen from './components/ProcessingScreen'
import BusinessReviewScreen from './components/BusinessReviewScreen'
import GeneratedSite from './components/GeneratedSite'
import DashboardScreen from './components/DashboardScreen'
import TemplatePreviewScreen from './components/TemplatePreviewScreen'
import FeaturesScreen from './components/FeaturesScreen'
import HowItWorksScreen from './components/HowItWorksScreen'
import {
  extractBusinessDetails,
  generateWebsiteFromBusinessDetails,
} from './services/aiService'
import { applyTheme, resetTheme } from './services/themeService'
import { useWouessiAuth } from './auth/AuthContext'
import { claimDraft, loadDraft, saveDraftContent } from './services/draftService'
import styles from './App.module.css'

const PROCESSING_DISPLAY_MS = 3400
const PENDING_CLAIM_KEY = 'wouessi:pending-claim'

export default function App() {
  const auth = useWouessiAuth()
  const [screen, setScreen] = useState(getInitialScreen)
  const [input, setInput] = useState('')
  const [fromVoice, setFromVoice] = useState(false)
  const [siteData, setSiteData] = useState(null)
  const [businessReview, setBusinessReview] = useState(null)
  const [reviewError, setReviewError] = useState('')
  const [processingMode, setProcessingMode] = useState('extracting')
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' })
  const [requestedDraftId, setRequestedDraftId] = useState(getDraftId)
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
    setInput(fullPrompt)
    setReviewError('')
    setProcessingMode('extracting')
    setScreen('processing')

    try {
      const [review] = await Promise.all([
        extractBusinessDetails(fullPrompt, {
          getToken: auth.isSignedIn ? auth.getToken : null,
        }),
        wait(1600),
      ])
      setBusinessReview(review)
      setScreen('review')
    } catch (error) {
      setReviewError(error.message || 'Could not extract your business details.')
      setScreen('conversation')
    }
  }

  async function handleReviewConfirm(businessData) {
    if (!businessReview) return
    setReviewError('')
    setProcessingMode('generating')
    setScreen('processing')

    try {
      const [data] = await Promise.all([
        generateWebsiteFromBusinessDetails(businessReview, businessData, {
          getToken: auth.isSignedIn ? auth.getToken : null,
          claimToken: businessReview.claimToken,
        }),
        wait(PROCESSING_DISPLAY_MS),
      ])

      finishGeneration(data)
    } catch (error) {
      setReviewError(error.message || 'Could not generate your website. Please try again.')
      setScreen('review')
    }
  }

  function finishGeneration(data) {
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
    const draftId = requestedDraftId
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
      setRequestedDraftId(null)
      clearDraftUrl()
      setScreen('input')
    })

    return () => {
      cancelled = true
    }
  }, [auth.getToken, auth.isLoaded, auth.isSignedIn, auth.userId, requestedDraftId, siteData?.siteId])

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
    setBusinessReview(null)
    setReviewError('')
    setInput('')
    setSaveState({ status: 'idle', message: '' })
    setScreen('input')
    setRequestedDraftId(null)
    clearDraftUrl()
    clearDashboardUrl()
    window.scrollTo(0, 0)
  }

  function handleOpenDashboard() {
    resetTheme()
    setSiteData(null)
    setSaveState({ status: 'idle', message: '' })
    setScreen('dashboard')
    setRequestedDraftId(null)
    clearDraftUrl()
    setDashboardUrl()
    window.scrollTo(0, 0)
  }

  function handleOpenSite(siteId) {
    restoreAttemptRef.current = ''
    setSiteData(null)
    setSaveState({ status: 'idle', message: '' })
    setDraftUrl(siteId)
    setRequestedDraftId(siteId)
    setScreen('loading-draft')
    window.scrollTo(0, 0)
  }

  function handleOpenTemplateGallery() {
    resetTheme()
    setSiteData(null)
    setSaveState({ status: 'idle', message: '' })
    setRequestedDraftId(null)
    clearDraftUrl()
    clearDashboardUrl()
    setScreen('templates')
    window.scrollTo(0, 0)
  }

  function handleOpenFeatures() {
    resetTheme()
    setSiteData(null)
    setSaveState({ status: 'idle', message: '' })
    clearDraftUrl()
    setScreen('features')
    window.scrollTo(0, 0)
  }

  function handleOpenHowItWorks() {
    resetTheme()
    setSiteData(null)
    setSaveState({ status: 'idle', message: '' })
    clearDraftUrl()
    setScreen('how-it-works')
    window.scrollTo(0, 0)
  }

  function handleOpenTemplatePreview(data) {
    applyTheme(data)
    setSiteData({ ...data, owned: false })
    setSaveState({ status: 'idle', message: '' })
    setRequestedDraftId(null)
    clearDraftUrl()
    clearDashboardUrl()
    setScreen('result')
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
        onOpenDashboard={handleOpenDashboard}
        saveState={saveState}
      />
    )
  }

  if (screen === 'dashboard') {
    return <DashboardScreen onOpenSite={handleOpenSite} onStartNew={handleRestart} />
  }

  if (screen === 'review' && businessReview) {
    return (
      <BusinessReviewScreen
        review={businessReview}
        onConfirm={handleReviewConfirm}
        onStartOver={handleRestart}
        isSubmitting={false}
        error={reviewError}
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

  if (screen === 'templates') {
    return (
      <TemplatePreviewScreen
        onBack={handleRestart}
        onHome={handleRestart}
        onFeatures={handleOpenFeatures}
        onHowItWorks={handleOpenHowItWorks}
        onPreview={handleOpenTemplatePreview}
      />
    )
  }

  if (screen === 'features') {
    return (
      <FeaturesScreen
        onHome={handleRestart}
        onStart={handleRestart}
        onHowItWorks={handleOpenHowItWorks}
        onTemplates={handleOpenTemplateGallery}
      />
    )
  }

  if (screen === 'how-it-works') {
    return (
      <HowItWorksScreen
        onHome={handleRestart}
        onStart={handleRestart}
        onFeatures={handleOpenFeatures}
        onTemplates={handleOpenTemplateGallery}
      />
    )
  }

  return (
  <>
    {screen === 'input' && (
      <InputScreen
  onSubmit={(text) => handleSubmit(text, false)}
  onOpenDashboard={handleOpenDashboard}
  onHome={handleRestart}
  onFeatures={handleOpenFeatures}
  onHowItWorks={handleOpenHowItWorks}
  onPreviewTemplates={handleOpenTemplateGallery}
/>
    )}
    {screen === 'processing' && (
      <div className={styles.page}>
        <main className={styles.container}>
          <ProcessingScreen input={input} fromVoice={fromVoice} mode={processingMode} />
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
  url.searchParams.delete('view')
  url.searchParams.set('draft', siteId)
  window.history.replaceState({}, '', url)
}

function clearDraftUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('draft')
  window.history.replaceState({}, '', url)
}

function getInitialScreen() {
  return new URLSearchParams(window.location.search).get('view') === 'dashboard'
    ? 'dashboard'
    : 'input'
}

function setDashboardUrl() {
  const url = new URL(window.location.href)
  url.searchParams.set('view', 'dashboard')
  window.history.replaceState({}, '', url)
}

function clearDashboardUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('view')
  window.history.replaceState({}, '', url)
}
