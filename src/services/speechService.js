// src/services/speechService.js
// Uses Groq Whisper via Stefan's backend for accent-tolerant transcription.
// Falls back to browser Web Speech API if the backend is unavailable.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ── Browser support check ─────────────────────────────────────────────────────
export function isSpeechSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
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
  formData.append('audio', audioBlob, 'recording.webm')

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

// ── Main speech session ───────────────────────────────────────────────────────
// Records audio using MediaRecorder, sends to Groq Whisper on stop.
// Calls onInterim while recording to show a pulsing status.
// Calls onTranscript with the final Whisper result.

export function startSpeechSession({ onTranscript, onInterim, onError, onStateChange }) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    onError?.('not-supported')
    return null
  }

  let active = true
  let mediaRecorder = null
  let chunks = []
  let stream = null
  let interimInterval = null

  // Animated interim messages while Whisper processes
  const listeningMessages = [
    'Listening… speak your business description',
    'Keep going… I\'m capturing everything',
    'Almost there… finish your description',
  ]
  let msgIndex = 0

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((s) => {
      if (!active) {
        s.getTracks().forEach(t => t.stop())
        return
      }

      stream = s

      // Use webm if supported, otherwise ogg
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg')
        ? 'audio/ogg'
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
          onInterim?.(listeningMessages[msgIndex % listeningMessages.length])
          msgIndex++
        }, 2000)
        onInterim?.(listeningMessages[0])
      }

      mediaRecorder.onstop = async () => {
        clearInterval(interimInterval)
        onInterim?.('Processing with Groq Whisper…')

        const audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())

        try {
          const transcript = await transcribeWithWhisper(audioBlob)
          if (transcript) {
            onTranscript?.(transcript)
          } else {
            onError?.('empty-transcript')
          }
        } catch (err) {
          console.error('Whisper transcription error:', err)
          onError?.('transcription-failed')
        }

        onStateChange?.('idle')
      }

      mediaRecorder.onerror = () => {
        clearInterval(interimInterval)
        onError?.('recorder-error')
        onStateChange?.('idle')
      }

      mediaRecorder.start()
    })
    .catch((err) => {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        onError?.('not-allowed')
      } else {
        onError?.('mic-error')
      }
      onStateChange?.('idle')
    })

  return {
    stop() {
      active = false
      clearInterval(interimInterval)
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      } else {
        stream?.getTracks().forEach(t => t.stop())
        onStateChange?.('idle')
      }
    },
    getTranscript() {
      return ''
    }
  }
}
