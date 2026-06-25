import { useRef, useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
    }
    onTurnstileLoad?: () => void
  }
}

export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return

    if (widgetIdRef.current !== null) {
      try { window.turnstile.remove(widgetIdRef.current) } catch {}
      widgetIdRef.current = null
    }

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
    if (!siteKey) {
      console.warn('Turnstile site key not configured')
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'dark',
      callback: (t: string) => {
        setToken(t)
        setError(null)
      },
      'expired-callback': () => {
        setToken(null)
        setError('Verification expired. Please verify again.')
      },
      'error-callback': () => {
        setToken(null)
        setError('Verification failed. Please try again.')
      },
    })
    setIsReady(true)
  }, [])

  useEffect(() => {
    const scriptId = 'turnstile-script'

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      window.onTurnstileLoad = renderWidget
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
      }
    }
  }, [renderWidget])

  const reset = useCallback(() => {
    setToken(null)
    setError(null)
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [])

  return { containerRef, token, error, isReady, reset }
}