import { useCallback, useEffect, useState, useRef } from 'react'

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
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [apiLoaded, setApiLoaded] = useState(!!window.turnstile)
  const [renderTrigger, setRenderTrigger] = useState(0)

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerElement(node)
  }, [])

  // Render the widget
  useEffect(() => {
    if (!apiLoaded) {
      console.log('Turnstile API not loaded')
      return
    }
    if (!containerElement) {
      console.log('Turnstile container not available')
      return
    }
    // If already rendered, remove it first to re-render (for reset)
    if (widgetIdRef.current !== null) {
      try {
        window.turnstile?.remove(widgetIdRef.current)
      } catch {}
      widgetIdRef.current = null
    }

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
    if (!siteKey) {
      console.error('Turnstile site key missing')
      setError('Configuration error: missing site key.')
      return
    }

    console.log('Turnstile rendering with siteKey:', siteKey)

    try {
      widgetIdRef.current = window.turnstile!.render(containerElement, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (t: string) => {
          console.log('Turnstile token received:', t)
          setToken(t)
          setError(null)
        },
        'expired-callback': () => {
          console.warn('Turnstile token expired')
          setToken(null)
          setError('Verification expired. Please verify again.')
        },
        'error-callback': (err?: unknown) => {
          console.error('Turnstile error:', err)
          setToken(null)
          setError('Verification failed. Please try again.')
        },
      })
      setIsReady(true)
    } catch (err) {
      console.error('Turnstile render error:', err)
      setError('Failed to render security check.')
    }
  }, [apiLoaded, containerElement, renderTrigger])

  // Load script
  useEffect(() => {
    const scriptId = 'turnstile-script'

    if (window.turnstile) {
      setApiLoaded(true)
      return
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      console.log('Turnstile script appended')
    }

    window.onTurnstileLoad = () => {
      console.log('Turnstile script loaded (global callback)')
      setApiLoaded(true)
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {}
        widgetIdRef.current = null
      }
      if (window.onTurnstileLoad) {
        delete window.onTurnstileLoad
      }
    }
  }, [])

  const reset = useCallback(() => {
    setToken(null)
    setError(null)
    setRenderTrigger(prev => prev + 1) // triggers re-render
  }, [])

  return { containerRef, token, error, isReady, reset }
}