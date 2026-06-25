import { useTurnstile } from '../hooks/useTurnstile'

interface TurnstileWidgetProps {
  onVerified: (token: string) => void
  onReset?: () => void
}

export default function TurnstileWidget({ onVerified, onReset }: TurnstileWidgetProps) {
  const { containerRef, token, error } = useTurnstile()

  if (token && !error) {
    onVerified(token)
  }

  if (onReset && !token) {
    onReset()
  }

  return (
    <div>
      <div ref={containerRef} className="mt-2" />
      {error && <p className="error-text mt-1">{error}</p>}
    </div>
  )
}