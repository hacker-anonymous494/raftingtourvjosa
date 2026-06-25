interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ size = 'md', label, fullScreen = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} border-white/20 border-t-[#4CAF50] rounded-full animate-spin`}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && <p className="text-sm text-white/50">{label}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0F1A17] flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}