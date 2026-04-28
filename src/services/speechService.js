// src/services/speechService.js

export function isSpeechSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// Maps spoken words/phrases to the symbols they represent.
// Applied after every transcript update.
function normaliseTranscript(text) {
  return text
    // Email / web
    .replace(/\bat\b/gi, '@')
    .replace(/\bdot com\b/gi, '.com')
    .replace(/\bdot com dot au\b/gi, '.com.au')
    .replace(/\bdot au\b/gi, '.au')
    .replace(/\bdot org\b/gi, '.org')
    .replace(/\bdot net\b/gi, '.net')
    .replace(/\bunderscore\b/gi, '_')
    .replace(/\bdash\b/gi, '-')
    .replace(/\bslash\b/gi, '/')
    // Phone / numbers
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
    // Currency
    .replace(/\bdollar\b/gi, '$')
    .replace(/\bpercent\b/gi, '%')
    // Punctuation
    .replace(/\bcomma\b/gi, ',')
    .replace(/\bfull stop\b/gi, '.')
    .replace(/\bperiod\b/gi, '.')
    .replace(/\bnew line\b/gi, '\n')
    // Clean up extra spaces around symbols
    .replace(/\s@\s/g, '@')
    .replace(/\s\.\s/g, '.')
    .replace(/\+\s/g, '+')
    .trim()
}

export function startSpeechSession({ onTranscript, onInterim, onError, onStateChange }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) return null

  let active = true
  let accumulated = ''  // confirmed final text
  let currentInstance = null

  function spawn() {
    if (!active) return

    const r = new SpeechRecognition()
    r.continuous = false
    r.interimResults = true
    r.lang = 'en-US'
    r.maxAlternatives = 1
    currentInstance = r

    r.onstart = () => onStateChange?.('recording')

    r.onresult = (event) => {
      let interim = ''
      let newFinal = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) newFinal += t
        else interim += t
      }

      if (newFinal) {
        const appended = accumulated
          ? accumulated + ' ' + newFinal.trim()
          : newFinal.trim()
        accumulated = normaliseTranscript(appended)
        onTranscript?.(accumulated)
      }

      if (interim) {
        const preview = accumulated
          ? accumulated + ' ' + interim
          : interim
        onInterim?.(normaliseTranscript(preview))
      }
    }

    r.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Silence — spawn fresh and keep listening
        setTimeout(spawn, 150)
        return
      }
      if (event.error === 'aborted') return

      if (event.error === 'not-allowed') {
        onError?.('not-allowed')
      } else {
        onError?.(event.error)
      }
      active = false
    }

    r.onend = () => {
      if (active) setTimeout(spawn, 150)
      else onStateChange?.('idle')
    }

    try {
      r.start()
    } catch (_) {
      setTimeout(spawn, 300)
    }
  }

  spawn()

  return {
    stop() {
      active = false
      try { currentInstance?.abort() } catch (_) {}
      currentInstance = null
      onStateChange?.('idle')
    },
    getTranscript() {
      return accumulated
    },
  }
}
