// src/services/speechService.js
// Uses Groq Whisper via Stefan's backend for accent-tolerant transcription.
// Falls back to browser Web Speech API if the backend is unavailable.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ── Browser support check ─────────────────────────────────────────────────────
export function isSpeechSupported() {
  return Boolean(
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)
    || getSpeechRecognition()
  )
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

// ── Normalise transcript text ─────────────────────────────────────────────────
function normaliseTranscript(text) {
  return text
    .replace(/\bat\b/gi, '@')
    .replace(/\bdot com\b/gi, '.com')
    .replace(/\bdot com dot au\b/gi, '.com.au')
    .replace(/\bdot au\b/gi, '.au')
    .replace(/\bdot org\b/gi, '.org')
    .replace(/\bdot net\b/gi, '.net')
    .replace(/\bunderscore\b/gi, '_')
    .replace(/\bdash\b/gi, '-')
    .replace(/\bslash\b/gi, '/')
    .replace(/\bplus\b/gi, '+')
    .replace(/\bzero\b/gi, '0')
    .replace(/\bone\b/gi, '1')
    .replace(/\btwo\b/gi, '2')
    .replace(/\bthree\b/gi, '3')
    .replace(/\bfour\b/gi, '4')
    .replace(/\bfive\b/gi, '5')
    .replace(/\bsix\b/gi, '6')
    .replace(/\bseven\b/gi, '7')
    .replace(/\beight\b/gi, '8')
    .replace(/\bnine\b/gi, '9')
    .replace(/\bdollar\b/gi, '$')
    .replace(/\bpercent\b/gi, '%')
    .replace(/\bcomma\b/gi, ',')
    .replace(/\bfull stop\b/gi, '.')
    .replace(/\bperiod\b/gi, '.')
    .replace(/\bnew line\b/gi, '\n')
    .replace(/\s@\s/g, '@')
    .replace(/\s\.\s/g, '.')
    .replace(/\+\s/g, '+')
    .trim()
}

// ── Send audio blob to Groq Whisper via Stefan's backend ──────────────────────
async function transcribeWithWhisper(audioBlob) {
  const formData = new FormData()
  formData.append('audio', audioBlob, audioFileName(audioBlob.type))

  const res = await fetch(`${API_URL}/api/transcribe`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Transcription failed')
  }

  const data = await res.json()
  return normaliseTranscript(data.transcript || '')
}

function audioFileName(mimeType) {
  if (mimeType.includes('ogg')) return 'recording.ogg'
  if (mimeType.includes('mp4')) return 'recording.mp4'
  if (mimeType.includes('wav')) return 'recording.wav'
  return 'recording.webm'
}

// ── Main speech session ───────────────────────────────────────────────────────
// Records audio using MediaRecorder, sends to Groq Whisper on stop.
// Also runs the browser SpeechRecognition API as a fallback where available.

export function startSpeechSession({ onTranscript, onInterim, onError, onStateChange }) {
  const Recognition = getSpeechRecognition()
  const canRecord = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)

  if (!canRecord && !Recognition) {
    onError?.('not-supported')
    return null
  }

  let active = true
  let stopping = false
  let delivered = false
  let mediaRecorder = null
  let chunks = []
  let stream = null
  let interimInterval = null
  let recognition = null
  let browserFinal = ''
  let browserInterim = ''

  // Animated interim messages while Whisper processes
  const listeningMessages = [
    'Listening… speak your business description',
    'Keep going… I\'m capturing everything',
    'Almost there… finish your description',
  ]
  let msgIndex = 0

  function browserTranscript() {
    return normaliseTranscript(`${browserFinal} ${browserInterim}`.trim())
  }

  function deliverTranscript(text) {
    const clean = normaliseTranscript(text || '')
    if (!clean || delivered) return false
    delivered = true
    onTranscript?.(clean)
    return true
  }

  function finishWithBrowserFallback(errorCode = 'transcription-failed') {
    if (!deliverTranscript(browserTranscript())) {
      onError?.(errorCode)
    }
  }

  function stopBrowserRecognition() {
    if (!recognition) return
    recognition.onend = null
    recognition.onerror = null
    try {
      recognition.stop()
    } catch {
      // Browser recognition may already be stopped.
    }
  }

  function startBrowserRecognition() {
    if (!Recognition) return

    recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript || ''
        if (event.results[i].isFinal) {
          browserFinal = `${browserFinal} ${transcript}`.trim()
        } else {
          interim += transcript
        }
      }

      browserInterim = interim.trim()
      const text = browserTranscript()
      if (text) onInterim?.(text)
    }

    recognition.onerror = (event) => {
      if (!canRecord && !stopping) {
        onError?.(event.error === 'not-allowed' ? 'not-allowed' : 'speech-recognition-error')
        onStateChange?.('idle')
      }
    }

    recognition.onend = () => {
      if (active && !stopping && !canRecord) {
        try {
          recognition.start()
        } catch {
          // Ignore restart races; the user can tap the mic again.
        }
      }
    }

    try {
      recognition.start()
      onStateChange?.('recording')
    } catch {
      recognition = null
    }
  }

  function startRecorder() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((s) => {
      if (!active) {
        s.getTracks().forEach(t => t.stop())
        return
      }

      stream = s

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : ''

      mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      chunks = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstart = () => {
        onStateChange?.('recording')
        // Show animated interim status while recording
        interimInterval = setInterval(() => {
          if (!browserTranscript()) onInterim?.(listeningMessages[msgIndex % listeningMessages.length])
          msgIndex++
        }, 2000)
        if (!browserTranscript()) onInterim?.(listeningMessages[0])
      }

      mediaRecorder.onstop = async () => {
        clearInterval(interimInterval)
        stopBrowserRecognition()
        onInterim?.('Processing with Groq Whisper…')

        const audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())

        if (audioBlob.size < 1024) {
          finishWithBrowserFallback('empty-transcript')
          onStateChange?.('idle')
          return
        }

        try {
          const transcript = await transcribeWithWhisper(audioBlob)
          if (!deliverTranscript(transcript)) finishWithBrowserFallback('empty-transcript')
        } catch (err) {
          console.error('Whisper transcription error:', err)
          finishWithBrowserFallback('transcription-failed')
        }

        onStateChange?.('idle')
      }

      mediaRecorder.onerror = () => {
        clearInterval(interimInterval)
        stopBrowserRecognition()
        finishWithBrowserFallback('recorder-error')
        onStateChange?.('idle')
      }

      mediaRecorder.start(1000)
    })
    .catch((err) => {
      if (Recognition) {
        return
      }

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        onError?.('not-allowed')
      } else {
        onError?.('mic-error')
      }
      onStateChange?.('idle')
    })
  }

  startBrowserRecognition()
  if (canRecord) startRecorder()

  return {
    stop() {
      active = false
      stopping = true
      clearInterval(interimInterval)
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      } else {
        stopBrowserRecognition()
        stream?.getTracks().forEach(t => t.stop())
        if (!canRecord) finishWithBrowserFallback('empty-transcript')
        onStateChange?.('idle')
      }
    },
    getTranscript() {
      return browserTranscript()
    }
  }
}
