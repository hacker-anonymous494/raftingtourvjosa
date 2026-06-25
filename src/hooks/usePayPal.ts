import { useState, useCallback } from 'react'
import { capturePayment, ApiError } from '../lib/api'

interface UsePayPalOptions {
  bookingId: string
  paypalOrderId: string
  onSuccess: (bookingRef: string, captureId: string) => void
  onError: (error: string) => void
}

export function usePayPal({ bookingId, paypalOrderId, onSuccess, onError }: UsePayPalOptions) {
  const [isCapturing, setIsCapturing] = useState(false)

  const handleApprove = useCallback(async () => {
    setIsCapturing(true)
    try {
      const result = await capturePayment({
        booking_id: bookingId,
        paypal_order_id: paypalOrderId,
      })
      if (result.success) {
        onSuccess(result.booking_ref, result.capture_id)
      } else {
        onError('Payment capture failed. Please contact support.')
      }
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : 'Payment verification failed. Please contact support if funds were deducted.'
      onError(msg)
    } finally {
      setIsCapturing(false)
    }
  }, [bookingId, paypalOrderId, onSuccess, onError])

  return { handleApprove, isCapturing }
}