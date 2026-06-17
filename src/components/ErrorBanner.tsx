import { useState } from 'react'
import { toUserMessage } from '../utils/errors'

interface ErrorBannerProps {
  message: string | null
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null

  return (
    <div className="app-error">
      <div className="flex items-start justify-between gap-4">
        <span>{message}</span>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="shrink-0">
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: unknown) => {
    setError(toUserMessage(err))
  }

  return { error, setError, handleError, clearError: () => setError(null) }
}
