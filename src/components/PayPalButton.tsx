import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { usePayPal } from '../hooks/usePayPal'
import LoadingSpinner from './LoadingSpinner'

interface PayPalButtonProps {
  bookingId: string
  paypalOrderId: string
  amount: string
  currency: string
  onSuccess: (bookingRef: string, captureId: string) => void
  onError: (error: string) => void
}

function InnerButton({ bookingId, paypalOrderId, onSuccess, onError }: Omit<PayPalButtonProps, 'amount' | 'currency'>) {
  const { handleApprove, isCapturing } = usePayPal({
    bookingId,
    paypalOrderId,
    onSuccess,
    onError,
  })

  if (isCapturing) {
    return (
      <div className="py-6">
        <LoadingSpinner label="Verifying payment with PayPal…" />
      </div>
    )
  }

  return (
    <PayPalButtons
      style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
      disabled={isCapturing}
      createOrder={() => Promise.resolve(paypalOrderId)}
      onApprove={handleApprove}
      onError={(err) => {
        console.error('PayPal error:', err)
        onError('PayPal encountered an error. Please try again or use a different payment method.')
      }}
      onCancel={() => onError('Payment cancelled.')}
    />
  )
}

export default function PayPalButton(props: PayPalButtonProps) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
  const env = import.meta.env.VITE_PAYPAL_ENV ?? 'sandbox'

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: props.currency,
        intent: 'capture',
        components: 'buttons',
        ...(env === 'sandbox' ? { 'buyer-country': 'AL' } : {}),
      }}
    >
      <InnerButton {...props} />
    </PayPalScriptProvider>
  )
}